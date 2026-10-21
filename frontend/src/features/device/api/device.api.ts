import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/schemas/api.schema';
import type { ListDevicesParams, ListDevicesData } from '../types/device.types';

export const getDevicesApi = async (
  params: ListDevicesParams = {}
): Promise<ApiResponse<ListDevicesData>> => {
  const queryParams: Record<string, string | number> = {};

  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  if (params.speed && params.speed !== 'ALL') queryParams.speed = params.speed;
  if (params.search && params.search.trim().length > 0) {
    queryParams.search = params.search.trim();
  }

  const response = await apiClient.get<ApiResponse<ListDevicesData>>('/device', {
    params: queryParams,
  });

  return response.data;
};
