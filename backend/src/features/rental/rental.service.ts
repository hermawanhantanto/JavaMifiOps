import { prisma } from '../../config/prisma';
import { AppError, BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../common/errors';
import { DeviceStatus, PaymentGateway, PaymentStatus, RentalStatus } from '../../generated/prisma/enums.js';
import { snap } from '../../config/midtrans';
import { env } from '../../config/env';
import type {
  CreateRentalInput,
  UpdateRentalInput,
  RentalWithDetailsResponse,
  CustomerDeviceSummary,
  RentalPaymentSummary,
} from './rental.dto.js';
import {
  calculateRentalDurationAndAmount,
  generateRentalCode,
  generatePaymentId,
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

    const paymentId = generatePaymentId();

    try {
      const snapParameter = buildSnapTransactionParameter({
        orderId: paymentId,
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
          id: paymentId,
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

  /**
   * Updates an existing rental booking while in PENDING_PAYMENT status.
   *
   * Business Rules:
   * 1. If only destination is modified, updates the rental record directly without touching payment.
   * 2. If startDate or endDate changes, totalDays and totalAmount are recalculated.
   *    Because Midtrans Snap tokens are immutable to amount, the previous payment is marked EXPIRED,
   *    a new Midtrans transaction token is generated outside DB transactions, and an atomic transaction
   *    persists the updated rental and the new pending payment.
   */
  async updateRental(
    rentalId: string,
    userId: string,
    userRole: string,
    input: UpdateRentalInput
  ): Promise<RentalWithDetailsResponse> {
    // 1. Fetch rental record with relations
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        device: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    // 2. Authorization check
    if (rental.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this rental');
    }

    // 3. Status and expiration check
    if (rental.status !== RentalStatus.PENDING_PAYMENT) {
      throw new BadRequestError('Only pending payment rentals can be updated');
    }

    if (rental.expiresAt && rental.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestError('Rental booking has expired. Please create a new booking');
    }

    // 4. Resolve effective dates
    const effectiveStartDate = input.startDate ? new Date(input.startDate) : rental.startDate;
    const effectiveEndDate = input.endDate ? new Date(input.endDate) : rental.endDate;

    if (effectiveEndDate.getTime() < effectiveStartDate.getTime()) {
      throw new BadRequestError('End date must be on or after start date');
    }

    const isDatesChanged =
      (input.startDate !== undefined &&
        effectiveStartDate.toISOString().slice(0, 10) !==
          rental.startDate.toISOString().slice(0, 10)) ||
      (input.endDate !== undefined &&
        effectiveEndDate.toISOString().slice(0, 10) !==
          rental.endDate.toISOString().slice(0, 10));

    // 5. Scenario A: Dates did not change (only destination update)
    if (!isDatesChanged) {
      const updatedRental = await prisma.rental.update({
        where: { id: rental.id },
        data: {
          destination: input.destination ?? rental.destination,
        },
        include: {
          device: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const deviceSummary: CustomerDeviceSummary | null = updatedRental.device
        ? {
            id: updatedRental.device.id,
            model: updatedRental.device.model,
            speed: updatedRental.device.speed,
            status: updatedRental.device.status,
          }
        : null;

      const latestPayment = updatedRental.payments[0] ?? null;
      const paymentSummary: RentalPaymentSummary | null = latestPayment
        ? {
            id: latestPayment.id,
            amount: latestPayment.amount,
            status: latestPayment.status,
            gateway: latestPayment.gateway,
            snapToken: latestPayment.snapToken,
            redirectUrl: latestPayment.redirectUrl,
            expiresAt: latestPayment.expiresAt,
            createdAt: latestPayment.createdAt,
          }
        : null;

      return {
        id: updatedRental.id,
        rentalCode: updatedRental.rentalCode,
        userId: updatedRental.userId,
        deviceId: updatedRental.deviceId,
        destination: updatedRental.destination,
        startDate: updatedRental.startDate,
        endDate: updatedRental.endDate,
        totalDays: updatedRental.totalDays,
        totalAmount: updatedRental.totalAmount,
        status: updatedRental.status,
        expiresAt: updatedRental.expiresAt,
        createdAt: updatedRental.createdAt,
        updatedAt: updatedRental.updatedAt,
        device: deviceSummary,
        payment: paymentSummary,
      };
    }

    // 6. Scenario B: Dates changed (Financial recalculation & new payment)
    if (!rental.device) {
      throw new BadRequestError('Device not assigned to this rental');
    }

    const calculation = calculateRentalDurationAndAmount(
      effectiveStartDate,
      effectiveEndDate,
      rental.device.dailyRate
    );

    const newPaymentId = generatePaymentId();

    const snapPayload = buildSnapTransactionParameter({
      orderId: newPaymentId,
      rentalCode: rental.rentalCode,
      totalAmount: calculation.totalAmount,
      totalDays: calculation.totalDays,
      device: {
        id: rental.device.id,
        model: rental.device.model,
      },
      customer: rental.user,
      clientUrl: env.CLIENT_URL,
    });

    let snapResponse: { token: string; redirect_url: string };

    try {
      snapResponse = await snap.createTransaction(snapPayload);
    } catch (error: any) {
      throw new AppError('Payment gateway is currently unavailable. Please try again later', 502);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Invalidate existing pending payments
      await tx.payment.updateMany({
        where: {
          rentalId: rental.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.EXPIRED,
        },
      });

      // Insert new active payment record
      const newPayment = await tx.payment.create({
        data: {
          id: newPaymentId,
          rentalId: rental.id,
          amount: calculation.totalAmount,
          status: PaymentStatus.PENDING,
          snapToken: snapResponse.token,
          redirectUrl: snapResponse.redirect_url,
          expiresAt: calculation.expiresAt,
        },
      });

      // Update Rental with new dates, totalDays, totalAmount, and renewed expiresAt
      const updatedRental = await tx.rental.update({
        where: { id: rental.id },
        data: {
          destination: input.destination ?? rental.destination,
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          totalDays: calculation.totalDays,
          totalAmount: calculation.totalAmount,
          expiresAt: calculation.expiresAt,
        },
        include: {
          device: true,
        },
      });

      return { updatedRental, newPayment };
    });

    const deviceSummary: CustomerDeviceSummary | null = result.updatedRental.device
      ? {
          id: result.updatedRental.device.id,
          model: result.updatedRental.device.model,
          speed: result.updatedRental.device.speed,
          status: result.updatedRental.device.status,
        }
      : null;

    const paymentSummary: RentalPaymentSummary = {
      id: result.newPayment.id,
      amount: result.newPayment.amount,
      status: result.newPayment.status,
      gateway: result.newPayment.gateway,
      snapToken: result.newPayment.snapToken,
      redirectUrl: result.newPayment.redirectUrl,
      expiresAt: result.newPayment.expiresAt,
      createdAt: result.newPayment.createdAt,
    };

    return {
      id: result.updatedRental.id,
      rentalCode: result.updatedRental.rentalCode,
      userId: result.updatedRental.userId,
      deviceId: result.updatedRental.deviceId,
      destination: result.updatedRental.destination,
      startDate: result.updatedRental.startDate,
      endDate: result.updatedRental.endDate,
      totalDays: result.updatedRental.totalDays,
      totalAmount: result.updatedRental.totalAmount,
      status: result.updatedRental.status,
      expiresAt: result.updatedRental.expiresAt,
      createdAt: result.updatedRental.createdAt,
      updatedAt: result.updatedRental.updatedAt,
      device: deviceSummary,
      payment: paymentSummary,
    };
  }

  /**
   * Cancels a rental booking while in PENDING_PAYMENT status.
   *
   * Business Rules:
   * 1. Only owner or ADMIN can cancel.
   * 2. Only PENDING_PAYMENT rentals can be cancelled.
   * 3. Atomically updates Rental to CANCELLED, expires pending Payments,
   *    and releases the reserved Device back to AVAILABLE.
   * 4. Makes a best-effort call to Midtrans snap.transaction.cancel to close
   *    any active payment session or virtual account.
   */
  async cancelRental(
    rentalId: string,
    userId: string,
    userRole: string
  ): Promise<RentalWithDetailsResponse> {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        device: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    if (rental.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to cancel this rental');
    }

    if (rental.status === RentalStatus.CANCELLED) {
      throw new BadRequestError('Rental booking is already cancelled');
    }

    if (rental.status !== RentalStatus.PENDING_PAYMENT) {
      throw new BadRequestError('Only pending payment rentals can be cancelled');
    }

    const pendingPayment = rental.payments.find((p) => p.status === PaymentStatus.PENDING) ?? null;
    const deviceId = rental.deviceId;

    // 1. Cancel Midtrans transaction before updating database
    if (pendingPayment) {
      try {
        await (snap as any).transaction?.cancel(pendingPayment.id);
      } catch (error: any) {
        const isNotFound =
          error?.httpStatusCode === 404 ||
          error?.ApiResponse?.status_code === '404' ||
          error?.ApiResponse?.status_message?.includes?.('does not exist');

        if (!isNotFound) {
          throw new AppError(
            'Payment gateway is currently unavailable. Failed to cancel payment session',
            502
          );
        }
      }
    }

    // 2. Atomic state update in database (expire payment, release device, mark rental cancelled)
    const updatedRental = await prisma.$transaction(async (tx) => {
      // Step A: Mark pending payments as EXPIRED
      await tx.payment.updateMany({
        where: {
          rentalId: rental.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.EXPIRED,
        },
      });

      // Step B: Release device back to AVAILABLE
      if (deviceId) {
        await tx.device.updateMany({
          where: {
            id: deviceId,
            status: DeviceStatus.BOOKED,
          },
          data: {
            status: DeviceStatus.AVAILABLE,
          },
        });
      }

      // Step C: Mark rental as CANCELLED
      return tx.rental.update({
        where: { id: rental.id },
        data: {
          status: RentalStatus.CANCELLED,
        },
        include: {
          device: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    });

    const deviceSummary: CustomerDeviceSummary | null = updatedRental.device
      ? {
          id: updatedRental.device.id,
          model: updatedRental.device.model,
          speed: updatedRental.device.speed,
          status: updatedRental.device.status,
        }
      : null;

    const latestPayment = updatedRental.payments[0] ?? null;
    const paymentSummary: RentalPaymentSummary | null = latestPayment
      ? {
          id: latestPayment.id,
          amount: latestPayment.amount,
          status: latestPayment.status,
          gateway: latestPayment.gateway,
          snapToken: latestPayment.snapToken,
          redirectUrl: latestPayment.redirectUrl,
          expiresAt: latestPayment.expiresAt,
          createdAt: latestPayment.createdAt,
        }
      : null;

    return {
      id: updatedRental.id,
      rentalCode: updatedRental.rentalCode,
      userId: updatedRental.userId,
      deviceId: updatedRental.deviceId,
      destination: updatedRental.destination,
      startDate: updatedRental.startDate,
      endDate: updatedRental.endDate,
      totalDays: updatedRental.totalDays,
      totalAmount: updatedRental.totalAmount,
      status: updatedRental.status,
      expiresAt: updatedRental.expiresAt,
      createdAt: updatedRental.createdAt,
      updatedAt: updatedRental.updatedAt,
      device: deviceSummary,
      payment: paymentSummary,
    };
  }
}

export const rentalService = new RentalService();
