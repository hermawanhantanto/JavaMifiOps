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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceItem, DeviceSpeed, DeviceStatus } from '../types/device.types';
import { SPEED_DISPLAY_MAP, STATUS_DISPLAY_MAP } from '../utils/device.mapper';
import { useUpdateDevice } from '../hooks/use-update-device';
import { Loader2 } from 'lucide-react';

export interface DeviceEditDialogProps {
  device: DeviceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SPEED_OPTIONS: DeviceSpeed[] = [
  'SPEED_4G_150MBPS',
  'SPEED_4G_300MBPS',
  'SPEED_5G_500MBPS',
  'SPEED_5G_1GBPS',
];

const STATUS_OPTIONS: DeviceStatus[] = [
  'AVAILABLE',
  'BOOKED',
  'RENTED',
  'MAINTENANCE',
  'LOST',
  'RETIRED',
];

interface DeviceEditFormProps {
  device: DeviceItem;
  onOpenChange: (open: boolean) => void;
}

/**
 * Inner form component initialized with device props on mount.
 */
function DeviceEditForm({ device, onOpenChange }: DeviceEditFormProps) {
  const updateMutation = useUpdateDevice();

  const [model, setModel] = React.useState(device.model || '');
  const [serialNumber, setSerialNumber] = React.useState(device.serialNumber || '');
  const [imei, setImei] = React.useState(device.imei || '');
  const [speed, setSpeed] = React.useState<DeviceSpeed>(device.speed || 'SPEED_4G_150MBPS');
  const [batteryHealth, setBatteryHealth] = React.useState<number>(device.batteryHealth ?? 100);
  const [dailyRate, setDailyRate] = React.useState<number>(device.dailyRate ?? 50000);
  const [status, setStatus] = React.useState<DeviceStatus>(device.status || 'AVAILABLE');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const isRented = device.status === 'RENTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validations aligned with backend rules
    if (!model.trim()) {
      setValidationError('Model name is required');
      return;
    }
    if (!serialNumber.trim()) {
      setValidationError('Serial number is required');
      return;
    }
    if (!/^\d{15}$/.test(imei.trim())) {
      setValidationError('IMEI must be exactly 15 numeric digits');
      return;
    }
    if (batteryHealth < 0 || batteryHealth > 100) {
      setValidationError('Battery health must be between 0 and 100');
      return;
    }
    if (dailyRate <= 0) {
      setValidationError('Daily rate must be greater than 0');
      return;
    }
    if (isRented && status === 'AVAILABLE') {
      setValidationError('Cannot set status to AVAILABLE while device is actively rented');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: device.id,
        data: {
          model: model.trim(),
          serialNumber: serialNumber.trim(),
          imei: imei.trim(),
          speed,
          batteryHealth: Math.round(batteryHealth),
          dailyRate: Math.round(dailyRate),
          status,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {validationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {validationError}
        </div>
      )}

      {/* Model */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-model" className="text-xs font-medium">
          Model Name
        </Label>
        <Input
          id="edit-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. JavaMifi Pro 5G"
          className="h-9 text-sm"
          required
        />
      </div>

      {/* Serial Number & IMEI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-serial" className="text-xs font-medium">
            Serial Number
          </Label>
          <Input
            id="edit-serial"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="SN-XXXXX"
            className="h-9 font-mono text-xs"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-imei" className="text-xs font-medium">
            IMEI (15 digits)
          </Label>
          <Input
            id="edit-imei"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="15 digits"
            maxLength={15}
            className="h-9 font-mono text-xs"
            required
          />
        </div>
      </div>

      {/* Speed & Battery Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Speed Profile</Label>
          <Select
            value={speed}
            onValueChange={(val) => setSpeed(val as DeviceSpeed)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              {SPEED_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs">
                  {SPEED_DISPLAY_MAP[opt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-battery" className="text-xs font-medium">
            Battery Health (%)
          </Label>
          <Input
            id="edit-battery"
            type="number"
            min={0}
            max={100}
            value={batteryHealth}
            onChange={(e) => setBatteryHealth(Number(e.target.value))}
            className="h-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Daily Rate & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-rate" className="text-xs font-medium">
            Daily Rate (IDR)
          </Label>
          <Input
            id="edit-rate"
            type="number"
            min={1}
            step={1000}
            value={dailyRate}
            onChange={(e) => setDailyRate(Number(e.target.value))}
            className="h-9 text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Device Status</Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as DeviceStatus)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  disabled={isRented && opt === 'AVAILABLE'}
                  className="text-xs"
                >
                  {STATUS_DISPLAY_MAP[opt]}
                  {isRented && opt === 'AVAILABLE' ? ' (Actively Rented)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isRented && (
            <p className="text-[11px] text-muted-foreground">
              Status cannot be set to Available while device is actively rented.
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="flex-row items-center justify-end gap-2.5 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={updateMutation.isPending}
          className="h-9 px-4 text-xs font-medium"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-9 px-4 text-xs font-medium min-w-[120px]"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Single-purpose modal dialog for editing device hardware attributes and status.
 * Enforces backend rule: Rented devices cannot be transitioned directly to AVAILABLE.
 */
export function DeviceEditDialog({
  device,
  open,
  onOpenChange,
}: DeviceEditDialogProps) {
  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>
            Update hardware parameters, operational configuration, and fleet status.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DeviceEditForm
            key={device.id}
            device={device}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
