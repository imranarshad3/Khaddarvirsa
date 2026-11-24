import Link from 'next/link';
import { getSettings, whatsappLink } from '@/lib/settings';
import { MailIcon, PhoneIcon, PinIcon, SocialIcon, WhatsappIcon } from '@/components/icons';
import PaymentLogos from '@/components/PaymentLogos';
import Newsletter from './Newsletter';

export default async function Footer() {
  const s = (await getSettings());
  const h = 'mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-sand';
  const a = 'text-[#e8dfd2]/75 hover:text-sand';
  return (
    <footer className="mt-20 bg-ink-2 text-[#e8dfd2]/75">
      <div className="border-b border-white/10">
        <div className="container-kk grid gap-6 py-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow !text-sand">Let&rsquo;s stay in touch</p>
            <h2 className="font-display mt-2 text-[30px] text-white md:text-[36px]">A little inspiration, stitched in.</h2>
            <p className="mt-2">New khaddar arrivals, winter weaves and exclusive updates.</p>
          </div>
          <Newsletter />
        </div>
      </div>
      <div className="container-kk grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <section>
          <p className="font-display text-[26px] uppercase tracking-[0.1em] text-white">{s.store_name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-sand">Feel the fabric of tradition</p>
          <p className="mt-5 max-w-[320px]">Timeless cultural tradition with modern elegance: premium khaddar crafted for comfort and style.</p>
          {s.social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.social.map((x) => (
                <li key={x.key}><a href={x.link} target="_blank" rel="noopener" aria-label={x.name}
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-sand hover:bg-sand hover:text-ink"><SocialIcon name={x.key} /></a></li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className={h}>Shop</h2>
          <ul className="space-y-2">
            <li><Link className={a} href="/today-sale">{s.sale_title}</Link></li>
            <li><Link className={a} href="/search?q=khaddar">Shop All</Link></li>
            <li><Link className={a} href="/cart-detail">Shopping Bag</Link></li>
            <li><Link className={a} href="/about-us">Our Story</Link></li>
          </ul>
        </section>
        <section>
          <h2 className={h}>Customer Care</h2>
          <ul className="space-y-2">
            <li><Link className={a} href="/contact">Contact</Link></li>
            <li><Link className={a} href="/faq">FAQs</Link></li>
            <li><Link className={a} href="/return-policy">Delivery &amp; Returns</Link></li>
            <li><Link className={a} href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link className={a} href="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </section>
        <section>
          <h2 className={h}>Get in touch</h2>
          <ul className="space-y-2.5">
            {s.contact.address.map((x) => <li key={x} className="flex gap-2.5"><PinIcon className="mt-1 h-4 w-4 shrink-0 text-sand" />{x}</li>)}
            {s.contact.email.map((x) => <li key={x} className="flex gap-2.5"><MailIcon className="mt-1 h-4 w-4 shrink-0 text-sand" /><a className={a} href={`mailto:${x}`}>{x}</a></li>)}
            {s.contact.phone.map((x) => <li key={x} className="flex gap-2.5"><PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-sand" /><a className={a} href={`tel:+${x.replace(/\D/g, '')}`}>{x}</a></li>)}
            {s.whatsapp_number && (
              <li><a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className={`inline-flex items-center gap-2.5 ${a}`}>
                <WhatsappIcon className="h-4 w-4 text-sand" /> Let&rsquo;s talk style ↗</a></li>
            )}
          </ul>
        </section>
      </div>
      <div className="border-t border-white/10">
        <div className="container-kk flex flex-col items-center justify-between gap-3 py-5 text-[14px] sm:flex-row">
          <p>© {new Date().getFullYear()} {s.store_name}. All rights reserved.</p>
          <p className="flex items-center gap-3">We accept <PaymentLogos small /></p>
        </div>
      </div>
    </footer>
  );
}
