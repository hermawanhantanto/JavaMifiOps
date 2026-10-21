import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { signinApi } from '../api/auth.api';
import type {
  SigninFormValues,
  SigninResponseData,
  ApiErrorResponse,
} from '../types/auth.types';
import type { ApiResponse } from '@/schemas/api.schema';

export interface UseSigninOptions {
  onSuccessRedirect?: string;
}

export const useSignin = (options: UseSigninOptions = {}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccessRedirect = '/' } = options;

  return useMutation<
    ApiResponse<SigninResponseData>,
    AxiosError<ApiErrorResponse>,
    SigninFormValues
  >({
    mutationFn: signinApi,
    onSuccess: (response) => {
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }

      // Reset any queries affected by user auth state
      queryClient.invalidateQueries();

      navigate(onSuccessRedirect, { replace: true });
    },
  });
};
