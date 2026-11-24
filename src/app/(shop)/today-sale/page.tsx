import type { Metadata } from 'next';
import { saleProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSettings()).sale_title, alternates: { canonical: '/today-sale' } };
}

export default async function TodaySalePage() {
  const s = (await getSettings());
  const products = (await saleProducts());
  return (
    <>
      <PageBanner title={s.sale_title} crumbs={[{ name: s.sale_title }]} />
      <div className="container-kk mt-8">
        {products.length ? <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} eager={4} />
          : <p className="py-10 text-center">No sale products right now.</p>}
      </div>
    </>
  );
}
