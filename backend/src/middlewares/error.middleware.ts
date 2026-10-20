import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/errors';
import { sendError } from '../common/response';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return sendError(res, 'Validation failed', { errors: formattedErrors }, 400);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.data ?? null, err.statusCode);
  }

  console.error('[Unhandled Server Error]', err);

  return sendError(res, 'Internal server error', null, 500);
};
