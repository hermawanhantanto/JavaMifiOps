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
import { Badge } from '@/components/ui/badge';
import type { RentalItem } from '../types/rental.types';
import { formatRentalDateRange, formatFulfillmentType } from '../utils/rental.mapper';
import {
  Building2,
  Clock,
  Copy,
  Check,
  Info,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  Wifi,
} from 'lucide-react';

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
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  if (!rental) return null;

  const isAirport = rental.fulfillmentType !== 'HOME_DELIVERY';
  const pickupLocation =
    rental.pickupLocation || 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1';
  const shippingAddress = rental.shippingAddress || 'No shipping address specified';
  const trackingNumber = rental.trackingNumber;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(rental.rentalCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyTracking = async () => {
    if (!trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-6 sm:p-7">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center justify-between pr-6">
            <Badge variant="outline" className="font-mono text-[11px] font-medium tracking-wide">
              {rental.rentalCode}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[11px] font-medium capitalize"
            >
              {formatFulfillmentType(rental.fulfillmentType)}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground font-heading pt-1">
            Fulfillment & Return Instructions
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Travel to <span className="font-medium text-foreground">{rental.destination}</span> (
            {formatRentalDateRange(rental.startDate, rental.endDate)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Hardware Device Summary */}
          <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Wifi className="size-4" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm block">
                  {rental.device?.model ?? 'JavaMifi Pocket Wi-Fi'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {rental.totalDays} days rental period
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 text-xs font-mono"
            >
              {copiedCode ? (
                <>
                  <Check className="size-3.5 mr-1 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 mr-1 text-muted-foreground" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          {/* Fulfillment Mode Details */}
          {isAirport ? (
            <div className="space-y-3">
              {/* Pickup Counter Card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <Building2 className="size-4 shrink-0" />
                  <span>Airport Counter Pickup</span>
                </div>
                <div className="text-xs space-y-1 pl-6">
                  <div className="font-medium text-foreground">{pickupLocation}</div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Open 24 Hours / 7 Days a week</span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground bg-background rounded-lg border border-border/80 p-2.5 space-y-1">
                  <span className="font-medium text-foreground block">Pickup Procedure:</span>
                  <span>
                    Show booking code <code className="font-mono text-primary font-semibold">{rental.rentalCode}</code> to booth staff before passing airport departure security check.
                  </span>
                </div>
              </div>

              {/* Airport Return Drop Box */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                  <RotateCcw className="size-4 shrink-0" />
                  <span>Return via 24/7 Airport Drop Box</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5 pl-6">
                  <p>
                    When arriving back at the airport, drop the pouch containing device, cable, and charger into the <strong className="text-foreground">JavaMifi 24/7 Drop Box</strong> located at the terminal arrival hall (near baggage claim exit).
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    No waiting in line required. Staff inspects and marks return within 2 hours.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Home Delivery Card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <Truck className="size-4 shrink-0" />
                  <span>Courier Home Delivery</span>
                </div>
                <div className="text-xs space-y-1.5 pl-6">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground break-words">{shippingAddress}</span>
                  </div>

                  {trackingNumber ? (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Package className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[11px] text-muted-foreground">Tracking No:</span>
                        <code className="font-mono font-semibold text-foreground text-xs">{trackingNumber}</code>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyTracking}
                        className="h-6 text-[11px] px-2"
                      >
                        {copiedTracking ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 pt-1">
                      <Clock className="size-3" />
                      <span>Tracking number will appear once courier picks up package (2 days before departure).</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Home Return Prepaid Bag */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                  <RotateCcw className="size-4 shrink-0" />
                  <span>Return via Prepaid Return Polymailer</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5 pl-6">
                  <p>
                    Your delivery includes a <strong className="text-foreground">pre-addressed prepaid polymailer bag</strong>. Seal device, adapter, and cable inside after your trip.
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Hand over to any nearest JNE/SiCepat branch, or schedule courier pickup at no additional cost.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Support Notice */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              Need changes or flight delay assistance? Contact 24/7 JavaMifi WhatsApp Care: <strong className="text-foreground font-mono">+62 811-9876-5432</strong>
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-9 text-xs font-medium"
          >
            Close Guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
