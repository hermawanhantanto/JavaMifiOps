import type { DeviceSpeed, DeviceStatus } from '@/features/device/types/device.types';

export type RentalStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface CreateRentalInput {
  deviceId: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export interface UpdateRentalInput {
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export interface RentalUserSummary {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
}

export interface RentalPaymentSummary {
  id: string;
  amount: number;
  status: string;
  gateway?: string;
  snapToken?: string | null;
  redirectUrl?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface RentalDeviceSummary {
  id: string;
  model: string;
  speed: DeviceSpeed;
  status: DeviceStatus;
  serialNumber?: string;
  imei?: string;
  dailyRate?: number;
}

export interface RentalItem {
  id: string;
  rentalCode: string;
  userId: string;
  deviceId: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: RentalStatus | string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  device: RentalDeviceSummary | null;
  payment?: RentalPaymentSummary | null;
  payments?: RentalPaymentSummary[];
  user?: RentalUserSummary;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListRentalsParams {
  page?: number;
  limit?: number;
  status?: RentalStatus | 'ALL';
  search?: string;
  destination?: string;
  userId?: string;
  deviceId?: string;
}

export interface ListRentalsResponseData {
  rentals: RentalItem[];
  pagination: PaginationMeta;
}

export interface SingleRentalResponseData {
  rental: RentalItem;
}

export interface CreateRentalResponseData {
  rental: RentalItem;
}
