import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data:`,
  `font-src 'self' data:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io', '*.trycloudflare.com'],
  poweredByHeader: false,
  typedRoutes: true,
  serverExternalPackages: ['pino', 'pino-pretty'],

  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },

  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
