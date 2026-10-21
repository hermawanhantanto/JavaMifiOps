import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceStatus } from '../types/device.types';

export interface DeviceFilterSelectProps {
  value: DeviceStatus | 'ALL';
  onChange: (value: DeviceStatus | 'ALL') => void;
  isCustomer?: boolean;
  disabled?: boolean;
}

const ALL_STATUS_OPTIONS: Array<{ value: DeviceStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'LOST', label: 'Lost' },
  { value: 'RETIRED', label: 'Retired' },
];

/**
 * Dropdown select filter for device statuses.
 * When isCustomer is true, restricts status filter strictly to AVAILABLE.
 */
export function DeviceFilterSelect({
  value,
  onChange,
  isCustomer = false,
  disabled = false,
}: DeviceFilterSelectProps) {
  if (isCustomer) {
    return (
      <div className="w-[160px]">
        <Select value="AVAILABLE" disabled>
          <SelectTrigger className="h-9 text-xs sm:text-sm bg-card">
            <SelectValue placeholder="Status: Available" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AVAILABLE">Available Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="w-[160px]">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as DeviceStatus | 'ALL')}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 text-xs sm:text-sm bg-card">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {ALL_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
