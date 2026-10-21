import type { z } from 'zod';
import type { midtransNotificationSchema } from './payment.validator.js';
import type { PaymentStatus, RentalStatus } from '../../generated/prisma/enums.js';

export type MidtransNotificationPayload = z.infer<typeof midtransNotificationSchema>;

export interface PaymentStatusMappingResult {
  paymentStatus: PaymentStatus;
  rentalStatus: RentalStatus | null;
  shouldReleaseDevice: boolean;
  shouldUpdate: boolean;
}

export interface WebhookLogIngestionResult {
  webhookLogId: string;
  orderId: string;
  transactionStatus: string;
}

export interface ProcessNotificationResult {
  orderId: string;
  paymentStatus: PaymentStatus;
  rentalStatus: RentalStatus | null;
  isDuplicate: boolean;
  message: string;
}
