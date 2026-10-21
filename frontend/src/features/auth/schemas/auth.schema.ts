import { z } from 'zod';

export const signupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    phone_number: z
      .string()
      .trim()
      .regex(/^62\d+$/, "Phone number must start strictly with '62' and contain only numeric digits")
      .min(10, 'Phone number must be at least 10 digits long')
      .max(15, 'Phone number cannot exceed 15 digits'),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirm_password: z
      .string()
      .min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password and confirm password do not match',
    path: ['confirm_password'],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const signinFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type SigninFormValues = z.infer<typeof signinFormSchema>;
