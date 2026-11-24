import type { Metadata } from 'next';
import { searchProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 60);
  const s = getSettings();
  const products = q ? searchProducts(q) : [];
  return (
    <>
      <PageBanner title={q ? `Search: ${q}` : 'Search'} crumbs={[{ name: 'Search' }]} />
      <div className="container-kk mt-8">
        {!q ? <p className="py-10 text-center">Type a product name or code in the search box.</p>
          : products.length ? <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} />
          : <p className="py-10 text-center">No products match “{q}”.</p>}
      </div>
    </>
  );
}
