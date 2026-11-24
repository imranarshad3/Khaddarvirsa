import { getT } from '@/lib/lang';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="container-kk py-16 text-center md:py-24">
      <p className="font-display text-[88px] leading-none text-gold/40 md:text-[120px]">404</p>
      <h1 className="font-display mt-2 text-[28px] text-ink md:text-[36px]">{t('We could not find that page')}</h1>
      <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-muted">{t('The page or piece you are looking for may have moved or sold out. Try a search, or head back to the shop.')}</p>
      <form action="/search" className="mx-auto mt-8 flex max-w-[420px] items-center rounded-full border border-line bg-white pl-5 focus-within:border-gold">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
        <input name="q" aria-label={t('Search products')} placeholder={t('Search khaddar, shawls…')} className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-[16px] outline-none" />
        <button className="m-1 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-sand">{t('Search')}</button>
      </form>
      <Link href="/" className="mt-6 inline-block text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-2 underline underline-offset-4">{t('Back to home')}</Link>
    </div>
  );
}
