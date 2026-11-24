import type { Metadata } from 'next';
import { getSettings, whatsappLink } from '@/lib/settings';
import { TruckIcon, WhatsappIcon } from '@/components/icons';
import TrackForm from './TrackForm';

export const metadata: Metadata = { title: 'Track your order', description: 'Check the status of your Khaddar Virsa order.', alternates: { canonical: '/track-order' } };

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ number?: string }> }) {
  const number = ((await searchParams).number ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12);
  const s = await getSettings();
  return (
    <div className="container-kk py-10 md:py-16">
      <div className="mx-auto grid max-w-[980px] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_70px_-40px_rgba(53,34,24,.45)] md:grid-cols-[1fr_1.1fr]">
        <div className="relative bg-ink p-8 text-sand md:p-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/10 text-sand"><TruckIcon className="h-6 w-6" /></span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand/70">Order tracking</p>
          <h1 className="font-display mt-2 text-[32px] leading-tight text-white md:text-[40px]">Where is my order?</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-sand/80">Enter your order number and the mobile number you used at checkout to see its status.</p>
          <ol className="mt-8 space-y-3 text-[14px] text-sand/80">
            {['Placed: we have your order', 'Confirmed: we called to confirm it', 'Shipped: on its way to you', 'Delivered: enjoy your khaddar'].map((t, i) => (
              <li key={t} className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sand/30 text-[11px]">{i + 1}</span>{t}</li>
            ))}
          </ol>
        </div>
        <div className="p-8 md:p-10">
          <TrackForm number={number} />
          {s.whatsapp_number && (
            <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="mt-8 flex items-center gap-3 rounded-2xl border border-line p-4 text-[14px] text-body transition hover:border-ink">
              <WhatsappIcon className="h-6 w-6 shrink-0 text-[#25D366]" />
              <span><strong className="block font-semibold text-ink">Lost your order number?</strong>Message us on WhatsApp and we will look it up.</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
