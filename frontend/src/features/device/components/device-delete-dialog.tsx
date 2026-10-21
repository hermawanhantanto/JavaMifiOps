import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DeviceItem } from '../types/device.types';
import { useDeleteDevice } from '../hooks/use-delete-device';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface DeviceDeleteDialogProps {
  device: DeviceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Single-purpose confirmation modal for deleting a device.
 * Enforces business rule: Only available devices with no rental history can be deleted.
 */
export function DeviceDeleteDialog({
  device,
  open,
  onOpenChange,
}: DeviceDeleteDialogProps) {
  const deleteMutation = useDeleteDevice();

  if (!device) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(device.id);
      onOpenChange(false);
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="size-5" />
            <DialogTitle>Remove Device</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to permanently remove device{' '}
            <span className="font-semibold text-foreground">{device.model}</span>{' '}
            (Serial:{' '}
            <span className="font-mono text-xs text-foreground">
              {device.serialNumber ?? 'N/A'}
            </span>
            )? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row items-center justify-end gap-2.5 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-9 px-4 text-xs font-medium min-w-[130px]"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Removing...</span>
              </>
            ) : (
              <span>Remove Device</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
