import { DeviceSearchInput } from './device-search-input';
import { DeviceFilterSelect } from './device-filter-select';
import type { DeviceStatus } from '../types/device.types';

export interface DeviceToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: DeviceStatus | 'ALL';
  onStatusChange: (status: DeviceStatus | 'ALL') => void;
  isCustomer?: boolean;
  disabled?: boolean;
}

/**
 * Top toolbar for the device table.
 * Houses the debounced search input and the status dropdown filter.
 */
export function DeviceToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isCustomer = false,
  disabled = false,
}: DeviceToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full pb-2">
      <DeviceSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={
          isCustomer
            ? 'Search WiFi models...'
            : 'Search model, serial, or IMEI...'
        }
        disabled={disabled}
      />

      <div className="flex items-center gap-2">
        <DeviceFilterSelect
          value={statusFilter}
          onChange={onStatusChange}
          isCustomer={isCustomer}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
