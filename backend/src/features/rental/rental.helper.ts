import crypto from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client.js';
import type { RentalCalculationResult } from './rental.dto.js';

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
