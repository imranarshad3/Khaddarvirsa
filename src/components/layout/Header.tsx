import Link from 'next/link';
import { navigation } from '@/lib/catalog';
import { db } from '@/lib/db';
import { getSettings, whatsappLink } from '@/lib/settings';
import { WhatsappIcon, ChevronDown } from '@/components/icons';
import SearchOverlay from './SearchOverlay';
import MobileNavigation from './MobileNavigation';
import { CartButton } from '@/components/cart/CartDrawer';
import WishlistLink from './WishlistLink';
import NavLink from './NavLink';
import HeaderShell from './HeaderShell';

export type NavItem = { name: string; alias: string; subs: { name: string; alias: string }[] };

export function AnnouncementBar({ texts }: { texts: string[] }) {
  if (!texts.length) return null;
  // Folds away once the visitor scrolls, leaving a slimmer sticky header.
  return (
    <div className="grid grid-rows-[1fr] bg-ink transition-[grid-template-rows] duration-300 group-data-[scrolled]/hdr:grid-rows-[0fr]">
      <div className="overflow-hidden">
        <p className="flex items-center justify-center px-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-sand">
          {texts.map((t, i) => <span key={i} className={i > 0 ? 'hidden items-center sm:inline-flex' : 'inline-flex items-center'}>{i > 0 && <span aria-hidden className="mx-5 inline-block h-1 w-1 rotate-45 bg-gold" />}{t}</span>)}
        </p>
      </div>
    </div>
  );
}

export function Wordmark({ name, small = false }: { name: string; small?: boolean }) {
  // Phones get the mark without the tagline, which would be too small to read.
  return (
    <Link href="/" aria-label={`${name} home`} className="flex justify-center">
      {small
        ? <img src="/brand/khaddar-virsa-mark.png" alt={name} width={193} height={140} className="h-[46px] w-auto transition-[height] duration-300 group-data-[scrolled]/hdr:h-[38px]" />
        : <img src="/brand/khaddar-virsa-logo.png" alt={name} width={194} height={164} className="h-[76px] w-auto transition-[height] duration-300 group-data-[scrolled]/hdr:h-[52px]" />}
    </Link>
  );
}

export default async function Header() {
  const s = (await getSettings());
  const menuPages = s.menu_pages.length
    ? ((await db().prepare(`SELECT slug, title FROM pages WHERE slug IN (${s.menu_pages.map(() => '?').join(',')})`).all(...s.menu_pages)) as { slug: string; title: string }[])
      .sort((a, b) => s.menu_pages.indexOf(a.slug) - s.menu_pages.indexOf(b.slug))
    : [];
  const nav: NavItem[] = (await navigation()).map((c) => ({ name: c.name, alias: c.alias, subs: c.subs.map((x) => ({ name: x.name, alias: x.alias })) }));

  return (
    <HeaderShell>
      <AnnouncementBar texts={s.top_bar_text} />
      <div className="border-b border-line bg-paper/90 backdrop-blur-md transition-shadow duration-300 group-data-[scrolled]/hdr:shadow-[0_12px_32px_-20px_rgba(53,34,24,.45)]">
        {/* Desktop */}
        <div className="container-kk hidden grid-cols-[1fr_auto_1fr] items-center gap-6 py-4 transition-[padding] duration-300 group-data-[scrolled]/hdr:py-2 md:grid">
          <div className="max-w-[280px]"><SearchOverlay /></div>
          <Wordmark name={s.store_name} />
          <div className="flex items-center justify-end gap-1">
            {s.whatsapp_number && (
              <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="mr-3 hidden items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark transition-colors hover:border-ink hover:bg-ink hover:text-sand lg:inline-flex">
                <WhatsappIcon className="h-4 w-4" /> Order on WhatsApp
              </a>
            )}
            <WishlistLink />
            <CartButton />
          </div>
        </div>
        <nav aria-label="Main" className="hidden border-t border-line/70 md:block">
          <ul className="container-kk flex flex-wrap items-center justify-center gap-x-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-2 lg:gap-x-11">
            <li><NavLink href="/">Home</NavLink></li>
            {nav.map((c) => (
              <li key={c.alias} className="group relative">
                <NavLink href={`/main-category/${c.alias}`} also={c.subs.map((x) => `/product-category/${x.alias}`)}>
                  {c.name}{c.subs.length > 0 && <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-300 group-hover:rotate-180" />}
                </NavLink>
                {c.subs.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-30 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <ul className="relative min-w-[270px] border-x border-b border-t-2 border-line border-t-gold bg-paper py-4 shadow-[0_28px_60px_-24px_rgba(53,34,24,.45)] before:absolute before:-top-[6px] before:left-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:rotate-45 before:border-l before:border-t before:border-gold before:bg-paper">
                      {c.subs.map((x) => (
                        <li key={x.alias}>
                          <Link href={`/product-category/${x.alias}`} className="group/item flex items-center gap-0 px-6 py-2 font-display text-[16px] normal-case tracking-normal text-body transition-all hover:gap-3 hover:bg-soft hover:text-ink">
                            <span aria-hidden className="h-px w-0 bg-gold transition-all duration-300 group-hover/item:w-4" />{x.name}
                          </Link>
                        </li>
                      ))}
                      <li className="mx-6 mt-3 border-t border-line pt-3">
                        <Link href={`/main-category/${c.alias}`} className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark hover:text-ink">View all {c.name} →</Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ))}
            {s.sale_enabled && <li>
              <NavLink href="/today-sale" style={{ color: s.sale_color }}>
                <span aria-hidden className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden" style={{ background: s.sale_color }} /><span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: s.sale_color }} /></span>
                {s.sale_title}
              </NavLink>
            </li>}
            {menuPages.map((p) => <li key={p.slug}><NavLink href={`/${p.slug}`}>{p.title}</NavLink></li>)}
            <li><NavLink href="/contact">Contact</NavLink></li>
          </ul>
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="grid grid-cols-[88px_1fr_88px] items-center px-2 py-1.5">
            <MobileNavigation nav={nav} pages={menuPages} whatsapp={s.whatsapp_number ? whatsappLink(s.whatsapp_number) : ''}
              sale={s.sale_enabled ? { title: s.sale_title, color: s.sale_color, headline: s.sale_headline, endsAt: s.sale_ends_at } : null} />
            <Wordmark name={s.store_name} small />
            <div className="flex justify-end"><WishlistLink /><CartButton /></div>
          </div>
          <div className="px-4 pb-3"><SearchOverlay dark /></div>
        </div>
      </div>
    </HeaderShell>
  );
}
