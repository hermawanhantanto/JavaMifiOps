import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './auth/auth.route';
import { errorHandler } from './middlewares/error.middleware';
import { sendSuccess } from './common/response';

export const createApp = (): Express => {
  const app: Express = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    return sendSuccess(res, 'JavaMifi Backend is running', {
      timestamp: new Date().toISOString(),
    });
  });

  // Authentication routes
  app.use('/api/auth', authRouter);

  // Global error handling middleware (Express 5 async error propagation)
  app.use(errorHandler);

  return app;
};
