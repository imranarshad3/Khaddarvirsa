import { useEffect, useState } from 'react'
import { fetchBanners } from './api'
import type { Banner } from './types'

// One banners query is shared by every slot on a page; refreshed after 30s so admin edits show on the next visit.
let shared: { at: number; load: Promise<Record<string, Banner>> } | null = null
function loadBanners() {
  if (!shared || Date.now() - shared.at > 30_000) shared = { at: Date.now(), load: fetchBanners().catch(() => ({})) }
  return shared.load
}

/** The admin's active banner for a storefront slot, or null so the page keeps its built-in photo and text. */
export function useBanner(placement?: string) {
  const [banner, setBanner] = useState<Banner | null>(null)
  useEffect(() => {
    if (!placement) return
    let live = true
    void loadBanners().then((map) => { if (live) setBanner(map[placement] ?? null) })
    return () => { live = false }
  }, [placement])
  return banner
}
