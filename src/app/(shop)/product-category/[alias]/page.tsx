import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { imageUrl, subCategoryByAlias, subCategoryProducts, type Sort } from '@/lib/catalog';
import { getSettings, siteUrl } from '@/lib/settings';
import PageBanner, { JsonLd, breadcrumbJsonLd } from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';
import FilterBar from '@/components/product/FilterBar';

type Props = { params: Promise<{ alias: string }>; searchParams: Promise<{ sort?: string; stock?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sc = (await subCategoryByAlias((await params).alias));
  if (!sc) return {};
  return {
    title: sc.meta_title || sc.name,
    description: sc.meta_description || sc.description || `Shop ${sc.name} (${sc.cat_name}) at ${(await getSettings()).store_name}. Cash on Delivery across Pakistan.`,
    ...(sc.img ? { openGraph: { images: [imageUrl(sc.img, 'sub_cat')] } } : {}),
    alternates: { canonical: `/product-category/${sc.alias}` },
  };
}

export default async function SubCategoryPage({ params, searchParams }: Props) {
  const sc = (await subCategoryByAlias((await params).alias));
  if (!sc) notFound();
  const { sort = 'price-asc', stock } = await searchParams;
  const s = (await getSettings());
  const products = (await subCategoryProducts(sc.id, sort as Sort, stock === 'in'));
  const crumbs = [{ name: sc.cat_name, href: `/main-category/${sc.cat_alias}` }, { name: sc.name, href: `/product-category/${sc.alias}` }];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageBanner title={sc.name} crumbs={crumbs} />
      <div className="container-kk mt-6">
        <FilterBar count={products.length} sort={sort} inStockOnly={stock === 'in'} />
        {products.length ? <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} eager={4} />
          : <p className="py-10 text-center">No products found.</p>}
      </div>
    </>
  );
}
