import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../common/errors';
import type { Role } from '../generated/prisma/enums.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Middleware that verifies JWT tokens from HTTP-only cookie or Authorization header.
 * Attaches the authenticated user payload to req.user.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};

/**
 * Role-based access control (RBAC) middleware factory.
 * Enforces that the authenticated user possesses one of the permitted roles.
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Forbidden: Access denied. Insufficient permissions');
    }

    next();
  };
};
