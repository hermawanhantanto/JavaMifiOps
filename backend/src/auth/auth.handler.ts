import type { Request, Response, CookieOptions } from 'express';
import { signupSchema, signinSchema } from './auth.validator';
import { authService } from './auth.service';
import { sendSuccess } from '../common/response';
import { env } from '../config/env';

export const AUTH_COOKIE_NAME = 'token';

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
};

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

/**
 * Handles user authentication (signin).
 * Sets HTTP-only secure cookie and returns standardized success response.
 */
export const signinHandler = async (req: Request, res: Response) => {
  // 1. Process and validate request payload
  const validatedData = signinSchema.parse(req.body);

  // 2. Delegate authentication logic to service
  const { user, token } = await authService.signin(validatedData);

  // 3. Set token in HTTP-only cookie
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  // 4. Output standardized response format: { status, message, data }
  return sendSuccess(res, 'Login successful', { user, token }, 200);
};
