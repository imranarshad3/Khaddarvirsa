import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { getSettings, siteUrl } from "@/lib/settings";
import { getLang } from "@/lib/lang";
import { LangProvider } from "@/components/i18n/LangProvider";

const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
// Only downloaded by browsers when Urdu text is on the page (preload off).
const urdu = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["400", "600"], variable: "--font-urdu", preload: false });

export const dynamic = "force-dynamic"; // catalogue, prices and settings are edited live from the admin panel

export async function generateMetadata(): Promise<Metadata> {
  const s = (await getSettings());
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo_title, template: `%s | ${s.store_name}` },
    description: s.seo_description,
    icons: { icon: "/brand/favicon.svg" },
    applicationName: s.store_name,
    openGraph: { siteName: s.store_name, type: "website", locale: "en_PK", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: s.store_name }] },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#352218" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === "ur" ? "rtl" : "ltr"} className={`${sans.variable} ${serif.variable} ${urdu.variable}`}>
      <body className="antialiased"><LangProvider lang={lang}>{children}</LangProvider></body>
    </html>
  );
}
