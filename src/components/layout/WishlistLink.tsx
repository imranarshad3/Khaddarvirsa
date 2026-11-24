'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HeartIcon } from '@/components/icons';
import { readWishlist, WISH_EVENT } from '@/components/product/CartButtons';

export default function WishlistLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readWishlist().length);
    update();
    window.addEventListener(WISH_EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(WISH_EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  return (
    <Link href="/wishlist" aria-label={`Wishlist, ${count} items`} className="relative flex h-10 w-10 items-center justify-center text-ink hover:text-gold">
      <HeartIcon className="h-5 w-5" />
      {count > 0 && <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-ink px-1 text-center text-[12px] font-bold leading-[18px] text-white">{count}</span>}
    </Link>
  );
}
