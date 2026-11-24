/** Khaddar Virsa seal: a diamond holding a woven lattice, the weave of handloom khaddar. */
export function LogoMark({ className = '', light = false }: { className?: string; light?: boolean }) {
  const ink = light ? '#fffaf2' : '#352218';
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <defs>
        <clipPath id={light ? 'kv-weave-l' : 'kv-weave'}><path d="M24 9 39 24 24 39 9 24Z" /></clipPath>
      </defs>
      <path d="M24 1.5 46.5 24 24 46.5 1.5 24Z" stroke="#916b43" strokeWidth="1.1" />
      <path d="M24 5 43 24 24 43 5 24Z" stroke="#d4b289" strokeWidth=".6" />
      <path d="M24 9 39 24 24 39 9 24Z" fill={ink} />
      <g clipPath={`url(#${light ? 'kv-weave-l' : 'kv-weave'})`} stroke={light ? '#916b43' : '#d4b289'} strokeWidth=".9" opacity=".75">
        {[-12, -6, 0, 6, 12].map((o) => <path key={`a${o}`} d={`M${4 + o} ${24 - 20} l40 40`} />)}
        {[-12, -6, 0, 6, 12].map((o) => <path key={`b${o}`} d={`M${44 + o} ${24 - 20} l-40 40`} strokeDasharray="3 3" />)}
      </g>
      <path d="M24 18.5 29.5 24 24 29.5 18.5 24Z" fill="#916b43" stroke={ink} strokeWidth="1.2" />
      <circle cx="24" cy="1.5" r="1.1" fill="#916b43" />
      <circle cx="24" cy="46.5" r="1.1" fill="#916b43" />
    </svg>
  );
}

/** Full logo. `compact` is the one-row phone version; `light` is for dark backgrounds. */
export default function Logo({ compact = false, light = false, shrink = false }: { compact?: boolean; light?: boolean; shrink?: boolean }) {
  const name = light ? 'text-white' : 'text-ink';
  const accent = light ? 'text-sand' : 'text-gold-dark';
  // shrink: follows the sticky header's scrolled state.
  const s = (a: string) => (shrink ? a : '');
  if (compact) return (
    <span className="flex items-center gap-2.5">
      <LogoMark light={light} className={`h-9 w-9 transition-all duration-300 ${s('group-data-[scrolled]/hdr:h-7 group-data-[scrolled]/hdr:w-7')}`} />
      <span className={`font-display flex flex-col text-[17px] uppercase leading-[1.05] tracking-[0.16em] ${name}`}>
        <span>Khaddar</span><span className={accent}>Virsa</span>
      </span>
    </span>
  );
  return (
    <span className="flex flex-col items-center">
      <LogoMark light={light} className={`h-12 w-12 transition-all duration-300 ${s('group-data-[scrolled]/hdr:h-0 group-data-[scrolled]/hdr:w-0 group-data-[scrolled]/hdr:opacity-0')}`} />
      <span className={`font-display mt-1.5 whitespace-nowrap text-[24px] uppercase leading-none tracking-[0.2em] ${name}`}>
        Khaddar <span className={accent}>Virsa</span>
      </span>
      <span className={`mt-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.32em] text-gold transition-all duration-300 ${s('group-data-[scrolled]/hdr:mt-0 group-data-[scrolled]/hdr:h-0 group-data-[scrolled]/hdr:opacity-0')}`}>
        <span aria-hidden className="h-px w-5 bg-gold/60" />Feel the Fabric of Tradition<span aria-hidden className="h-px w-5 bg-gold/60" />
      </span>
    </span>
  );
}
