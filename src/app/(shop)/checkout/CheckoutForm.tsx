'use client';
import { T, useT } from '@/components/i18n/LangProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, type CartItem } from '@/components/cart/CartProvider';
import { useQuote } from '@/components/cart/useQuote';
import { BUY_NOW_KEY } from '@/components/product/CartButtons';
import { submitOrder } from '@/app/actions';
import { rs } from '@/lib/pricing';
import { CheckIcon, CloseIcon, TruckIcon } from '@/components/icons';
import type { Settings } from '@/lib/settings';

const input = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-[16px] text-ink-2 outline-none transition placeholder:text-muted/70 focus:border-gold focus:ring-4 focus:ring-gold/10';
const lbl = 'mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2';
const opt = <span className="font-normal normal-case tracking-normal text-muted"><T>(optional)</T></span>;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white/80 p-5 shadow-[0_18px_40px_-32px_rgba(53,34,24,.5)] sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-[22px] text-ink">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-sans text-[13px] font-semibold text-sand">{n}</span>{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function PayOption({ value, current, onPick, title, note, icon }: { value: string; current: string; onPick: (v: string) => void; title: string; note: string; icon: string }) {
  const on = current === value;
  return (
    <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${on ? 'border-gold bg-soft ring-4 ring-gold/10' : 'border-line bg-white hover:border-gold/50'}`}>
      <input type="radio" name="payment" value={value} checked={on} onChange={() => onPick(value)} className="sr-only" />
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-gold-dark' : 'border-line'}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-gold-dark" />}</span>
      <span className="flex-1 leading-tight"><span className="block text-[16px] font-semibold text-ink">{title}</span><span className="text-[14px] text-muted">{note}</span></span>
      <img src={icon} alt="" width={44} height={28} className="h-7 w-auto" />
    </label>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const t = useT();
  const b = 'flex h-7 w-7 items-center justify-center text-[16px] text-ink transition-colors hover:text-gold-dark disabled:opacity-30';
  return (
    <div className="inline-flex h-8 items-center rounded-full border border-line bg-white" role="group" aria-label={t('Quantity')}>
      <button type="button" className={b} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t('Decrease quantity')}>−</button>
      <span className="w-6 text-center text-[14px] font-semibold text-ink" aria-live="polite">{value}</span>
      <button type="button" className={b} onClick={() => onChange(value + 1)} disabled={value >= 50} aria-label={t('Increase quantity')}>+</button>
    </div>
  );
}

export default function CheckoutForm({ bank, bankNote, buyNow }: { bank: Settings['bank_details']; bankNote: string; buyNow: boolean }) {
  const t = useT();
  const cart = useCart();
  const router = useRouter();
  // Buy now: one product checked out on its own, kept in this tab and apart from the bag.
  const [direct, setDirect] = useState<CartItem[] | undefined>();
  const [directReady, setDirectReady] = useState(!buyNow);
  useEffect(() => {
    if (!buyNow) return;
    try {
      const v = JSON.parse(sessionStorage.getItem(BUY_NOW_KEY) || 'null');
      if (Array.isArray(v) && v.length && Number.isInteger(v[0]?.id)) setDirect(v.slice(0, 1));
    } catch { /* unreadable: fall back to the bag */ }
    setDirectReady(true);
  }, [buyNow]);

  const items = direct ?? cart.items;
  const setQty = (id: number, qty: number) => {
    if (!direct) return cart.setQty(id, qty);
    const next = direct.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 50)) } : i));
    setDirect(next);
    sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(next));
  };
  const remove = (id: number) => {
    if (!direct) return cart.remove(id);
    sessionStorage.removeItem(BUY_NOW_KEY);
    setDirect([]);
  };

  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | undefined>();
  const [payment, setPayment] = useState('cod');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const quote = useQuote(appliedCode, direct);
  const line = (id: number) => quote?.lines.find((l) => l.id === id);
  const blocked = !quote || quote.lines.some((l) => !l.available);

  if (cart.ready && directReady && items.length === 0)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white/80 px-6 py-12 text-center">
        <p className="mb-2 font-display text-[26px] text-ink">{t('Your bag is empty')}</p>
        <p className="mb-6">{t('Add a few pieces and come back to check out.')}</p>
        <Link href="/" className="btn-dark rounded-full">{t('Continue shopping')}</Link>
      </div>
    );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const res = await submitOrder({
      name: String(f.get('name')), phone: String(f.get('phone')), email: String(f.get('email') || ''),
      city: String(f.get('city')), address: String(f.get('address')), remarks: String(f.get('remarks') || ''),
      payment_method: payment, discount_code: appliedCode, items: items.map((i) => ({ id: i.id, qty: i.qty })),
    }).catch(() => ({ ok: false as const, error: t('Network error. Please check your connection and try again.') }));
    if (res.ok) {
      if (direct) sessionStorage.removeItem(BUY_NOW_KEY); else cart.clear();
      router.push(`/order/${res.number}`);
    } else {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
      <div className="space-y-6">
        <Section n={1} title={t('Contact details')}>
          <div><label className={lbl} htmlFor="name">{t('Full name')} *</label><input id="name" name="name" required maxLength={100} autoComplete="name" className={input} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl} htmlFor="phone">{t('Mobile number')} *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                inputMode="tel"
                pattern="(?:\+?92|0)[\d\s\-]{10,13}"
                title="Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567 or +923001234567)"
                placeholder="03XXXXXXXXX"
                autoComplete="tel"
                className={input}
              />
              <span className="mt-1 block text-[11px] text-muted">{t('Pakistani mobile format: 03001234567')}</span>
            </div>
            <div><label className={lbl} htmlFor="email">{t('Email')} {opt}</label><input id="email" name="email" type="email" maxLength={150} autoComplete="email" className={input} /></div>
          </div>
        </Section>

        <Section n={2} title={t('Delivery address')}>
          <div><label className={lbl} htmlFor="city">{t('City')} *</label><input id="city" name="city" required maxLength={80} autoComplete="address-level2" className={input} /></div>
          <div><label className={lbl} htmlFor="address">{t('Full address')} *</label><textarea id="address" name="address" required minLength={5} maxLength={500} rows={3} autoComplete="street-address" placeholder={t('House, street, area')} className={input} /></div>
          <div><label className={lbl} htmlFor="remarks">{t('Order notes')} {opt}</label><textarea id="remarks" name="remarks" rows={2} maxLength={1000} className={input} /></div>
        </Section>

        <Section n={3} title={t('Payment')}>
          <div className="space-y-3" role="radiogroup" aria-label={t('Payment method')}>
            <PayOption value="cod" current={payment} onPick={setPayment} title={t('Cash on Delivery')} note={t('Pay in cash when your parcel arrives')} icon="/brand/cod.svg" />
            {bank.length > 0 && <PayOption value="bank" current={payment} onPick={setPayment} title={t('Direct Bank Transfer')} note={t('Transfer to our account before dispatch')} icon="/brand/bank.svg" />}
          </div>
          {payment === 'bank' && (
            <div className="space-y-3 rounded-xl border border-dashed border-gold/50 bg-soft p-4 text-[15px] leading-6">
              {bank.map((b) => (
                <p key={b.account_number}><strong className="text-ink">{b.bank}</strong><br />{t('Title')}: {b.account_title}<br />{t('Account')}: {b.account_number}<br />IBAN: {b.iban}</p>
              ))}
              {bankNote && <p className="text-sale">{bankNote}</p>}
            </div>
          )}
        </Section>
      </div>

      <aside className="rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_60px_-36px_rgba(53,34,24,.55)] sm:p-7 lg:sticky lg:top-32">
        <h2 className="mb-1 font-display text-[24px] text-ink">{t('Order summary')}</h2>
        <p className="mb-5 text-[12px] uppercase tracking-[0.16em] text-muted">{direct ? t('Buying now') : `${items.reduce((a, i) => a + i.qty, 0)} ${t('item(s) in your bag')}`}</p>
        <ul className="divide-y divide-line">
          {items.map((i) => {
            const l = line(i.id);
            return (
              <li key={i.id} className="flex gap-4 py-4 first:pt-0">
                <img src={i.img} alt="" width={72} height={88} className="h-[88px] w-[72px] shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${i.alias}`} className="font-display text-[17px] leading-snug text-ink hover:text-gold-dark">{i.title}</Link>
                    <button type="button" onClick={() => remove(i.id)} aria-label={`${t('Remove')} ${i.title}`} className="-mr-1 shrink-0 rounded-full p-1 text-muted hover:bg-soft hover:text-sale"><CloseIcon className="h-4 w-4" /></button>
                  </div>
                  {i.code && <p className="text-[12px] uppercase tracking-[0.12em] text-muted">{i.code}</p>}
                  {l && !l.available && <p className="text-[13px] font-semibold text-sale">{t('Out of stock, please remove')}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <Stepper value={i.qty} onChange={(q) => setQty(i.id, q)} />
                    <span className="font-semibold text-ink">{rs((l?.price ?? i.price) * i.qty)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex gap-2">
          <label htmlFor="code" className="sr-only">{t('Discount code')}</label>
          <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('Discount code')} className={`${input} rounded-full py-2.5`} />
          <button type="button" onClick={() => setAppliedCode(code.trim() || undefined)} className="shrink-0 rounded-full border border-ink px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-white">{t('Apply')}</button>
        </div>
        {quote?.discountValid === false && <p className="mt-2 text-[14px] text-sale">{t('That discount code is not valid for this order.')}</p>}
        {quote?.discountValid && quote.discount === 0 && <p className="mt-2 text-[14px] text-sale">{t('This code needs a higher order total.')}</p>}

        {quote ? (
          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-[15px]">
            <div className="flex justify-between"><dt>{t('Subtotal')}</dt><dd className="text-ink">{rs(quote.subtotal)}</dd></div>
            {quote.discount > 0 && <div className="flex justify-between text-green-700"><dt>{t('Discount')}</dt><dd>− {rs(quote.discount)}</dd></div>}
            <div className="flex justify-between"><dt>{t('Delivery')}</dt><dd className="text-ink">{quote.shipping ? rs(quote.shipping) : t('Free')}</dd></div>
            {quote.freeShippingOver > 0 && quote.shipping > 0 && <p className="text-[13px] text-gold-dark">{t('Free delivery on orders above')} {rs(quote.freeShippingOver)}</p>}
            <div className="flex items-baseline justify-between border-t border-line pt-4"><dt className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">{t('Total')}</dt><dd className="font-display text-[30px] text-ink">{rs(quote.total)}</dd></div>
          </dl>
        ) : <p className="mt-5 border-t border-line pt-5 text-center text-muted">{t('Calculating…')}</p>}

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-[15px] text-sale">{t(error)}</p>}
        <button type="submit" disabled={pending || blocked || quote?.discountValid === false}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold-dark disabled:opacity-60">
          {pending ? t('Placing order…') : <>{t('Confirm order')}{quote && <span className="opacity-80">· {rs(quote.total)}</span>}</>}
        </button>
        <ul className="mt-5 space-y-2 text-[13px] text-body">
          <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-gold-dark" /> {t('Pay only when your parcel arrives with Cash on Delivery')}</li>
          <li className="flex items-center gap-2"><TruckIcon className="h-4 w-4 text-gold-dark" /> {t('Delivery across Pakistan')}</li>
        </ul>
      </aside>
    </form>
  );
}
