import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response';
import { publicService } from './public.service';
import {
  supportCancelRentalSchema,
  supportUpdateLogisticsSchema,
  trackRentalParamSchema,
} from './public.validator';

/**
 * Retrieves all currently available pocket Wi-Fi devices.
 */
export const listPublicDevicesHandler = async (req: Request, res: Response) => {
  const result = await publicService.listAvailableDevices();

  return sendSuccess(res, 'Available devices retrieved successfully', result, 200);
};

/**
 * Retrieves booking tracking, fulfillment, and payment checkout details by Rental Code.
 */
export const trackPublicRentalHandler = async (req: Request, res: Response) => {
  const { code } = trackRentalParamSchema.parse(req.params);

  const rental = await publicService.trackRentalByCode(code);

  return sendSuccess(res, 'Rental tracking details retrieved successfully', { rental }, 200);
};

/**
 * Updates rental fulfillment type, airport pickup counter, or home delivery shipping address
 * after verifying both the Rental Code and the customer's registered email address.
 */
export const updatePublicRentalLogisticsHandler = async (req: Request, res: Response) => {
  const payload = { ...req.query, ...req.body };
  const validatedData = supportUpdateLogisticsSchema.parse(payload);

  const rental = await publicService.updateRentalLogisticsBySupport(validatedData);

  return sendSuccess(res, 'Rental fulfillment logistics updated successfully', { rental }, 200);
};

/**
 * Cancels an unpaid (PENDING_PAYMENT) rental booking and releases the hardware device
 * after verifying both the Rental Code and the customer's registered email address.
 */
export const cancelPublicRentalHandler = async (req: Request, res: Response) => {
  const payload = { ...req.query, ...req.body };
  const validatedData = supportCancelRentalSchema.parse(payload);

  const rental = await publicService.cancelRentalBySupport(validatedData);

  return sendSuccess(
    res,
    'Rental booking cancelled and device released successfully',
    { rental },
    200
  );
};
