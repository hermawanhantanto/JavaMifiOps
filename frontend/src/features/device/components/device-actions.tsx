import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { DeviceItem } from '../types/device.types';
import { DeviceEditDialog } from './device-edit-dialog';
import { DeviceDeleteDialog } from './device-delete-dialog';

export interface DeviceActionsProps {
  device: DeviceItem;
}

/**
 * Single-purpose component rendering the administrative action buttons (Edit & Remove)
 * for a specific device row, enforcing backend deletion and status mutation rules.
 */
export function DeviceActions({ device }: DeviceActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Backend rule: Only devices with AVAILABLE status and no active rental can be removed
  const canDelete = device.status === 'AVAILABLE';

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditDialogOpen(true)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        title="Edit Device"
      >
        <Pencil className="size-3.5 mr-1" />
        <span>Edit</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={!canDelete}
        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
        title={
          canDelete
            ? 'Remove Device'
            : 'Only devices with AVAILABLE status can be removed'
        }
      >
        <Trash2 className="size-3.5 mr-1" />
        <span>Remove</span>
      </Button>

      {/* Edit Dialog */}
      <DeviceEditDialog
        device={device}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeviceDeleteDialog
        device={device}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
