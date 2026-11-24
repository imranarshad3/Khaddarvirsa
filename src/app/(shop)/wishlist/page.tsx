import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import Link from 'next/link';
import { productsByIds } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';
import WishlistSync from './WishlistSync';
import { HeartIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } };

// The saved IDs live in the browser (localStorage); WishlistSync mirrors them into ?ids= so the server can render the cards.
export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const ids = ((await searchParams).ids ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const s = (await getSettings());
  const products = (await productsByIds(ids));
  const t = await getT();
  return (
    <>
      <PageBanner title="Wishlist" crumbs={[{ name: 'Wishlist' }]} subtitle="Pieces you have saved for later, all in one place." />
      <div className="container-kk mt-10">
        <WishlistSync ids={ids}>
          {products.length ? (
            <>
              <p className="mb-8 text-center text-[15px] text-muted">{products.length} {t(products.length === 1 ? 'saved piece' : 'saved pieces')}</p>
              <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} />
            </>
          ) : (
            <div className="mx-auto max-w-[520px] rounded-[28px] border border-line bg-white px-6 py-12 text-center shadow-[0_24px_60px_-44px_rgba(53,34,24,.5)]">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-gold"><HeartIcon className="h-6 w-6" /></span>
              <p className="font-display mt-5 text-[28px] text-ink">{t('Your wishlist is empty')}</p>
              <p className="mt-2 text-[16px]">{t('Tap the heart on any product to save it here.')}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/search?q=khaddar" className="btn-dark rounded-full">{t('Shop all')}</Link>
                <Link href="/today-sale" className="btn-line rounded-full">{t('Explore the sale')}</Link>
              </div>
            </div>
          )}
        </WishlistSync>
      </div>
    </>
  );
}
