import { Badge } from '@/components/ui/badge';
import type { RentalStatus } from '../types/rental.types';
import { formatRentalStatus, getRentalStatusVariant } from '../utils/rental.mapper';
import { cn } from 'cn';

export interface RentalStatusBadgeProps {
  status: RentalStatus | string;
  className?: string;
}

/**
 * Status badge component consistent with DeviceStatusBadge styling.
 */
export function RentalStatusBadge({ status, className }: RentalStatusBadgeProps) {
  const label = formatRentalStatus(status);
  const variantClass = getRentalStatusVariant(status);

  return (
    <Badge
      variant="outline"
      className={cn('font-medium text-[11px] px-2 py-0.5 rounded-full border', variantClass, className)}
    >
      {label}
    </Badge>
  );
}
