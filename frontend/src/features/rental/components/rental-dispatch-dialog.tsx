import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RentalItem } from '../types/rental.types';
import { useDispatchRental } from '../hooks/use-dispatch-rental';
import { formatFulfillmentType } from '../utils/rental.mapper';
import { Loader2 } from 'lucide-react';

export interface RentalDispatchDialogProps {
  rental: RentalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentalDispatchDialog({
  rental,
  open,
  onOpenChange,
}: RentalDispatchDialogProps) {
  const dispatchMutation = useDispatchRental();
  const [trackingNumber, setTrackingNumber] = React.useState('');

  React.useEffect(() => {
    if (rental) {
      setTrackingNumber(rental.trackingNumber || '');
    }
  }, [rental]);

  if (!rental) return null;

  const isHomeDelivery = rental.fulfillmentType === 'HOME_DELIVERY';

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatchMutation.mutateAsync({
        id: rental.id,
        input: trackingNumber.trim() ? { trackingNumber: trackingNumber.trim() } : undefined,
      });
      onOpenChange(false);
    } catch {
      // Handled by toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
        <form onSubmit={handleDispatch} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{rental.rentalCode}</span>
              <span>{formatFulfillmentType(rental.fulfillmentType)}</span>
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Dispatch Device
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mark device as dispatched and set rental status to Active.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">
                {rental.user?.name || rental.user?.email || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device</span>
              <span className="font-medium text-foreground">{rental.device?.model ?? 'Pocket Wi-Fi'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isHomeDelivery ? 'Address' : 'Counter'}</span>
              <span className="font-medium text-foreground text-right max-w-[220px] truncate">
                {isHomeDelivery
                  ? rental.shippingAddress || 'Address not specified'
                  : rental.pickupLocation || 'Jakarta Soekarno-Hatta (CGK) T3'}
              </span>
            </div>
          </div>

          {isHomeDelivery && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="dispatch-tracking" className="text-xs font-medium">
                Tracking Number
              </Label>
              <Input
                id="dispatch-tracking"
                placeholder="e.g. JNE1098234710"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={dispatchMutation.isPending}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={dispatchMutation.isPending}
              className="h-9 px-4 text-xs font-medium"
            >
              {dispatchMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <span>Confirm Dispatch</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
