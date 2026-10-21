export type DeviceSpeed =
  | 'SPEED_4G_150MBPS'
  | 'SPEED_4G_300MBPS'
  | 'SPEED_5G_500MBPS'
  | 'SPEED_5G_1GBPS';

export type DeviceStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'LOST'
  | 'RETIRED';

export interface DeviceItem {
  id: string;
  serialNumber?: string;
  imei?: string;
  model: string;
  batteryHealth: number;
  speed: DeviceSpeed;
  dailyRate: number;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListDevicesData {
  devices: DeviceItem[];
  pagination: PaginationMeta;
}

export interface ListDevicesParams {
  page?: number;
  limit?: number;
  status?: DeviceStatus | 'ALL';
  speed?: DeviceSpeed | 'ALL';
  search?: string;
}
