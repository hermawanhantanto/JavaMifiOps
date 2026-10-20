import type { Request, Response } from 'express';
import { signupSchema } from './auth.validator';
import { authService } from './auth.service';
import { sendSuccess } from '../common/response';

/**
 * Auth Handler / Controller.
 * Responsible ONLY for processing request and response.
 * Delegates validation to auth.validator and business logic / DB operations to auth.service.
 */
export const signupHandler = async (req: Request, res: Response) => {
  // 1. Process and validate request payload
  const validatedData = signupSchema.parse(req.body);

  // 2. Delegate business logic and DB operations to service
  const user = await authService.signup(validatedData);

  // 3. Output standardized response format: { status, message, data }
  return sendSuccess(res, 'User registered successfully', { user }, 201);
};
