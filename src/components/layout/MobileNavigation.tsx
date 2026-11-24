'use client';
import { LangSwitch, useT } from '@/components/i18n/LangProvider';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, BagIcon, ChevronDown, CloseIcon, MenuIcon, WhatsappIcon } from '@/components/icons';
import { useDialog } from '@/components/useDialog';
import Countdown from './Countdown';
import type { NavItem } from './Header';

type Sale = { title: string; color: string; headline: string; endsAt: string } | null;

export default function MobileNavigation({ nav, sale, pages, whatsapp }: { nav: NavItem[]; sale: Sale; pages: { slug: string; title: string }[]; whatsapp: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const panel = useDialog<HTMLElement>(open, () => setOpen(false));

  useEffect(() => setOpen(false), [pathname]);

  const on = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const row = (href: string) => `group flex min-h-[54px] flex-1 items-center gap-3 font-display text-[20px] transition-colors ${on(href) ? 'text-gold-dark' : 'text-ink hover:text-gold-dark'}`;
  const dash = (href: string) => <span aria-hidden className={`h-px bg-gold transition-all duration-300 ${on(href) ? 'w-5' : 'w-0 group-hover:w-5'}`} />;
  const small = 'flex min-h-[44px] items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-body hover:text-gold-dark';

  return (
    <>
      <button type="button" aria-label={t('Open menu')} aria-expanded={open} onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft">
        <MenuIcon className="h-6 w-6" />
      </button>
      {/* Portal: the header's backdrop-blur would otherwise trap this fixed panel inside the header strip. */}
      {open && createPortal(
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('Menu')}>
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[3px]" style={{ animation: 'kk-fade-in .2s' }} onClick={() => setOpen(false)} />
          <nav ref={panel} className="absolute inset-y-0 left-0 flex w-[340px] max-w-[88vw] flex-col overflow-hidden rounded-r-[28px] bg-paper shadow-[24px_0_60px_-30px_rgba(53,34,24,.6)]" style={{ animation: 'kk-slide-in .3s cubic-bezier(.2,.8,.2,1)' }}>
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <Link href="/" aria-label={t('Home')}><img src="/brand/khaddar-virsa-mark.png" alt="Khaddar Virsa" width={193} height={140} className="h-[48px] w-auto" /></Link>
              <span className="flex items-center gap-2">
              <LangSwitch className="flex h-10 items-center rounded-full border border-gold/50 px-4 text-[14px] font-semibold text-gold-dark transition hover:border-ink hover:bg-ink hover:text-sand" />
              <button type="button" aria-label={t('Close menu')} onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:rotate-90 hover:border-ink"><CloseIcon className="h-4 w-4" /></button>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              {sale && (
                <Link href="/today-sale" className="relative mt-2 block overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_-24px_rgba(53,34,24,.8)]" style={{ background: `linear-gradient(135deg, ${sale.color}, #2a1a12)` }}>
                  <span aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70 motion-reduce:hidden" /><span className="relative h-1.5 w-1.5 rounded-full bg-white" /></span>
                    {sale.title}
                  </span>
                  <span className="mt-2 block font-display text-[22px] leading-snug">{sale.headline || t('Shop the sale')}</span>
                  {sale.endsAt && <Countdown to={sale.endsAt} className="mt-3 scale-90 origin-left" />}
                  <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">{t('Shop now')} <ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>
              )}

              <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">{t('Shop')}</p>
              <ul className="divide-y divide-line/80 border-y border-line/80">
                <li className="flex"><Link href="/" className={row('/')}>{dash('/')}{t('Home')}</Link></li>
                {nav.map((c) => {
                  const href = `/main-category/${c.alias}`;
                  const isOpen = expanded === c.alias;
                  return (
                    <li key={c.alias}>
                      <div className="flex items-center">
                        <Link href={href} className={row(href)}>{dash(href)}{c.name}</Link>
                        {c.subs.length > 0 && (
                          <button type="button" className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isOpen ? 'bg-ink text-sand' : 'bg-soft text-ink'}`}
                            aria-label={`${t('Show categories')}: ${c.name}`} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : c.alias)}>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      {c.subs.length > 0 && (
                        <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="mb-3 ml-1 border-l border-gold/50 pl-4">
                              {c.subs.map((x) => (
                                <Link key={x.alias} href={`/product-category/${x.alias}`} tabIndex={isOpen ? undefined : -1}
                                  className={`flex min-h-[40px] items-center text-[15px] ${on(`/product-category/${x.alias}`) ? 'font-semibold text-gold-dark' : 'text-body hover:text-ink'}`}>{x.name}</Link>
                              ))}
                              <Link href={href} tabIndex={isOpen ? undefined : -1} className="flex min-h-[40px] items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">{t('View all')} {c.name} →</Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">{t('Help')}</p>
              <div className="grid grid-cols-2 gap-x-4">
                {pages.map((p) => <Link key={p.slug} href={`/${p.slug}`} className={small}>{p.title}</Link>)}
                <Link href="/contact" className={small}>{t('Contact')}</Link>
                <Link href="/wishlist" className={small}>{t('Wishlist')}</Link>
                <Link href="/track-order" className={small}>{t('Track order')}</Link>
              </div>
            </div>

            <div className="grid gap-2 border-t border-line bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link href="/cart-detail" className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold-dark"><BagIcon className="h-4 w-4" />{t('View bag')}</Link>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener" className="flex h-12 items-center justify-center gap-2 rounded-full border border-gold/50 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-dark transition-colors hover:border-ink hover:bg-ink hover:text-sand">
                  <WhatsappIcon className="h-4 w-4" />{t('Order on WhatsApp')}
                </a>
              )}
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
