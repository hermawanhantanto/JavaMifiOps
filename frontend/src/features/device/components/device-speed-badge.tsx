import { Badge } from '@/components/ui/badge';
import type { DeviceSpeed } from '../types/device.types';
import { formatDeviceSpeed } from '../utils/device.mapper';
import { cn } from 'cn';

export interface DeviceSpeedBadgeProps {
  speed: DeviceSpeed | string;
  className?: string;
}

export function DeviceSpeedBadge({ speed, className }: DeviceSpeedBadgeProps) {
  const displayLabel = formatDeviceSpeed(speed);

  return (
    <Badge
      variant="secondary"
      className={cn('font-normal text-xs text-foreground bg-muted/70 px-2 py-0.5 border border-border/50', className)}
    >
      {displayLabel}
    </Badge>
  );
}
