import { z } from 'zod';
import { FulfillmentType } from '../../generated/prisma/enums.js';

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

export const trackRentalParamSchema = z.object({
  code: z
    .string({ required_error: 'Rental code is required' })
    .trim()
    .min(1, 'Rental code is required'),
});

export const supportUpdateLogisticsSchema = z
  .object({
    rentalCode: z
      .string({ required_error: 'Rental code is required' })
      .trim()
      .min(1, 'Rental code is required'),
    email: z
      .string({ required_error: 'Account email is required for verification' })
      .trim()
      .email('Valid email address is required'),
    fulfillmentType: z.preprocess(
      emptyStringToUndefined,
      z.nativeEnum(FulfillmentType).optional()
    ),
    pickupLocation: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().max(100, 'Pickup location cannot exceed 100 characters').optional()
    ),
    shippingAddress: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().max(500, 'Shipping address cannot exceed 500 characters').optional()
    ),
  })
  .refine(
    (data) =>
      data.fulfillmentType !== undefined ||
      data.pickupLocation !== undefined ||
      data.shippingAddress !== undefined,
    {
      message:
        'At least one logistics field (fulfillmentType, pickupLocation, or shippingAddress) must be provided',
    }
  );

export const supportCancelRentalSchema = z.object({
  rentalCode: z
    .string({ required_error: 'Rental code is required' })
    .trim()
    .min(1, 'Rental code is required'),
  email: z
    .string({ required_error: 'Account email is required for verification' })
    .trim()
    .email('Valid email address is required'),
});
