'use client';
import { useEffect, useRef } from 'react';

/** Shared modal behaviour: locks page scroll, closes on Escape, moves focus into the panel and back to the opener on close. */
export function useDialog<T extends HTMLElement>(open: boolean, close: () => void) {
  const panel = useRef<T>(null);
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; });
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', esc);
    panel.current?.querySelector<HTMLElement>('[data-autofocus], button, a[href]')?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', esc);
      opener?.focus?.();
    };
  }, [open]);
  return panel;
}
