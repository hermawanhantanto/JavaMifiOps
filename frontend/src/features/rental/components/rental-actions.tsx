import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Pencil, X } from 'lucide-react';
import type { RentalItem } from '../types/rental.types';
import { RentalCancelDialog } from './rental-cancel-dialog';
import { RentalUpdateDialog } from './rental-update-dialog';
import { formatRentalStatus } from '../utils/rental.mapper';

export interface RentalActionsProps {
  rental: RentalItem;
  isCustomer?: boolean;
}

/**
 * Single-purpose component rendering compact icon-only action buttons
 * consistent with device table action patterns.
 */
export function RentalActions({ rental, isCustomer = false }: RentalActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  const isPending = rental.status === 'PENDING_PAYMENT';
  const paymentUrl = rental.payment?.redirectUrl ?? rental.payments?.[0]?.redirectUrl;

  if (!isPending) {
    return (
      <div className="flex items-center justify-end">
        <span
          className="text-muted-foreground/40 text-xs px-2 select-none"
          title={`Booking is ${formatRentalStatus(rental.status).toLowerCase()} and cannot be modified`}
        >
          —
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Pay Action (Customer only) */}
      {isCustomer && paymentUrl && (
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          className="size-7 rounded-lg border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-none"
          title="Pay Now on Midtrans"
        >
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" aria-label="Pay Now">
            <CreditCard className="size-3.5" />
          </a>
        </Button>
      )}

      {/* Edit/Update Action */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setIsUpdateOpen(true)}
        className="size-7 rounded-lg border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-none"
        title="Update Booking"
        aria-label="Update Booking"
      >
        <Pencil className="size-3.5" />
      </Button>

      {/* Cancel Action */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setIsCancelOpen(true)}
        className="size-7 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all shadow-none"
        title="Cancel Booking"
        aria-label="Cancel Booking"
      >
        <X className="size-3.5" />
      </Button>

      {/* Modals */}
      <RentalUpdateDialog
        rental={rental}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />

      <RentalCancelDialog
        rental={rental}
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
      />
    </div>
  );
}
