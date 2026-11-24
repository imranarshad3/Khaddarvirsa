import type { Metadata } from 'next';
import { getSettings, whatsappLink } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import { MailIcon, PhoneIcon, PinIcon, WhatsappIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Contact Us', alternates: { canonical: '/contact' } };

export default function ContactPage() {
  const s = getSettings();
  const row = 'flex items-start gap-3 text-[17px] text-ink-2';
  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ name: 'Contact Us' }]} />
      <div className="container-kk mt-8 grid gap-4 sm:grid-cols-2">
        {s.contact.address.map((x) => <p key={x} className={row}><PinIcon className="mt-1 h-5 w-5 text-gold" />{x}</p>)}
        {s.contact.phone.map((x) => <p key={x} className={row}><PhoneIcon className="mt-1 h-5 w-5 text-gold" /><a href={`tel:${x.replace(/\D/g, '')}`} className="hover:text-hover">{x}</a></p>)}
        {s.contact.email.map((x) => <p key={x} className={row}><MailIcon className="mt-1 h-5 w-5 text-gold" /><a href={`mailto:${x}`} className="hover:text-hover">{x}</a></p>)}
        {s.whatsapp_number && <p className={row}><WhatsappIcon className="mt-1 h-5 w-5 text-[#25d366]" /><a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="hover:text-hover">WhatsApp {s.whatsapp_number}</a></p>}
      </div>
    </>
  );
}
