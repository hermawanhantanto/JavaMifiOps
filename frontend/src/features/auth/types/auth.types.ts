import type { SignupFormValues, SigninFormValues } from '../schemas/auth.schema';

export type { SignupFormValues, SigninFormValues };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupResponseData {
  user: AuthUser;
}

export interface SigninResponseData {
  user: AuthUser;
  token: string;
}

export interface ApiValidationErrorItem {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  data: {
    errors?: ApiValidationErrorItem[];
  } | null;
}
