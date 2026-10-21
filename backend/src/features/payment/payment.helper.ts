import crypto from 'node:crypto';
import type { PaymentStatusMappingResult } from './payment.dto.js';

/**
 * Verifies Midtrans SHA-512 signature key.
 * Expected: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean => {
  const payloadToHash = `${orderId}${statusCode}${grossAmount}${serverKey}`;

  const computedHash = crypto.createHash('sha512').update(payloadToHash).digest('hex');
  
  return computedHash.toLowerCase() === signatureKey.toLowerCase();
};

/**
 * Maps Midtrans transaction and fraud status to internal database enums.
 */
export const mapMidtransStatus = (
  transactionStatus: string,
  fraudStatus?: string
): PaymentStatusMappingResult => {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'challenge') {
      return {
        paymentStatus: 'PENDING',
        rentalStatus: null,
        shouldReleaseDevice: false,
        shouldUpdate: false,
      };
    }

    if (fraudStatus === 'accept') {
      return {
        paymentStatus: 'PAID',
        rentalStatus: 'CONFIRMED',
        shouldReleaseDevice: false,
        shouldUpdate: true,
      };
    }

    return {
      paymentStatus: 'PENDING',
      rentalStatus: null,
      shouldReleaseDevice: false,
      shouldUpdate: false,
    };
  }

  if (transactionStatus === 'settlement') {
    return {
      paymentStatus: 'PAID',
      rentalStatus: 'CONFIRMED',
      shouldReleaseDevice: false,
      shouldUpdate: true,
    };
  }

  if (transactionStatus === 'pending') {
    return {
      paymentStatus: 'PENDING',
      rentalStatus: 'PENDING_PAYMENT',
      shouldReleaseDevice: false,
      shouldUpdate: false,
    };
  }

  if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
    return {
      paymentStatus: 'FAILED',
      rentalStatus: 'CANCELLED',
      shouldReleaseDevice: true,
      shouldUpdate: true,
    };
  }

  if (transactionStatus === 'expire') {
    return {
      paymentStatus: 'EXPIRED',
      rentalStatus: 'CANCELLED',
      shouldReleaseDevice: true,
      shouldUpdate: true,
    };
  }

  if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') {
    return {
      paymentStatus: 'REFUNDED',
      rentalStatus: 'CANCELLED',
      shouldReleaseDevice: true,
      shouldUpdate: true,
    };
  }

  return {
    paymentStatus: 'PENDING',
    rentalStatus: null,
    shouldReleaseDevice: false,
    shouldUpdate: false,
  };
};

/**
 * Parses timestamp string from Midtrans (WIB / UTC+7) or falls back to now.
 */
export const parsePaidDate = (settlementTime?: string, transactionTime?: string): Date => {
  const timeCandidate = settlementTime || transactionTime;
  if (!timeCandidate) {
    return new Date();
  }

  const parsed = new Date(timeCandidate.replace(' ', 'T') + '+07:00');
  if (isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};
