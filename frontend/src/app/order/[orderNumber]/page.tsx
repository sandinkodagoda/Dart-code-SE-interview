'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  CreditCard,
  Phone,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => storeApi.getOrderByNumber(orderNumber),
    enabled: Boolean(orderNumber),
    refetchInterval: (query) => {
      // If payment is pending, poll every 5s for payment callback update
      return query.state.data?.paymentStatus === 'PENDING' ? 5000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.25rem' }}>
        <Skeleton height="80px" borderRadius="16px" style={{ marginBottom: '2rem' }} />
        <Skeleton height="350px" borderRadius="16px" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Order Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          We could not locate order <strong>{orderNumber}</strong>. Please check your order reference number.
        </p>
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'SHIPPED':
      case 'READY_TO_SHIP':
        return 'info';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'primary';
      default:
        return 'warning';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'neutral';
      default:
        return 'warning';
    }
  };

  return (
    <div className="container-custom" style={{ padding: '3rem 1.25rem 6rem', maxWidth: '960px' }}>
      {/* ── 1. STATUS HERO ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: order.orderStatus === 'CANCELLED' ? '#fee2e2' : '#ecfdf5',
            color: order.orderStatus === 'CANCELLED' ? '#ef4444' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          {order.orderStatus === 'CANCELLED' ? <ShieldAlert size={36} /> : <CheckCircle2 size={36} />}
        </div>

        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ORDER CONFIRMATION
        </span>

        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
          Order {order.orderNumber}
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-LK', { dateStyle: 'long', timeStyle: 'short' })}
        </p>

        {/* Status Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <Badge variant={getOrderStatusVariant(order.orderStatus)} size="md">
            Order Status: {order.orderStatus}
          </Badge>
          <Badge variant={getPaymentStatusVariant(order.paymentStatus)} size="md">
            Payment: {order.paymentStatus}
          </Badge>
          <Badge variant="neutral" size="md">
            Method: {order.paymentMethod}
          </Badge>
        </div>

        {/* WhatsApp Specific Instruction */}
        {order.paymentMethod === 'WHATSAPP' && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginTop: '1.75rem',
              textAlign: 'left',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Phone size={24} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
              <strong>WhatsApp Order Registered:</strong> If WhatsApp did not open automatically, you can message our sales hotline at <strong>+94 77 123 4567</strong> quoting order number <strong>{order.orderNumber}</strong>.
            </div>
          </div>
        )}
      </div>

      {/* ── 2. ORDER DETAILS & ITEMS ──────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Customer & Shipping Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="sm:grid-cols-2">
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Customer Details
            </h3>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {order.customerName}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {order.customerEmail}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {order.customerPhone}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Shipping Address
            </h3>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
              {order.addressLine1}
              {order.addressLine2 && <div>{order.addressLine2}</div>}
              <div>{order.city} {order.postalCode || ''}</div>
            </div>
            {order.customerNotes && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                Note: "{order.customerNotes}"
              </div>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            Purchased Products
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderRadius: '12px',
                  gap: '1rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {item.productName}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    SKU: {item.sku} • Qty: {item.quantity} × LKR {Number(item.unitPrice).toLocaleString('en-LK')}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  LKR {Number(item.total).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
            <span>Subtotal</span>
            <span>LKR {Number(order.subtotal).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
            <span>Islandwide Delivery</span>
            <span>
              {Number(order.deliveryFee) === 0 ? (
                <strong style={{ color: '#059669' }}>FREE</strong>
              ) : (
                `LKR ${Number(order.deliveryFee).toFixed(2)}`
              )}
            </span>
          </div>

          <div
            style={{
              borderTop: '1.5px dashed var(--color-border)',
              paddingTop: '0.85rem',
              marginTop: '0.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
              Final Total
            </span>
            <Price amount={Number(order.total)} size="xl" />
          </div>
        </div>

        {/* Return Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <Link href="/shop">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>

          <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
            <Button variant="outline" leftIcon={<HelpCircle size={16} />}>
              Need Help With This Order?
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
