import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/lib/query/provider';
import StorefrontLayoutWrapper from '@/components/layout/StorefrontLayoutWrapper';

export const metadata: Metadata = {
  title: 'Nexora — Premier Electronics, Laptops & Smartphones',
  description:
    'Sri Lanka’s premier electronics and gadgets e-commerce store. Official flagship smartphones, high-performance laptops, noise-cancelling audio, and accessories with genuine warranties.',
  keywords: 'electronics, smartphones, laptops, Sri Lanka, Nexora, PayHere, iPhone, MacBook, Sony',
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
          <StorefrontLayoutWrapper>{children}</StorefrontLayoutWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
