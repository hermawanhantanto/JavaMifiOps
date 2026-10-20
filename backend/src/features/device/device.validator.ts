import { z } from 'zod';
import { DeviceSpeed, DeviceStatus } from '../../generated/prisma/enums.js';

export const addDeviceSchema = z.object({
  serialNumber: z
    .string({ required_error: 'Serial number is required' })
    .trim()
    .min(3, 'Serial number must be at least 3 characters')
    .max(50, 'Serial number cannot exceed 50 characters'),
  imei: z
    .string({ required_error: 'IMEI is required' })
    .trim()
    .regex(/^\d{15}$/, 'IMEI must be exactly 15 numeric digits'),
  model: z
    .string({ required_error: 'Model is required' })
    .trim()
    .min(2, 'Model must be at least 2 characters')
    .max(100, 'Model cannot exceed 100 characters'),
  batteryHealth: z
    .number({ required_error: 'Battery health is required' })
    .int('Battery health must be an integer')
    .min(0, 'Battery health must be between 0 and 100')
    .max(100, 'Battery health must be between 0 and 100')
    .default(100),
  speed: z.nativeEnum(DeviceSpeed, {
    errorMap: () => ({
      message: `Speed must be one of: ${Object.values(DeviceSpeed).join(', ')}`,
    }),
  }),
  dailyRate: z
    .number({ required_error: 'Daily rate is required' })
    .positive('Daily rate must be greater than 0'),
});

export type AddDeviceInput = z.infer<typeof addDeviceSchema>;

export const listDeviceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(DeviceStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(DeviceStatus).join(', ')}`,
    }),
  }).optional(),
  speed: z.nativeEnum(DeviceSpeed, {
    errorMap: () => ({
      message: `Speed must be one of: ${Object.values(DeviceSpeed).join(', ')}`,
    }),
  }).optional(),
  search: z.string().trim().optional(),
});

export type ListDeviceQuery = z.infer<typeof listDeviceQuerySchema>;

export const getDeviceByIdSchema = z.object({
  id: z.string({ required_error: 'Device ID is required' }).trim().min(1, 'Device ID is required'),
});

export type GetDeviceByIdParams = z.infer<typeof getDeviceByIdSchema>;
