'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Stroke icons (24px grid), drawn inline so the admin needs no icon dependency.
const ICONS: Record<string, string> = {
  dashboard: 'M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z',
  orders: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  analytics: 'M3 3v18h18M7 15l4-4 3 3 6-6',
  products: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  categories: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  customers: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  discounts: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  homepage: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  sale: 'M13 2 3 14h9l-1 8 10-12h-9z',
  pages: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
  subscribers: 'M4 4h16v16H4zM4 6l8 7 8-7',
  shop: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 6h18M3 12h18M3 18h18',
};
export function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: string; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}><path d={ICONS[name]} /></svg>;
}

export const GROUPS: { title: string; items: [string, string, string][] }[] = [
  { title: 'Overview', items: [['/admin', 'Dashboard', 'dashboard'], ['/admin/analytics', 'Analytics', 'analytics']] },
  { title: 'Sales', items: [['/admin/orders', 'Orders', 'orders'], ['/admin/customers', 'Customers', 'customers'], ['/admin/discounts', 'Discounts', 'discounts']] },
  { title: 'Catalogue', items: [['/admin/products', 'Products', 'products'], ['/admin/categories', 'Categories', 'categories']] },
  { title: 'Website', items: [['/admin/homepage', 'Homepage', 'homepage'], ['/admin/sale', 'Sale page', 'sale'], ['/admin/pages', 'Pages', 'pages'], ['/admin/subscribers', 'Subscribers', 'subscribers'], ['/admin/settings', 'Settings & SEO', 'settings']] },
];

export function crumb(path: string) {
  for (const g of GROUPS) for (const [href, label] of g.items) if (href !== '/admin' && (path === href || path.startsWith(`${href}/`))) return [g.title, label];
  return ['Overview', 'Dashboard'];
}

export default function AdminNav({ logout }: { logout: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === '/admin' ? path === href : path === href || path.startsWith(`${href}/`));
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-nav" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-sand ring-1 ring-white/15 md:hidden" aria-label="Menu">
        <Icon name="menu" />
      </button>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? 'block' : 'hidden'} w-full md:block`} onClick={() => setOpen(false)}>
        {GROUPS.map((g) => (
          <div key={g.title} className="mt-6 first:mt-2">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/50">{g.title}</p>
            <ul className="grid gap-0.5">
              {g.items.map(([href, label, icon]) => (
                <li key={href}>
                  <Link href={href} aria-current={active(href) ? 'page' : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-all ${active(href) ? 'bg-gradient-to-r from-sand/20 to-sand/5 text-white shadow-[inset_0_0_0_1px_rgba(212,178,137,.25)]' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}>
                    {active(href) && <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-sand" />}
                    <Icon name={icon} className={`h-[18px] w-[18px] ${active(href) ? 'text-sand' : 'text-white/45 group-hover:text-sand'}`} />{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-8 grid gap-0.5 border-t border-white/10 pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-white/65 hover:bg-white/5 hover:text-white"><Icon name="shop" className="h-[18px] w-[18px] text-white/45" />View shop</Link>
          <form action={logout}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] text-white/65 hover:bg-white/5 hover:text-white"><Icon name="logout" className="h-[18px] w-[18px] text-white/45" />Log out</button></form>
        </div>
      </nav>
    </>
  );
}

export function Crumb() {
  const [group, label] = crumb(usePathname());
  return <p className="text-[12px] uppercase tracking-[0.22em] text-muted">Studio <span className="mx-1.5 text-gold">/</span> {group} <span className="mx-1.5 text-gold">/</span> <span className="text-ink-2">{label}</span></p>;
}
