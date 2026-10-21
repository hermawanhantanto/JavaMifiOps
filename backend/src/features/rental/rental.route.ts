import { Router } from 'express';
import { createRentalHandler } from './rental.handler';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';
import { Role } from '../../generated/prisma/enums.js';

const rentalRouter: Router = Router();

/**
 * Endpoint: POST /api/rental
 * Books an available pocket Wi-Fi hardware device for an authenticated customer.
 * Automatically computes totalDays and totalAmount, sets device status to BOOKED,
 * and initializes a pending payment record.
 */
rentalRouter.post(
  '/',
  authenticateToken,
  requireRole(Role.CUSTOMER, Role.ADMIN),
  createRentalHandler
);

export default rentalRouter;
