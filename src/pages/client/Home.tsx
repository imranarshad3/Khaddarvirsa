import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import './home-hero.css'
import { Link } from 'react-router-dom'
import { fetchBanners, fetchProducts } from '../../lib/api'
import { useStore } from '../../context/StoreContext'
import ProductCard, { ProductCardSkeleton, productCover } from '../../components/client/ProductCard'
import {
  CategoryTiles,
  FeatureRow,
  InstagramStrip,
  LifestyleBand,
  PhilosophyBand,
  SectionTitle,
  StoryBand,
} from '../../components/client/Sections'
import { Reveal } from '../../components/client/Primitives'
import type { Banner, ProductFull } from '../../lib/types'

const HERO_TITLE = 'Elegance Woven Into Every Thread.'
const HERO_FALLBACK = '/assets/fashion/hero.webp'

export default function Home() {
  const { categories, store } = useStore()
  const [banners, setBanners] = useState<Record<string, Banner>>({})
  const [featured, setFeatured] = useState<ProductFull[]>([])
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [bannerMap, result] = await Promise.all([
        fetchBanners(),
        fetchProducts({ featured: true, perPage: 4, sort: 'featured' }),
      ])
      if (!active) return
      setBanners(bannerMap)
      setFeatured(result.products.length ? result.products : (await fetchProducts({ perPage: 4 })).products)
      setLoading(false)
    })().catch(() => { if (active) { setLoadError(true); setLoading(false) } })
    return () => {
      active = false
    }
  }, [])

  const hero = banners.home_hero
  const heroTitle = hero?.title || HERO_TITLE
  const gallery = featured.length
    ? featured.flatMap((p) => p.images.map((i) => i.url)).slice(0, 6)
    : []

  return (
    <>
      {loadError && <div className="notice error" role="alert">We could not load the latest collection. Please refresh and try again.</div>}
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-copy">
          <div className="eyebrow">{hero?.eyebrow || "Men's Khaddar Suits"}</div>
          <h1 id="home-hero-title">{heroTitle === HERO_TITLE ? <><span>Elegance</span>{' '}<span>Woven Into</span>{' '}<span>Every Thread.</span></> : heroTitle}</h1>
          <p className="home-hero-description">
            {hero?.subtitle ||
              'Discover handwoven Pakistani khaddar for men, from everyday Kamalia cloth to hand-loomed designer khaddi.'}
          </p>
          <div className="home-hero-actions">
            <Link className="btn home-hero-cta" to={hero?.link_url || '/shop'}>
              {hero?.cta_label || 'Explore Collection'} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link className="home-hero-story" to="/shop?category=handmade-khaddi">Shop Handmade Khaddi <span aria-hidden="true">↗</span></Link>
          </div>
          <p className="home-hero-signature"><span aria-hidden="true" />Pure cotton. Handloom texture. Made with care.</p>
        </div>
        <figure className="home-hero-figure">
          <div className="home-hero-image">
            <img src={HERO_FALLBACK} srcSet="/assets/fashion/hero-640.webp 640w, /assets/fashion/hero-960.webp 960w, /assets/fashion/hero.webp 1672w, /assets/fashion/hero-2400.webp 2400w" sizes="(max-width: 700px) calc(100vw - 2.5rem), (max-width: 1000px) 44vw, (max-width: 1792px) 54vw, 58rem" width={1672} height={941} fetchPriority="high" alt="Folded handwoven khaddar suit fabrics for men in cream, camel, brown, charcoal and black" />
          </div>
          <figcaption><span>The art of dressing well</span><span>Khaddar Virsa · Feel the Fabric of Tradition</span></figcaption>
        </figure>
      </section>

      <FeatureRow />

      {categories.length > 0 && (
        <Reveal as="section" className="section wrap">
          <SectionTitle
            eyebrow="EXPLORE BY STYLE"
            title="Shop by Category"
            description="Handwoven khaddar suit fabrics for men, for every season."
            linkTo="/collections"
          />
          <CategoryTiles categories={categories} />
        </Reveal>
      )}

      <section className="section wrap paper">
        <SectionTitle
          eyebrow="BESTSELLERS"
          title="Best Sellers"
          description="Our most-loved khaddar suits, chosen for fabric, texture and finish."
          linkTo="/shop"
        />
        <div className="gridprod">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <StoryBand banner={banners.home_story} />

      <LifestyleBand banner={banners.home_lifestyle} />

      <PhilosophyBand />

      <InstagramStrip
        images={gallery.length ? gallery : featured.map(productCover)}
        handle={store.social?.instagram ? store.name.toLowerCase() : undefined}
      />
    </>
  )
}
