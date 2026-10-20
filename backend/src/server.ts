import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
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
