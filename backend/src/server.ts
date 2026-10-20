import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const handleShutdown = (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server...`);

  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
