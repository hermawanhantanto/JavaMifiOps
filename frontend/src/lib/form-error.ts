import type { UseFormSetError, FieldValues, FieldPath } from 'react-hook-form';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/schemas/api.schema';

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorData {
  errors?: ApiValidationErrorDetail[];
}

export interface HandleFormMutationErrorOptions<TFieldValues extends FieldValues> {
  error: unknown;
  setError?: UseFormSetError<TFieldValues>;
  setServerError?: (message: string) => void;
  defaultMessage?: string;
}

/**
 * Extracts a human-readable error message from an unknown error (AxiosError, Error, or string).
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) {
    return fallbackMessage;
  }

  const axiosError = error as AxiosError<ApiResponse<ApiErrorData>>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}

/**
 * Centralized handler for mutation errors from backend API responses.
 * Automatically maps server-side validation error arrays to React Hook Form fields via setError,
 * and forwards the overall human-readable error message to setServerError.
 */
export function handleFormMutationError<TFieldValues extends FieldValues>({
  error,
  setError,
  setServerError,
  defaultMessage = 'An unexpected error occurred. Please try again.',
}: HandleFormMutationErrorOptions<TFieldValues>): string {
  const axiosError = error as AxiosError<ApiResponse<ApiErrorData>>;
  const errorResponse = axiosError.response?.data;
  const validationErrors = errorResponse?.data?.errors;

  if (setError && Array.isArray(validationErrors)) {
    for (const item of validationErrors) {
      if (item.field) {
        setError(item.field as FieldPath<TFieldValues>, {
          type: 'server',
          message: item.message,
        });
      }
    }
  }

  const message = extractErrorMessage(error, defaultMessage);

  if (setServerError) {
    setServerError(message);
  }

  return message;
}
