'use client';
import { useT } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HeartIcon } from '@/components/icons';
import { readWishlist, WISH_EVENT } from '@/components/product/CartButtons';

export default function WishlistLink() {
  const t = useT();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readWishlist().length);
    update();
    window.addEventListener(WISH_EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(WISH_EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  return (
    <Link href="/wishlist" aria-label={`${t('Wishlist')}: ${count}`} className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft hover:text-gold-dark">
      <HeartIcon className="h-5 w-5" />
      {count > 0 && <span className="absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-gold-dark px-1 text-center text-[11px] font-bold leading-[18px] text-white ring-2 ring-paper">{count}</span>}
    </Link>
  );
}
