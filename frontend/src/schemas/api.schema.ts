import { z } from 'zod';

export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(['success', 'error']),
    message: z.string(),
    data: dataSchema.nullable(),
  });

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}
