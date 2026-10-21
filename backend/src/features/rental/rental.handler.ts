import type { Request, Response } from 'express';
import {
  createRentalSchema,
  updateRentalSchema,
  listRentalsQuerySchema,
  returnRentalSchema,
  dispatchRentalSchema,
} from './rental.validator';
import { rentalService } from './rental.service';
import { sendSuccess } from '../../common/response';
import { BadRequestError, UnauthorizedError } from '../../common/errors';

/**
 * Rental Handler / Controller.
 * Responsible strictly for parsing request payload and returning standard API envelope responses.
 * Delegates data validation to rental.validator and business persistence to rentalService.
 */
export const createRentalHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // 1. Validate request body against Zod contract
  const validatedData = createRentalSchema.parse(req.body);

  // 2. Delegate to service layer
  const rental = await rentalService.createRental(req.user.userId, validatedData);

  // 3. Return standardized success response
  return sendSuccess(res, 'Rental booked successfully', { rental }, 201);
};

/**
 * Updates an existing rental booking in PENDING_PAYMENT status.
 */
export const updateRentalHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const rentalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rentalId) {
    throw new BadRequestError('Rental ID is required');
  }

  const validatedData = updateRentalSchema.parse(req.body);
  const rental = await rentalService.updateRental(
    rentalId,
    req.user.userId,
    req.user.role,
    validatedData
  );

  return sendSuccess(res, 'Rental updated successfully', { rental }, 200);
};

/**
 * Cancels a rental booking in PENDING_PAYMENT status.
 */
export const cancelRentalHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const rentalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rentalId) {
    throw new BadRequestError('Rental ID is required');
  }

  const rental = await rentalService.cancelRental(rentalId, req.user.userId, req.user.role);

  return sendSuccess(res, 'Rental booking cancelled successfully', { rental }, 200);
};

/**
 * Retrieves a single rental by ID.
 * Access is restricted to the booking owner and Admins.
 */
export const getRentalByIdHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const rentalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rentalId) {
    throw new BadRequestError('Rental ID is required');
  }

  const rental = await rentalService.getRentalById(
    rentalId,
    req.user.userId,
    req.user.role
  );

  return sendSuccess(res, 'Rental retrieved successfully', { rental }, 200);
};

/**
 * Lists rentals with pagination, filtering, and role scoping.
 * Customers are strictly scoped to their own rentals; Admins can view and filter all.
 */
export const listRentalsHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const query = listRentalsQuerySchema.parse(req.query);
  const result = await rentalService.listRentals(
    query,
    req.user.userId,
    req.user.role
  );

  return sendSuccess(res, 'Rentals retrieved successfully', result, 200);
};

/**
 * Dispatches an assigned device for a CONFIRMED rental booking.
 * Transitions Rental to ACTIVE and Device to RENTED.
 * Admin only.
 */
export const dispatchRentalHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const rentalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rentalId) {
    throw new BadRequestError('Rental ID is required');
  }

  const validatedInput = dispatchRentalSchema.parse(req.body ?? {});
  const rental = await rentalService.dispatchRental(rentalId, validatedInput);

  return sendSuccess(res, 'Rental device dispatched successfully', { rental }, 200);
};

/**
 * Processes the return and inspection of a device for an ACTIVE or OVERDUE rental.
 * Transitions Rental to RETURNED and Device to AVAILABLE (or MAINTENANCE / LOST).
 * Admin only.
 */
export const returnRentalHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const rentalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!rentalId) {
    throw new BadRequestError('Rental ID is required');
  }

  const validatedInput = returnRentalSchema.parse(req.body ?? {});
  const rental = await rentalService.returnRental(rentalId, validatedInput);

  return sendSuccess(res, 'Rental device returned successfully', { rental }, 200);
};


