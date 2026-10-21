import type { z } from 'zod';
import type { Rental, Payment, Device, User } from '../../generated/prisma/client.js';
import type {
  createRentalSchema,
  updateRentalSchema,
  listRentalsQuerySchema,
} from './rental.validator.js';

/**
 * Data Transfer Objects (DTOs) strictly scoped to the Rental Feature Module.
 */

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export type UpdateRentalInput = z.infer<typeof updateRentalSchema>;

export type ListRentalsQuery = z.infer<typeof listRentalsQuerySchema>;

export type RentalResponse = Rental;

export type CustomerDeviceSummary = Pick<Device, 'id' | 'model' | 'speed' | 'status'>;

export type AdminDeviceSummary = Pick<
  Device,
  'id' | 'serialNumber' | 'imei' | 'model' | 'speed' | 'status' | 'batteryHealth' | 'dailyRate'
>;

export type RentalUserSummary = Pick<User, 'id' | 'name' | 'email' | 'phone'>;

export type RentalPaymentSummary = Pick<
  Payment,
  'id' | 'amount' | 'status' | 'gateway' | 'snapToken' | 'redirectUrl' | 'expiresAt' | 'createdAt'
>;

export interface RentalWithDetailsResponse extends Rental {
  device: CustomerDeviceSummary | AdminDeviceSummary | null;
  payment: RentalPaymentSummary | null;
  user?: RentalUserSummary;
}

export interface RentalDetails extends Rental {
  device: CustomerDeviceSummary | AdminDeviceSummary | null;
  payments: RentalPaymentSummary[];
  user?: RentalUserSummary;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListRentalsResult {
  rentals: RentalDetails[];
  pagination: PaginationMeta;
}

export interface RentalCalculationResult {
  totalDays: number;
  totalAmount: number;
  expiresAt: Date;
}

export interface BuildSnapTransactionParams {
  orderId?: string;
  rentalCode: string;
  totalAmount: number;
  totalDays: number;
  device: {
    id: string;
    model: string;
  };
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  clientUrl: string;
}

export interface RentalExpirationJobData {
  rentalId: string;
}

