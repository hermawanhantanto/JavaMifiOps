import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Pencil, XCircle } from 'lucide-react';
import type { RentalItem } from '../types/rental.types';
import { RentalCancelDialog } from './rental-cancel-dialog';
import { RentalUpdateDialog } from './rental-update-dialog';
import { formatRentalStatus } from '../utils/rental.mapper';

export interface RentalActionsProps {
  rental: RentalItem;
  isCustomer?: boolean;
}

/**
 * Single-purpose component rendering administrative and customer action triggers
 * (Pay Now, Update, and Cancel) strictly guarded by booking status.
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
          className="text-xs text-muted-foreground/60 cursor-default select-none px-2"
          title={`Booking is ${formatRentalStatus(rental.status).toLowerCase()} and cannot be modified`}
        >
          —
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Pay Now Button (Direct Midtrans redirect for pending customer bookings) */}
      {isCustomer && paymentUrl && (
        <Button
          size="sm"
          variant="default"
          asChild
          className="h-7 px-2.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Complete payment on Midtrans"
          >
            <CreditCard className="size-3.5 mr-1" />
            <span>Pay</span>
            <ExternalLink className="size-3 ml-1 opacity-70" />
          </a>
        </Button>
      )}

      {/* Update Booking Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsUpdateOpen(true)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
        title="Update Destination or Dates"
      >
        <Pencil className="size-3.5 mr-1" />
        <span>Update</span>
      </Button>

      {/* Cancel Booking Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCancelOpen(true)}
        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        title="Cancel Booking"
      >
        <XCircle className="size-3.5 mr-1" />
        <span>Cancel</span>
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
