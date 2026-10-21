import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDeviceApi } from '../api/device.api';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteDeviceApi(id);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success(response.message || 'Device deleted successfully');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete device';
      toast.error(message);
    },
  });
}
