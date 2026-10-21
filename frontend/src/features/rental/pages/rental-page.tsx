import * as React from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useDebounce } from '../hooks/use-debounce';
import { useRentals } from '../hooks/use-rentals';
import { RentalToolbar } from '../components/rental-toolbar';
import { RentalTable } from '../components/rental-table';
import type { RentalStatus } from '../types/rental.types';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Top-level Rental page coordinator.
 * Coordinates user role projection, debounced text search, status filtering,
 * pagination state, and query lifecycle.
 */
export function RentalPage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [statusFilter, setStatusFilter] = React.useState<RentalStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleStatusChange = (status: RentalStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const { data, isLoading, isError, error, refetch } = useRentals({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter,
  });

  const rentals = data?.data?.rentals ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            {isAdmin ? 'Rental Management' : 'My Rentals'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isAdmin
              ? 'Complete overview of customer device bookings, schedules, and payment verification.'
              : 'Track and manage your pocket WiFi reservations, travel destinations, and payment status.'}
          </p>
        </div>
      </div>

      {/* Toolbar: Debounced Search & Status Filter */}
      <RentalToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        isAdmin={isAdmin}
        disabled={isLoading}
      />

      {/* Error State Banner */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {error?.message || 'Failed to load rental bookings. Please verify your connection.'}
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
      <RentalTable
        rentals={rentals}
        pagination={pagination}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onPageChange={setPage}
      />
    </div>
  );
}

export default RentalPage;
