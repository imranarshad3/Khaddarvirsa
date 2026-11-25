import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { orderByNumber, PAYMENT_METHODS } from '@/lib/orders';
import { getSettings, whatsappLink } from '@/lib/settings';
import { rs } from '@/lib/pricing';
import { CheckIcon, TruckIcon, WhatsappIcon, PinIcon, ArrowRight } from '@/components/icons';

export const metadata: Metadata = { title: 'Your order', robots: { index: false } };

const STEPS = [
  { key: 'pending', label: 'Placed', note: 'We have received your order.' },
  { key: 'confirmed', label: 'Confirmed', note: 'We called you and confirmed it.' },
  { key: 'shipped', label: 'Shipped', note: 'Your parcel is with the courier.' },
  { key: 'delivered', label: 'Delivered', note: 'Delivered to your door.' },
];

const card = 'rounded-[24px] border border-line bg-white p-6 md:p-8';
const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark';

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const o = /^KK[0-9A-F]{10}$/.test(number) ? await orderByNumber(number) : null;
  if (!o) notFound();
  const s = await getSettings();
  const step = STEPS.findIndex((x) => x.key === o.status);
  const cancelled = o.status === 'cancelled';
  // created_at is SQLite UTC without a zone marker.
  const placed = new Date(o.created_at.replace(' ', 'T') + 'Z').toLocaleString('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });
  const phone = o.phone.length > 4 ? `${o.phone.slice(0, 4)}•••${o.phone.slice(-3)}` : o.phone;
  const wa = s.whatsapp_number ? `${whatsappLink(s.whatsapp_number)}?text=${encodeURIComponent(`Salam, I have a question about my order ${o.number}.`)}` : '';
  const isNew = o.status === 'pending';
  const t = await getT();

  return (
    <div className="bg-cream/40 pb-16">
      <section className="border-b border-line bg-ink text-sand">
        <div className="container-kk animate-[kk-fade_.6s_ease-out] py-10 text-center md:py-14">
          <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${cancelled ? 'bg-sale/20 text-sale' : 'bg-gold text-ink'}`}>
            {cancelled ? <span className="text-[28px] leading-none">×</span> : <CheckIcon className="h-8 w-8" />}
          </span>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-sand/70">{t(isNew ? 'Order placed' : 'Order status')}</p>
          <h1 className="font-display mt-2 text-[30px] leading-tight text-white md:text-[44px]">
            {cancelled ? t('This order was cancelled') : isNew ? `${t('Thank you')}, ${o.name.split(' ')[0]}` : t(STEPS[step]?.label ?? 'Your order')}
          </h1>
          <p className="mx-auto mt-3 max-w-[460px] text-[15px] leading-relaxed text-sand/80">
            {t(cancelled ? 'If this is unexpected, please message us and we will help.' : isNew ? 'Your order is in. We will call you on your mobile number to confirm it before dispatch.' : STEPS[step]?.note ?? '')}
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-sand/20 bg-white/5 px-5 py-2 text-[13px]">
            <span className="text-sand/70">{t('Order')}</span><strong className="tracking-[0.12em] text-white">{o.number}</strong>
            <span aria-hidden className="h-1 w-1 rounded-full bg-sand/40" /><span className="text-sand/70">{placed}</span>
          </div>
        </div>
      </section>

      <div className="container-kk -mt-6 grid max-w-[1080px] gap-5 md:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          {!cancelled && (
            <div className={card}>
              <p className={eyebrow}>{t('Progress')}</p>
              <ol className="mt-5">
                {STEPS.map((x, i) => {
                  const done = i <= step;
                  return (
                    <li key={x.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < STEPS.length - 1 && <span aria-hidden className={`absolute left-[15px] top-8 h-[calc(100%-32px)] w-px ${i < step ? 'bg-gold' : 'bg-line'}`} />}
                      <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold ${done ? 'border-gold bg-gold text-ink' : 'border-line bg-paper text-muted'}`}>
                        {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                      </span>
                      <div className="pt-1">
                        <p className={`text-[15px] font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{t(x.label)}{i === step && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-gold-dark">{t('Now')}</span>}</p>
                        <p className="text-[14px] text-muted">{t(x.note)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {o.payment_method === 'bank' && !cancelled && s.bank_details.length > 0 && (
            <div className={`${card} border-gold/40 bg-gold/5`}>
              <p className={eyebrow}>{t('Bank transfer')}</p>
              <p className="mt-2 text-[15px] text-body">{t('Please transfer')} <strong className="text-ink">{rs(o.total)}</strong> {t('and use')} <strong className="text-ink">{o.number}</strong> {t('as the reference.')}</p>
              <div className="mt-4 space-y-3">
                {s.bank_details.map((b) => (
                  <dl key={b.account_number} className="grid grid-cols-[110px_1fr] gap-y-1 rounded-2xl border border-line bg-white p-4 text-[14px]">
                    <dt className="text-muted">{t('Bank')}</dt><dd className="font-semibold text-ink">{b.bank}</dd>
                    <dt className="text-muted">{t('Title')}</dt><dd className="text-ink">{b.account_title}</dd>
                    <dt className="text-muted">{t('Account')}</dt><dd className="select-all break-all text-ink">{b.account_number}</dd>
                    {b.iban && <><dt className="text-muted">IBAN</dt><dd className="select-all break-all text-ink">{b.iban}</dd></>}
                  </dl>
                ))}
              </div>
              {s.bank_note && <p className="mt-3 text-[14px] text-muted">{s.bank_note}</p>}
            </div>
          )}

          <div className={card}>
            <p className={eyebrow}>{t('Delivery')}</p>
            <div className="mt-4 grid gap-4 text-[14px] sm:grid-cols-2">
              <div className="flex gap-3"><PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" /><div><p className="font-semibold text-ink">{o.name}</p><p className="text-muted">{o.city} · {phone}</p></div></div>
              {o.tracking && !cancelled && <div className="flex gap-3 sm:col-span-2"><TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" /><div><p className="font-semibold text-ink">{o.courier || t('Courier')}</p><p className="text-muted">{t('Tracking number')}: <span className="select-all font-semibold text-ink">{o.tracking}</span></p></div></div>}
              <div className="flex gap-3"><TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" /><div><p className="font-semibold text-ink">{t(PAYMENT_METHODS[o.payment_method])}</p><p className="text-muted">{t(o.payment_method === 'cod' ? 'Pay when your parcel arrives.' : 'Dispatched once payment is received.')}</p></div></div>
            </div>
          </div>
        </div>

        <aside className={`${card} h-fit md:sticky md:top-28`}>
          <p className={eyebrow}>{t('Order summary')}</p>
          <ul className="mt-4 divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <span className="relative shrink-0">
                  <img src={i.img ?? '/brand/favicon.svg'} alt="" width={56} height={70} className="h-[70px] w-14 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-sand">{i.qty}</span>
                </span>
                <span className="min-w-0 flex-1 leading-tight"><span className="line-clamp-2 text-[14px] font-semibold text-ink">{i.title}</span><span className="text-[12px] text-muted">{i.code}</span></span>
                <span className="text-[14px] font-semibold text-ink">{rs(i.unit_price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">{t('Subtotal')}</dt><dd>{rs(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-sale"><dt>{t('Discount')} {o.discount_code && `(${o.discount_code})`}</dt><dd>− {rs(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">{t('Shipping')}</dt><dd>{o.shipping ? rs(o.shipping) : t('Free')}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold text-ink">{t('Total')}</dt><dd className="font-display text-[24px] text-ink">{rs(o.total)}</dd></div>
          </dl>
          <div className="mt-6 grid gap-2">
            <Link href="/" className="flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand transition hover:bg-ink-2">{t('Continue shopping')} <ArrowRight className="h-4 w-4" /></Link>
            {wa && <a href={wa} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full border border-line py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-ink"><WhatsappIcon className="h-4 w-4 text-[#25D366]" /> {t('Ask about this order')}</a>}
          </div>
          <p className="mt-4 text-center text-[12px] text-muted">{t('Save your order number. You can check its status any time on')} <Link href={`/track-order?number=${o.number}`} className="underline hover:text-ink">{t('Track order')}</Link>.</p>
        </aside>
      </div>
    </div>
  );
}
