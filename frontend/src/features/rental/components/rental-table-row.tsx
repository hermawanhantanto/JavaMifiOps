import { TableCell, TableRow } from '@/components/ui/table';
import type { RentalItem } from '../types/rental.types';
import { formatRentalCurrency, formatRentalDateRange } from '../utils/rental.mapper';
import { RentalStatusBadge } from './rental-status-badge';
import { RentalActions } from './rental-actions';
import { Building2, Truck } from 'lucide-react';

export interface RentalTableRowProps {
  rental: RentalItem;
  isAdmin: boolean;
}

/**
 * Single-purpose table row component consistent with device table row styling.
 */
export function RentalTableRow({ rental, isAdmin }: RentalTableRowProps) {
  const deviceModel = rental.device?.model ?? 'Pocket WiFi';
  const formattedDates = formatRentalDateRange(rental.startDate, rental.endDate);
  const isHomeDelivery = rental.fulfillmentType === 'HOME_DELIVERY';

  const fulfillmentBadge = (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      {isHomeDelivery ? (
        <>
          <Truck className="size-3.5 text-primary shrink-0" />
          <span>Home Delivery</span>
        </>
      ) : (
        <>
          <Building2 className="size-3.5 text-primary shrink-0" />
          <span>Airport Pickup</span>
        </>
      )}
    </span>
  );

  if (isAdmin) {
    const userName = rental.user?.name || rental.user?.email || '—';

    return (
      <TableRow className="transition-colors hover:bg-muted/50">
        <TableCell className="font-mono text-xs text-muted-foreground">
          {rental.rentalCode}
        </TableCell>
        <TableCell className="font-medium text-foreground text-sm">
          {userName}
        </TableCell>
        <TableCell className="font-medium text-foreground text-sm">
          {deviceModel}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {rental.destination}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {formattedDates}
        </TableCell>
        <TableCell>
          {fulfillmentBadge}
        </TableCell>
        <TableCell className="text-sm font-normal text-foreground">
          {formatRentalCurrency(rental.totalAmount)}
        </TableCell>
        <TableCell>
          <RentalStatusBadge status={rental.status} />
        </TableCell>
        <TableCell className="text-right">
          <RentalActions rental={rental} isCustomer={false} />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="transition-colors hover:bg-muted/50">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {rental.rentalCode}
      </TableCell>
      <TableCell className="font-medium text-foreground text-sm">
        {deviceModel}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {rental.destination}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formattedDates}
      </TableCell>
      <TableCell>
        {fulfillmentBadge}
      </TableCell>
      <TableCell className="text-sm font-normal text-foreground">
        {formatRentalCurrency(rental.totalAmount)}
      </TableCell>
      <TableCell>
        <RentalStatusBadge status={rental.status} />
      </TableCell>
      <TableCell className="text-right">
        <RentalActions rental={rental} isCustomer={true} />
      </TableCell>
    </TableRow>
  );
}
