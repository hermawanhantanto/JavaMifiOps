import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { verifyMidtransSignature, mapMidtransStatus, parsePaidDate } from './payment.helper.js';
import type {
  MidtransNotificationPayload,
  ProcessNotificationResult,
  WebhookLogIngestionResult,
} from './payment.dto.js';
import { cancelRentalExpiration } from '../rental/rental.queue.js';

export class PaymentService {
  /**
   * Verifies the cryptographic SHA-512 signature and persists the audit log entry
   * in payment_webhook_logs so the HTTP handler can immediately return 200 OK to Midtrans.
   */
  public async ingestNotificationLog(
    payload: MidtransNotificationPayload
  ): Promise<WebhookLogIngestionResult> {
    const isSignatureValid = verifyMidtransSignature(
      payload.order_id,
      payload.status_code,
      payload.gross_amount,
      env.MIDTRANS_SERVER_KEY,
      payload.signature_key
    );

    let numericGrossAmount: Prisma.Decimal | null = null;
    if (payload.gross_amount) {
      numericGrossAmount = new Prisma.Decimal(payload.gross_amount);
    }

    const webhookLog = await prisma.paymentWebhookLog.create({
      data: {
        orderId: payload.order_id,
        transactionId: payload.transaction_id,
        transactionStatus: payload.transaction_status,
        fraudStatus: payload.fraud_status ?? null,
        statusCode: payload.status_code,
        grossAmount: numericGrossAmount,
        signatureKey: payload.signature_key,
        isSignatureValid,
        isProcessed: false,
        rawPayload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    if (!isSignatureValid) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLog.id },
        data: { failureReason: 'Invalid Midtrans signature key' },
      });

      throw new BadRequestError('Invalid payment signature');
    }

    return {
      webhookLogId: webhookLog.id,
      orderId: payload.order_id,
      transactionStatus: payload.transaction_status,
    };
  }

  /**
   * Asynchronously processes a verified and logged Midtrans notification in the background
   * after the HTTP 200 OK response has been returned to Midtrans.
   */
  public async processLoggedNotification(
    webhookLogId: string,
    payload: MidtransNotificationPayload
  ): Promise<ProcessNotificationResult> {
    // 1. Resolve associated Payment and Rental records directly by payment primary key
    const payment = await prisma.payment.findUnique({
      where: { id: payload.order_id },
      include: {
        rental: true,
      },
    });

    if (!payment || !payment.rental) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLogId },
        data: { failureReason: 'Payment or associated rental not found for orderId' },
      });

      throw new NotFoundError('Order not found');
    }

    const rental = payment.rental;

    // Associate payment ID with webhook log
    await prisma.paymentWebhookLog.update({
      where: { id: webhookLogId },
      data: { paymentId: payment.id },
    });

    // 2. Map Midtrans notification status to domain state
    const mapped = mapMidtransStatus(payload.transaction_status, payload.fraud_status);

    // 3. Idempotency Check: Payment already reached target state
    if (payment.status === mapped.paymentStatus) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLogId },
        data: {
          isProcessed: true,
          failureReason: 'Skipped duplicate notification; payment already in target state',
        },
      });

      return {
        orderId: payload.order_id,
        paymentStatus: payment.status,
        rentalStatus: rental.status,
        isDuplicate: true,
        message: 'Notification already processed',
      };
    }

    // 4. Idempotency Check: Conflicting transition for settled payment
    const isSettledPayment = payment.status === 'PAID';
    const isTerminalFailureAttempt =
      mapped.paymentStatus === 'EXPIRED' || mapped.paymentStatus === 'FAILED';

    if (isSettledPayment && isTerminalFailureAttempt) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLogId },
        data: {
          isProcessed: false,
          failureReason: `Conflicting transition: received ${mapped.paymentStatus} for settled PAID payment`,
        },
      });

      return {
        orderId: payload.order_id,
        paymentStatus: payment.status,
        rentalStatus: rental.status,
        isDuplicate: true,
        message: 'Conflicting transition ignored for settled payment',
      };
    }

    // 5. Idempotency Check: Non-actionable status (e.g. pending notification when already pending)
    if (!mapped.shouldUpdate) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLogId },
        data: { isProcessed: true },
      });

      return {
        orderId: payload.order_id,
        paymentStatus: payment.status,
        rentalStatus: rental.status,
        isDuplicate: false,
        message: 'Notification logged without state mutation',
      };
    }

    // 6. Atomic transactional state transition
    const paidAt =
      mapped.paymentStatus === 'PAID'
        ? parsePaidDate(payload.settlement_time, payload.transaction_time)
        : null;

    const targetRentalStatus = mapped.rentalStatus;
    const shouldRelease = mapped.shouldReleaseDevice && rental.deviceId;
    const deviceIdToRelease = rental.deviceId;
    const paymentId = payment.id;
    const rentalId = rental.id;

    await prisma.$transaction(async (tx) => {
      // Update Payment record
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: mapped.paymentStatus,
          paymentMethod: payload.payment_type,
          gatewayRef: payload.transaction_id,
          paidAt: paidAt ?? undefined,
        },
      });

      // Update Rental record if new status is specified
      if (targetRentalStatus) {
        await tx.rental.update({
          where: { id: rentalId },
          data: { status: targetRentalStatus },
        });
      }

      // Release device back to AVAILABLE if rental was cancelled/expired/failed
      if (shouldRelease && deviceIdToRelease) {
        await tx.device.updateMany({
          where: {
            id: deviceIdToRelease,
            status: 'BOOKED',
          },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      // Mark webhook log as processed
      await tx.paymentWebhookLog.update({
        where: { id: webhookLogId },
        data: { isProcessed: true },
      });
    });

    // Cancel scheduled BullMQ expiration job now that payment has transitioned
    await cancelRentalExpiration(rental.id);

    return {
      orderId: payload.order_id,
      paymentStatus: mapped.paymentStatus,
      rentalStatus: targetRentalStatus ?? rental.status,
      isDuplicate: false,
      message: 'Payment notification processed successfully',
    };
  }
}

export const paymentService = new PaymentService();
