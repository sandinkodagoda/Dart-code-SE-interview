import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Electronics — Smartphones, Laptops & Audio | Nexora',
  description:
    'Explore Sri Lanka’s best collection of flagship phones, Apple MacBooks, wireless headphones, and tech accessories with official warranty.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
