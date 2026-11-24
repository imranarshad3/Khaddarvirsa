'use client';
import { createContext, useContext, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LANG_COOKIE, translator, type Lang } from '@/lib/i18n';

const LangContext = createContext<Lang>('en');

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = () => translator(useLang());

/** Flips between English and Urdu; the choice lives in a cookie so server-rendered pages follow it. */
export function LangSwitch({ className = '' }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === 'ur' ? 'en' : 'ur';
  return (
    <button type="button" lang={next} onClick={() => { document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`; start(() => router.refresh()); }} disabled={pending} aria-busy={pending}
      aria-label={next === 'ur' ? 'اردو میں دیکھیں' : 'View in English'} className={`${className ?? ''} disabled:cursor-wait disabled:opacity-50`}>
      {next === 'ur' ? 'اردو' : 'English'}
    </button>
  );
}

/** Translates a fixed English phrase; works inside server components too. */
export function T({ children }: { children: string }) {
  return <>{useT()(children)}</>;
}
