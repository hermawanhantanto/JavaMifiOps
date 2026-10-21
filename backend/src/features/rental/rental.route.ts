import { Router } from 'express';
import {
  createRentalHandler,
  updateRentalHandler,
  cancelRentalHandler,
} from './rental.handler';
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

/**
 * Endpoint: PATCH /api/rental/:id
 * Updates an existing rental booking while in PENDING_PAYMENT status.
 * If dates change, recalculates amounts, voids previous pending payment,
 * and generates a new Midtrans Snap payment URL.
 */
rentalRouter.patch(
  '/:id',
  authenticateToken,
  requireRole(Role.CUSTOMER, Role.ADMIN),
  updateRentalHandler
);

/**
 * Endpoint: POST /api/rental/:id/cancel
 * Cancels a rental booking while in PENDING_PAYMENT status.
 * Releases the reserved hardware device back to AVAILABLE,
 * expires any pending payment, and performs best-effort cancellation on Midtrans.
 */
rentalRouter.post(
  '/:id/cancel',
  authenticateToken,
  requireRole(Role.CUSTOMER, Role.ADMIN),
  cancelRentalHandler
);

export default rentalRouter;
