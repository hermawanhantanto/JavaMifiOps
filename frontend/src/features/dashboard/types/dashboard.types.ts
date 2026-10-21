import type { RentalItem } from '@/features/rental/types/rental.types';

export interface CustomerDashboardStats {
  activeCount: number;
  upcomingCount: number;
  completedCount: number;
  totalDays: number;
}

export interface CustomerDashboardData {
  stats: CustomerDashboardStats;
  pendingPaymentRental: RentalItem | null;
  activeRental: RentalItem | null;
  recentRentals: RentalItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface AdminDashboardFleetStats {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  bookedDevices: number;
  maintenanceDevices: number;
  lostDevices: number;
  retiredDevices: number;
  utilizationRate: number;
  avgBatteryHealth: number;
}

export interface AdminDashboardRentalStats {
  pendingDispatchCount: number;
  activeRentalsCount: number;
  overdueRentalsCount: number;
  completedRentalsCount: number;
  pendingPaymentCount: number;
  totalRevenue: number;
}

export interface AdminDashboardData {
  fleetStats: AdminDashboardFleetStats;
  rentalStats: AdminDashboardRentalStats;
  actionRequiredRentals: RentalItem[];
  recentRentals: RentalItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
