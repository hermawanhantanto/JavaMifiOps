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
import { Badge } from '@/components/ui/badge';
import type { RentalItem } from '../types/rental.types';
import { useDispatchRental } from '../hooks/use-dispatch-rental';
import { formatFulfillmentType } from '../utils/rental.mapper';
import { Building2, Loader2, Send, Truck, Wifi } from 'lucide-react';

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
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 sm:p-7">
        <form onSubmit={handleDispatch} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <Badge variant="outline" className="font-mono text-[11px] font-medium">
                {rental.rentalCode}
              </Badge>
              <Badge variant="secondary" className="text-[11px] font-medium">
                {formatFulfillmentType(rental.fulfillmentType)}
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground font-heading pt-1">
              Dispatch Rental Device
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transition rental status to ACTIVE and mark hardware device as RENTED.
            </DialogDescription>
          </DialogHeader>

          {/* Device & Customer Details */}
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Wifi className="size-3.5 text-primary" />
              <span>{rental.device?.model ?? 'Device'}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Customer:</span>
              <span className="font-medium text-foreground">
                {rental.user?.name || rental.user?.email || '—'}
              </span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Destination:</span>
              <span className="font-medium text-foreground">{rental.destination}</span>
            </div>
          </div>

          {/* Fulfillment Instructions & Input */}
          {isHomeDelivery ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Truck className="size-3.5 text-primary" />
                  <span>Courier Shipping Address</span>
                </div>
                <p className="text-muted-foreground pl-5 break-words text-[11px]">
                  {rental.shippingAddress || 'No address specified'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dispatch-tracking" className="text-xs font-medium">
                  Courier Tracking Number (Optional)
                </Label>
                <Input
                  id="dispatch-tracking"
                  placeholder="e.g. JNE1098234710 or SICEPAT9823"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="size-3.5 text-primary" />
                <span>Airport Counter Handover</span>
              </div>
              <p className="text-muted-foreground pl-5 text-[11px]">
                {rental.pickupLocation || 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1'}
              </p>
              <p className="text-[11px] text-muted-foreground/80 pl-5">
                Verify customer booking code and hand over device at the counter.
              </p>
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-end gap-2.5 pt-2">
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
              className="h-9 px-4 text-xs font-medium min-w-[120px]"
            >
              {dispatchMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5 mr-1.5" />
                  <span>Dispatch Device</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
