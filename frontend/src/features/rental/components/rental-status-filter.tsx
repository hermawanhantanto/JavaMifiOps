import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RentalStatus } from '../types/rental.types';

export interface RentalStatusFilterProps {
  value: RentalStatus | 'ALL';
  onChange: (value: RentalStatus | 'ALL') => void;
  disabled?: boolean;
}

const RENTAL_STATUS_OPTIONS: Array<{ value: RentalStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

/**
 * Dropdown select filter for rental statuses matching device filter select.
 */
export function RentalStatusFilter({
  value,
  onChange,
  disabled = false,
}: RentalStatusFilterProps) {
  return (
    <div className="w-[165px]">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as RentalStatus | 'ALL')}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 text-xs sm:text-sm bg-card">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {RENTAL_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
