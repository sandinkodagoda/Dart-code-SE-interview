import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/lib/query/provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'TechGadgets Store — Electronics, Laptops & Smartphones',
  description:
    'Sri Lanka’s premier electronics and gadgets e-commerce store. Official flagship smartphones, high-performance laptops, noise-cancelling audio, and accessories with genuine warranties.',
  keywords: 'electronics, smartphones, laptops, Sri Lanka, TechGadgets, PayHere, iPhone, MacBook, Sony',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <QueryProvider>
          <Header />
          <main style={{ flex: 1, width: '100%' }}>{children}</main>
          <Footer />
          <CartDrawer />
        </QueryProvider>
      </body>
    </html>
  );
}
