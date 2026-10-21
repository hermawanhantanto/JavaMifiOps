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
import { Globe, Calendar, Loader2, Info } from 'lucide-react';
import type { RentalItem } from '../types/rental.types';
import { useUpdateRental } from '../hooks/use-update-rental';
import { formatRentalCurrency } from '../utils/rental.mapper';

export interface RentalUpdateDialogProps {
  rental: RentalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInputFormat(dateVal: string | Date | undefined): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateInclusiveDays(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

interface RentalUpdateContentProps {
  rental: RentalItem;
  onOpenChange: (open: boolean) => void;
}

function RentalUpdateContent({ rental, onOpenChange }: RentalUpdateContentProps) {
  const updateMutation = useUpdateRental();

  const [destination, setDestination] = React.useState(rental.destination);
  const [startDate, setStartDate] = React.useState(toDateInputFormat(rental.startDate));
  const [endDate, setEndDate] = React.useState(toDateInputFormat(rental.endDate));
  const [formError, setFormError] = React.useState<string | null>(null);

  const initialStartDate = toDateInputFormat(rental.startDate);
  const initialEndDate = toDateInputFormat(rental.endDate);

  const isDatesChanged = startDate !== initialStartDate || endDate !== initialEndDate;
  const totalDays = calculateInclusiveDays(startDate, endDate);

  // Derive daily rate from totalAmount and initial totalDays if device dailyRate is not directly on object
  const dailyRate = rental.device?.dailyRate ?? (rental.totalDays > 0 ? rental.totalAmount / rental.totalDays : 0);
  const calculatedTotal = totalDays * dailyRate;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (destination.trim().length < 2) {
      setFormError('Destination must be at least 2 characters');
      return;
    }

    if (endDate < startDate) {
      setFormError('End date must be on or after start date');
      return;
    }

    try {
      const response = await updateMutation.mutateAsync({
        id: rental.id,
        input: {
          destination: destination.trim(),
          ...(isDatesChanged ? { startDate, endDate } : {}),
        },
      });

      const newRedirectUrl = response.data?.rental?.payment?.redirectUrl;
      onOpenChange(false);

      if (isDatesChanged && newRedirectUrl) {
        // Direct option to open new payment URL
        window.open(newRedirectUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Update Rental Booking</DialogTitle>
        <DialogDescription>
          Modify destination or travel schedule for booking{' '}
          <span className="font-mono font-medium text-foreground">{rental.rentalCode}</span>.
        </DialogDescription>
      </DialogHeader>

      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {formError}
        </div>
      )}

      {/* Destination Field */}
      <div className="space-y-1.5">
        <Label htmlFor="update-destination" className="text-xs font-medium flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground" />
          <span>Travel Destination</span>
        </Label>
        <Input
          id="update-destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Tokyo, Japan"
          className="h-9 text-sm"
          required
        />
      </div>

      {/* Date Range Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="update-start-date" className="text-xs font-medium flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>Start Date</span>
          </Label>
          <Input
            id="update-start-date"
            type="date"
            min={getTodayString()}
            value={startDate}
            onChange={handleStartDateChange}
            className="h-9 text-xs font-mono"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="update-end-date" className="text-xs font-medium flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>End Date</span>
          </Label>
          <Input
            id="update-end-date"
            type="date"
            min={startDate}
            value={endDate}
            onChange={handleEndDateChange}
            className="h-9 text-xs font-mono"
            required
          />
        </div>
      </div>

      {/* Schedule & Financial Preview */}
      <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>Assigned Device:</span>
          <span className="font-medium text-foreground">{rental.device?.model ?? 'Pocket WiFi'}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Duration:</span>
          <span className="font-medium text-foreground">{totalDays} day(s)</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground text-sm">
          <span>Total Amount:</span>
          <span>{formatRentalCurrency(isDatesChanged ? calculatedTotal : rental.totalAmount)}</span>
        </div>
      </div>

      {isDatesChanged && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
          <Info className="size-4 shrink-0 mt-0.5" />
          <span>
            Changing travel dates will automatically void the previous payment session and generate a new Midtrans checkout for the recalculated total.
          </span>
        </div>
      )}

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={updateMutation.isPending}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={updateMutation.isPending || destination.trim().length === 0}
          className="text-xs"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              Updating...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Single-purpose modal dialog for editing destination and dates on pending bookings.
 */
export function RentalUpdateDialog({
  rental,
  open,
  onOpenChange,
}: RentalUpdateDialogProps) {
  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <RentalUpdateContent
            key={`${rental.id}-${rental.updatedAt}`}
            rental={rental}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
