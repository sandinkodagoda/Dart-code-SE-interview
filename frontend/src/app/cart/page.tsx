'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryFee = useCartStore((state) => state.getDeliveryFee);
  const getEstimatedTotal = useCartStore((state) => state.getEstimatedTotal);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.25rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Shopping Cart</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={<ShoppingBag size={56} />}
          title="Your Cart is Empty"
          description="You haven't added any electronics to your cart yet. Discover our latest flagship smartphones, laptops, and gadgets."
          actionLabel="Explore Catalog"
          actionHref="/shop"
        />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const estimatedTotal = getEstimatedTotal();

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Shopping Cart
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          style={{
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Clear All
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="lg:grid-cols-[1fr_380px]"
      >
        {/* ── Left Column: Cart Items List ───────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => {
            const product = item.product;
            const primaryImg =
              product.primaryImage?.imageUrl ||
              product.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';

            const lineTotal = Number(product.price) * item.quantity;

            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${product.slug}`}
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={primaryImg}
                    alt={product.name}
                    style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                  />
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {product.brand?.name}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    SKU: {product.sku}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <Price amount={Number(product.price)} size="sm" />
                  </div>
                </div>

                {/* Quantity Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(product.id, item.quantity - 1)}
                    style={{ padding: '0.4rem 0.65rem', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.65rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, item.quantity + 1)}
                    disabled={item.quantity >= product.stockQuantity}
                    style={{ padding: '0.4rem 0.65rem', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div style={{ minWidth: '110px', textAlign: 'right' }} className="hidden sm:block">
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total</div>
                  <Price amount={lineTotal} size="md" />
                </div>

                {/* Remove Icon */}
                <button
                  onClick={() => removeItem(product.id)}
                  aria-label="Remove item"
                  style={{
                    padding: '0.5rem',
                    color: 'var(--color-text-muted)',
                    borderRadius: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <div style={{ marginTop: '1rem' }}>
            <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Right Column: Order Summary ────────────────────── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal</span>
              <Price amount={subtotal} size="sm" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Islandwide Delivery</span>
              <span>
                {deliveryFee === 0 ? (
                  <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                ) : (
                  `LKR ${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            {subtotal < 10000 && (
              <div style={{ fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                Add LKR {(10000 - subtotal).toLocaleString('en-LK')} more to get <strong>Free Islandwide Delivery</strong>!
              </div>
            )}

            <div
              style={{
                borderTop: '1.5px dashed var(--color-border)',
                paddingTop: '0.75rem',
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                Estimated Total
              </span>
              <Price amount={estimatedTotal} size="lg" />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              *Final prices and delivery fees are verified securely by backend at checkout.
            </p>
          </div>

          <Link href="/checkout" style={{ width: '100%', marginTop: '0.5rem' }}>
            <Button size="lg" variant="primary" style={{ width: '100%' }} rightIcon={<ArrowRight size={18} />}>
              Proceed to Checkout
            </Button>
          </Link>

          <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--color-primary)" />
              <span>100% Genuine electronics with manufacturer warranty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={16} color="#10b981" />
              <span>Secure card payment (PayHere) or instant WhatsApp order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
