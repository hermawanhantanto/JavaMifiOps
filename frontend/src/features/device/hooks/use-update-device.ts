import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDeviceApi } from '../api/device.api';
import type { UpdateDeviceInput } from '../types/device.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDeviceInput }) => {
      return await updateDeviceApi(id, data);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Device updated successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update device';
      toast.error(message);
    },
  });
}
