import { env } from '@/env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    'A production-grade Next.js starter with strict TypeScript, testing, CI and container builds.',
  url: env.NEXT_PUBLIC_APP_URL,
  locale: 'en_US',
  links: {
    github: 'https://github.com/your-org/your-repo',
  },
} as const;

export type SiteConfig = typeof siteConfig;
