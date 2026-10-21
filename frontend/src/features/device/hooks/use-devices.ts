import { useQuery } from '@tanstack/react-query';
import { getDevicesApi } from '../api/device.api';
import type { ListDevicesParams } from '../types/device.types';

export const useDevices = (params: ListDevicesParams = {}) => {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => getDevicesApi(params),
    placeholderData: (previousData) => previousData,
  });
};
