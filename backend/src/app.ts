import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './auth/auth.route';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

export const createApp = (): Express => {
  const app: Express = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Authentication routes
  app.use('/api/auth', authRouter);

  // Global error handling middleware (Express 5 async error propagation)
  app.use(errorHandler);

  return app;
};
