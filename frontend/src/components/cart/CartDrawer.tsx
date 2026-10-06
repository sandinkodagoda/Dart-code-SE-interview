'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart.store';
import { formatLKR } from '@/lib/currency';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 10000;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getItemCount,
    getSubtotal,
    getDeliveryFee,
    getEstimatedTotal,
  } = useCartStore();

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getEstimatedTotal();

  // Progress toward free shipping
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const textLines = [
      '👋 Hello Nexora! I would like to order the following items from my cart:',
      '',
      ...items.map(
        (item) =>
          `• ${item.product.name} (x${item.quantity}) - ${formatLKR(
            Number(item.product.price) * item.quantity,
          )}`,
      ),
      '',
      `Subtotal: ${formatLKR(subtotal)}`,
      `Delivery: ${deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}`,
      `Total: ${formatLKR(total)}`,
      '',
      'Please confirm availability and dispatch schedule!',
    ];
    const encoded = encodeURIComponent(textLines.join('\n'));
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94711093799';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* 1. Backdrop Overlay */}
      <div
        onClick={closeDrawer}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* 2. Slide-Over Panel Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          width: '100vw',
          maxWidth: '480px',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* ── TOP SECTION: Header & Free Shipping Bar ───────── */}
          <div>
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    Shopping Cart
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                  </span>
                </div>
              </div>

              <button
                onClick={closeDrawer}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                aria-label="Close cart drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Alert & Progress Meter */}
            <div
              style={{
                padding: '0.85rem 1.5rem',
                backgroundColor: subtotal >= FREE_SHIPPING_THRESHOLD ? '#ecfdf5' : '#eff6ff',
                borderBottom: `1px solid ${
                  subtotal >= FREE_SHIPPING_THRESHOLD ? '#bbf7d0' : '#dbeafe'
                }`,
              }}
            >
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#065f46',
                  }}
                >
                  <Truck size={17} color="#059669" />
                  <span>
                    🎉 You unlocked <strong>FREE Express Delivery</strong> nationwide!
                  </span>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#1e3a8a',
                      fontWeight: 600,
                      marginBottom: '0.45rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Truck size={15} color="#2563eb" />
                      Add <strong style={{ color: '#2563eb' }}>{formatLKR(amountNeeded)}</strong> more
                      for <strong>FREE Delivery</strong>
                    </span>
                    <span style={{ fontWeight: 800, color: '#2563eb' }}>{shippingProgress}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${shippingProgress}%`,
                        height: '100%',
                        backgroundColor: '#2563eb',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MIDDLE SECTION: Cart Items List ──────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {items.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '3rem 1rem',
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '20px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <ShoppingBag size={36} />
                </div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.35rem',
                  }}
                >
                  Your cart is empty
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginBottom: '1.5rem',
                    maxWidth: '260px',
                  }}
                >
                  Explore our latest flagship smartphones, laptops, and gadgets!
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/shop');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product;
                const img =
                  product.primaryImage?.imageUrl ||
                  product.images?.[0]?.imageUrl ||
                  FALLBACK_IMG;

                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '0.85rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #f1f5f9',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        position: 'relative',
                        width: '72px',
                        height: '72px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '0.35rem',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMG;
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          lineHeight: 1.35,
                          marginBottom: '0.2rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeDrawer}
                          style={{ color: '#0f172a', textDecoration: 'none' }}
                        >
                          {product.name}
                        </Link>
                      </h4>

                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginBottom: '0.65rem',
                          fontWeight: 500,
                        }}
                      >
                        {product.brand?.name || 'Brand'} · {product.category?.name || 'Gadgets'}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        {/* Stepper */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span
                            style={{
                              padding: '0 0.5rem',
                              fontSize: '0.8125rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              minWidth: '22px',
                              textAlign: 'center',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price */}
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 800,
                            color: '#0f172a',
                          }}
                        >
                          {formatLKR(Number(product.price) * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => removeItem(product.id)}
                      style={{
                        padding: '0.45rem',
                        color: '#94a3b8',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'color 0.15s ease',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      aria-label="Remove item"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ── BOTTOM SECTION: Checkout Summary & Actions ──── */}
          {items.length > 0 && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1.5px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Financial Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}
                >
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatLKR(subtotal)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}
                >
                  <span>Islandwide Delivery</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: deliveryFee === 0 ? '#059669' : '#0f172a',
                    }}
                  >
                    {deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>
                    {formatLKR(total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                >
                  <MessageSquare size={16} />
                  <span>Order via WhatsApp</span>
                </button>
              </div>

              {/* Footer Links & Guarantee */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.25rem',
                }}
              >
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  View Full Cart Page →
                </Link>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                  }}
                >
                  <ShieldCheck size={14} color="#059669" />
                  <span>SSL Secured & Guaranteed</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
