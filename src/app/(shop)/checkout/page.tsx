import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const s = (await getSettings());
  return (
    <>
      <PageBanner title="Checkout" crumbs={[{ name: 'Cart', href: '/cart-detail' }, { name: 'Checkout' }]} />
      <div className="container-kk mt-8">
        <CheckoutForm bank={s.bank_details} bankNote={s.bank_note} />
      </div>
    </>
  );
}
