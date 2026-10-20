import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

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


  app.get('/health', (req: Request, res: Response) => {
    console.log(`[HealthCheck] ${req.method} ${req.url} - App is healthy and running`);
    res.status(200).json({
      status: 'ok',
      message: 'JavaMifi Backend is running',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};
