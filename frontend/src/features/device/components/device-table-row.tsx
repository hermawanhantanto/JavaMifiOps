import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import type { DeviceItem } from '../types/device.types';
import { formatDailyRate, formatBatteryHealth } from '../utils/device.mapper';
import { DeviceStatusBadge } from './device-status-badge';
import { DeviceSpeedBadge } from './device-speed-badge';
import { DeviceActions } from './device-actions';
import { RentalBookingDialog } from '@/features/rental/components/rental-booking-dialog';

export interface DeviceTableRowProps {
  device: DeviceItem;
  isAdmin: boolean;
}

/**
 * Single-purpose component rendering a single device row matching the active role projection.
 * Columns: Model -> Speed -> Battery Health -> Daily Rate -> Action.
 */
export function DeviceTableRow({ device, isAdmin }: DeviceTableRowProps) {
  const [isRentDialogOpen, setIsRentDialogOpen] = React.useState(false);

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
        <TableCell>
          <DeviceSpeedBadge speed={device.speed} />
        </TableCell>
        <TableCell className="text-xs">
          {formatBatteryHealth(device.batteryHealth)}
        </TableCell>
        <TableCell className="text-xs font-medium">
          {formatDailyRate(device.dailyRate)}
        </TableCell>
        <TableCell>
          <DeviceStatusBadge status={device.status} />
        </TableCell>
        <TableCell className="text-right">
          <DeviceActions device={device} />
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
      <TableCell className="text-sm">
        {formatBatteryHealth(device.batteryHealth)}
      </TableCell>
      <TableCell className="text-sm font-medium">
        {formatDailyRate(device.dailyRate)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setIsRentDialogOpen(true)}
          className="size-7 rounded-lg border-border/80 text-primary hover:border-primary/50 hover:bg-primary/10 transition-all shadow-none"
          title="Rent Device"
          aria-label="Rent Device"
        >
          <CalendarPlus className="size-3.5" />
        </Button>
        <RentalBookingDialog
          device={device}
          open={isRentDialogOpen}
          onOpenChange={setIsRentDialogOpen}
        />
      </TableCell>
    </TableRow>
  );
}
