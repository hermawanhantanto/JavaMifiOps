import type { Request, Response } from 'express';
import { createRentalSchema, updateRentalSchema } from './rental.validator';
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

