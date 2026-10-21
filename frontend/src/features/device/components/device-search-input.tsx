import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface DeviceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Single-purpose search input component for filtering devices.
 */
export function DeviceSearchInput({
  value,
  onChange,
  placeholder = 'Search by model, serial, or IMEI...',
  disabled = false,
}: DeviceSearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-8 pr-8 h-9 text-sm bg-card"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
          aria-label="Clear search input"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
