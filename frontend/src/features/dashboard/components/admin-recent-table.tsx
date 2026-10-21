import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { RentalItem } from '@/features/rental/types/rental.types';
import {
  formatRentalCurrency,
  formatRentalDateRange,
} from '@/features/rental/utils/rental.mapper';
import { RentalStatusBadge } from '@/features/rental/components/rental-status-badge';
import { RentalActions } from '@/features/rental/components/rental-actions';
import { ArrowRight } from 'lucide-react';

export interface AdminRecentTableProps {
  rentals: RentalItem[];
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering the administrative platform bookings activity table.
 * Includes direct operational action controls (Dispatch, Return check-in, Fulfillment details).
 */
export function AdminRecentTable({
  rentals,
  isLoading = false,
}: AdminRecentTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h3 className="text-base font-semibold text-foreground font-heading">
            Recent Platform Bookings
          </h3>
          <p className="text-xs text-muted-foreground">
            Latest customer reservations and active hardware orders.
          </p>
        </div>

        <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary gap-1">
          <Link to="/rental">
            <span>View All Orders</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">Booking Code</TableHead>
              <TableHead className="min-w-[130px]">Customer</TableHead>
              <TableHead className="min-w-[120px]">Device Model</TableHead>
              <TableHead className="min-w-[110px]">Destination</TableHead>
              <TableHead className="w-[150px]">Dates</TableHead>
              <TableHead className="w-[110px]">Total Due</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[110px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-24 font-mono" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-7 w-14 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : rentals.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-28 text-center text-xs sm:text-sm text-muted-foreground">
                  No rental bookings recorded yet. New customer reservations will appear here.
                </TableCell>
              </TableRow>
            ) : (
              rentals.map((rental) => {
                const customerName = rental.user?.name || rental.user?.email || '—';
                const deviceModel = rental.device?.model ?? 'Pocket WiFi';

                return (
                  <TableRow key={rental.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {rental.rentalCode}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      {customerName}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      {deviceModel}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {rental.destination}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatRentalDateRange(rental.startDate, rental.endDate)}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
