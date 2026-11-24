'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, BagIcon, ChevronDown, CloseIcon, MenuIcon } from '@/components/icons';
import { useDialog } from '@/components/useDialog';
import type { NavItem } from './Header';

export default function MobileNavigation({ nav, saleTitle, saleColor }: { nav: NavItem[]; saleTitle: string; saleColor: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const panel = useDialog<HTMLElement>(open, () => setOpen(false));

  useEffect(() => setOpen(false), [pathname]);

  const link = 'flex min-h-[52px] items-center border-b border-line px-5 text-[14px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:bg-soft';
  return (
    <>
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft">
        <MenuIcon className="h-6 w-6" />
      </button>
      {/* Portal: the header's backdrop-blur would otherwise trap this fixed panel inside the header strip. */}
      {open && createPortal(
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" style={{ animation: 'kk-fade-in .2s' }} onClick={() => setOpen(false)} />
          <nav ref={panel} className="absolute inset-y-0 left-0 flex w-[320px] max-w-[86vw] flex-col bg-cream shadow-[24px_0_60px_-30px_rgba(53,34,24,.6)]" style={{ animation: 'kk-slide-in .25s ease-out' }}>
            <div className="flex items-center justify-between border-b border-line bg-paper py-2 pl-5 pr-2">
              <img src="/brand/khaddar-virsa-mark.png" alt="Khaddar Virsa" width={193} height={140} className="h-[44px] w-auto" />
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-soft"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <Link href="/today-sale" className={`${link} justify-between font-bold`} style={{ color: saleColor }}>{saleTitle}<ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className={link}>Home</Link>
              {nav.map((c) => (
                <div key={c.alias}>
                  <div className="flex border-b border-line">
                    <Link href={`/main-category/${c.alias}`} className={`${link} flex-1 border-b-0`}>{c.name}</Link>
                    {c.subs.length > 0 && (
                      <button type="button" className="flex w-14 items-center justify-center border-l border-line text-ink-2 hover:bg-soft" aria-label={`Show ${c.name} categories`} aria-expanded={expanded === c.alias}
                        onClick={() => setExpanded(expanded === c.alias ? null : c.alias)}>
                        <ChevronDown className={`h-4 w-4 transition ${expanded === c.alias ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {expanded === c.alias && (
                    <div className="border-b border-line bg-soft py-1">
                      {c.subs.map((x) => (
                        <Link key={x.alias} href={`/product-category/${x.alias}`} className="flex min-h-[44px] items-center px-8 text-[15px] text-body hover:text-gold-dark">{x.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/contact" className={link}>Contact</Link>
            </div>
            <div className="border-t border-line bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link href="/cart-detail" className="btn-dark w-full"><BagIcon className="h-4 w-4" />View cart</Link>
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
