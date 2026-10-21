import { Router } from 'express';
import {
  signupHandler,
  signinHandler,
  signoutHandler,
  getMeHandler,
  updateProfileHandler,
} from './auth.handler';
import { signinRateLimiter } from '../../middlewares/rate-limit.middleware';
import { authenticateToken } from '../../middlewares/auth.middleware';

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

/**
 * Endpoint: POST /api/auth/signout
 * Clears the authentication token cookie.
 */
authRouter.post('/signout', signoutHandler);

/**
 * Endpoint: GET /api/auth/me
 * Retrieves current authenticated user's profile.
 */
authRouter.get('/me', authenticateToken, getMeHandler);

/**
 * Endpoint: PATCH /api/auth/profile
 * Updates authenticated user's profile information.
 */
authRouter.patch('/profile', authenticateToken, updateProfileHandler);

export default authRouter;
