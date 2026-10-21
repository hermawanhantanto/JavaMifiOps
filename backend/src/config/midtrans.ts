import midtransClient from 'midtrans-client';
import { env } from './env';

/**
 * Midtrans Snap Client Singleton.
 *
 * Context-7 Reference:
 * Midtrans Node.js Client official Snap API initialization.
 * Source: https://github.com/midtrans/midtrans-nodejs-client/blob/master/README.md
 */
export const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});
