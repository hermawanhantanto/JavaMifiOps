import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchRentalApi } from '../api/rental.api';
import type { DispatchRentalInput } from '../types/rental.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

/**
 * TanStack Query mutation hook for dispatching a confirmed rental device (Admin only).
 */
export function useDispatchRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input?: DispatchRentalInput }) => {
      return await dispatchRentalApi(id, input);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Rental device dispatched successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to dispatch rental device';
      toast.error(message);
    },
  });
}
