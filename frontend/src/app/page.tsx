'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Cpu,
  Sparkles,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Truck,
  RotateCcw,
  Headset,
  CreditCard,
  Flame,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomePage() {
  // 1. Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => storeApi.getCategories(),
  });

  // 2. Fetch featured products
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => storeApi.getFeaturedProducts(8),
  });

  // 3. Fetch latest products
  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: () => storeApi.getProducts({ sort: 'newest', limit: 8 }),
  });

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('phone')) return <Smartphone size={24} />;
    if (slug.includes('laptop')) return <Laptop size={24} />;
    if (slug.includes('audio')) return <Headphones size={24} />;
    if (slug.includes('watch')) return <Watch size={24} />;
    return <Cpu size={24} />;
  };

  const getCategoryColor = (slug: string) => {
    if (slug.includes('phone')) return { bg: '#eff6ff', color: '#2563eb' };
    if (slug.includes('laptop')) return { bg: '#f5f3ff', color: '#7c3aed' };
    if (slug.includes('audio')) return { bg: '#fdf2f8', color: '#db2777' };
    if (slug.includes('watch')) return { bg: '#fffbeb', color: '#d97706' };
    return { bg: '#ecfdf5', color: '#059669' };
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4.5rem', paddingBottom: '4rem' }}>
      {/* ── 1. HERO SECTION ─────────────────────────────────── */}
      <section
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 45%, #172554 100%)',
          color: '#ffffff',
          padding: '5rem 1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="container-custom"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(96, 165, 250, 0.35)',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#93c5fd',
                marginBottom: '1.5rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={16} /> Official Sri Lanka Tech Launch
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              Next-Gen Tech Gadgets.
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #60a5fa 0%, #93c5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Engineered For More.
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.125rem',
                color: '#cbd5e1',
                lineHeight: 1.65,
                maxWidth: '540px',
                marginBottom: '2.25rem',
              }}
            >
              Explore flagship smartphones, Apple M3 MacBooks, studio-grade noise-cancelling audio, and genuine smart wearables with official manufacturer warranties.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/shop">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                  Explore Full Catalog
                </Button>
              </Link>
              <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="secondary"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  WhatsApp Assistant
                </Button>
              </a>
            </div>

            {/* Quick Benefits row */}
            <div
              style={{
                display: 'flex',
                gap: '2.5rem',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.85rem',
                color: '#94a3b8',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={18} color="#34d399" /> 1-Year Official Warranty
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Zap size={18} color="#fbbf24" /> Instant PayHere Gateway
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Truck size={18} color="#60a5fa" /> Islandwide Delivery
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '24px',
                padding: '2.25rem',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.2)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '260px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: '1rem',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"
                  alt="iPhone 15 Pro Max Natural Titanium"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.4s ease',
                  }}
                />
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#60a5fa',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                  }}
                >
                  FLAGSHIP HIGHLIGHT
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
                  iPhone 15 Pro Max 256GB
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                  Natural Titanium • A17 Pro 3nm • 48MP Camera
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.25rem',
                  }}
                >
                  <Link href="/product/iphone-15-pro-max-256gb">
                    <Button variant="primary" size="sm">
                      View Specifications
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BROWSE BY CATEGORY ─────────────────────────── */}
      <section className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              DEVICES & HARDWARE
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              Shop By Category
            </h2>
          </div>
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.25rem',
            width: '100%',
          }}
        >
          {loadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="130px" borderRadius="16px" />
            ))
          ) : (
            categories?.map((cat) => {
              const theme = getCategoryColor(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.5rem 1rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.85rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(37, 99, 235, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.03)';
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      backgroundColor: theme.bg,
                      color: theme.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {cat.name}
                    </h3>
                    {cat._count?.products !== undefined && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                        {cat._count.products} Products
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ──────────────────────────── */}
      <section className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ea580c', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Flame size={15} /> HAND-PICKED GEAR
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              Featured Electronics
            </h2>
          </div>
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem',
            width: '100%',
          }}
        >
          {loadingFeatured ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="360px" borderRadius="16px" />
            ))
          ) : (
            featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* ── 4. PROMOTIONAL SHOWCASE BANNER ─────────────────── */}
      <section className="container-custom">
        <div
          style={{
            width: '100%',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 80% 20%, #1e3a8a 0%, #0f172a 70%)',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'inline-block',
              }}
            >
              PRO PERFORMANCE LINE
            </span>
            <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 900, marginTop: '1rem', lineHeight: 1.15 }}>
              MacBook Pro 16" with M3 Max Silicon
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginTop: '1rem', maxWidth: '480px' }}>
              16-core CPU, 40-core GPU, up to 128GB unified memory and Liquid Retina XDR. Engineered for heavy 3D rendering and software compilation.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/product/macbook-pro-16-m3-max-space-black">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                  Explore MacBook Pro
                </Button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
              alt="MacBook Pro 16 M3 Max"
              style={{
                width: '100%',
                maxHeight: '320px',
                objectFit: 'contain',
                borderRadius: '16px',
                filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5))',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 5. LATEST PRODUCTS ─────────────────────────────── */}
      <section className="container-custom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              FRESH CATALOG
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
              New Arrivals
            </h2>
          </div>
          <Link href="/shop?sort=newest" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            See All New Items <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem',
            width: '100%',
          }}
        >
          {loadingLatest ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="360px" borderRadius="16px" />
            ))
          ) : (
            latestData?.items?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* ── 6. VALUE PROPOSITION CARDS ─────────────────────── */}
      <section className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            width: '100%',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Islandwide Delivery
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Free express door-to-door shipping on orders over LKR 10,000.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                100% Genuine Tech
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Direct authorized distributor imports with official manufacturer warranties.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#f5f3ff',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Secure Checkout
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
                PayHere Sandbox encrypted card checkout and direct WhatsApp orders.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#fffbeb',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headset size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Dedicated Support
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Live customer support and technical consultation via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
