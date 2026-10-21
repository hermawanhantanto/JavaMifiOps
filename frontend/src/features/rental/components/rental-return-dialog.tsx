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
import { useReturnRental } from '../hooks/use-return-rental';
import { Loader2, RotateCcw, Wifi } from 'lucide-react';

export interface RentalReturnDialogProps {
  rental: RentalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RentalReturnDialog({
  rental,
  open,
  onOpenChange,
}: RentalReturnDialogProps) {
  const returnMutation = useReturnRental();
  const [condition, setCondition] = React.useState<'GOOD' | 'DAMAGED' | 'LOST'>('GOOD');
  const [batteryHealth, setBatteryHealth] = React.useState<number>(100);
  const [notes, setNotes] = React.useState('');

  if (!rental) return null;

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await returnMutation.mutateAsync({
        id: rental.id,
        input: {
          condition,
          batteryHealth: !isNaN(batteryHealth) ? batteryHealth : undefined,
          notes: notes.trim() ? notes.trim() : undefined,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 sm:p-7">
        <form onSubmit={handleReturn} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <Badge variant="outline" className="font-mono text-[11px] font-medium">
                {rental.rentalCode}
              </Badge>
              <Badge variant="secondary" className="text-[11px] font-medium">
                Return Inspection
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground font-heading pt-1">
              Process Device Return
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Inspect device condition and mark rental trip as RETURNED.
            </DialogDescription>
          </DialogHeader>

          {/* Device & Rental Details */}
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 text-xs">
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
          </div>

          {/* Condition Select Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Hardware Condition</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCondition('GOOD')}
                className={`rounded-lg border p-2.5 text-center text-xs font-medium transition-all ${
                  condition === 'GOOD'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Good (Available)
              </button>
              <button
                type="button"
                onClick={() => setCondition('DAMAGED')}
                className={`rounded-lg border p-2.5 text-center text-xs font-medium transition-all ${
                  condition === 'DAMAGED'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Damaged (Repair)
              </button>
              <button
                type="button"
                onClick={() => setCondition('LOST')}
                className={`rounded-lg border p-2.5 text-center text-xs font-medium transition-all ${
                  condition === 'LOST'
                    ? 'border-destructive bg-destructive/10 text-destructive font-semibold shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Lost (Write-off)
              </button>
            </div>
          </div>

          {/* Battery Health */}
          <div className="space-y-1.5">
            <Label htmlFor="return-battery" className="text-xs font-medium">
              Battery Health (%)
            </Label>
            <Input
              id="return-battery"
              type="number"
              min={0}
              max={100}
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(Number(e.target.value))}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Inspection Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="return-notes" className="text-xs font-medium">
              Inspection Notes (Optional)
            </Label>
            <Input
              id="return-notes"
              placeholder="e.g. Device returned in pouch with original USB-C cable"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter className="flex-row items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={returnMutation.isPending}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={returnMutation.isPending}
              className="h-9 px-4 text-xs font-medium min-w-[120px]"
            >
              {returnMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5 mr-1.5" />
                  <span>Complete Return</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
