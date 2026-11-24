'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '@/components/useDialog';
import { CloseIcon, ExpandIcon, ZoomIcon } from '@/components/icons';

/** Single product image (the catalogue has one image per product) with hover zoom, fullscreen view and optional video. */
export default function ProductGallery({ image, alt, youtubeId }: { image: string; alt: string; youtubeId: string | null }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [zoomOn, setZoomOn] = useState(false);
  const [full, setFull] = useState(false);
  const [tab, setTab] = useState<'image' | 'video'>('image');

  const fullPanel = useDialog<HTMLDivElement>(full, () => setFull(false));

  return (
    <div>
      {tab === 'image' ? (
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-soft ring-1 ring-line"
          onMouseMove={(e) => {
            if (!zoomOn) return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}>
          <img src={image} alt={alt} width={600} height={600} fetchPriority="high" className="h-full w-full object-cover transition-transform duration-200"
            style={zoomOn && zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
          <button type="button" onClick={() => setZoomOn(!zoomOn)} aria-pressed={zoomOn} aria-label="Toggle zoom"
            className={`absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full shadow-card ${zoomOn ? 'bg-gold text-white' : 'bg-white text-ink-2'}`}><ZoomIcon /></button>
          <button type="button" onClick={() => setFull(true)} aria-label="View fullscreen"
            className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-2 shadow-card"><ExpandIcon /></button>
        </div>
      ) : (
        <div className="aspect-square overflow-hidden rounded-2xl bg-black">
          <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}`} title="Product video" className="h-full w-full" allowFullScreen
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      )}
      {youtubeId && (
        <div className="mt-3 flex gap-2 text-[15px]">
          <button type="button" onClick={() => setTab('image')} className={`rounded border px-3 py-1 ${tab === 'image' ? 'border-gold text-gold' : ''}`}>Image</button>
          <button type="button" onClick={() => setTab('video')} className={`rounded border px-3 py-1 ${tab === 'video' ? 'border-gold text-gold' : ''}`}>Product Video</button>
        </div>
      )}
      {full && createPortal(
        <div ref={fullPanel} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" style={{ animation: 'kk-fade-in .2s' }} role="dialog" aria-modal="true" aria-label={alt} onClick={() => setFull(false)}>
          <img src={image} alt={alt} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" aria-label="Close" className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25" onClick={() => setFull(false)}><CloseIcon className="h-6 w-6" /></button>
        </div>,
        document.body,
      )}
    </div>
  );
}
