import { rateLimit } from 'express-rate-limit';
import { sendError } from '../common/response';

/**
 * Rate limiter middleware for login and signin endpoints.
 * Protects against brute-force attacks and credential stuffing.
 * Allows at most 5 attempts per 15-minute window per IP.
 */
export const signinRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: 'draft-8', // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (_req, res, _next, options) => {
    return sendError(
      res,
      'Too many login attempts. Please try again after 15 minutes.',
      null,
      options.statusCode
    );
  },
});
