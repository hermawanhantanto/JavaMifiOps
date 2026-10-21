import { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client.js';
import type {
  DeviceSpeed,
  DeviceStatus,
  FulfillmentType,
  PaymentGateway,
  PaymentStatus,
  RentalStatus,
} from '../../generated/prisma/enums.js';
import type {
  supportCancelRentalSchema,
  supportUpdateLogisticsSchema,
  trackRentalParamSchema,
} from './public.validator.js';

export type TrackRentalParamInput = z.infer<typeof trackRentalParamSchema>;
export type SupportUpdateLogisticsInput = z.infer<typeof supportUpdateLogisticsSchema>;
export type SupportCancelRentalInput = z.infer<typeof supportCancelRentalSchema>;

export interface PublicDeviceItem {
  id: string;
  model: string;
  speed: DeviceSpeed;
  dailyRate: Prisma.Decimal;
  batteryHealth: number;
  status: DeviceStatus;
}

export interface PublicDeviceListResult {
  devices: PublicDeviceItem[];
}

export interface PublicPaymentSummary {
  status: PaymentStatus;
  gateway: PaymentGateway;
  amount: Prisma.Decimal;
  redirectUrl: string | null;
  paidAt: Date | null;
  expiresAt: Date | null;
}

export interface PublicRentalTrackingResponse {
  rentalCode: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: Prisma.Decimal;
  status: RentalStatus;
  fulfillmentType: FulfillmentType;
  pickupLocation: string | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  expiresAt: Date | null;
  device: {
    model: string;
    speed: DeviceSpeed;
  } | null;
  payment: PublicPaymentSummary | null;
}
