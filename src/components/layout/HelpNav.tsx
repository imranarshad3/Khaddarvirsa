import Link from 'next/link';
import { ArrowRight } from '@/components/icons';

/** Every customer-care page, so shoppers can hop between them without going back to the footer. */
export const HELP_PAGES = [
  { href: '/contact', name: 'Contact Us', note: 'Call, WhatsApp or email' },
  { href: '/track-order', name: 'Track Order', note: 'See where your parcel is' },
  { href: '/faq', name: 'FAQs', note: 'Quick answers' },
  { href: '/return-policy', name: 'Delivery & Returns', note: 'Shipping and exchanges' },
  { href: '/about-us', name: 'Our Story', note: 'Who we are' },
  { href: '/terms', name: 'Terms & Conditions', note: 'Shopping terms' },
  { href: '/privacy-policy', name: 'Privacy Policy', note: 'How we use your data' },
];

export default function HelpNav({ current }: { current: string }) {
  return (
    <nav aria-label="Customer care" className="rounded-[22px] border border-line bg-white p-3 shadow-[0_20px_50px_-40px_rgba(53,34,24,.5)]">
      <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Customer care</p>
      <ul>
        {HELP_PAGES.map((p) => {
          const on = p.href === current;
          return (
            <li key={p.href}>
              <Link href={p.href} aria-current={on ? 'page' : undefined}
                className={`group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition ${on ? 'bg-ink text-white' : 'text-ink hover:bg-soft'}`}>
                <span>
                  <span className="block text-[15px] font-medium">{p.name}</span>
                  <span className={`block text-[12.5px] ${on ? 'text-sand' : 'text-muted'}`}>{p.note}</span>
                </span>
                <ArrowRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${on ? 'text-sand' : 'text-gold'}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
