import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import Link from 'next/link';
import { bestSellers, categoryPhotos, homeSections, imageUrl, navigation, saleProducts } from '@/lib/catalog';
import { getSettings, siteUrl } from '@/lib/settings';
import { ProductGrid } from '@/components/product/ProductCard';
import { SectionBar, JsonLd } from '@/components/layout/PageBanner';
import HeroSlider from '@/components/HeroSlider';
import HeroBanners, { type Banner } from '@/components/HeroBanners';
import { discountPercent } from '@/lib/pricing';
import { ArrowRight } from '@/components/icons';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const s = (await getSettings());
  const t = await getT();
  const [sections, best] = await Promise.all([homeSections(8), bestSellers(8)]);
  const cats = (await navigation());
  const pics = (ps: { img: string | null; in_stock: number }[]) => ps.filter((p) => p.in_stock).slice(0, 2).map((p) => imageUrl(p.img, 'product', '1600x900_cover'));
  const lines = [
    [t('Elegance Woven Into Every Thread.'), t('Handwoven Pakistani khaddar in pure cotton, with a handloom texture made with care.')],
    [t('Crafted for Every Season.'), t('Breathable weaves for warm days and rich, soft cloth for winter.')],
    [t('Heritage in Every Weave.'), t('Traditional looms, timeless colours, tailored to your style.')],
    [t('Timeless Comfort, Pure Cotton.'), t('Soft on skin and made to last, wash after wash.')],
  ];
  const banners: Banner[] = (await Promise.all(cats.slice(0, 4).map(async (c, k) => ({
    eyebrow: c.name, title: lines[k % lines.length][0], text: lines[k % lines.length][1],
    href: `/main-category/${c.alias}`, cta: `${t('Shop')} ${c.name}`, images: (await categoryPhotos(c.id)).map((img) => imageUrl(img, 'product', '1600x900_cover')),
  })))).filter((b) => b.images.length === 2);
  // Lifestyle photos (from the Rugistan assets) lead each banner; product shots stay as the fallback.
  // focus = where the person stands across the photo (%), so phones crop around them.
  const heroPhotos: [string, number][] = [['/hero/shop-hero-wide.webp', 66], ['/hero/about-hero-wide.webp', 62], ['/hero/product-craft-courtyard.webp', 64]];
  banners.forEach((b, k) => { if (heroPhotos[k]) { b.images = [heroPhotos[k][0], ...b.images]; b.focus = heroPhotos[k][1]; } });
  const onSale = (await saleProducts());
  const maxOff = Math.max(0, ...onSale.map(discountPercent));
  if (pics(onSale).length === 2) banners.splice(1, 0, {
    eyebrow: s.sale_title, title: maxOff ? t('Up to {n}% Off.').replace('{n}', String(maxOff)) : t('The Sale Is On.'), text: `${onSale.length} ${t('pieces on sale for a limited time, with Cash on Delivery across Pakistan.')}`,
    href: '/today-sale', cta: t('Shop the sale'), images: ['/hero/collections-hero-wide.webp', ...pics(onSale)], focus: 82,
  });
  const sale = { title: s.sale_title, color: s.sale_color };
  const perks = [
    [t('Premium Fabrics'), t('Pure cotton, soft on skin')],
    [t('Handwoven Khaddar'), t('Woven with patience and care')],
    [t('Cash on Delivery'), t('Pay at your door, across Pakistan')],
    [s.free_shipping_over > 0 ? `${t('Free delivery on orders above')} Rs ${s.free_shipping_over.toLocaleString()}` : t('Nationwide Delivery'), t('Delivered to every city')],
  ];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: s.store_name, url: siteUrl() }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Organization', name: s.store_name, url: siteUrl(), logo: siteUrl() + '/brand/khaddar-virsa-logo-hq.png',
        email: s.contact.email[0], telephone: s.contact.phone[0], sameAs: s.social.map((x) => x.link),
        address: s.contact.address[0] ? { '@type': 'PostalAddress', streetAddress: s.contact.address[0], addressCountry: 'PK' } : undefined,
      }} />

      <h1 className="sr-only">{s.store_name}: handwoven men&rsquo;s khaddar suits</h1>
      {s.sliders.length > 0 ? <HeroSlider slides={s.sliders} /> : <HeroBanners banners={banners} />}

      <section aria-label={t('Why shop with us')} className="border-y border-line bg-paper">
        <ul className="container-kk grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4">
          {perks.map(([pt, d]) => (
            <li key={pt} className="px-3 text-center">
              <p className="font-display text-[19px] text-ink">{pt}</p>
              <p className="mt-1 text-[14px]">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-kk">
        {sections.length > 0 && (
          <section className="mb-12 border-b border-line pb-14 pt-16 md:mb-16 md:pb-16">
            <div className="mb-8 text-center">
              <p className="eyebrow">{t('Explore by style')}</p>
              <h2 className="font-display mt-2 text-[32px] md:text-[40px]">{t('Shop by Category')}</h2>
            </div>
            <nav aria-label={t('Featured categories')} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {sections.map(({ sub }) => (
                <Link key={sub.id} href={`/product-category/${sub.alias}`}
                  className="group relative block overflow-hidden rounded-t-[999px] rounded-b-2xl bg-ink shadow-[0_18px_40px_-24px_rgba(53,34,24,.6)] ring-1 ring-line transition-transform duration-500 hover:-translate-y-1.5">
                  <img src={imageUrl(sub.img, 'sub_cat', '300x300_cover')} alt="" width={210} height={280} loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-3 pb-5 text-center">
                    <span className="font-display text-[19px] leading-tight text-white sm:text-[21px]">{sub.name}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-sand transition-all group-hover:gap-2.5 group-hover:text-white">{t('Shop')} <ArrowRight className="h-3.5 w-3.5" /></span>
                  </span>
                </Link>
              ))}
            </nav>
          </section>
        )}

        {best.length > 0 && (
          <section className="mb-14 md:mb-20">
            <SectionBar title="Best sellers" />
            <ProductGrid products={best} sale={sale} eager={4} />
          </section>
        )}

        {sections.map(({ sub, products }, i) => (
          <section key={sub.id} className="mb-14 md:mb-20">
            <SectionBar title={sub.name} href={`/product-category/${sub.alias}`} />
            <ProductGrid products={products} sale={sale} eager={i === 0 && !best.length ? 4 : 0} />
          </section>
        ))}
      </div>

      <section className="bg-ink text-[#e8dfd2]/80">
        <div className="container-kk grid gap-8 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="eyebrow !text-sand">{t('Our craftsmanship')}</p>
            <h2 className="font-display mt-3 text-[34px] leading-tight text-white md:text-[44px]">{t('A Story of Heritage, Craft & Grace')}</h2>
          </div>
          <div>
            <p className="text-[17px]">{t('Every {store} suit celebrates Pakistani weaving traditions and the skilled hands that bring khaddar to life: fine fabrics, handloom weaving and individual character.').replace('{store}', s.store_name)}</p>
            <Link href="/about-us" className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand hover:text-white">{t('Discover our story')} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
