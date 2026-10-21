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
  formatRentalStatus,
  getRentalStatusVariant,
} from '@/features/rental/utils/rental.mapper';
import { ArrowRight, ExternalLink } from 'lucide-react';

export interface CustomerRecentTableProps {
  rentals: RentalItem[];
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering the customer's recent bookings activity feed.
 */
export function CustomerRecentTable({
  rentals,
  isLoading = false,
}: CustomerRecentTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h3 className="text-base font-semibold text-foreground font-heading">
            Recent Bookings
          </h3>
          <p className="text-xs text-muted-foreground">
            Your latest travel reservations and rental statuses.
          </p>
        </div>

        <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary gap-1">
          <Link to="/rental">
            <span>View All</span>
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">Booking Code</TableHead>
              <TableHead className="min-w-[130px]">Destination</TableHead>
              <TableHead className="min-w-[140px]">Device</TableHead>
              <TableHead className="w-[160px]">Dates</TableHead>
              <TableHead className="w-[120px]">Total Due</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-24 font-mono" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-7 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : rentals.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-28 text-center text-xs sm:text-sm text-muted-foreground">
                  No bookings found yet. Reserve your first pocket Wi-Fi device to begin.
                </TableCell>
              </TableRow>
            ) : (
              rentals.map((rental) => {
                const isPending = rental.status === 'PENDING_PAYMENT';
                const paymentUrl =
                  rental.payment?.redirectUrl ?? rental.payments?.[0]?.redirectUrl;

                return (
                  <TableRow key={rental.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {rental.rentalCode}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      {rental.destination}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {rental.device?.model ?? 'Pocket WiFi'}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatRentalDateRange(rental.startDate, rental.endDate)}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-foreground">
                      {formatRentalCurrency(rental.totalAmount)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getRentalStatusVariant(
                          rental.status
                        )}`}
                      >
                        {formatRentalStatus(rental.status)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      {isPending && paymentUrl ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                        >
                          <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                            <span>Pay</span>
                            <ExternalLink className="size-3 ml-1" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/30 select-none pr-2">—</span>
                      )}
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
