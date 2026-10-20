import type { Request, Response } from 'express';
import { addDeviceSchema } from './device.validator';
import { deviceService } from './device.service';
import { sendSuccess } from '../../common/response';

/**
 * Device Handler / Controller.
 * Responsible ONLY for processing request and response.
 * Delegates validation to addDeviceSchema and database logic to deviceService.
 */
export const addDeviceHandler = async (req: Request, res: Response) => {
  // 1. Process and validate request payload
  const validatedData = addDeviceSchema.parse(req.body);

  // 2. Delegate business logic and persistence to service
  const device = await deviceService.addDevice(validatedData);

  // 3. Return standardized API success response
  return sendSuccess(res, 'Device added successfully', { device }, 201);
};
