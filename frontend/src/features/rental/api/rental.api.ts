import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/schemas/api.schema';
import type {
  CreateRentalInput,
  CreateRentalResponseData,
  ListRentalsParams,
  ListRentalsResponseData,
  SingleRentalResponseData,
  UpdateRentalInput,
} from '../types/rental.types';

/**
 * Creates a new pocket WiFi rental booking and requests a Midtrans Snap transaction token.
 */
export const createRentalApi = async (
  input: CreateRentalInput
): Promise<ApiResponse<CreateRentalResponseData>> => {
  const response = await apiClient.post<ApiResponse<CreateRentalResponseData>>(
    '/rental',
    input
  );
  return response.data;
};

/**
 * Retrieves a paginated list of rentals with optional search and status filtering.
 */
export const getRentalsApi = async (
  params: ListRentalsParams = {}
): Promise<ApiResponse<ListRentalsResponseData>> => {
  const cleanParams: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };

  if (params.status && params.status !== 'ALL') {
    cleanParams.status = params.status;
  }

  if (params.search && params.search.trim().length > 0) {
    cleanParams.search = params.search.trim();
  }

  if (params.destination && params.destination.trim().length > 0) {
    cleanParams.destination = params.destination.trim();
  }

  if (params.userId) {
    cleanParams.userId = params.userId;
  }

  if (params.deviceId) {
    cleanParams.deviceId = params.deviceId;
  }

  const response = await apiClient.get<ApiResponse<ListRentalsResponseData>>('/rental', {
    params: cleanParams,
  });
  return response.data;
};

/**
 * Retrieves full details for a single rental booking by ID.
 */
export const getRentalByIdApi = async (
  id: string
): Promise<ApiResponse<SingleRentalResponseData>> => {
  const response = await apiClient.get<ApiResponse<SingleRentalResponseData>>(
    `/rental/${id}`
  );
  return response.data;
};

/**
 * Updates destination or travel dates for a pending payment rental booking.
 */
export const updateRentalApi = async (
  id: string,
  input: UpdateRentalInput
): Promise<ApiResponse<SingleRentalResponseData>> => {
  const response = await apiClient.patch<ApiResponse<SingleRentalResponseData>>(
    `/rental/${id}`,
    input
  );
  return response.data;
};

/**
 * Cancels a rental booking in pending payment status, releasing the device lock.
 */
export const cancelRentalApi = async (
  id: string
): Promise<ApiResponse<SingleRentalResponseData>> => {
  const response = await apiClient.post<ApiResponse<SingleRentalResponseData>>(
    `/rental/${id}/cancel`
  );
  return response.data;
};
