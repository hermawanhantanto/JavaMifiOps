import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '../hooks/use-admin-dashboard';
import { AdminKpiGrid } from '../components/admin-kpi-grid';
import { AdminAlertBanner } from '../components/admin-alert-banner';
import { AdminFleetOverview } from '../components/admin-fleet-overview';
import { AdminRecentTable } from '../components/admin-recent-table';
import { AdminQuickActions } from '../components/admin-quick-actions';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Top-level coordinator for the Admin Dashboard page.
 * Clean, modern, and minimalist layout:
 * - Direct typographic header with manual telemetry refresh
 * - Actionable operational alert strip (pending dispatches / overdue returns)
 * - 4 clean typographic KPI metrics
 * - Fleet hardware status and battery health overview
 * - Recent platform bookings table with direct admin operational controls
 * - Quick administrative management shortcut cards
 */
export function AdminDashboardPage() {
  const {
    fleetStats,
    rentalStats,
    recentRentals,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
          Admin Operations Center
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Real-time fleet telemetry, fulfillment logistics, and platform rental activity.
        </p>
      </div>

      {/* Error Alert Banner */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error?.message || 'Unable to load administrative metrics. Please check your network connection.'}</span>
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

      {/* 1. Operational Attention Alert Strip */}
      <AdminAlertBanner rentalStats={rentalStats} isLoading={isLoading} />

      {/* 2. Key Performance Metric Cards */}
      <AdminKpiGrid
        fleetStats={fleetStats}
        rentalStats={rentalStats}
        isLoading={isLoading}
      />

      {/* 3. Physical Fleet Hardware Health & Status Distribution */}
      <AdminFleetOverview fleetStats={fleetStats} isLoading={isLoading} />

      {/* 4. Recent Platform Bookings with Direct Admin Controls */}
      <AdminRecentTable rentals={recentRentals} isLoading={isLoading} />

      {/* 5. Quick Administrative Navigation Cards */}
      <AdminQuickActions />
    </div>
  );
}

export default AdminDashboardPage;
