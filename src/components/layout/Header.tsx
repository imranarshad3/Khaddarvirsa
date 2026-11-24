import Link from 'next/link';
import { navigation } from '@/lib/catalog';
import { getSettings, whatsappLink } from '@/lib/settings';
import { WhatsappIcon, ChevronDown } from '@/components/icons';
import SearchOverlay from './SearchOverlay';
import MobileNavigation from './MobileNavigation';
import { CartButton } from '@/components/cart/CartDrawer';
import WishlistLink from './WishlistLink';
import NavLink from './NavLink';

export type NavItem = { name: string; alias: string; subs: { name: string; alias: string }[] };

export function AnnouncementBar({ texts }: { texts: string[] }) {
  if (!texts.length) return null;
  return (
    <div className="bg-ink px-3 py-2 text-center text-[12px] font-medium uppercase tracking-[0.2em] text-sand">
      {texts.map((t, i) => <span key={i} className={i > 0 ? 'hidden sm:inline' : ''}>{i > 0 && <span className="mx-4 opacity-50">·</span>}{t}</span>)}
    </div>
  );
}

export function Wordmark({ name, small = false }: { name: string; small?: boolean }) {
  // Phones get the mark without the tagline, which would be too small to read.
  return (
    <Link href="/" aria-label={`${name} home`} className="flex justify-center">
      {small
        ? <img src="/brand/khaddar-virsa-mark.png" alt={name} width={193} height={140} className="h-[46px] w-auto" />
        : <img src="/brand/khaddar-virsa-logo.png" alt={name} width={194} height={164} className="h-[76px] w-auto" />}
    </Link>
  );
}

export default async function Header() {
  const s = (await getSettings());
  const nav: NavItem[] = (await navigation()).map((c) => ({ name: c.name, alias: c.alias, subs: c.subs.map((x) => ({ name: x.name, alias: x.alias })) }));

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar texts={s.top_bar_text} />
      <div className="border-b border-line bg-paper/95 backdrop-blur">
        {/* Desktop */}
        <div className="container-kk hidden grid-cols-[1fr_auto_1fr] items-center gap-6 py-3 md:grid">
          <div className="max-w-[260px]"><SearchOverlay /></div>
          <Wordmark name={s.store_name} />
          <div className="flex items-center justify-end gap-4">
            {s.whatsapp_number && (
              <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="hidden items-center gap-2 text-[14px] tracking-wide text-ink-2 hover:text-gold lg:inline-flex">
                <WhatsappIcon className="h-4 w-4" /> Order on WhatsApp
              </a>
            )}
            <WishlistLink />
            <CartButton />
          </div>
        </div>
        <nav aria-label="Main" className="hidden border-t border-line md:block">
          <ul className="container-kk flex flex-wrap items-center justify-center gap-x-6 text-[13px] font-medium uppercase tracking-[0.16em] text-ink-2 lg:gap-x-10">
            <li><NavLink href="/">Home</NavLink></li>
            {nav.map((c) => (
              <li key={c.alias} className="group relative">
                <NavLink href={`/main-category/${c.alias}`} also={c.subs.map((x) => `/product-category/${x.alias}`)}>
                  {c.name}{c.subs.length > 0 && <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-300 group-hover:rotate-180" />}
                </NavLink>
                {c.subs.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-30 -translate-x-1/2 translate-y-2 pt-px opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <ul className="min-w-[250px] border-t-2 border-gold bg-paper py-4 shadow-[0_24px_50px_-20px_rgba(53,34,24,.35)]">
                      {c.subs.map((x) => (
                        <li key={x.alias}>
                          <Link href={`/product-category/${x.alias}`} className="flex items-center justify-between px-6 py-2 text-[15px] normal-case tracking-normal text-body transition-all hover:bg-soft hover:pl-7 hover:text-ink">
                            {x.name}
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
            <li>
              <NavLink href="/today-sale" style={{ color: s.sale_color }}>
                <span aria-hidden className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden" style={{ background: s.sale_color }} /><span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: s.sale_color }} /></span>
                {s.sale_title}
              </NavLink>
            </li>
            <li><NavLink href="/contact">Contact</NavLink></li>
          </ul>
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="grid grid-cols-[80px_1fr_80px] items-center px-3 py-2">
            <MobileNavigation nav={nav} saleTitle={s.sale_title} saleColor={s.sale_color} />
            <Wordmark name={s.store_name} small />
            <div className="flex justify-end"><WishlistLink /><CartButton /></div>
          </div>
          <div className="px-3 pb-3"><SearchOverlay dark /></div>
        </div>
      </div>
    </header>
  );
}
