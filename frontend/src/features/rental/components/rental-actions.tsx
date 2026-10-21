import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, MapPin, Pencil, RotateCcw, Send, X } from 'lucide-react';
import type { RentalItem } from '../types/rental.types';
import { RentalCancelDialog } from './rental-cancel-dialog';
import { RentalUpdateDialog } from './rental-update-dialog';
import { RentalFulfillmentDialog } from './rental-fulfillment-dialog';
import { RentalDispatchDialog } from './rental-dispatch-dialog';
import { RentalReturnDialog } from './rental-return-dialog';

export interface RentalActionsProps {
  rental: RentalItem;
  isCustomer?: boolean;
}

/**
 * Single-purpose component rendering compact action buttons
 * with full lifecycle support (Pay, Edit, Cancel, Fulfillment Guide, Dispatch, Return).
 */
export function RentalActions({ rental, isCustomer = false }: RentalActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [isFulfillmentOpen, setIsFulfillmentOpen] = React.useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = React.useState(false);
  const [isReturnOpen, setIsReturnOpen] = React.useState(false);

  const isPending = rental.status === 'PENDING_PAYMENT';
  const isConfirmed = rental.status === 'CONFIRMED';
  const isActive = rental.status === 'ACTIVE' || rental.status === 'OVERDUE';
  const paymentUrl = rental.payment?.redirectUrl ?? rental.payments?.[0]?.redirectUrl;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* 1. Fulfillment Guide (Available for Customer & Admin once confirmed/active/returned) */}
      {!isPending && rental.status !== 'CANCELLED' && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setIsFulfillmentOpen(true)}
          className="size-7 rounded-lg border-primary/30 text-primary hover:bg-primary/10 transition-all shadow-none"
          title="Fulfillment & Return Instructions"
          aria-label="Fulfillment & Return Instructions"
        >
          <MapPin className="size-3.5" />
        </Button>
      )}

      {/* 2. Admin Dispatch Action (CONFIRMED status) */}
      {!isCustomer && isConfirmed && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setIsDispatchOpen(true)}
          className="size-7 rounded-lg border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all shadow-none"
          title="Dispatch Device to Customer"
          aria-label="Dispatch Device"
        >
          <Send className="size-3.5" />
        </Button>
      )}

      {/* 3. Admin Return Inspection Action (ACTIVE or OVERDUE status) */}
      {!isCustomer && isActive && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setIsReturnOpen(true)}
          className="size-7 rounded-lg border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-all shadow-none"
          title="Process Device Return & Inspection"
          aria-label="Process Device Return"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      )}

      {/* 4. Pay Action (Customer only when PENDING_PAYMENT) */}
      {isPending && isCustomer && paymentUrl && (
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

      {/* 5. Edit/Update Action (PENDING_PAYMENT only) */}
      {isPending && (
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
      )}

      {/* 6. Cancel Action (PENDING_PAYMENT only) */}
      {isPending && (
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
      )}

      {/* Modals */}
      <RentalFulfillmentDialog
        rental={rental}
        open={isFulfillmentOpen}
        onOpenChange={setIsFulfillmentOpen}
      />

      <RentalDispatchDialog
        rental={rental}
        open={isDispatchOpen}
        onOpenChange={setIsDispatchOpen}
      />

      <RentalReturnDialog
        rental={rental}
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
      />

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
