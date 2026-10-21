import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/schemas/api.schema';
import type {
  SignupFormValues,
  SignupResponseData,
  SigninFormValues,
  SigninResponseData,
  AuthUser,
} from '../types/auth.types';

export const signupApi = async (
  payload: SignupFormValues
): Promise<ApiResponse<SignupResponseData>> => {
  const response = await apiClient.post<ApiResponse<SignupResponseData>>(
    '/auth/signup',
    payload
  );
  return response.data;
};

export const signinApi = async (
  payload: SigninFormValues
): Promise<ApiResponse<SigninResponseData>> => {
  const response = await apiClient.post<ApiResponse<SigninResponseData>>(
    '/auth/signin',
    payload
  );
  return response.data;
};

export const getMeApi = async (): Promise<ApiResponse<{ user: AuthUser }>> => {
  const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
  return response.data;
};

export const updateProfileApi = async (
  payload: Partial<Pick<AuthUser, 'name' | 'phone' | 'address'>>
): Promise<ApiResponse<{ user: AuthUser }>> => {
  const response = await apiClient.patch<ApiResponse<{ user: AuthUser }>>('/auth/profile', payload);
  return response.data;
};
