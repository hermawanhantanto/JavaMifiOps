import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRentalApi } from '../api/rental.api';
import type { UpdateRentalInput } from '../types/rental.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

export interface UpdateRentalParams {
  id: string;
  input: UpdateRentalInput;
}

/**
 * TanStack Query mutation hook for updating rental destination and/or travel dates.
 * Invalidates rental queries to reflect updated schedules and gross amounts.
 */
export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: UpdateRentalParams) => {
      return await updateRentalApi(id, input);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Rental updated successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update rental booking';
      toast.error(message);
    },
  });
}
