import type { MetadataRoute } from 'next';
import { getSettings } from '@/lib/settings';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.store_name, short_name: s.store_name, description: s.seo_description, start_url: '/', display: 'standalone',
    background_color: '#fffaf2', theme_color: '#352218',
    icons: [{ src: '/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
  };
}
