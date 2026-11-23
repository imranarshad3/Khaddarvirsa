import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDownRight, Sparkles, Pause, Play } from 'lucide-react'
import Icon from './Icon'
import Carousel from './Carousel'
import { Link } from 'react-router-dom'
import { Reveal, SectionTitle } from './Primitives'
import type { Banner, Category } from '../../lib/types'

const FALLBACK = '/assets/fashion/hero.webp'

export function PageBanner({
  eyebrow = 'KHADDAR VIRSA · FEEL THE FABRIC OF TRADITION',
  title,
  description,
  image = FALLBACK,
  imageSrcSet,
  cta,
  ctaTo,
  editorial = false,
  shop = false,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  image?: string | null
  imageSrcSet?: string
  cta?: string
  ctaTo?: string
  editorial?: boolean
  shop?: boolean
  className?: string
}) {
  return (
    <div className={`banner${editorial ? ' banner-editorial' : ''}${shop ? ' shop-hero' : ''}${image === null ? ' banner-plain' : ''}${className ? ` ${className}` : ''}`}>
      {image !== null && <img src={image || FALLBACK} srcSet={imageSrcSet} sizes={imageSrcSet ? '(max-width: 1520px) 100vw, 1440px' : undefined} alt="" aria-hidden="true" fetchPriority={imageSrcSet ? 'high' : undefined} />}
      <div className="shade" />
      <div className="inner">
        <nav className="banner-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>›</span><span aria-current="page">{title}</span></nav>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {shop && <span className="shop-hero-rule" aria-hidden="true" />}
        {description && <p>{description}</p>}
        {shop && <><a className="btn shop-hero-cta" href="#rug-catalogue">Explore Collection <ArrowDownRight size={18} aria-hidden="true" /></a><div className="shop-hero-note"><Sparkles size={16} aria-hidden="true" /><span>Fine fabrics. Timeless character.</span></div></>}
        {cta && ctaTo && <Link className="btn" to={ctaTo}>{cta} <Icon name="arrow" /></Link>}
      </div>
    </div>
  )
}

export function FeatureRow() {
  const features = [
    ['leaf', 'Premium Fabrics', '100% chemical-free, soft on skin'],
    ['heart', 'Handwoven Khaddar', 'Woven with patience and care'],
    ['spark', '15-Day Returns', 'Easy exchange or refund'],
    ['truck', 'Free Delivery', 'Cash on Delivery across Pakistan'],
  ] as const
  return (
    <section className="feature-row">
      {features.map(([icon, title, note]) => (
        <div className="feature" key={title}>
          <div className="icon" aria-hidden="true">
            <Icon name={icon} />
          </div>
          <div>
            <strong>{title}</strong>
            <small>{note}</small>
          </div>
        </div>
      ))}
    </section>
  )
}

export function CategoryTiles({ categories, three = false }: { categories: Category[]; three?: boolean }) {
  if (!categories.length) return null
  return (
    <div className={`tiles ${three ? 'three' : ''}`.trim()}>
      {categories.map((c, index) => (
        <article className="tile" key={c.id}>
          <Link to={`/shop?category=${c.slug}`}>
            <div className="pic">
              <img src={c.image_url || FALLBACK} alt={c.name} loading="lazy" />
              <span className="tile-veil" aria-hidden="true" />
              <span className="tile-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="tile-copy">
                <div className="tile-heading"><h3>{c.name}</h3></div>
                {c.description && <p>{c.description}</p>}
                <span className="tilelink">Explore collection <span aria-hidden="true">→</span></span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}

export function CategoryCircles({ categories }: { categories: Category[] }) {
  if (!categories.length) return null
  return (
    <Carousel label="categories" className="cat-circles">
      {categories.map((c) => (
        <Link className="cat-circle" key={c.id} to={`/shop?category=${c.slug}`}>
          <img src={c.image_url || FALLBACK} alt="" loading="lazy" />
          <span>{c.name}</span>
        </Link>
      ))}
    </Carousel>
  )
}

export function StoryBand({
  banner,
  reverse = false,
  fallbackImage = '/assets/fashion/story.jpg',
}: {
  banner?: Banner | null
  reverse?: boolean
  fallbackImage?: string
}) {
  const image = banner?.image_url || fallbackImage
  const copy = (
    <div className="storycopy">
      <div className="eyebrow">{banner?.eyebrow || 'OUR CRAFTSMANSHIP'}</div>
      <h2>{banner?.title || 'A Story of Heritage, Craft & Grace'}</h2>
      <p>
        {banner?.subtitle ||
          'Every Khaddar Virsa piece celebrates our rich heritage, redesigned for the contemporary wardrobe. Embrace your roots and elevate your everyday look.'}
      </p>
      <div className="craft-values">{([['leaf','Fine fabrics'],['heart','Handloom weaving'],['spark','Individual character']] as const).map(([name,label])=><div className="craft-value" key={name}><Icon name={name}/><span>{label}</span></div>)}</div>
      <Link className="btn" to={banner?.link_url || '/our-story'}>
        {banner?.cta_label || 'Discover Our Story'} →
      </Link>
    </div>
  )

  return (
    <div className="storyband">
      {reverse ? copy : image ? <img src={image} alt="" aria-hidden="true" loading="lazy" /> : <div className="craft-photo" role="img" aria-label="Hands weaving khaddar on a loom" />}
      {reverse ? <div className="craft-photo" role="img" aria-label="Hands weaving khaddar on a loom" /> : copy}
    </div>
  )
}

export function LifestyleBand({ banner, fallbackImage = '/assets/fashion/lifestyle.jpg' }: { banner?: Banner | null; fallbackImage?: string }) {
  return (
    <div className="lifestyle">
      <img src={banner?.image_url || fallbackImage} alt="" aria-hidden="true" loading="lazy" />
      <div className="text">
        {banner?.eyebrow && <div className="eyebrow">{banner.eyebrow}</div>}
        <h2>{banner?.title || 'Khaddar for Every Season'}</h2>
        {banner?.subtitle && <p>{banner.subtitle}</p>}
        <Link className="btn" to={banner?.link_url || '/shop'}>
          {banner?.cta_label || 'Shop Now'} →
        </Link>
      </div>
    </div>
  )
}

/**
 * Khaddar Virsa's own design philosophy — brand copy, not customer testimonials.
 * Real customer reviews appear on product pages once they are approved.
 */
export function PhilosophyBand() {
  const items = [
    ['Crafted with intention', 'The beauty of craft is in the small details: fabric, stitching and a graceful drape.'],
    ['Elegance in every detail', 'You deserve soft comfort, lasting quality and a considered design.'],
    ['Designed for real moments', 'Discover colour, character and thoughtful fabrics for every day and every celebration.'],
  ]
  return (
    <section className="section cream center philosophy">
      <div className="eyebrow">A CLOSER LOOK</div>
      <h2>Made to Feel Like You</h2>
      <p className="subtitle">From quiet neutrals to rich winter weaves, find a suit fabric that fits the way you live.</p>
      <div className="testimonials">
        {items.map(([title, body], index) => (
          <Reveal className="quote" key={title}>
            <span className="quote-number">0{index + 1}</span>
            <h3 style={{ marginBottom: 12 }}>{title}</h3>
            <p>{body}</p>
            <strong>KHADDAR VIRSA DESIGN PHILOSOPHY</strong>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function InstagramStrip({ images, handle }: { images: string[]; handle?: string }) {
  const galleryRef = useRef<HTMLElement>(null)
  const [rotation, setRotation] = useState({step:0, order:[] as number[]})
  const previousRects = useRef(new Map<string, DOMRect>())
  const animations = useRef<Animation[]>([])
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const photos = images.slice(0, 6)
  const photoCount = photos.length
  const order = rotation.order.length === photos.length ? rotation.order : photos.map((_, index) => index)
  useLayoutEffect(() => {
    const cards = Array.from(galleryRef.current?.querySelectorAll<HTMLElement>('.journal-card') ?? [])
    if (reducedMotion) { previousRects.current.clear(); return }
    cards.forEach((card, index) => {
      const before = previousRects.current.get(card.dataset.photo ?? '')
      if (!before) return
      const after = card.getBoundingClientRect()
      if (!after.width || !after.height) return
      const x = before.left - after.left, y = before.top - after.top
      const sx = before.width / after.width, sy = before.height / after.height
      if (Math.abs(x) + Math.abs(y) < 1 && Math.abs(sx - 1) < .01) return
      const from = `translate(${x}px,${y}px) scale(${sx},${sy})`
      card.style.zIndex = index === 0 ? '4' : '2'
      const frames: Keyframe[] = index === 0 ? [
        {transform:from,offset:0,boxShadow:'0 0 0 transparent'},
        {transform:`translate(${x}px,${y - 12}px) scale(${sx * 1.04},${sy * 1.04}) rotate(-1deg)`,offset:.16,boxShadow:'0 1rem 2rem #30251d30'},
        {transform:'translate(18%,18%) scale(.64) rotate(-1.4deg)',offset:.48},
        {transform:'translate(18.5%,18%) scale(.64) rotate(1.2deg)',offset:.55},
        {transform:'translate(17.5%,18%) scale(.64) rotate(-.7deg)',offset:.61},
        {transform:'translate(18%,18%) scale(.64) rotate(0deg)',offset:.67},
        {transform:'translate(0,0) scale(1) rotate(0deg)',offset:1,boxShadow:'0 0 0 transparent'},
      ] : [{transform:from},{transform:'translate(0,0) scale(1)'}]
      const animation = card.animate(frames,{duration:1200,easing:'cubic-bezier(.22,.61,.36,1)'})
      animation.onfinish = () => {card.style.zIndex = ''}
      animations.current.push(animation)
    })
    previousRects.current.clear()
    return () => {
      animations.current.forEach(animation => animation.cancel())
      animations.current = []
      cards.forEach(card => {card.style.zIndex = ''})
    }
  }, [rotation, reducedMotion])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReducedMotion(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    const element = galleryRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {threshold:.15})
    observer.observe(element)
    return () => observer.disconnect()
  }, [images.length])
  useEffect(() => {
    if (paused || hovered || reducedMotion || !visible || photoCount < 2) return
    let timer: ReturnType<typeof setInterval> | undefined
    const restart = () => {
      clearInterval(timer)
      if (!document.hidden) timer = setInterval(() => {
        previousRects.current.clear()
        galleryRef.current?.querySelectorAll<HTMLElement>('.journal-card').forEach(card => previousRects.current.set(card.dataset.photo ?? '',card.getBoundingClientRect()))
        setRotation(value => {
          const next = value.order.length === photoCount ? [...value.order] : Array.from({length:photoCount},(_, index) => index)
          const target = 1 + value.step % (next.length - 1)
          ;[next[0],next[target]] = [next[target],next[0]]
          return {step:value.step + 1,order:next}
        })
      }, 5000)
    }
    restart()
    document.addEventListener('visibilitychange', restart)
    return () => {clearInterval(timer); document.removeEventListener('visibilitychange', restart)}
  }, [paused, hovered, reducedMotion, visible, photoCount])
  if (!photos.length) return null
  return (
    <section ref={galleryRef} className="section wrap journal-gallery" aria-label="Khaddar Virsa gallery">
      <div className="journal-heading">
        <div><div className="eyebrow">FOLLOW OUR JOURNEY</div>
          <h2>{handle ? `@${handle}` : 'Khaddar Virsa, as Worn'}</h2>
        </div>
        <div className="journal-heading-aside"><p>Natural textures. Individual spaces. A little inspiration for your home.</p>
          {photos.length > 1 && !reducedMotion && <button type="button" className="journal-playback" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play gallery rotation' : 'Pause gallery rotation'} aria-pressed={paused}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? 'Play' : 'Pause'}</span>
          </button>}
        </div>
      </div>
      <div className="gallery journal-cards" data-count={photos.length} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
        {order.map(index => <figure className="journal-card" data-photo={index} key={index}>
          <img className="journal-current" src={photos[index]} alt={`Men's khaddar suit fabric ${index + 1}`} loading="lazy" decoding="async" />
        </figure>)}
      </div>
    </section>
  )
}

export function ProcessSteps({ steps }: { steps: [string, string, string][] }) {
  return (
    <div className="steps">
      {steps.map(([num, title, body]) => (
        <Reveal className="step" key={num}>
          <b>{num}</b>
          <div>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

export { SectionTitle }
