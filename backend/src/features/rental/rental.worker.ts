import { Worker, type Job } from 'bullmq';
import { prisma } from '../../config/prisma.js';
import { snap } from '../../config/midtrans.js';
import { redisConnectionOptions } from '../../config/redis.js';
import { DeviceStatus, PaymentStatus, RentalStatus } from '../../generated/prisma/enums.js';
import { RENTAL_EXPIRATION_QUEUE_NAME } from './rental.queue.js';
import type { RentalExpirationJobData } from './rental.dto.js';

/**
 * Core processor for expiring unconfirmed rental bookings.
 * Triggered automatically by BullMQ when the 30-minute delay elapses.
 */
export const processRentalExpiration = async (
  job: Job<RentalExpirationJobData>
): Promise<void> => {
  const { rentalId } = job.data;

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      payments: {
        where: { status: PaymentStatus.PENDING },
      },
    },
  });

  if (!rental || rental.status !== RentalStatus.PENDING_PAYMENT) return;


  // 1. Best-effort cancellation on Midtrans for any active pending payment sessions
  for (const payment of rental.payments) {
    try {
      await (snap as any).transaction?.cancel(payment.id);
    } catch (error: any) {
      console.error(`[ERROR] Failed to cancel Midtrans payment ${payment.id} for rental ${rental.rentalCode}:`, error);
    }
  }

  // 2. Atomic state transition in database
  const deviceId = rental.deviceId;
  await prisma.$transaction(async (tx) => {
    // Expire pending payments
    await tx.payment.updateMany({
      where: {
        rentalId: rental.id,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.EXPIRED,
      },
    });

    // Release device back to AVAILABLE
    if (deviceId) {
      await tx.device.updateMany({
        where: {
          id: deviceId,
          status: DeviceStatus.BOOKED,
        },
        data: {
          status: DeviceStatus.AVAILABLE,
        },
      });
    }

    // Transition rental status to CANCELLED
    await tx.rental.update({
      where: { id: rental.id },
      data: {
        status: RentalStatus.CANCELLED,
      },
    });
  });
};

/**
 * Initializes and returns the BullMQ worker for rental expirations.
 */
export const createRentalExpirationWorker = (): Worker<RentalExpirationJobData, void, string> => {
  const worker = new Worker<RentalExpirationJobData, void, string>(
    RENTAL_EXPIRATION_QUEUE_NAME,
    processRentalExpiration,
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.info(`[INFO] Expiration worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[ERROR] Expiration worker failed job ${job?.id}:`, err);
  });

  return worker;
};
