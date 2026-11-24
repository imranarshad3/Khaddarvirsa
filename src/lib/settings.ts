import 'server-only';
import { db, tx } from './db';

export type Settings = {
  store_name: string;
  top_bar_text: string[];
  sale_title: string;
  sale_color: string;
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
  shipping_charges: 0, free_shipping_over: 0, contact: { address: [], email: [], phone: [] }, whatsapp_number: '',
  social: [], bank_details: [], bank_note: '', sliders: [], seo_title: 'Khaddar Virsa', seo_description: '',
};

export async function getSettings(): Promise<Settings> {
  const rows = (await db().prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const r of rows) out[r.key] = JSON.parse(r.value);
  return out as Settings;
}

export async function saveSettings(patch: Partial<Settings>) {
  await tx(async (d) => {
    const st = d.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(patch)) if (k in DEFAULTS) await st.run(k, JSON.stringify(v));
  });
}

export const whatsappLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '').replace(/^0/, '92')}`;

export function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}
