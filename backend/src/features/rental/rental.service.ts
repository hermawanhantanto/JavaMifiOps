import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../common/errors';
import { DeviceStatus, PaymentGateway, PaymentStatus, RentalStatus } from '../../generated/prisma/enums.js';
import type {
  CreateRentalInput,
  RentalWithDetailsResponse,
  CustomerDeviceSummary,
} from './rental.dto.js';
import {
  calculateRentalDurationAndAmount,
  generateRentalCode,
} from './rental.helper';

/**
 * Rental Service.
 * Manages the booking and rental lifecycle for customers.
 *
 * Context-7 Reference:
 * Implements Prisma Interactive Transactions to guarantee ACID atomicity and prevent race conditions.
 * Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/orm/fundamentals/transactions.mdx
 */
export class RentalService {
  /**
   * Creates a new rental booking for an authenticated customer.
   *
   * Business Logic & Concurrency Rules:
   * 1. Validates that the requested device exists and is currently AVAILABLE.
   * 2. Executes an atomic Compare-and-Swap (CAS) update on the hardware device to transition its status
   *    from AVAILABLE to BOOKED, preventing double-booking race conditions between concurrent requests.
   * 3. Calculates duration in inclusive calendar days and computes authoritative total amount from device daily rate.
   * 4. Generates a unique, non-guessable rental code.
   * 5. Sets booking expiration timestamp (expiresAt) to 30 minutes in the future.
   * 6. Persists initial Payment record with PENDING status.
   */
  async createRental(userId: string, input: CreateRentalInput): Promise<RentalWithDetailsResponse> {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify device existence and fetch authoritative rate with AVAILABLE filter
      const deviceWhere = {
        id: input.deviceId,
        status: DeviceStatus.AVAILABLE,
      };
      const deviceSelect = {
        id: true,
        status: true,
        dailyRate: true,
        model: true,
        speed: true,
      };

      const device = await tx.device.findFirst({
        where: deviceWhere,
        select: deviceSelect,
      });

      if (!device) {
        throw new NotFoundError('Device not found or not available for rental');
      }

      // 2. Atomic Compare-and-Swap (CAS) lock on device status
      const casWhere = {
        id: input.deviceId,
        status: DeviceStatus.AVAILABLE,
      };
      const casData = {
        status: DeviceStatus.BOOKED,
      };

      const lockResult = await tx.device.updateMany({
        where: casWhere,
        data: casData,
      });

      if (lockResult.count === 0) {
        throw new ConflictError(
          'Device was just booked by another user. Please choose another device'
        );
      }

      // 3. Authoritative server-side calculations
      const calculation = calculateRentalDurationAndAmount(
        input.startDate,
        input.endDate,
        device.dailyRate
      );
      const rentalCode = generateRentalCode();

      // 4. Persist Rental entity
      const rentalData = {
        rentalCode,
        userId,
        deviceId: input.deviceId,
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        totalDays: calculation.totalDays,
        totalAmount: calculation.totalAmount,
        status: RentalStatus.PENDING_PAYMENT,
        expiresAt: calculation.expiresAt,
      };

      const rental = await tx.rental.create({
        data: rentalData,
      });

      // 5. Persist initial Payment record
      // TODO: Initialize Midtrans Snap Token / Transaction once payment gateway is integrated
      const paymentData = {
        rentalId: rental.id,
        amount: calculation.totalAmount,
        gateway: PaymentGateway.MIDTRANS,
        status: PaymentStatus.PENDING,
        expiresAt: calculation.expiresAt,
      };
      const paymentSelect = {
        id: true,
        amount: true,
        status: true,
        gateway: true,
        expiresAt: true,
        createdAt: true,
      };

      const payment = await tx.payment.create({
        data: paymentData,
        select: paymentSelect,
      });

      const deviceSummary: CustomerDeviceSummary = {
        id: device.id,
        model: device.model,
        speed: device.speed,
        status: DeviceStatus.BOOKED,
      };

      return {
        ...rental,
        device: deviceSummary,
        payment,
      };
    });
  }
}

export const rentalService = new RentalService();
