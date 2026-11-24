import { T } from '@/components/i18n/LangProvider';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryByAlias, categorySections } from '@/lib/catalog';
import { getSettings, siteUrl } from '@/lib/settings';
import PageBanner, { SectionBar, JsonLd, breadcrumbJsonLd } from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/product/ProductCard';

type Props = { params: Promise<{ alias: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = (await categoryByAlias((await params).alias));
  if (!c) return {};
  const store = (await getSettings()).store_name;
  return { title: { absolute: c.meta_title || `${c.name} | ${store}` },
    description: c.meta_description || `Shop ${c.name} at ${store}. Cash on Delivery across Pakistan.`, alternates: { canonical: `/main-category/${c.alias}` } };
}

export default async function MainCategoryPage({ params }: Props) {
  const c = (await categoryByAlias((await params).alias));
  if (!c) notFound();
  const s = (await getSettings());
  const { premium, sections } = await categorySections(c.id);
  const sale = { title: s.sale_title, color: s.sale_color };
  const crumbs = [{ name: c.name, href: `/main-category/${c.alias}` }];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageBanner title={c.name} crumbs={crumbs} />
      <div className="container-kk mt-8">
        {sections.length === 0 && <p className="py-10 text-center"><T>No products in this category yet.</T></p>}
        {premium.length > 0 && (
          <section className="mb-10">
            <SectionBar title="Premium picks" />
            <ProductGrid products={premium} sale={sale} eager={4} />
          </section>
        )}
        {sections.map(({ sub, products }, i) => (
          <section key={sub.id} className="mb-10">
            <SectionBar title={sub.name} href={`/product-category/${sub.alias}`} />
            <ProductGrid products={products} sale={sale} eager={i === 0 && !premium.length ? 4 : 0} />
          </section>
        ))}
      </div>
    </>
  );
}
