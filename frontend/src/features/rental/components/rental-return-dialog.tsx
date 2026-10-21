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
import { useReturnRental } from '../hooks/use-return-rental';
import { Loader2 } from 'lucide-react';

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
      // Handled by toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
        <form onSubmit={handleReturn} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{rental.rentalCode}</span>
              <span>Return Inspection</span>
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Process Return
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify device condition and complete rental return.
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
          </div>

          {/* Condition Select */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-medium">Device Condition</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCondition('GOOD')}
                className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                  condition === 'GOOD'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => setCondition('DAMAGED')}
                className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                  condition === 'DAMAGED'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                Damaged
              </button>
              <button
                type="button"
                onClick={() => setCondition('LOST')}
                className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                  condition === 'LOST'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-input bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                Lost
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
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
            <div className="space-y-1.5">
              <Label htmlFor="return-notes" className="text-xs font-medium">
                Notes (Optional)
              </Label>
              <Input
                id="return-notes"
                placeholder="Pouch & cable included"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-end gap-2 pt-2">
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
              className="h-9 px-4 text-xs font-medium"
            >
              {returnMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Complete Return</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
