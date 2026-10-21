import { z } from 'zod';

export const midtransNotificationSchema = z
  .object({
    order_id: z.string().min(1, 'Order ID is required'),
    status_code: z.string().min(1, 'Status code is required'),
    gross_amount: z.string().min(1, 'Gross amount is required'),
    signature_key: z.string().min(1, 'Signature key is required'),
    transaction_status: z.string().min(1, 'Transaction status is required'),
    transaction_id: z.string().min(1, 'Transaction ID is required'),
    payment_type: z.string().min(1, 'Payment type is required'),
    fraud_status: z.string().optional(),
    transaction_time: z.string().optional(),
    settlement_time: z.string().optional(),
    status_message: z.string().optional(),
    merchant_id: z.string().optional(),
    currency: z.string().optional(),
    va_numbers: z
      .array(
        z.object({
          va_number: z.string(),
          bank: z.string(),
        })
      )
      .optional(),
    bill_key: z.string().optional(),
    biller_code: z.string().optional(),
    permata_va_number: z.string().optional(),
  })
  .passthrough();
