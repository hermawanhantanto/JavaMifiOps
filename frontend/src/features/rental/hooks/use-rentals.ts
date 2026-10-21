import { useQuery } from '@tanstack/react-query';
import { getRentalsApi } from '../api/rental.api';
import type { ListRentalsParams } from '../types/rental.types';

/**
 * TanStack Query hook for fetching paginated and filtered rental bookings.
 * Employs placeholderData to preserve table content during filter transitions.
 */
export const useRentals = (params: ListRentalsParams = {}) => {
  return useQuery({
    queryKey: ['rentals', params],
    queryFn: () => getRentalsApi(params),
    placeholderData: (previousData) => previousData,
  });
};
