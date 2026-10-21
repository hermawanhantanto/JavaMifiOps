import { AdminKpiCard } from './admin-kpi-card';
import type {
  AdminDashboardFleetStats,
  AdminDashboardRentalStats,
} from '../types/dashboard.types';
import { formatRentalCurrency } from '@/features/rental/utils/rental.mapper';

export interface AdminKpiGridProps {
  fleetStats: AdminDashboardFleetStats;
  rentalStats: AdminDashboardRentalStats;
  isLoading?: boolean;
}

/**
 * Single-purpose component rendering the 4-column administrative KPI metrics grid.
 */
export function AdminKpiGrid({
  fleetStats,
  rentalStats,
  isLoading = false,
}: AdminKpiGridProps) {
  const activeFleetCount = fleetStats.rentedDevices + fleetStats.bookedDevices;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Fleet Utilization */}
      <AdminKpiCard
        label="Fleet Utilization"
        value={`${fleetStats.utilizationRate}%`}
        description={`${activeFleetCount} of ${fleetStats.totalDevices} units in circulation`}
        isLoading={isLoading}
      />

      {/* 2. Awaiting Dispatch */}
      <AdminKpiCard
        label="Awaiting Dispatch"
        value={rentalStats.pendingDispatchCount}
        description="Confirmed orders ready for hardware fulfillment"
        isLoading={isLoading}
        alert={rentalStats.pendingDispatchCount > 0}
      />

      {/* 3. Active Deployments */}
      <AdminKpiCard
        label="Active Deployments"
        value={rentalStats.activeRentalsCount}
        description="Units currently active with travelers abroad"
        isLoading={isLoading}
      />

      {/* 4. Total Platform Revenue */}
      <AdminKpiCard
        label="Gross Revenue"
        value={formatRentalCurrency(rentalStats.totalRevenue)}
        description="Cumulative paid rental reservations"
        isLoading={isLoading}
      />
    </div>
  );
}
