import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis.js';
import type { RentalExpirationJobData } from './rental.dto.js';

export const RENTAL_EXPIRATION_QUEUE_NAME = 'rental-expiration';

export const rentalExpirationQueue = new Queue<RentalExpirationJobData, void, string>(
  RENTAL_EXPIRATION_QUEUE_NAME,
  {
    connection: redisConnectionOptions,
  }
);

/**
 * Schedules an automated expiration job for a pending rental booking.
 * Default delay is 30 minutes (1,800,000 ms).
 */
export const scheduleRentalExpiration = async (
  rentalId: string,
  delayMs: number = 30 * 60 * 1000
): Promise<void> => {
  const jobId = `expire-rental-${rentalId}`;

  // If a previous job exists for this rental (e.g. date renewal), remove it first
  const existingJob = await rentalExpirationQueue.getJob(jobId);
  if (existingJob) {
    await existingJob.remove();
  }

  await rentalExpirationQueue.add(
    'expire',
    { rentalId },
    {
      jobId,
      delay: delayMs,
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
};

/**
 * Cancels any scheduled expiration job for a rental (e.g. on confirmation or manual cancellation).
 */
export const cancelRentalExpiration = async (rentalId: string): Promise<void> => {
  const jobId = `expire-rental-${rentalId}`;
  const existingJob = await rentalExpirationQueue.getJob(jobId);

  if (existingJob) {
    await existingJob.remove();
  }
};
