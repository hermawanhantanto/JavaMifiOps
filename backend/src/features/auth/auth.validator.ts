import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    confirm_password: z
      .string({ required_error: 'Confirm password is required' })
      .min(1, 'Confirm password is required'),
    phone_number: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(/^62\d+$/, "Phone number must start strictly with '62' and contain only numeric digits")
      .min(10, 'Phone number must be at least 10 digits long')
      .max(15, 'Phone number cannot exceed 15 digits'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password and confirm password do not match',
    path: ['confirm_password'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type SigninInput = z.infer<typeof signinSchema>;
