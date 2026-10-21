import * as React from 'react';
import { useDevices } from '@/features/device/hooks/use-devices';
import { useRentals } from '@/features/rental/hooks/use-rentals';
import type { DeviceItem } from '@/features/device/types/device.types';
import type { RentalItem } from '@/features/rental/types/rental.types';
import type {
  AdminDashboardData,
  AdminDashboardFleetStats,
  AdminDashboardRentalStats,
} from '../types/dashboard.types';

/**
 * Hook aggregating administrative fleet status, operational rental pipeline,
 * and pending actionable bookings for platform administrators.
 */
export function useAdminDashboard(): AdminDashboardData {
  const devicesQuery = useDevices({
    page: 1,
    limit: 100,
  });

  const rentalsQuery = useRentals({
    page: 1,
    limit: 100,
  });

  const rawDevices = devicesQuery.data?.data?.devices;
  const rawRentals = rentalsQuery.data?.data?.rentals;

  const fleetStats = React.useMemo<AdminDashboardFleetStats>(() => {
    const devices: DeviceItem[] = rawDevices ?? [];
    const totalDevices = devices.length;

    let availableDevices = 0;
    let rentedDevices = 0;
    let bookedDevices = 0;
    let maintenanceDevices = 0;
    let lostDevices = 0;
    let retiredDevices = 0;
    let totalBattery = 0;

    for (const device of devices) {
      totalBattery += device.batteryHealth ?? 100;
      switch (device.status) {
        case 'AVAILABLE':
          availableDevices++;
          break;
        case 'RENTED':
          rentedDevices++;
          break;
        case 'BOOKED':
          bookedDevices++;
          break;
        case 'MAINTENANCE':
          maintenanceDevices++;
          break;
        case 'LOST':
          lostDevices++;
          break;
        case 'RETIRED':
          retiredDevices++;
          break;
      }
    }

    const inUse = rentedDevices + bookedDevices;
    const utilizationRate = totalDevices > 0 ? Math.round((inUse / totalDevices) * 100) : 0;
    const avgBatteryHealth = totalDevices > 0 ? Math.round(totalBattery / totalDevices) : 100;

    return {
      totalDevices,
      availableDevices,
      rentedDevices,
      bookedDevices,
      maintenanceDevices,
      lostDevices,
      retiredDevices,
      utilizationRate,
      avgBatteryHealth,
    };
  }, [rawDevices]);

  const { rentalStats, actionRequiredRentals, recentRentals } = React.useMemo(() => {
    const rentals: RentalItem[] = rawRentals ?? [];

    let pendingDispatchCount = 0;
    let activeRentalsCount = 0;
    let overdueRentalsCount = 0;
    let completedRentalsCount = 0;
    let pendingPaymentCount = 0;
    let totalRevenue = 0;

    const actionItems: RentalItem[] = [];

    for (const rental of rentals) {
      const amount = typeof rental.totalAmount === 'number' ? rental.totalAmount : Number(rental.totalAmount) || 0;

      switch (rental.status) {
        case 'CONFIRMED':
          pendingDispatchCount++;
          actionItems.push(rental);
          totalRevenue += amount;
          break;
        case 'ACTIVE':
          activeRentalsCount++;
          totalRevenue += amount;
          break;
        case 'OVERDUE':
          overdueRentalsCount++;
          actionItems.push(rental);
          totalRevenue += amount;
          break;
        case 'RETURNED':
          completedRentalsCount++;
          totalRevenue += amount;
          break;
        case 'PENDING_PAYMENT':
          pendingPaymentCount++;
          break;
      }
    }

    const stats: AdminDashboardRentalStats = {
      pendingDispatchCount,
      activeRentalsCount,
      overdueRentalsCount,
      completedRentalsCount,
      pendingPaymentCount,
      totalRevenue,
    };

    return {
      rentalStats: stats,
      actionRequiredRentals: actionItems,
      recentRentals: rentals.slice(0, 8),
    };
  }, [rawRentals]);

  const isLoading = devicesQuery.isLoading || rentalsQuery.isLoading;
  const isError = devicesQuery.isError || rentalsQuery.isError;
  const error = (devicesQuery.error || rentalsQuery.error) as Error | null;

  const refetch = React.useCallback(() => {
    devicesQuery.refetch();
    rentalsQuery.refetch();
  }, [devicesQuery, rentalsQuery]);

  return {
    fleetStats,
    rentalStats,
    actionRequiredRentals,
    recentRentals,
    isLoading,
    isError,
    error,
    refetch,
  };
}
