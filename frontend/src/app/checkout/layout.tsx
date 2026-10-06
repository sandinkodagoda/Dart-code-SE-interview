import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout — PayHere & WhatsApp Direct Order | Nexora',
  description:
    'Complete your order with zero account hassle. Secure PayHere card gateway or direct WhatsApp order with Islandwide delivery.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
