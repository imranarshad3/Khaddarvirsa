import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSettings, whatsappLink } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import HelpNav from '@/components/layout/HelpNav';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon, TruckIcon, WhatsappIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Contact Us', alternates: { canonical: '/contact' } };

type Way = { icon: ReactNode; label: string; value: string; action: string; href: string; external?: boolean };

export default async function ContactPage() {
  const s = await getSettings();
  const t = await getT();
  const ways: Way[] = [
    ...(s.whatsapp_number ? [{ icon: <WhatsappIcon className="h-6 w-6 text-[#25D366]" />, label: 'WhatsApp', value: s.whatsapp_number, action: t('Chat now'), href: whatsappLink(s.whatsapp_number), external: true }] : []),
    ...s.contact.phone.map((x) => ({ icon: <PhoneIcon className="h-6 w-6 text-gold" />, label: t('Call us'), value: x, action: t('Call now'), href: `tel:+${x.replace(/\D/g, '')}` })),
    ...s.contact.email.map((x) => ({ icon: <MailIcon className="h-6 w-6 text-gold" />, label: t('Email'), value: x, action: t('Send email'), href: `mailto:${x}` })),
  ];
  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ name: 'Contact Us' }]} subtitle="Questions about sizes, fabric or your order? Reach us the way that suits you." />
      <div className="container-kk mt-10 grid gap-8 md:mt-14 lg:grid-cols-[1fr_300px]">
        <div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {ways.map((w) => (
              <li key={w.href}>
                <a href={w.href} {...(w.external ? { target: '_blank', rel: 'noopener' } : {})}
                  className="group flex h-full flex-col rounded-[22px] border border-line bg-white p-6 shadow-[0_20px_50px_-40px_rgba(53,34,24,.5)] transition hover:-translate-y-0.5 hover:border-gold">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft">{w.icon}</span>
                  <span className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">{w.label}</span>
                  <span className="mt-1 break-all text-[18px] font-medium text-ink">{w.value}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink group-hover:text-gold">{w.action} <ArrowRight className="h-4 w-4" /></span>
                </a>
              </li>
            ))}
          </ul>

          {s.contact.address.length > 0 && (
            <div className="mt-4 flex items-start gap-4 rounded-[22px] border border-line bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft"><PinIcon className="h-6 w-6 text-gold" /></span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">{t('Visit us')}</p>
                {s.contact.address.map((x) => <p key={x} className="mt-1 text-[16px] text-ink">{x}</p>)}
              </div>
            </div>
          )}

          <Link href="/track-order" className="mt-4 flex items-center gap-4 rounded-[22px] bg-ink p-6 text-sand transition hover:bg-ink-2">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand/10"><TruckIcon className="h-6 w-6" /></span>
            <span className="flex-1">
              <span className="block font-display text-[22px] text-white">{t('Already ordered?')}</span>
              <span className="block text-[14px] text-sand/80">{t('Track your parcel with your order number.')}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start"><HelpNav current="/contact" /></aside>
      </div>
    </>
  );
}
