import type { z } from 'zod';
import type { Rental, Payment, Device } from '../../generated/prisma/client.js';
import type { createRentalSchema } from './rental.validator.js';

/**
 * Data Transfer Objects (DTOs) strictly scoped to the Rental Feature Module.
 */

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export type RentalResponse = Rental;

export type CustomerDeviceSummary = Pick<Device, 'id' | 'model' | 'speed' | 'status'>;

export type RentalPaymentSummary = Pick<
  Payment,
  'id' | 'amount' | 'status' | 'gateway' | 'snapToken' | 'redirectUrl' | 'expiresAt' | 'createdAt'
>;

export interface RentalWithDetailsResponse extends Rental {
  device: CustomerDeviceSummary | null;
  payment: RentalPaymentSummary | null;
}

export interface RentalCalculationResult {
  totalDays: number;
  totalAmount: number;
  expiresAt: Date;
}

export interface BuildSnapTransactionParams {
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
