import { sanitizeHtml } from '../../lib/html'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBanners, fetchPage } from '../../lib/api'
import {
  PageBanner,
  PhilosophyBand,
  ProcessSteps,
} from '../../components/client/Sections'
import type { Banner, Page } from '../../lib/types'

const PROCESS: [string, string, string][] = [
  ['01', 'Fabric Selection', 'Soft, lasting fabrics chosen for drape and character.'],
  ['02', 'Colour & Design', 'A considered palette brings the design together.'],
  ['03', 'Weaving', 'Patient handloom work gives every metre its texture.'],
  ['04', 'Finishing', 'Careful finishing and a final quality check.'],
  ['05', 'A Timeless Piece', 'Ready to be worn and treasured.'],
]

export default function OurStory() {
  const [page, setPage] = useState<Page | null>(null)
  const [banners, setBanners] = useState<Record<string, Banner>>({})

  useEffect(() => {
    void fetchPage('our-story').then(setPage).catch(() => setPage(null))
    void fetchBanners().then(setBanners)
  }, [])

  const heroImage = page?.hero_image_url || '/assets/fashion/story.jpg'

  return (
    <>
      <PageBanner
        title={page?.hero_heading || 'A Story Woven With Grace'}
        cta="Our Philosophy"
        ctaTo="#our-philosophy"
        description="More than beautiful clothes: a celebration of Pakistani craftsmanship and timeless design."
        image={heroImage}
      />

      <div className="storyband" id="our-philosophy">
        <img src={banners.home_hero?.image_url || '/assets/fashion/hero.webp'} alt="" aria-hidden="true" />
        <div className="storycopy">
          <div className="eyebrow">OUR STORY</div>
          {page?.content ? (
            <div className="cms" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
          ) : (
            <>
              <h2>Feel the Fabric of Tradition</h2>
              <p>
                Khaddar Virsa was born out of a passion to revive Pakistan&rsquo;s rich textile heritage for the modern world,
                with premium, chemical-free fabrics that bridge cultural roots and contemporary everyday fashion.
              </p>
            </>
          )}
          <Link className="btn" to="/shop">
            Browse the Collection →
          </Link>
        </div>
      </div>

      <section className="section wrap story-foundations">
        <div className="foundation-grid">
          {[
            ['The Beauty of Fine Fabrics', 'Softness, warmth and drape begin with the fabric behind every piece.', 'foundation-wool', '/shop?category=handmade-khaddi'],
            ['Time-Honored Craftsmanship', 'Patient hands weave khaddar on the loom, one considered thread at a time.', 'foundation-hands', '/shop'],
            ['A Naturally Rich Palette', 'Quiet neutrals and jewel tones create a wardrobe for every occasion.', 'foundation-palette', '/collections'],
            ['Designed for Generations', 'Thoughtful design and gentle care help your favourite piece become part of your story.', 'foundation-rugs', '/khaddar-guide'],
          ].map(([title,body,photo,to])=><article key={title}><div className={`foundation-photo ${photo}`} role="img" aria-label={title}/><h3>{title}</h3><p>{body}</p><Link className="inline-link" to={to}>Discover More →</Link></article>)}
        </div>
      </section>

      <div className="storyband">
        <div className="storycopy">
          <div className="eyebrow">OUR HERITAGE</div>
          <h2>
            A Legacy That Lives On
          </h2>
          <p>
            Thoughtful yarn selection, careful weaving and hand finishing define the character of each suit.
          </p>
        </div>
        <div className="heritage-photo" role="img" aria-label="A traditional handloom strung with cotton thread" />
      </div>

      <section className="section wrap cream" id="process">
        <div className="eyebrow">THE MAKING OF A PIECE</div>
        <h2 style={{ marginBottom: 25 }}>A Thoughtful Process</h2>
        <ProcessSteps steps={PROCESS} />
      </section>

      <PhilosophyBand />
    </>
  )
}
