import { createApp } from './app';
import { env } from './config/env';
import { createRentalExpirationWorker } from './features/rental/rental.worker.js';

const app = createApp();

// Start BullMQ worker for rental expirations
const expirationWorker = createRentalExpirationWorker();

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const handleShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server and BullMQ worker...`);

  await expirationWorker.close();

  server.close(() => {
    console.log('HTTP server and BullMQ worker closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
