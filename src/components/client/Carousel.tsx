import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Swipeable row with prev/next arrows; item width comes from CSS (--per-view). */
export default function Carousel({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  function update() {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [children])

  const go = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' })

  return (
    <div className={`carousel ${className}`.trim()} role="region" aria-roledescription="carousel" aria-label={label}>
      <button type="button" className="carousel-btn prev" aria-label={`Previous ${label}`} onClick={() => go(-1)} disabled={edge.start}>
        <ChevronLeft size={18} />
      </button>
      <div className="carousel-track" ref={track} onScroll={update}>
        {children}
      </div>
      <button type="button" className="carousel-btn next" aria-label={`Next ${label}`} onClick={() => go(1)} disabled={edge.end}>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
