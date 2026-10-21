import { Badge } from '@/components/ui/badge';
import type { DeviceStatus } from '../types/device.types';
import { formatDeviceStatus } from '../utils/device.mapper';
import { cn } from 'cn';

export interface DeviceStatusBadgeProps {
  status: DeviceStatus | string;
  className?: string;
}

export function DeviceStatusBadge({ status, className }: DeviceStatusBadgeProps) {
  const label = formatDeviceStatus(status);

  let variantClass = 'bg-secondary text-secondary-foreground border-border';

  switch (status) {
    case 'AVAILABLE':
      variantClass =
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      break;
    case 'BOOKED':
      variantClass =
        'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      break;
    case 'RENTED':
      variantClass =
        'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      break;
    case 'MAINTENANCE':
      variantClass =
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      break;
    case 'LOST':
      variantClass =
        'bg-destructive/10 text-destructive border-destructive/20';
      break;
    case 'RETIRED':
      variantClass =
        'bg-muted text-muted-foreground border-border';
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium text-[11px] px-2 py-0.5 rounded-full border', variantClass, className)}
    >
      {label}
    </Badge>
  );
}
