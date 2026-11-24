import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { getSettings, siteUrl } from "@/lib/settings";

const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });

export const dynamic = "force-dynamic"; // catalogue, prices and settings are edited live from the admin panel

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo_title, template: `%s | ${s.store_name}` },
    description: s.seo_description,
    icons: { icon: "/brand/favicon.svg" },
    openGraph: { siteName: s.store_name, type: "website", locale: "en_PK" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#352218" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
