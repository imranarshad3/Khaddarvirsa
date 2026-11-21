import './loading-screen.css'
const BRAND = 'Khaddar Virsa'
export default function LoadingScreen({ studio = false }: { studio?: boolean }) {
 return <div className="rugistan-loading" role="status" aria-live="polite">
  <div className="loading-center">
   <div className="loading-emblem" aria-hidden="true">
    <svg viewBox="0 0 120 120">
     <defs><linearGradient id="kvGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9a46a"/><stop offset=".5" stopColor="#8a6440"/><stop offset="1" stopColor="#d9b97e"/></linearGradient></defs>
     <circle className="emblem-ring" cx="60" cy="60" r="56"/>
     <circle className="emblem-thread" cx="60" cy="60" r="56" stroke="url(#kvGold)"/>
     <circle className="emblem-inner" cx="60" cy="60" r="46"/>
    </svg>
    <span className="emblem-mark">K<i>V</i></span>
   </div>
   <div className="loading-wordmark" aria-label={BRAND}>{[...BRAND].map((c, i) => <span key={i} style={{ animationDelay: `${0.15 + i * 0.05}s` }}>{c === ' ' ? ' ' : c}</span>)}</div>
   <div className="loading-tagline">FEEL THE FABRIC OF TRADITION</div>
   <div className="loading-rule" aria-hidden="true"><span/></div>
   <p>{studio ? 'Preparing your studio' : 'A little beauty is on its way'}</p>
   <span className="loading-caption">{studio ? 'Your store, thoughtfully managed.' : 'Fine fabrics. Timeless craftsmanship.'}</span>
   <div className="loading-track" aria-hidden="true"><span/></div>
  </div>
  <div className="loading-footer">CRAFTED WITH CARE · KHADDAR VIRSA</div>
 </div>
}
