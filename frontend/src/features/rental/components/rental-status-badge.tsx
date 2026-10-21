import { Badge } from '@/components/ui/badge';
import type { RentalStatus } from '../types/rental.types';
import { formatRentalStatus, getRentalStatusClasses } from '../utils/rental.mapper';
import { cn } from 'cn';

export interface RentalStatusBadgeProps {
  status: RentalStatus | string;
  className?: string;
}

/**
 * Single-purpose status badge component for rental bookings.
 * Renders cleanly formatted, accessible status pill without emojis.
 */
export function RentalStatusBadge({ status, className }: RentalStatusBadgeProps) {
  const label = formatRentalStatus(status);
  const colorClasses = getRentalStatusClasses(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-[11px] px-2 py-0.5 rounded-full border tracking-wide whitespace-nowrap',
        colorClasses,
        className
      )}
    >
      {label}
    </Badge>
  );
}
