import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#eaecf0',
    theme_color: '#fe7f2d',
  };
}
