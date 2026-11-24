import { cache } from 'react';
import 'server-only';
import { db, tx } from './db';

export type Settings = {
  store_name: string;
  top_bar_text: string[];
  sale_title: string;
  sale_color: string;
  /** Today's sale page: menu link on/off, hero text and photo, optional end time (ISO) for the countdown. */
  sale_enabled: boolean;
  sale_headline: string;
  sale_text: string;
  sale_banner: string;
  sale_ends_at: string;
  /** Slugs of Admin → Pages entries linked from the menus, in order. */
  menu_pages: string[];
  shipping_charges: number;
  free_shipping_over: number;
  contact: { address: string[]; email: string[]; phone: string[] };
  whatsapp_number: string;
  social: { key: string; name: string; link: string }[];
  bank_details: { account_title: string; bank: string; account_number: string; iban: string }[];
  bank_note: string;
  sliders: { img: string; link: string }[];
  seo_title: string;
  seo_description: string;
};

const DEFAULTS: Settings = {
  store_name: 'Khaddar Virsa', top_bar_text: [], sale_title: 'Sale', sale_color: '#B70000',
  sale_enabled: true, sale_headline: '', sale_text: '', sale_banner: '', sale_ends_at: '', menu_pages: [],
  shipping_charges: 0, free_shipping_over: 0, contact: { address: [], email: [], phone: [] }, whatsapp_number: '',
  social: [], bank_details: [], bank_note: '', sliders: [], seo_title: 'Khaddar Virsa', seo_description: '',
};

// cache(): one settings read per request, however many components ask for it.
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = (await db().prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const r of rows) out[r.key] = JSON.parse(r.value);
  return out as Settings;
});

export async function saveSettings(patch: Partial<Settings>) {
  await tx(async (d) => {
    const st = d.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(patch)) if (k in DEFAULTS) await st.run(k, JSON.stringify(v));
  });
}

export const whatsappLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '').replace(/^0/, '92')}`;

export function siteUrl() {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL; // set by Vercel, so preview builds still point canonicals at the live domain
  return (process.env.SITE_URL || (prod ? `https://${prod}` : 'http://localhost:3000')).replace(/\/$/, '');
}
