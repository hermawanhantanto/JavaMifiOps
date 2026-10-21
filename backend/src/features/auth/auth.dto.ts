import type { z } from 'zod';
import type { Role } from '../../generated/prisma/enums.js';
import type { signupSchema, signinSchema, updateProfileSchema } from './auth.validator.js';

/**
 * Data Transfer Objects (DTOs) for the Authentication Feature Module.
 */

export type SignupInput = z.infer<typeof signupSchema>;

export type SigninInput = z.infer<typeof signinSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface SigninResult {
  user: UserResponse;
  token: string;
}
