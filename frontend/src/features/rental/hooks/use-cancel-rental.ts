import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelRentalApi } from '../api/rental.api';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

/**
 * TanStack Query mutation hook for cancelling a rental booking in pending payment status.
 * Releases the reserved hardware device lock and invalidates rental/device queries.
 */
export function useCancelRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rentalId: string) => {
      return await cancelRentalApi(rentalId);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Rental booking cancelled successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel rental booking';
      toast.error(message);
    },
  });
}
