import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import Link from 'next/link';
import { customerPhone, ordersForPhone } from '@/lib/customer';
import { accountSignOut } from '@/app/actions';
import { rs } from '@/lib/pricing';
import { ArrowRight, UserIcon } from '@/components/icons';
import TrackForm from '../track-order/TrackForm';
import ReorderButton from './ReorderButton';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Placed', cls: 'bg-gold/15 text-gold-dark' },
  confirmed: { label: 'Confirmed', cls: 'bg-ink/10 text-ink' },
  shipped: { label: 'Shipped', cls: 'bg-ink text-sand' },
  delivered: { label: 'Delivered', cls: 'bg-[#2f7d4f]/15 text-[#2f7d4f]' },
  cancelled: { label: 'Cancelled', cls: 'bg-sale/10 text-sale' },
};

export default async function AccountPage() {
  const t = await getT();
  const phone = await customerPhone();

  if (!phone) {
    return (
      <div className="container-kk py-10 md:py-16">
        <div className="mx-auto grid max-w-[980px] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_70px_-40px_rgba(53,34,24,.45)] md:grid-cols-[1fr_1.1fr]">
          <div className="bg-ink p-8 text-sand md:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/10 text-sand"><UserIcon className="h-6 w-6" /></span>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand/70">{t('My account')}</p>
            <h1 className="font-display mt-2 text-[32px] leading-tight text-white md:text-[40px]">{t('All your orders in one place')}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-sand/80">{t('No password needed. Enter your mobile number and any one of your order numbers, and we will show every order placed with that number.')}</p>
            <p className="mt-6 text-[13px] text-sand/60">{t('You stay signed in on this device for 30 days.')}</p>
          </div>
          <div className="p-8 md:p-10"><TrackForm number="" account /></div>
        </div>
      </div>
    );
  }

  const orders = await ordersForPhone(phone);
  return (
    <div className="container-kk py-10 md:py-16">
      <div className="mx-auto max-w-[880px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">{t('My account')}</p>
            <h1 className="font-display mt-1 text-[32px] leading-tight text-ink md:text-[40px]">{t('Your orders')}</h1>
            <p className="mt-1 text-[14px] text-muted">{`${phone.slice(0, 4)}•••${phone.slice(-3)}`}</p>
          </div>
          <form action={accountSignOut}>
            <button className="rounded-full border border-line px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-2 transition-colors hover:border-ink hover:text-ink">{t('Sign out')}</button>
          </form>
        </div>

        {orders.length === 0 && <p className="mt-8 rounded-[24px] border border-line bg-white p-8 text-center text-body">{t('No orders yet.')}</p>}
        <ul className="mt-8 space-y-4">
          {orders.map((o) => {
            const st = STATUS[o.status] ?? STATUS.pending;
            const placed = new Date(o.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'medium' });
            return (
              <li key={o.number} className="rounded-[24px] border border-line bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold tracking-[0.08em] text-ink">{o.number}</p>
                    <p className="text-[13px] text-muted">{placed} · {rs(Number(o.total))}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${st.cls}`}>{t(st.label)}</span>
                </div>
                <ul className="mt-4 space-y-1 text-[14px] text-body">
                  {o.items.map((it, i) => <li key={i}>{it.qty} × {it.title}{it.code ? ` ${it.code}` : ''}</li>)}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <ReorderButton items={o.reorder} />
                  <Link href={`/order/${o.number}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-dark hover:text-ink">{t('View details')} <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
