import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.url('Set DATABASE_URL to your Neon connection string'),
  BETTER_AUTH_SECRET: z.string().min(32, 'Generate one with: openssl rand -base64 32'),
  BETTER_AUTH_URL: z.url().optional(),
  BETTER_AUTH_API_KEY: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  QSTASH_URL: z.url(),
  QSTASH_CURRENT_SIGNING_KEY: z.string(),
  QSTASH_NEXT_SIGNING_KEY: z.string(),
  QSTASH_TOKEN: z.string(),
  BENCHMARK_API_URL: z.url().default('http://127.0.0.1:8000'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Hackathon'),
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  QSTASH_URL: process.env.QSTASH_URL,
  QSTASH_TOKEN: process.env.QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
  BENCHMARK_API_URL: process.env.BENCHMARK_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
} as const;

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;
type Env = ServerEnv & ClientEnv;

const isServer = typeof window === 'undefined';

const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION);

function parseEnv(): Env {
  if (skipValidation) {
    return processEnv as unknown as Env;
  }

  const schema = isServer ? serverSchema.extend(clientSchema.shape) : clientSchema;
  const parsed = schema.safeParse(processEnv);

  if (!parsed.success) {
    const issues = z.prettifyError(parsed.error);

    console.error(`\n[env] Invalid environment variables:\n${issues}\n`);
    throw new Error('Invalid environment variables. See the output above.');
  }

  return parsed.data as Env;
}

const parsedEnv = parseEnv();

export const env: Env = new Proxy(parsedEnv, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (!isServer && !prop.startsWith('NEXT_PUBLIC_')) {
      throw new Error(
        `[env] Attempted to access server-only variable "${prop}" on the client. ` +
          `Move the read into a Server Component, or expose it as NEXT_PUBLIC_${prop}.`,
      );
    }
    return target[prop as keyof Env];
  },
});
