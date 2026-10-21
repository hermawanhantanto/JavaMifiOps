import { TableCell, TableRow } from '@/components/ui/table';
import type { RentalItem } from '../types/rental.types';
import { formatRentalCurrency, formatRentalDateRange } from '../utils/rental.mapper';
import { RentalStatusBadge } from './rental-status-badge';
import { RentalActions } from './rental-actions';

export interface RentalTableRowProps {
  rental: RentalItem;
  isAdmin: boolean;
}

/**
 * Single-purpose component rendering a single rental record row adhering to role column projection.
 */
export function RentalTableRow({ rental, isAdmin }: RentalTableRowProps) {
  const deviceModel = rental.device?.model ?? 'Pocket WiFi';
  const formattedDates = formatRentalDateRange(
    rental.startDate,
    rental.endDate,
    rental.totalDays
  );

  if (isAdmin) {
    const userName = rental.user?.name || rental.user?.email || 'N/A';
    const userEmail = rental.user?.email;

    return (
      <TableRow className="transition-colors hover:bg-muted/50">
        <TableCell className="font-mono text-xs font-medium text-foreground">
          {rental.rentalCode}
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{userName}</span>
            {userEmail && rental.user?.name && (
              <span className="text-[11px] text-muted-foreground font-mono">{userEmail}</span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm font-medium text-foreground">
          {deviceModel}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {rental.destination}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {formattedDates}
        </TableCell>
        <TableCell className="text-sm font-semibold text-foreground whitespace-nowrap">
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
      <TableCell className="font-mono text-xs font-medium text-foreground">
        {rental.rentalCode}
      </TableCell>
      <TableCell className="text-sm font-medium text-foreground">
        {deviceModel}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {rental.destination}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formattedDates}
      </TableCell>
      <TableCell className="text-sm font-semibold text-foreground whitespace-nowrap">
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
