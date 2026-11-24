import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { logout } from '../actions';
import AdminNav, { Crumb, Icon } from './AdminNav';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const s = (await getSettings());
  return (
    <div lang="en" dir="ltr" className="admin min-h-screen bg-[#f7f2ea] print:bg-white text-[14px] text-ink-2 md:flex">
      <aside className="relative bg-ink print:hidden text-white md:sticky md:top-0 md:h-screen md:w-[256px] md:shrink-0 md:overflow-y-auto">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_0%_0%,rgba(212,178,137,.18),transparent_60%)]" />
        <div className="relative flex flex-wrap items-center gap-3 px-5 py-5 md:block md:px-6 md:py-7">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sand to-gold font-display text-[18px] text-ink shadow-lg">
              {s.store_name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[19px] text-white">{s.store_name}</span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-sand/70">Studio</span>
            </span>
          </Link>
          <AdminNav logout={logout} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex print:hidden items-center justify-between gap-4 border-b border-line/70 bg-[#f7f2ea]/85 px-4 py-3 backdrop-blur md:px-8">
          <Crumb />
          <Link href="/" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 shadow-sm transition hover:border-gold hover:text-gold-dark">
            Visit store <Icon name="shop" className="h-3.5 w-3.5" />
          </Link>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
