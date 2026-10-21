import * as React from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useDebounce } from '../hooks/use-debounce';
import { useDevices } from '../hooks/use-devices';
import { DeviceToolbar } from '../components/device-toolbar';
import { DeviceTable } from '../components/device-table';
import type { DeviceStatus } from '../types/device.types';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Top-level Device view page.
 * Coordinates search debouncing, role checking, query state, and table pagination.
 */
export function DevicePage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [statusFilter, setStatusFilter] = React.useState<DeviceStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleStatusChange = (status: DeviceStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const activeStatus = !isAdmin ? 'AVAILABLE' : statusFilter;

  const { data, isLoading, isError, error, refetch } = useDevices({
    page,
    limit: 10,
    search: debouncedSearch,
    status: activeStatus,
  });

  const devices = data?.data?.devices ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Device Fleet
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? 'Complete hardware inventory, IMEI trackers, and operational status.'
              : 'Browse high-speed portable WiFi devices available for instant rental.'}
          </p>
        </div>
      </div>

      {/* Toolbar: Debounced Search & Status Select */}
      <DeviceToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={activeStatus}
        onStatusChange={handleStatusChange}
        isCustomer={!isAdmin}
        disabled={isLoading}
      />

      {/* Error State Banner */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {error?.message || 'Failed to load devices. Please verify your connection.'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs border-destructive/40 hover:bg-destructive/20"
          >
            <RefreshCw className="size-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Main Table */}
      <DeviceTable
        devices={devices}
        pagination={pagination}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onPageChange={setPage}
      />
    </div>
  );
}

export default DevicePage;
