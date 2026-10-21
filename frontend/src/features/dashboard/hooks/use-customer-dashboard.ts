import * as React from 'react';
import { useRentals } from '@/features/rental/hooks/use-rentals';
import type { RentalItem } from '@/features/rental/types/rental.types';
import type { CustomerDashboardData, CustomerDashboardStats } from '../types/dashboard.types';

/**
 * Hook aggregating customer rental data into key performance metrics,
 * active journey status, and recent activity feed.
 */
export function useCustomerDashboard(): CustomerDashboardData {
  const { data, isLoading, isError, error, refetch } = useRentals({
    page: 1,
    limit: 100,
  });

  const rawRentals = data?.data?.rentals;

  const { stats, pendingPaymentRental, activeRental, recentRentals } = React.useMemo(() => {
    const rentals: RentalItem[] = rawRentals ?? [];
    let activeCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let totalDays = 0;

    let pending: RentalItem | null = null;
    let active: RentalItem | null = null;

    for (const rental of rentals) {
      if (rental.status === 'PENDING_PAYMENT') {
        if (!pending) pending = rental;
      } else if (rental.status === 'ACTIVE') {
        activeCount++;
        if (!active) active = rental;
      } else if (rental.status === 'CONFIRMED') {
        upcomingCount++;
        if (!active) active = rental;
      } else if (rental.status === 'RETURNED') {
        completedCount++;
      }

      if (rental.status !== 'CANCELLED') {
        totalDays += rental.totalDays || 0;
      }
    }

    const calculatedStats: CustomerDashboardStats = {
      activeCount,
      upcomingCount,
      completedCount,
      totalDays,
    };

    return {
      stats: calculatedStats,
      pendingPaymentRental: pending,
      activeRental: active,
      recentRentals: rentals.slice(0, 5),
    };
  }, [rawRentals]);

  return {
    stats,
    pendingPaymentRental,
    activeRental,
    recentRentals,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
