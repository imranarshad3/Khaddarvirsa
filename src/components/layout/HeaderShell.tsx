'use client';
import { useEffect, useState, type ReactNode } from 'react';

// Sticky header that marks itself data-scrolled once the page moves, so CSS can compact it.
export default function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header data-scrolled={scrolled || undefined} className="group/hdr sticky top-0 z-40">{children}</header>;
}
