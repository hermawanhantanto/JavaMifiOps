import { CustomerKpiCard } from './customer-kpi-card';
import type { CustomerDashboardStats } from '../types/dashboard.types';

export interface CustomerKpiGridProps {
  stats: CustomerDashboardStats;
  isLoading?: boolean;
}

/**
 * Single-purpose grid displaying the 4 core customer performance metrics.
 * Minimalist layout focusing purely on numbers and labels.
 */
export function CustomerKpiGrid({ stats, isLoading = false }: CustomerKpiGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <CustomerKpiCard
        label="Active Rentals"
        value={stats.activeCount}
        description="Currently in your possession"
        isLoading={isLoading}
      />

      <CustomerKpiCard
        label="Upcoming Trips"
        value={stats.upcomingCount}
        description="Confirmed future bookings"
        isLoading={isLoading}
      />

      <CustomerKpiCard
        label="Completed Travels"
        value={stats.completedCount}
        description="Past returned journeys"
        isLoading={isLoading}
      />

      <CustomerKpiCard
        label="Days Connected"
        value={stats.totalDays}
        description="Cumulative rental days"
        isLoading={isLoading}
      />
    </div>
  );
}
