import { Router } from 'express';
import { signupHandler } from './auth.handler';

const authRouter: Router = Router();

/**
 * Endpoint: POST /api/auth/signup
 */
authRouter.post('/signup', signupHandler);

export default authRouter;
