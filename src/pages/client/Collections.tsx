import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchBanners, fetchProducts } from '../../lib/api'
import { useStore } from '../../context/StoreContext'
import ProductCard, { ProductCardSkeleton, productCover } from '../../components/client/ProductCard'
import {
  CategoryTiles,
  InstagramStrip,
  PageBanner,
  SectionTitle,
  StoryBand,
} from '../../components/client/Sections'
import type { Banner, ProductFull } from '../../lib/types'

/** Occasion edits sit beside the category cards and share their card design. */
const EDITS = [
  {
    to: '/shop?room=Office%20%26%20Eid',
    photo: 'edit-neutral',
    image: null as string | null,
    alt: 'Man in a beige khaddar shalwar kameez',
    title: 'Office & Eid',
    body: 'Crisp, refined khaddar suits for the office, Friday prayers, weddings and Eid.',
    cta: 'Shop Office & Eid',
  },
  {
    to: '/shop?category=handmade-khaddi',
    photo: '',
    image: '/assets/fashion/heritage-loom.webp',
    alt: 'Khaddi fabric on a traditional handloom',
    title: 'Handmade Khaddi',
    body: 'Hand-loomed khaddi with a texture you can feel, for winter weddings and family events.',
    cta: 'Shop Handmade Khaddi',
  },
]

export default function Collections() {
  const { categories } = useStore()
  const [banners, setBanners] = useState<Record<string, Banner>>({})
  const [products, setProducts] = useState<ProductFull[]>([])
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [map, result] = await Promise.all([fetchBanners(), fetchProducts({ perPage: 4, sort: 'rating' })])
      if (!active) return
      setBanners(map)
      setProducts(result.products)
      setLoading(false)
    })().catch(() => { if (active) { setLoadError(true); setLoading(false) } })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {loadError && <div className="notice error" role="alert">We could not load the latest collection. Please refresh and try again.</div>}
      <PageBanner
        title="Collections"
        editorial
        eyebrow="CURATED BY KHADDAR VIRSA"
        cta="Explore Our Collections"
        ctaTo="#our-collections"
        description="Curated khaddar suits for men, combining Pakistani weaving tradition with a modern wardrobe."
        image="/assets/fashion/collections-hero.webp"
      />

      <section className="section wrap" id="our-collections">
        <SectionTitle
          eyebrow="EXPLORE BY STYLE"
          title="Our Collections"
          description="Distinctive styles, one shared love of craftsmanship."
          linkTo="/shop"
          linkLabel="Explore the collection →"
        />
        <div className="collection-catalog"><CategoryTiles categories={categories} />
        <div className="collection-edits">
          {EDITS.map((edit) => (
            <article className="tile collection-edit" key={edit.to}>
              <Link to={edit.to}>
                <div className="pic">
                  {edit.image
                    ? <img src={edit.image} alt={edit.alt} loading="lazy" />
                    : <div className={`edit-photo ${edit.photo}`} role="img" aria-label={edit.alt} />}
                  <span className="tile-veil" aria-hidden="true" />
                  <div className="tile-copy">
                    <div className="tile-heading"><h3>{edit.title}</h3></div>
                    <p>{edit.body}</p>
                    <span className="tilelink">{edit.cta} <span aria-hidden="true">→</span></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div></div>
      </section>

      <section className="section wrap cream">
        <SectionTitle
          eyebrow="FEATURED COLLECTIONS"
          title="Most Loved Collections"
          description="Textures, colors and patterns made for real homes."
          linkTo="/shop?sort=rating"
        />
        <div className="gridprod">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <StoryBand banner={banners.home_story} />

      <InstagramStrip images={products.map(productCover)} />
    </>
  )
}
