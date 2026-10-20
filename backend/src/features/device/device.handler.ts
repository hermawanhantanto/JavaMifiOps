import type { Request, Response } from 'express';
import {
  addDeviceSchema,
  getDeviceByIdSchema,
  listDeviceQuerySchema,
  updateDeviceSchema,
} from './device.validator';
import { deviceService } from './device.service';
import { sendSuccess } from '../../common/response';

/**
 * Device Handler / Controller.
 * Responsible ONLY for processing request and response.
 * Delegates validation to device.validator and database logic to deviceService.
 */
export const addDeviceHandler = async (req: Request, res: Response) => {
  // 1. Process and validate request payload
  const validatedData = addDeviceSchema.parse(req.body);

  // 2. Delegate business logic and persistence to service
  const device = await deviceService.addDevice(validatedData);

  // 3. Return standardized API success response
  return sendSuccess(res, 'Device added successfully', { device }, 201);
};

/**
 * Retrieves a single device by its ID parameter.
 */
export const getDeviceByIdHandler = async (req: Request, res: Response) => {
  const { id } = getDeviceByIdSchema.parse(req.params);

  const device = await deviceService.getDeviceById(id, req.user?.role);

  return sendSuccess(res, 'Device retrieved successfully', { device }, 200);
};

/**
 * Retrieves a paginated list of devices with optional query filters.
 */
export const listDevicesHandler = async (req: Request, res: Response) => {
  const validatedQuery = listDeviceQuerySchema.parse(req.query);

  const result = await deviceService.listDevices(validatedQuery, req.user?.role);

  return sendSuccess(res, 'Devices retrieved successfully', result, 200);
};

/**
 * Updates an existing device by ID.
 * Restricted to administrators.
 */
export const updateDeviceHandler = async (req: Request, res: Response) => {
  const { id } = getDeviceByIdSchema.parse(req.params);
  const validatedData = updateDeviceSchema.parse(req.body);

  const device = await deviceService.updateDevice(id, validatedData);

  return sendSuccess(res, 'Device updated successfully', { device }, 200);
};
