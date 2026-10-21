import type { Prisma } from '../../generated/prisma/client.js';

/**
 * Builds the Prisma select projection for public available devices.
 * Conceals sensitive hardware identifiers (IMEI and serialNumber).
 */
export const buildPublicDeviceSelect = (): Prisma.DeviceSelect => {
  return {
    id: true,
    model: true,
    speed: true,
    dailyRate: true,
    batteryHealth: true,
    status: true,
  };
};

/**
 * Builds the Prisma select projection for public rental tracking.
 * Conceals customer PII (name, email, phone) and sensitive hardware identifiers (IMEI, serialNumber).
 */
export const buildPublicRentalTrackSelect = (): Prisma.RentalSelect => {
  return {
    rentalCode: true,
    destination: true,
    startDate: true,
    endDate: true,
    totalDays: true,
    totalAmount: true,
    status: true,
    fulfillmentType: true,
    pickupLocation: true,
    shippingAddress: true,
    trackingNumber: true,
    expiresAt: true,
    device: {
      select: {
        model: true,
        speed: true,
      },
    },
    payments: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        status: true,
        gateway: true,
        amount: true,
        redirectUrl: true,
        paidAt: true,
        expiresAt: true,
      },
    },
  };
};
