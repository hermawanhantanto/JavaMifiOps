import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variable schema definition.
 * Strictly validates required secrets and configurations upon startup.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .min(1, 'DATABASE_URL cannot be empty'),
  CLIENT_URL: z
    .string({ required_error: 'CLIENT_URL is required' })
    .min(1, 'CLIENT_URL cannot be empty'),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(8, 'JWT_SECRET must be at least 8 characters long for security'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  MIDTRANS_SERVER_KEY: z
    .string({ required_error: 'MIDTRANS_SERVER_KEY is required' })
    .min(1, 'MIDTRANS_SERVER_KEY cannot be empty'),
  MIDTRANS_CLIENT_KEY: z
    .string({ required_error: 'MIDTRANS_CLIENT_KEY is required' })
    .min(1, 'MIDTRANS_CLIENT_KEY cannot be empty'),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n[ERROR] Invalid or missing environment variables:');
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\nPlease verify your .env file and restart the application.\n');
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
