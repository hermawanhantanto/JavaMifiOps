import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response.js';
import { midtransNotificationSchema } from './payment.validator.js';
import { paymentService } from './payment.service.js';

/**
 * Handles incoming payment notifications from Midtrans.
 * Verifies signature and creates the audit log in payment_webhook_logs first,
 * immediately returns 200 OK to Midtrans so the gateway never waits or times out,
 * and completes state transitions asynchronously in the background.
 */
export const handlePaymentNotification = async (req: Request, res: Response) => {
  const validatedPayload = midtransNotificationSchema.parse(req.body);

  const ingestion = await paymentService.ingestNotificationLog(validatedPayload);

  paymentService
    .processLoggedNotification(ingestion.webhookLogId, validatedPayload)
    .catch((error) => {
      console.error(
        `[ERROR] Background processing failed for webhookLogId ${ingestion.webhookLogId}:`,
        error
      );
    });

  return sendSuccess(res, 'Payment notification received and logged', ingestion, 200);
};
