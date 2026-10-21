import { Button } from '@/components/ui/button';
import { useCustomerDashboard } from '../hooks/use-customer-dashboard';
import { CustomerHeroBanner } from '../components/customer-hero-banner';
import { CustomerKpiGrid } from '../components/customer-kpi-grid';
import { CustomerRecentTable } from '../components/customer-recent-table';
import { CustomerQuickActions } from '../components/customer-quick-actions';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Top-level coordinator for the Customer Dashboard page.
 * Clean, modern, and minimalist layout:
 * - Direct typographic header (no redundant buttons)
 * - Active trip status strip (when ongoing)
 * - 4 clean typographic KPI metrics (no icons)
 * - Recent bookings activity table (only shows action if actionable)
 * - 3 quick navigation cards below table
 */
export function CustomerDashboardPage() {
  const {
    stats,
    activeRental,
    recentRentals,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomerDashboard();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Overview of your pocket Wi-Fi rentals and active connectivity.
        </p>
      </div>

      {/* Error Alert Banner */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error?.message || 'Unable to load dashboard data. Please check your connection.'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 text-xs border-destructive/40 hover:bg-destructive/20"
          >
            <RefreshCw className="size-3 mr-1" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* 1. Active Trip Status Strip (only displayed when customer has an active trip) */}
      <CustomerHeroBanner
        activeRental={activeRental}
        isLoading={isLoading}
      />

      {/* 2. Key Performance Metric Cards (Pure numbers and typography, no icons) */}
      <CustomerKpiGrid stats={stats} isLoading={isLoading} />

      {/* 3. Recent Bookings Table */}
      <CustomerRecentTable rentals={recentRentals} isLoading={isLoading} />

      {/* 4. Quick Navigation Cards */}
      <CustomerQuickActions />
    </div>
  );
}

export default CustomerDashboardPage;
