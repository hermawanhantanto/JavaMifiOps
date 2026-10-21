import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RentalItem } from '../types/rental.types';
import { formatRentalDateRange, formatFulfillmentType } from '../utils/rental.mapper';

export interface RentalFulfillmentDialogProps {
  rental: RentalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentalFulfillmentDialog({
  rental,
  open,
  onOpenChange,
}: RentalFulfillmentDialogProps) {
  if (!rental) return null;

  const isAirport = rental.fulfillmentType !== 'HOME_DELIVERY';
  const pickupLocation =
    rental.pickupLocation || 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1';
  const shippingAddress = rental.shippingAddress || 'Address not specified';
  const trackingNumber = rental.trackingNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">{rental.rentalCode}</span>
            <span>{formatFulfillmentType(rental.fulfillmentType)}</span>
          </div>
          <DialogTitle className="text-base font-semibold text-foreground">
            Fulfillment & Return
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {rental.destination} • {formatRentalDateRange(rental.startDate, rental.endDate)}
          </p>
        </DialogHeader>

        <div className="space-y-3.5 text-xs">
          {/* Handover / Collection */}
          <div className="space-y-1 border-t border-border/60 pt-3">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              {isAirport ? 'Pickup Counter' : 'Delivery Address'}
            </span>
            <p className="text-sm font-medium text-foreground leading-snug">
              {isAirport ? pickupLocation : shippingAddress}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isAirport
                ? 'Open 24/7. Show booking code at the counter before security.'
                : trackingNumber
                ? `Courier tracking: ${trackingNumber}`
                : 'Dispatched 2 days before trip departure.'}
            </p>
          </div>

          {/* Return Instructions */}
          <div className="space-y-1.5 border-t border-border/60 pt-3">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Return Method
            </span>
            <p className="text-sm font-medium text-foreground leading-snug">
              {isAirport ? '24/7 Airport Arrival Drop Box' : 'Prepaid Courier Polymailer'}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isAirport
                ? 'Drop the pouch into the JavaMifi drop box located at the arrival hall before airport exit.'
                : 'Pack into the prepaid return bag and drop off at any JNE or SiCepat branch.'}
            </p>

            {/* Non-Airport Return Fallback */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-border/60 space-y-1 text-[11px]">
              <span className="text-muted-foreground block">
                {isAirport ? 'Returning from home or missed the airport box?' : 'Direct Hub Address:'}
              </span>
              <div className="bg-muted/40 rounded p-2 text-[11px] space-y-0.5">
                <div className="font-semibold text-foreground">JavaMifi Return Hub</div>
                <div className="text-muted-foreground">Jl. Tomang Raya No. 12, Jakarta Barat 11440</div>
                <div className="text-muted-foreground font-mono text-[10px]">
                  Attn: Return Dept ({rental.rentalCode})
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">
                Ship via any courier (JNE, SiCepat, GoSend) or drop off at Indomaret.
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
