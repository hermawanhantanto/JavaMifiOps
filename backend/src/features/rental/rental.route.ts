import { Router } from 'express';
import {
  createRentalHandler,
  updateRentalHandler,
  cancelRentalHandler,
  listRentalsHandler,
  getRentalByIdHandler,
  dispatchRentalHandler,
  returnRentalHandler,
} from './rental.handler';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';
import { Role } from '../../generated/prisma/enums.js';

const rentalRouter: Router = Router();

/**
 * Endpoint: GET /api/rental
 * Lists rentals with pagination and role-based scoping.
 * Customers only see their own rentals; Admins can view and filter all.
 */
rentalRouter.get(
  '/',
  authenticateToken,
  requireRole(Role.CUSTOMER, Role.ADMIN),
  listRentalsHandler
);

/**
 * Endpoint: GET /api/rental/:id
 * Retrieves a single rental by ID.
 * Access is restricted to the booking owner and Admins.
 */
rentalRouter.get(
  '/:id',
  authenticateToken,
  requireRole(Role.CUSTOMER, Role.ADMIN),
  getRentalByIdHandler
);

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

/**
 * Endpoint: POST /api/rental/:id/dispatch
 * Dispatches a confirmed rental device to the customer.
 * Transitions Rental from CONFIRMED -> ACTIVE, and Device from BOOKED -> RENTED.
 * ADMIN only.
 */
rentalRouter.post(
  '/:id/dispatch',
  authenticateToken,
  requireRole(Role.ADMIN),
  dispatchRentalHandler
);

/**
 * Endpoint: POST /api/rental/:id/return
 * Processes device return and check-in inspection.
 * Transitions Rental from ACTIVE (or OVERDUE) -> RETURNED.
 * Updates Device to AVAILABLE (or MAINTENANCE / LOST).
 * ADMIN only.
 */
rentalRouter.post(
  '/:id/return',
  authenticateToken,
  requireRole(Role.ADMIN),
  returnRentalHandler
);

export default rentalRouter;
