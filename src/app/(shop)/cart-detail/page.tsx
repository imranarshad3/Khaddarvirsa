'use client';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { useQuote } from '@/components/cart/useQuote';
import { CartTable, TotalsTable } from '@/components/cart/CartTable';
import PageBanner from '@/components/layout/PageBanner';
import { BagIcon } from '@/components/icons';

export default function CartPage() {
  const { items, ready } = useCart();
  const quote = useQuote();
  const blocked = quote?.lines.some((l) => !l.available);
  return (
    <>
      <title>Shopping Bag</title>
      <meta name="robots" content="noindex" />
      <PageBanner title="Shopping Cart" crumbs={[{ name: 'Cart' }]} />
      <div className="container-kk mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-[18px]"><BagIcon className="h-5 w-5" /> Shopping cart</h2>
        {!ready ? <p>Loading…</p> : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="mb-4">Your cart is empty.</p>
            <Link href="/" className="rounded bg-primary px-6 py-2.5 text-white">Continue shopping</Link>
          </div>
        ) : (
          <>
            <CartTable quote={quote} />
            <div className="mt-6 ml-auto max-w-[420px]">
              <TotalsTable quote={quote} />
              <div className="mt-4 text-right">
                {blocked ? <p className="text-sale">Remove out-of-stock items to continue.</p>
                  : <Link href="/checkout" className="inline-block h-10 rounded-md bg-primary px-6 text-[16px] leading-10 text-white">Proceed To Checkout</Link>}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
