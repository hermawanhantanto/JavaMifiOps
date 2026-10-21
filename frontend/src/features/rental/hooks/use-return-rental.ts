import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnRentalApi } from '../api/rental.api';
import type { ReturnRentalInput } from '../types/rental.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

/**
 * TanStack Query mutation hook for processing device return and inspection (Admin only).
 */
export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ReturnRentalInput }) => {
      return await returnRentalApi(id, input);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Rental device returned successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to return rental device';
      toast.error(message);
    },
  });
}
