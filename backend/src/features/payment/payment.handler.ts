import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response.js';
import { midtransNotificationSchema } from './payment.validator.js';
import { paymentService } from './payment.service.js';

/**
 * Handles incoming payment notifications from Midtrans.
 * Validates request payload and delegates business logic to paymentService.
 */
export const handlePaymentNotification = async (req: Request, res: Response) => {
  const validatedPayload = midtransNotificationSchema.parse(req.body);

  const result = await paymentService.processNotification(validatedPayload);
  
  return sendSuccess(res, 'Payment notification processed successfully', result, 200);
};
