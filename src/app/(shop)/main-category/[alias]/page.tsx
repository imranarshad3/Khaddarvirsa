import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryByAlias, categorySections } from '@/lib/catalog';
import { getSettings, siteUrl } from '@/lib/settings';
import PageBanner, { SectionBar, JsonLd, breadcrumbJsonLd } from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';

type Props = { params: Promise<{ alias: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = categoryByAlias((await params).alias);
  if (!c) return {};
  return { title: { absolute: c.meta_title || c.name }, description: c.meta_description ?? undefined, alternates: { canonical: `/main-category/${c.alias}` } };
}

export default async function MainCategoryPage({ params }: Props) {
  const c = categoryByAlias((await params).alias);
  if (!c) notFound();
  const s = getSettings();
  const sections = categorySections(c.id);
  const crumbs = [{ name: c.name, href: `/main-category/${c.alias}` }];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageBanner title={c.name} crumbs={crumbs} />
      <div className="container-kk mt-8">
        {sections.length === 0 && <p className="py-10 text-center">No products in this category yet.</p>}
        {sections.map(({ sub, products }, i) => (
          <section key={sub.id} className="mb-10">
            <SectionBar title={sub.name} href={`/product-category/${sub.alias}`} />
            <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} eager={i === 0 ? 4 : 0} scroll />
          </section>
        ))}
      </div>
    </>
  );
}
