import { TableCell, TableRow } from '@/components/ui/table';
import type { DeviceItem } from '../types/device.types';
import { formatDailyRate, formatBatteryHealth } from '../utils/device.mapper';
import { DeviceStatusBadge } from './device-status-badge';
import { DeviceSpeedBadge } from './device-speed-badge';

export interface DeviceTableRowProps {
  device: DeviceItem;
  isAdmin: boolean;
}

/**
 * Single-purpose component rendering a single device row matching the active role projection.
 */
export function DeviceTableRow({ device, isAdmin }: DeviceTableRowProps) {
  if (isAdmin) {
    return (
      <TableRow className="transition-colors hover:bg-muted/50">
        <TableCell className="font-mono text-xs text-muted-foreground">
          {device.serialNumber ?? '-'}
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {device.imei ?? '-'}
        </TableCell>
        <TableCell className="font-medium text-foreground">
          {device.model}
        </TableCell>
        <TableCell className="text-xs">
          {formatBatteryHealth(device.batteryHealth)}
        </TableCell>
        <TableCell>
          <DeviceSpeedBadge speed={device.speed} />
        </TableCell>
        <TableCell className="text-xs font-medium">
          {formatDailyRate(device.dailyRate)}
        </TableCell>
        <TableCell className="text-right">
          <DeviceStatusBadge status={device.status} />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="transition-colors hover:bg-muted/50">
      <TableCell className="font-medium text-foreground text-sm">
        {device.model}
      </TableCell>
      <TableCell>
        <DeviceSpeedBadge speed={device.speed} />
      </TableCell>
      <TableCell className="text-sm font-medium">
        {formatDailyRate(device.dailyRate)}
      </TableCell>
      <TableCell className="text-right text-sm">
        {formatBatteryHealth(device.batteryHealth)}
      </TableCell>
    </TableRow>
  );
}
