import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import CartDrawer, { CartToast } from '@/components/cart/CartDrawer';
import { WhatsappIcon } from '@/components/icons';
import { getSettings, whatsappLink } from '@/lib/settings';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = getSettings();
  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <CartToast />
      {s.whatsapp_number && (
        <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg">
          <WhatsappIcon className="h-7 w-7" />
        </a>
      )}
    </CartProvider>
  );
}
