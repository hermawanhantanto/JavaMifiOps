import { z } from 'zod';

export const createRentalSchema = z
  .object({
    deviceId: z
      .string({ required_error: 'Device ID is required' })
      .trim()
      .min(1, 'Device ID is required'),
    destination: z
      .string({ required_error: 'Destination is required' })
      .trim()
      .min(2, 'Destination must be at least 2 characters')
      .max(100, 'Destination cannot exceed 100 characters'),
    startDate: z.coerce.date({ required_error: 'Start date is required' }),
    endDate: z.coerce.date({ required_error: 'End date is required' }),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      start.setUTCHours(0, 0, 0, 0);
      return start.getTime() >= today.getTime();
    },
    {
      message: 'Start date cannot be in the past',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(data.endDate);
      end.setUTCHours(0, 0, 0, 0);
      return end.getTime() >= start.getTime();
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const updateRentalSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(2, 'Destination must be at least 2 characters')
      .max(100, 'Destination cannot exceed 100 characters')
      .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.destination !== undefined ||
      data.startDate !== undefined ||
      data.endDate !== undefined,
    {
      message: 'At least one field (destination, startDate, endDate) must be provided for update',
    }
  )
  .refine(
    (data) => {
      if (data.startDate) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const start = new Date(data.startDate);
        start.setUTCHours(0, 0, 0, 0);
        return start.getTime() >= today.getTime();
      }
      return true;
    },
    {
      message: 'Start date cannot be in the past',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(data.endDate);
        end.setUTCHours(0, 0, 0, 0);
        return end.getTime() >= start.getTime();
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );
