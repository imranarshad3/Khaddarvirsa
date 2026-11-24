'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, type CartItem } from '@/components/cart/CartProvider';
import { BagIcon, CheckIcon, HeartIcon, HeartFilledIcon } from '@/components/icons';

type Item = Omit<CartItem, 'qty'>;

const circle = 'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-paper/95 text-ink shadow-[0_6px_18px_-6px_rgba(53,34,24,.45)] backdrop-blur transition-colors hover:bg-ink hover:text-white';

export function AddToBag({ item }: { item: Item }) {
  const { add, items } = useCart();
  const inCart = items.some((i) => i.id === item.id);
  return (
    <button type="button" onClick={() => add(item)} className={circle} aria-label={inCart ? 'Added to bag — add another' : 'Add to bag'} title="Add to bag">
      {inCart ? <CheckIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
    </button>
  );
}

// shortcut: wishlist is kept in this browser only (localStorage); add a wishlist page/account sync if needed.
const WISH_KEY = 'kv-wishlist';
export const WISH_EVENT = 'kv-wishlist-change';
export function readWishlist(): number[] {
  try { const v = JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); return Array.isArray(v) ? v.filter(Number.isInteger) : []; } catch { return []; }
}
export function WishlistButton({ id, big = false }: { id: number; big?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(readWishlist().includes(id)), [id]);
  const toggle = () => {
    const ids = readWishlist().filter((x) => x !== id);
    localStorage.setItem(WISH_KEY, JSON.stringify(on ? ids : [...ids, id]));
    setOn(!on);
    window.dispatchEvent(new Event(WISH_EVENT));
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={on} aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'} title="Wishlist" className={`${circle} ${big ? '!h-14 !w-14 shrink-0 border border-line' : ''} ${on ? 'text-sale' : ''}`}>
      {on ? <HeartFilledIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
    </button>
  );
}

export function BuyNow({ item, large = false }: { item: Item; large?: boolean }) {
  const { add } = useCart();
  const router = useRouter();
  return (
    <button type="button" onClick={() => { add(item); router.push('/checkout'); }}
      className={large
        ? 'btn-dark'
        : 'w-full rounded-full bg-ink py-3 text-[12px] font-semibold uppercase tracking-[0.16em] sm:py-3.5 sm:text-[13px] sm:tracking-[0.2em] text-white transition-colors hover:bg-gold-dark'}>
      {large ? 'Buy it Now' : 'Buy Now'}
    </button>
  );
}

export function AddToCart({ item }: { item: Item }) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);
  return (
    <button type="button" onClick={() => add(item)}
      className="btn-line">
      {inCart ? `Added (${inCart.qty}) — Add more` : 'Add to Cart'}
    </button>
  );
}

/** Product page buy box: quantity stepper, add to cart, buy now and wishlist. */
export function ProductActions({ item }: { item: Item }) {
  const { add, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const inCart = items.find((i) => i.id === item.id);
  const step = 'flex h-full w-11 items-center justify-center text-[20px] text-ink transition-colors hover:text-gold-dark disabled:opacity-30';
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex h-14 items-center rounded-full border border-line bg-paper" role="group" aria-label="Quantity">
          <button type="button" className={step} onClick={() => setQty(qty - 1)} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center text-[17px] font-semibold text-ink" aria-live="polite">{qty}</span>
          <button type="button" className={step} onClick={() => setQty(qty + 1)} disabled={qty >= 50} aria-label="Increase quantity">+</button>
        </div>
        <button type="button" onClick={() => add(item, qty)}
          className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full border border-ink text-[13px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-white">
          <BagIcon className="h-5 w-5" /> {inCart ? <>In bag ({inCart.qty})<span className="hidden sm:inline"> · Add more</span></> : 'Add to Cart'}
        </button>
        <WishlistButton id={item.id} big />
      </div>
      <button type="button" onClick={() => { add(item, qty); router.push('/checkout'); }}
        className="h-14 w-full rounded-full bg-ink text-[13px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-gold-dark">
        Buy it Now
      </button>
    </div>
  );
}
