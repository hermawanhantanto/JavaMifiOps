import { RentalSearchInput } from './rental-search-input';
import { RentalStatusFilter } from './rental-status-filter';
import type { RentalStatus } from '../types/rental.types';

export interface RentalToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: RentalStatus | 'ALL';
  onStatusChange: (status: RentalStatus | 'ALL') => void;
  isAdmin?: boolean;
  disabled?: boolean;
}

/**
 * Toolbar component combining debounced search input and status filter dropdown.
 */
export function RentalToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isAdmin = false,
  disabled = false,
}: RentalToolbarProps) {
  const searchPlaceholder = isAdmin
    ? 'Search by code, user, device, destination...'
    : 'Search by code, device, or destination...';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex-1 max-w-md">
        <RentalSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-2">
        <RentalStatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
