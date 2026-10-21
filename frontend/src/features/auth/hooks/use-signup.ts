import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { signupApi } from '../api/auth.api';
import type {
  SignupFormValues,
  SignupResponseData,
  ApiErrorResponse,
} from '../types/auth.types';
import type { ApiResponse } from '@/schemas/api.schema';

export interface UseSignupOptions {
  onSuccessRedirect?: string;
}

export const useSignup = (options: UseSignupOptions = {}) => {
  const navigate = useNavigate();
  const { onSuccessRedirect = '/signin' } = options;

  return useMutation<
    ApiResponse<SignupResponseData>,
    AxiosError<ApiErrorResponse>,
    SignupFormValues
  >({
    mutationFn: signupApi,
    onSuccess: (data) => {
      const message = data.message || 'User registered successfully';
      toast.success(message, {
        description: 'Please sign in with your new credentials.',
      });

      navigate(onSuccessRedirect, {
        state: {
          signupSuccess: true,
          message,
        },
      });
    },
  });
};
