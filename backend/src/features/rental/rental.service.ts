import { prisma } from '../../config/prisma';
import { AppError, ConflictError, NotFoundError } from '../../common/errors';
import { DeviceStatus, PaymentGateway, PaymentStatus, RentalStatus } from '../../generated/prisma/enums.js';
import { snap } from '../../config/midtrans';
import { env } from '../../config/env';
import type {
  CreateRentalInput,
  RentalWithDetailsResponse,
  CustomerDeviceSummary,
} from './rental.dto.js';
import {
  calculateRentalDurationAndAmount,
  generateRentalCode,
  buildSnapTransactionParameter,
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
   * Architectural & Concurrency Flow:
   * 1. Read-only pre-flight: Verifies device existence and availability without mutating the database.
   * 2. Computes rental duration, authoritative total price, and generates a unique rental code.
   * 3. Calls Midtrans Snap API OUTSIDE any database transaction.
   *    If Midtrans fails: No database rows have been modified, so the device is never left orphaned or stuck.
   * 4. Once snapToken and redirectUrl are acquired, executes ONE single atomic ACID transaction:
   *    - Acquires the atomic Compare-and-Swap (CAS) lock on the device (AVAILABLE -> BOOKED).
   *    - Inserts the Rental record with its authoritative expiresAt timestamp.
   *    - Inserts the Payment record with the pre-generated snapToken and redirectUrl.
   *    If ANY failure occurs in this transaction, PostgreSQL rolls back everything atomically,
   *    guaranteeing that a device can NEVER be left in BOOKED status without a corresponding Rental and expiresAt.
   * 5. Formats and returns the standardized response envelope.
   */
  async createRental(userId: string, input: CreateRentalInput): Promise<RentalWithDetailsResponse> {
    // 1. Read-only pre-flight verification (No database mutations)
    const device = await prisma.device.findFirst({
      where: {
        id: input.deviceId,
        status: DeviceStatus.AVAILABLE,
      },
      select: {
        id: true,
        status: true,
        dailyRate: true,
        model: true,
        speed: true,
      },
    });

    if (!device) {
      throw new NotFoundError('Device not found or not available for rental');
    }

    // 2. Fetch customer contact details for Midtrans checkout parameters
    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    });

    // 3. Authoritative server-side calculations
    const calculation = calculateRentalDurationAndAmount(
      input.startDate,
      input.endDate,
      device.dailyRate
    );
    const rentalCode = generateRentalCode();

    // 4. Generate Midtrans Snap Transaction (Outside DB Transaction - DB is 100% untouched so far)
    let snapToken: string;
    let redirectUrl: string;

    try {
      const snapParameter = buildSnapTransactionParameter({
        rentalCode,
        totalAmount: calculation.totalAmount,
        totalDays: calculation.totalDays,
        device: {
          id: device.id,
          model: device.model,
        },
        customer,
        clientUrl: env.CLIENT_URL,
      });

      const snapResponse = await snap.createTransaction(snapParameter);
      snapToken = snapResponse.token;
      redirectUrl = snapResponse.redirect_url;
    } catch (error) {
      console.error('[ERROR] Midtrans Snap transaction creation failed:', error);
      throw new AppError('Payment gateway is currently unavailable. Please try again later', 502);
    }

    // 5. Atomic Persistence (Single ACID Transaction: device lock, rental, and payment commit together)
    const casWhere = {
      id: input.deviceId,
      status: DeviceStatus.AVAILABLE,
    };
    const casData = {
      status: DeviceStatus.BOOKED,
    };

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

    const paymentSelect = {
      id: true,
      amount: true,
      status: true,
      gateway: true,
      snapToken: true,
      redirectUrl: true,
      expiresAt: true,
      createdAt: true,
    };

    const { rental, payment } = await prisma.$transaction(async (tx) => {
      // Step A: Atomic Compare-and-Swap lock on device status
      const lockResult = await tx.device.updateMany({
        where: casWhere,
        data: casData,
      });

      if (lockResult.count === 0) {
        throw new ConflictError(
          'Device was just booked by another user. Please choose another device'
        );
      }

      // Step B: Persist Rental record
      const createdRental = await tx.rental.create({
        data: rentalData,
      });

      // Step C: Persist Payment record with pre-acquired snapToken & redirectUrl
      const createdPayment = await tx.payment.create({
        data: {
          rentalId: createdRental.id,
          amount: calculation.totalAmount,
          gateway: PaymentGateway.MIDTRANS,
          status: PaymentStatus.PENDING,
          gatewayRef: rentalCode,
          snapToken,
          redirectUrl,
          expiresAt: calculation.expiresAt,
        },
        select: paymentSelect,
      });

      return {
        rental: createdRental,
        payment: createdPayment,
      };
    });

    // 6. Format final response payload outside the transaction
    const deviceSummary: CustomerDeviceSummary = {
      id: device.id,
      model: device.model,
      speed: device.speed,
      status: DeviceStatus.BOOKED,
    };

    return {
      id: rental.id,
      rentalCode: rental.rentalCode,
      userId: rental.userId,
      deviceId: rental.deviceId,
      destination: rental.destination,
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalDays: rental.totalDays,
      totalAmount: rental.totalAmount,
      status: rental.status,
      expiresAt: rental.expiresAt,
      createdAt: rental.createdAt,
      updatedAt: rental.updatedAt,
      device: deviceSummary,
      payment,
    };
  }
}

export const rentalService = new RentalService();
