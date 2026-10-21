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
 * Top toolbar for the rental table, consistent with device toolbar.
 */
export function RentalToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isAdmin = false,
  disabled = false,
}: RentalToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full pb-2">
      <RentalSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={
          isAdmin
            ? 'Search code, user, device, destination...'
            : 'Search code, device, or destination...'
        }
        disabled={disabled}
      />

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
