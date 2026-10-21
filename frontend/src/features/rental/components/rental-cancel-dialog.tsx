import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { RentalItem } from '../types/rental.types';
import { useCancelRental } from '../hooks/use-cancel-rental';

export interface RentalCancelDialogProps {
  rental: RentalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Single-purpose confirmation modal dialog for cancelling a pending payment rental booking.
 */
export function RentalCancelDialog({
  rental,
  open,
  onOpenChange,
}: RentalCancelDialogProps) {
  const cancelMutation = useCancelRental();

  if (!rental) return null;

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync(rental.id);
      onOpenChange(false);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle>Cancel Rental Booking</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel booking{' '}
            <span className="font-mono font-medium text-foreground">{rental.rentalCode}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Device Model:</span>
            <span className="font-medium text-foreground">{rental.device?.model ?? 'Pocket WiFi'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Destination:</span>
            <span className="font-medium text-foreground">{rental.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reserved Duration:</span>
            <span className="font-medium text-foreground">{rental.totalDays} day(s)</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Cancelling will immediately release the reserved device back into available fleet inventory
          and invalidate the pending payment session. This action cannot be reversed.
        </p>

        <DialogFooter className="gap-2 sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={cancelMutation.isPending}
            className="text-xs"
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={cancelMutation.isPending}
            className="text-xs"
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
