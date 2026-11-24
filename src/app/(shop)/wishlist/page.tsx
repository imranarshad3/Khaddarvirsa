import type { Metadata } from 'next';
import Link from 'next/link';
import { productsByIds } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';
import WishlistSync from './WishlistSync';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } };

// The saved IDs live in the browser (localStorage); WishlistSync mirrors them into ?ids= so the server can render the cards.
export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const ids = ((await searchParams).ids ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const s = getSettings();
  const products = productsByIds(ids);
  return (
    <>
      <PageBanner title="Wishlist" crumbs={[{ name: 'Wishlist' }]} />
      <div className="container-kk mt-10">
        <WishlistSync ids={ids}>
          {products.length ? (
            <>
              <p className="mb-8 text-center text-[15px] text-muted">{products.length} saved {products.length === 1 ? 'piece' : 'pieces'}</p>
              <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} />
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="font-display text-[28px] text-ink">Your wishlist is empty</p>
              <p className="mt-2 text-[16px]">Tap the heart on any product to save it here.</p>
              <Link href="/today-sale" className="btn-dark mt-8">Explore the sale</Link>
            </div>
          )}
        </WishlistSync>
      </div>
    </>
  );
}
