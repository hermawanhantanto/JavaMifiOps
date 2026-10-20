import { Router } from 'express';
import { signupHandler, signinHandler } from './auth.handler';
import { signinRateLimiter } from '../middlewares/rate-limit.middleware';

const authRouter: Router = Router();

/**
 * Endpoint: POST /api/auth/signup
 */
authRouter.post('/signup', signupHandler);

/**
 * Endpoint: POST /api/auth/signin
 * Rate limited to prevent brute-force attacks.
 */
authRouter.post('/signin', signinRateLimiter, signinHandler);

export default authRouter;
