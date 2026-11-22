import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'https://www.khaddarvirsa.store'
const BRAND = 'Khaddar Virsa'
const DEFAULT_TITLE = `${BRAND} · Premium Men's Khaddar Suits`
const DEFAULT_DESCRIPTION = 'Khaddar Virsa — premium, 100% chemical-free Kamalia khaddar suit fabric for men. Free delivery and Cash on Delivery across Pakistan, with 15-day returns.'
const PAGES: Record<string, [string, string]> = {
  '/shop': [`Shop Men's Khaddar Suits · ${BRAND}`, 'Browse unstitched men\'s khaddar suits in every colour. Chemical-free Kamalia khaddar, free delivery and Cash on Delivery across Pakistan.'],
  '/collections': [`Khaddar Collections · ${BRAND}`, 'Explore Khaddar Virsa collections of premium winter khaddar suit fabric for men, woven in Kamalia.'],
  '/our-story': [`Our Story · ${BRAND}`, 'How Khaddar Virsa brings handwoven, chemical-free Kamalia khaddar from the loom to your wardrobe.'],
  '/khaddar-guide': [`Khaddar Guide: Kamalia Handloom Khaddar Explained · ${BRAND}`, 'What khaddar is, why Kamalia handloom khaddar is special, our Pure, Winter, Desi and Designer ranges, stitching tips and how to care for it.'],
  '/contact': [`Contact Us · ${BRAND}`, 'Call +92 342 4307737 or visit us at 5 Jahangir Road, Ganj Mughalpura, Lahore. Open every day 9am to 5pm.'],
  '/track-order': [`Track Your Order · ${BRAND}`, 'Check the delivery status of your Khaddar Virsa order with your order number.'],
}
// Private or transactional routes that should never appear in search results.
const PRIVATE = /^\/(admin|account|cart|checkout|login|register|forgot-password|reset-password|team|order-confirmation)(\/|$)/

function tag<T extends HTMLElement>(selector: string, create: () => T) {
  return document.head.querySelector<T>(selector) ?? document.head.appendChild(create())
}

/** Sets title, description, canonical and robots per route. Product and CMS pages refine the title themselves once their data loads. */
export default function SeoHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'
    const [title, description] = PAGES[path] ?? [DEFAULT_TITLE, DEFAULT_DESCRIPTION]
    document.title = title
    tag('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' })).content = description
    // Product pages are reachable at /rug/:slug too; the canonical always points at /product/:slug.
    tag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' })).href = SITE + path.replace(/^\/rug\//, '/product/')
    const robots = tag('meta[name="robots"]', () => Object.assign(document.createElement('meta'), { name: 'robots' }))
    robots.content = PRIVATE.test(path) ? 'noindex, nofollow' : 'index, follow'
  }, [pathname])
  return null
}
