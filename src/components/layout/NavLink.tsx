'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

// Main-nav link (on the dark nav bar) with a sand underline that grows on hover and stays on the current section.
export default function NavLink({ href, also = [], style, children }: { href: string; also?: string[]; style?: CSSProperties; children: ReactNode }) {
  const path = usePathname();
  const active = href === '/' ? path === '/' : [href, ...also].some((h) => path === h || path.startsWith(`${h}/`));
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} style={style}
      className={`relative inline-flex items-center gap-1.5 py-[18px] transition-colors after:absolute after:inset-x-0 after:bottom-[12px] after:h-px after:origin-center after:bg-sand after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 group-hover:text-white group-hover:after:scale-x-100 ${active ? 'text-white after:scale-x-100' : 'after:scale-x-0'}`}>
      {children}
    </Link>
  );
}
