import type { ConnectionOptions } from 'bullmq';
import { env } from './env.js';

/**
 * Shared Redis connection options for BullMQ queues and workers.
 * maxRetriesPerRequest must be null as required by BullMQ.
 */
export const redisConnectionOptions: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};
