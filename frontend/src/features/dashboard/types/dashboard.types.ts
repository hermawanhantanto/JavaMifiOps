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
