import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Tracking & Confirmation | TechGadgets Store',
  description:
    'Track your order fulfillment milestone, payment verification, and delivery dispatch details in real-time.',
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
