import crypto from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client.js';
import { Role } from '../../generated/prisma/enums.js';
import type {
  RentalCalculationResult,
  BuildSnapTransactionParams,
  ListRentalsQuery,
} from './rental.dto.js';

/**
 * Calculates rental duration in inclusive calendar days, authoritative total amount,
 * and standard booking expiration timestamp (30 minutes from booking).
 *
 * @param startDate Requested rental start date
 * @param endDate Requested rental end date
 * @param dailyRate Authoritative daily rate of the hardware device
 */
export const calculateRentalDurationAndAmount = (
  startDate: Date,
  endDate: Date,
  dailyRate: Prisma.Decimal | number | string
): RentalCalculationResult => {
  const startUtc = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())
  );
  const endUtc = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate())
  );

  const diffMs = endUtc.getTime() - startUtc.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, diffDays + 1);

  const numericDailyRate = typeof dailyRate === 'number' ? dailyRate : Number(dailyRate);

  const totalAmount = Math.round(numericDailyRate * totalDays * 100) / 100;

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  return {
    totalDays,
    totalAmount,
    expiresAt,
  };
};

/**
 * Generates a unique, non-guessable, human-readable rental code.
 * Format: RENT-YYYYMMDD-XXXXXX (e.g. RENT-20261021-9A3F12)
 */
export const generateRentalCode = (): string => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();

  return `RENT-${year}${month}${day}-${randomSuffix}`;
};

/**
 * Generates a unique, non-guessable, human-readable payment reference ID.
 * Format: PAY-YYYYMMDD-XXXXXXXX (e.g. PAY-20261021-9A3F12BC)
 */
export const generatePaymentId = (): string => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();

  return `PAY-${year}${month}${day}-${randomSuffix}`;
};

/**
 * Builds standard transaction parameters for Midtrans Snap hosted checkout.
 */
export const buildSnapTransactionParameter = (params: BuildSnapTransactionParams) => {
  // Midtrans enforces a strict 50 character limit on item_details[].name.
  // Truncate cleanly so it never exceeds 45 characters.
  const rawItemName = `Wi-Fi (${params.device.model}) ${params.totalDays}D`;
  const sanitizedItemName =
    rawItemName.length > 45 ? `${rawItemName.slice(0, 42)}...` : rawItemName;

  return {
    transaction_details: {
      order_id: params.orderId ?? params.rentalCode,
      gross_amount: params.totalAmount,
    },
    customer_details: {
      first_name: params.customer?.name ?? 'Customer',
      email: params.customer?.email ?? 'customer@javamifi.com',
      phone: params.customer?.phone ?? undefined,
    },
    item_details: [
      {
        id: params.device.id.slice(0, 50),
        price: params.totalAmount,
        quantity: 1,
        name: sanitizedItemName,
      },
    ],
    expiry: {
      unit: 'minutes',
      duration: 30,
    },
    callbacks: {
      finish: `${params.clientUrl}/rental`,
    },
  };
};

/**
 * Builds a type-safe Prisma WhereInput filter object from list query parameters.
 * When the caller is a Customer, results are strictly restricted to their own userId.
 * When the caller is an Admin, they can filter across all users, devices, and search parameters.
 */
export const buildRentalWhereInput = (
  query: ListRentalsQuery,
  authUser: { userId: string; role: Role }
): Prisma.RentalWhereInput => {
  const where: Prisma.RentalWhereInput = {};

  if (authUser.role === Role.CUSTOMER) {
    where.userId = authUser.userId;

    if (query.status) {
      where.status = query.status;
    }

    if (query.destination) {
      where.destination = { contains: query.destination, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { rentalCode: { contains: query.search, mode: 'insensitive' } },
        { destination: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { device: { model: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  // Admin role filters
  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.deviceId) {
    where.deviceId = query.deviceId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.destination) {
    where.destination = { contains: query.destination, mode: 'insensitive' };
  }

  if (query.search) {
    where.OR = [
      { rentalCode: { contains: query.search, mode: 'insensitive' } },
      { destination: { contains: query.search, mode: 'insensitive' } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
      { device: { model: { contains: query.search, mode: 'insensitive' } } },
      { device: { serialNumber: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  return where;
};

/**
 * Builds a Prisma select projection object based on the caller's role.
 * Conceals sensitive hardware identifiers (serialNumber, IMEI) from CUSTOMER roles.
 */
export const buildRentalSelect = (role: Role): Prisma.RentalSelect => {
  const baseSelect = {
    id: true,
    rentalCode: true,
    userId: true,
    deviceId: true,
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
    createdAt: true,
    updatedAt: true,
    payments: {
      orderBy: { createdAt: 'desc' as const },
      take: 1,
      select: {
        id: true,
        amount: true,
        status: true,
        gateway: true,
        snapToken: true,
        redirectUrl: true,
        expiresAt: true,
        createdAt: true,
      },
    },
  };

  if (role === Role.CUSTOMER) {
    return {
      ...baseSelect,
      device: {
        select: {
          id: true,
          model: true,
          speed: true,
          status: true,
        },
      },
    };
  }

  return {
    ...baseSelect,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    device: {
      select: {
        id: true,
        serialNumber: true,
        imei: true,
        model: true,
        speed: true,
        status: true,
        batteryHealth: true,
        dailyRate: true,
      },
    },
  };
};
