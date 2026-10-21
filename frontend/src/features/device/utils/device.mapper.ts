import type { DeviceSpeed, DeviceStatus } from '../types/device.types';

export const SPEED_DISPLAY_MAP: Record<DeviceSpeed, string> = {
  SPEED_4G_150MBPS: '4G (150 Mbps)',
  SPEED_4G_300MBPS: '4G (300 Mbps)',
  SPEED_5G_500MBPS: '5G (500 Mbps)',
  SPEED_5G_1GBPS: '5G (1 Gbps)',
};

export const STATUS_DISPLAY_MAP: Record<DeviceStatus, string> = {
  AVAILABLE: 'Available',
  BOOKED: 'Booked',
  RENTED: 'Rented',
  MAINTENANCE: 'Maintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
};

/**
 * Maps raw backend speed enum into user-friendly readable label.
 */
export function formatDeviceSpeed(speed: DeviceSpeed | string): string {
  if (speed in SPEED_DISPLAY_MAP) {
    return SPEED_DISPLAY_MAP[speed as DeviceSpeed];
  }
  return String(speed);
}

/**
 * Maps raw backend device status into human-readable label.
 */
export function formatDeviceStatus(status: DeviceStatus | string): string {
  if (status in STATUS_DISPLAY_MAP) {
    return STATUS_DISPLAY_MAP[status as DeviceStatus];
  }
  return String(status);
}

/**
 * Formats daily rate integer into IDR currency string.
 */
export function formatDailyRate(rate: number): string {
  return (
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(rate) + ' / day'
  );
}

/**
 * Formats battery health percentage.
 */
export function formatBatteryHealth(health: number): string {
  return `${Math.round(health)}%`;
}
