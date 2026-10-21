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
import type { DeviceItem } from '@/features/device/types/device.types';
import { formatDailyRate, formatDeviceSpeed } from '@/features/device/utils/device.mapper';
import { formatRentalCurrency, formatFulfillmentType } from '../utils/rental.mapper';
import type { FulfillmentType } from '../types/rental.types';
import { useCreateRental } from '../hooks/use-create-rental';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  ExternalLink,
  Globe,
  Loader2,
  Truck,
  Wifi,
} from 'lucide-react';

export interface RentalBookingDialogProps {
  device: DeviceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateInclusiveDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

interface RentalBookingContentProps {
  device: DeviceItem;
  onOpenChange: (open: boolean) => void;
}

function RentalBookingContent({ device, onOpenChange }: RentalBookingContentProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCurrentUser();
  const createMutation = useCreateRental();

  const [step, setStep] = React.useState<'form' | 'confirm'>('form');
  const [destination, setDestination] = React.useState('');
  const [startDate, setStartDate] = React.useState(getTodayString());
  const [endDate, setEndDate] = React.useState(getTomorrowString());
  const [fulfillmentType, setFulfillmentType] = React.useState<FulfillmentType>('AIRPORT_PICKUP');
  const [pickupLocation, setPickupLocation] = React.useState(
    'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)'
  );
  const [shippingAddress, setShippingAddress] = React.useState(user?.address || '');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.address && !shippingAddress) {
      setShippingAddress(user.address);
    }
  }, [user?.address, shippingAddress]);

  const totalDays = calculateInclusiveDays(startDate, endDate);
  const totalAmount = totalDays * device.dailyRate;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndDate(newEnd);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (destination.trim().length < 2) {
      setErrorMsg('Destination must be at least 2 characters.');
      return;
    }

    if (endDate < startDate) {
      setErrorMsg('End date must be on or after start date.');
      return;
    }

    if (fulfillmentType === 'HOME_DELIVERY' && shippingAddress.trim().length < 5) {
      setErrorMsg('Please enter a valid shipping address for courier home delivery.');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmAndPay = async () => {
    setErrorMsg(null);

    try {
      const response = await createMutation.mutateAsync({
        deviceId: device.id,
        destination: destination.trim(),
        startDate,
        endDate,
        fulfillmentType,
        pickupLocation: fulfillmentType === 'AIRPORT_PICKUP' ? pickupLocation : undefined,
        shippingAddress: fulfillmentType === 'HOME_DELIVERY' ? shippingAddress.trim() : undefined,
      });

      const redirectUrl = response.data?.rental?.payment?.redirectUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        onOpenChange(false);
      }
    } catch {
      // Error handled by mutation onError toast
    }
  };

  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Review your rental reservation and fulfillment details before proceeding to checkout.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3.5">
          {/* Device Model */}
          <div className="pb-3 border-b border-border/70 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Wifi className="size-4" />
              </div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug break-words">
                {device.model}
              </h4>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground pl-[42px] flex-wrap">
              <span className="font-mono font-medium text-foreground">
                {formatDailyRate(device.dailyRate)}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-medium text-foreground text-[11px]">
                {formatDeviceSpeed(device.speed)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs pt-0.5">
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Destination
              </span>
              <span className="font-medium text-foreground break-words">
                {destination}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Duration
              </span>
              <span className="font-medium text-foreground">
                {totalDays} day{totalDays > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Start Date
              </span>
              <span className="font-mono text-foreground">{startDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                End Date
              </span>
              <span className="font-mono text-foreground">{endDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Fulfillment Mode
              </span>
              <span className="font-medium text-foreground">
                {formatFulfillmentType(fulfillmentType)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                {fulfillmentType === 'AIRPORT_PICKUP' ? 'Counter' : 'Delivery Address'}
              </span>
              <span className="font-medium text-foreground text-[11px] break-words">
                {fulfillmentType === 'AIRPORT_PICKUP' ? pickupLocation : shippingAddress}
              </span>
            </div>
          </div>

          <div className="border-t border-border/70 pt-3 flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Due</span>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">
                {formatRentalCurrency(totalAmount)}
              </span>
              <span className="text-xs font-normal text-muted-foreground block text-[11px]">
                / {totalDays} {totalDays > 1 ? 'days' : 'day'}
              </span>
            </div>
          </div>
        </div>

        {/* Midtrans & Return Notice */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CreditCard className="size-3.5 text-primary shrink-0" />
            <span>Midtrans Payment & Return Guarantee</span>
          </div>
          <p className="text-[11px] text-muted-foreground pl-5.5">
            Device is reserved for 30 minutes while completing payment. Returns are processed via 24/7 airport arrival drop box or included prepaid polymailer bag.
          </p>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('form')}
            disabled={createMutation.isPending}
            className="h-9 px-4 text-xs font-medium"
          >
            <ArrowLeft className="size-3.5 mr-1.5" />
            <span>Back</span>
          </Button>

          <Button
            type="button"
            onClick={handleConfirmAndPay}
            disabled={createMutation.isPending}
            className="h-9 px-4 text-xs font-medium min-w-[140px]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Confirm & Pay</span>
                <ExternalLink className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form onSubmit={handleProceedToConfirm} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Rent Pocket WiFi</DialogTitle>
        <DialogDescription>
          Select your travel destination, rental period, and preferred device handover method.
        </DialogDescription>
      </DialogHeader>

      {/* Device Overview Banner */}
      <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Wifi className="size-4" />
          </div>
          <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug break-words">
            {device.model}
          </h4>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-muted-foreground pl-[42px] flex-wrap">
          <span className="font-mono font-medium text-foreground">
            {formatDailyRate(device.dailyRate)}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-medium text-foreground text-[11px]">
            {formatDeviceSpeed(device.speed)}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Destination Field */}
      <div className="space-y-1.5">
        <Label htmlFor="rental-destination" className="text-xs font-medium flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground" />
          <span>Travel Destination</span>
        </Label>
        <Input
          id="rental-destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Tokyo, Japan or Bali, Indonesia"
          className="h-9 text-sm"
          required
        />
      </div>

      {/* Date Range Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rental-start" className="text-xs font-medium">
            Start Date
          </Label>
          <Input
            id="rental-start"
            type="date"
            min={getTodayString()}
            value={startDate}
            onChange={handleStartDateChange}
            className="h-9 text-xs font-mono"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rental-end" className="text-xs font-medium">
            End Date
          </Label>
          <Input
            id="rental-end"
            type="date"
            min={startDate}
            value={endDate}
            onChange={handleEndDateChange}
            className="h-9 text-xs font-mono"
            required
          />
        </div>
      </div>

      {/* Fulfillment Mode Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Device Handover & Return Method</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFulfillmentType('AIRPORT_PICKUP')}
            className={`rounded-lg border p-2.5 text-left text-xs transition-all flex items-start gap-2.5 ${
              fulfillmentType === 'AIRPORT_PICKUP'
                ? 'border-primary bg-primary/5 text-foreground font-medium ring-1 ring-primary/20'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Building2
              className={`size-4 shrink-0 mt-0.5 ${
                fulfillmentType === 'AIRPORT_PICKUP' ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <div>
              <span className="block font-semibold">Airport Counter</span>
              <span className="text-[11px] text-muted-foreground">Pick up at airport (24/7)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFulfillmentType('HOME_DELIVERY')}
            className={`rounded-lg border p-2.5 text-left text-xs transition-all flex items-start gap-2.5 ${
              fulfillmentType === 'HOME_DELIVERY'
                ? 'border-primary bg-primary/5 text-foreground font-medium ring-1 ring-primary/20'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Truck
              className={`size-4 shrink-0 mt-0.5 ${
                fulfillmentType === 'HOME_DELIVERY' ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <div>
              <span className="block font-semibold">Home Delivery</span>
              <span className="text-[11px] text-muted-foreground">Shipped before trip</span>
            </div>
          </button>
        </div>

        {/* Airport Counter Selector */}
        {fulfillmentType === 'AIRPORT_PICKUP' ? (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="pickup-location" className="text-[11px] text-muted-foreground">
              Select Airport Counter
            </Label>
            <select
              id="pickup-location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)">
                Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)
              </option>
              <option value="Jakarta Soekarno-Hatta (CGK) T2 Departure Gate 4 (24/7)">
                Jakarta Soekarno-Hatta (CGK) T2 Departure Gate 4 (24/7)
              </option>
              <option value="Bali I Gusti Ngurah Rai (DPS) Int'l Departure (24/7)">
                Bali I Gusti Ngurah Rai (DPS) Int'l Departure (24/7)
              </option>
              <option value="Surabaya Juanda (SUB) Terminal 2 Departure (24/7)">
                Surabaya Juanda (SUB) Terminal 2 Departure (24/7)
              </option>
            </select>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="shipping-address" className="text-[11px] text-muted-foreground">
              Complete Delivery Address
            </Label>
            <Input
              id="shipping-address"
              placeholder="e.g. Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan 12190"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="h-9 text-xs"
              required
            />
            <span className="text-[11px] text-muted-foreground block">
              Package arrives 2 days before trip and includes a prepaid polymailer bag for easy return.
            </span>
          </div>
        )}
      </div>

      {/* Live Calculation Preview */}
      <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>Rental Duration:</span>
          <span className="font-medium text-foreground">
            {totalDays} day{totalDays > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Daily Rate:</span>
          <span>{formatDailyRate(device.dailyRate)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground text-sm">
          <span>Estimated Total:</span>
          <span>
            {formatRentalCurrency(totalAmount)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              / {totalDays} {totalDays > 1 ? 'days' : 'day'}
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <DialogFooter className="flex-row items-center justify-end gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="h-9 px-4 text-xs font-medium"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={destination.trim().length === 0}
          className="h-9 px-4 text-xs font-medium"
        >
          <span>Continue</span>
          <ArrowRight className="size-3.5 ml-1.5" />
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Top-level modal coordinator for customer pocket WiFi booking.
 */
export function RentalBookingDialog({
  device,
  open,
  onOpenChange,
}: RentalBookingDialogProps) {
  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {open && (
          <RentalBookingContent
            key={device.id}
            device={device}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
