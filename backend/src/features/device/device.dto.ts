import type { z } from 'zod';
import type {
  addDeviceSchema,
  listDeviceQuerySchema,
  getDeviceByIdSchema,
  updateDeviceSchema,
} from './device.validator.js';

/**
 * Data Transfer Objects (DTOs) for the Device Feature Module.
 */

export type AddDeviceInput = z.infer<typeof addDeviceSchema>;

export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export type ListDeviceQuery = z.infer<typeof listDeviceQuerySchema>;

export type GetDeviceByIdParams = z.infer<typeof getDeviceByIdSchema>;

export interface DeviceConflictCheckParams {
  serialNumber?: string;
  imei?: string;
}
