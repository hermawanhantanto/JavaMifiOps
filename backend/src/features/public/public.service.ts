import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../config/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors';
import { DeviceStatus, RentalStatus } from '../../generated/prisma/enums.js';
import { rentalService } from '../rental/rental.service';
import type {
  PublicDeviceListResult,
  PublicRentalTrackingResponse,
  SupportCancelRentalInput,
  SupportUpdateLogisticsInput,
} from './public.dto.js';
import { buildPublicDeviceSelect, buildPublicRentalTrackSelect } from './public.helper';

export class PublicService {
  /**
   * Lists currently available hardware devices for public catalog and AI agent queries.
   */
  async listAvailableDevices(): Promise<PublicDeviceListResult> {
    const where: Prisma.DeviceWhereInput = {
      status: DeviceStatus.AVAILABLE,
    };
    const select = buildPublicDeviceSelect();
    const orderBy: Prisma.DeviceOrderByWithRelationInput = {
      dailyRate: 'asc',
    };

    const devices = await prisma.device.findMany({
      where,
      select,
      orderBy,
    });

    return {
      devices,
    };
  }

  /**
   * Retrieves tracking, fulfillment, and payment status for a rental booking by its rentalCode.
   */
  async trackRentalByCode(code: string): Promise<PublicRentalTrackingResponse> {
    const where: Prisma.RentalWhereUniqueInput = {
      rentalCode: code.trim(),
    };
    const select = buildPublicRentalTrackSelect();

    const rental = await prisma.rental.findUnique({
      where,
      select,
    });

    if (!rental) {
      throw new NotFoundError(`Rental booking with code ${code} was not found`);
    }

    const latestPayment = rental.payments[0] ?? null;

    return {
      rentalCode: rental.rentalCode,
      destination: rental.destination,
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalDays: rental.totalDays,
      totalAmount: rental.totalAmount,
      status: rental.status,
      fulfillmentType: rental.fulfillmentType,
      pickupLocation: rental.pickupLocation,
      shippingAddress: rental.shippingAddress,
      trackingNumber: rental.trackingNumber,
      expiresAt: rental.expiresAt,
      device: rental.device,
      payment: latestPayment,
    };
  }

  /**
   * Allows a customer via the AI Support Agent to update pickup counter or shipping address
   * prior to dispatch, protected by 2-factor verification (rentalCode + account email).
   */
  async updateRentalLogisticsBySupport(
    input: SupportUpdateLogisticsInput
  ): Promise<PublicRentalTrackingResponse> {
    const where: Prisma.RentalWhereUniqueInput = {
      rentalCode: input.rentalCode,
    };

    const existingRental = await prisma.rental.findUnique({
      where,
      select: {
        id: true,
        rentalCode: true,
        status: true,
        fulfillmentType: true,
        pickupLocation: true,
        shippingAddress: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingRental) {
      throw new NotFoundError(`Rental booking with code ${input.rentalCode} was not found`);
    }

    if (existingRental.user.email.toLowerCase() !== input.email.toLowerCase()) {
      throw new ForbiddenError(
        'Email verification failed. Provided email does not match this rental booking'
      );
    }

    const isModifiable =
      existingRental.status === RentalStatus.PENDING_PAYMENT ||
      existingRental.status === RentalStatus.CONFIRMED;

    if (!isModifiable) {
      throw new BadRequestError(
        `Cannot modify fulfillment logistics for a rental in ${existingRental.status} status`
      );
    }

    const updateData: Prisma.RentalUpdateInput = {
      fulfillmentType: input.fulfillmentType ?? existingRental.fulfillmentType,
      pickupLocation:
        input.pickupLocation !== undefined ? input.pickupLocation : existingRental.pickupLocation,
      shippingAddress:
        input.shippingAddress !== undefined
          ? input.shippingAddress
          : existingRental.shippingAddress,
    };
    const select = buildPublicRentalTrackSelect();

    const updatedRental = await prisma.rental.update({
      where: { id: existingRental.id },
      data: updateData,
      select,
    });

    const latestPayment = updatedRental.payments[0] ?? null;

    return {
      rentalCode: updatedRental.rentalCode,
      destination: updatedRental.destination,
      startDate: updatedRental.startDate,
      endDate: updatedRental.endDate,
      totalDays: updatedRental.totalDays,
      totalAmount: updatedRental.totalAmount,
      status: updatedRental.status,
      fulfillmentType: updatedRental.fulfillmentType,
      pickupLocation: updatedRental.pickupLocation,
      shippingAddress: updatedRental.shippingAddress,
      trackingNumber: updatedRental.trackingNumber,
      expiresAt: updatedRental.expiresAt,
      device: updatedRental.device,
      payment: latestPayment,
    };
  }

  /**
   * Allows a customer via the AI Support Agent to cancel an unpaid booking (PENDING_PAYMENT),
   * protected by 2-factor verification (rentalCode + account email).
   * Atomically expires payment, cancels BullMQ timer, and releases reserved device to AVAILABLE.
   */
  async cancelRentalBySupport(
    input: SupportCancelRentalInput
  ): Promise<PublicRentalTrackingResponse> {
    const where: Prisma.RentalWhereUniqueInput = {
      rentalCode: input.rentalCode,
    };

    const existingRental = await prisma.rental.findUnique({
      where,
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!existingRental) {
      throw new NotFoundError(`Rental booking with code ${input.rentalCode} was not found`);
    }

    if (existingRental.user.email.toLowerCase() !== input.email.toLowerCase()) {
      throw new ForbiddenError(
        'Email verification failed. Provided email does not match this rental booking'
      );
    }

    await rentalService.cancelRental(existingRental.id, existingRental.userId, 'CUSTOMER');

    return this.trackRentalByCode(input.rentalCode);
  }
}

export const publicService = new PublicService();
