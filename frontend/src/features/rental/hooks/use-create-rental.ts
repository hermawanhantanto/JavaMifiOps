import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRentalApi } from '../api/rental.api';
import type { CreateRentalInput } from '../types/rental.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

/**
 * TanStack Query mutation hook for creating a rental booking and generating Midtrans payment.
 */
export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRentalInput) => {
      return await createRentalApi(input);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success(response.message || 'Rental booked successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to book rental';
      toast.error(message);
    },
  });
}
