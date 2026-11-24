'use client';
import { T } from '@/components/i18n/LangProvider';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { readWishlist, WISH_EVENT } from '@/components/product/CartButtons';

const same = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

export default function WishlistSync({ ids, children }: { ids: number[]; children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    const sync = () => {
      const saved = readWishlist();
      if (same(saved, ids)) setSynced(true);
      else router.replace(saved.length ? `${path}?ids=${saved.join(',')}` : path, { scroll: false });
    };
    sync();
    window.addEventListener(WISH_EVENT, sync);
    return () => window.removeEventListener(WISH_EVENT, sync);
  }, [ids, path, router]);
  if (!synced && !ids.length) return <p className="py-16 text-center text-muted"><T>Loading your wishlist…</T></p>;
  return <>{children}</>;
}
