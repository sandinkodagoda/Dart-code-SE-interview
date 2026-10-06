import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart — Review Items & Delivery | Nexora',
  description:
    'Review your electronic items, check free delivery eligibility, and proceed to guest checkout.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
