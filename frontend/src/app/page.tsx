'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

// Hero slides matching reference showcase
const HERO_SLIDES = [
  {
    tag: 'NEW ARRIVALS',
    titleLine1: 'Technology that',
    highlightWord1: 'moves',
    highlightColor1: '#38bdf8',
    highlightWord2: 'you',
    highlightColor2: '#c084fc',
    titleLine3: 'forward.',
    subtitle: 'Discover the latest smartphones, laptops, audio and smart technology at NEXORA.',
    primaryBtn: { text: 'Shop Now', href: '/shop' },
    secondaryBtn: { text: 'Explore Products', href: '/shop?category=mobile-phones' },
    image: '/hero-phones-v2.webp',
    alt: 'iPhone 15 Pro Titanium on Glowing Neon Pedestal with Swirling Light Trails',
  },
  {
    tag: 'PRO PERFORMANCE',
    titleLine1: 'Power & Precision for',
    highlightWord1: 'limitless',
    highlightColor1: '#38bdf8',
    highlightWord2: '',
    highlightColor2: '',
    titleLine3: 'creation.',
    subtitle: 'Experience next-gen Apple M3 Max silicon, ultra-high refresh OLEDs, and workstation speeds.',
    primaryBtn: { text: 'Shop Laptops', href: '/shop?category=laptops' },
    secondaryBtn: { text: 'Compare Specs', href: '/shop?category=laptops' },
    image: '/hero-laptop.webp',
    alt: 'MacBook Pro M3 Max High Performance Laptop',
  },
  {
    tag: 'STUDIO ACOUSTICS',
    titleLine1: 'Immersive sound &',
    highlightWord1: 'intelligent',
    highlightColor1: '#c084fc',
    highlightWord2: '',
    highlightColor2: '',
    titleLine3: 'tracking.',
    subtitle: 'High-fidelity lossless wireless audio, spatial soundscapes, and sapphire smart wearables.',
    primaryBtn: { text: 'Explore Audio', href: '/shop?category=audio' },
    secondaryBtn: { text: 'View Watches', href: '/shop?category=smart-watches' },
    image: '/hero-audio.webp',
    alt: 'Studio Wireless Headphones and Smart Watch',
  },
];

// Category metadata matching Image 2 with pastel backgrounds
const CATEGORY_META: Record<
  string,
  { defaultImage: string; label: string; background: string; border: string }
> = {
  'mobile-phones': {
    defaultImage: '/categories/smartphones.webp',
    label: 'Smartphones',
    background: 'linear-gradient(180deg, #d8defa 0%, #edf3fe 55%, #f6f8fd 100%)',
    border: '1px solid rgba(216, 222, 250, 0.7)',
  },
  laptops: {
    defaultImage: '/categories/laptops.webp',
    label: 'Laptops',
    background: 'linear-gradient(180deg, #cde4fd 0%, #e6f2fd 55%, #f4f9fc 100%)',
    border: '1px solid rgba(205, 228, 253, 0.7)',
  },
  tablets: {
    defaultImage: '/categories/tablets.webp',
    label: 'Tablets',
    background: 'linear-gradient(135deg, #ecd8fd 0%, #f6e6f5 50%, #fdf0ea 100%)',
    border: '1px solid rgba(236, 216, 253, 0.7)',
  },
  audio: {
    defaultImage: '/categories/audio.webp',
    label: 'Audio',
    background: 'linear-gradient(180deg, #ede7fb 0%, #f7f3fd 55%, #fbf9fe 100%)',
    border: '1px solid rgba(237, 231, 251, 0.7)',
  },
  'smart-watches': {
    defaultImage: '/categories/smart-watches.webp',
    label: 'Smart Watches',
    background: 'linear-gradient(180deg, #daf4ef 0%, #edfbf8 55%, #f7fdfb 100%)',
    border: '1px solid rgba(218, 244, 239, 0.7)',
  },
  accessories: {
    defaultImage: '/categories/accessories.webp',
    label: 'Accessories',
    background: 'linear-gradient(180deg, #e5e9f0 0%, #f0f4f8 55%, #f8fafc 100%)',
    border: '1px solid rgba(229, 233, 240, 0.7)',
  },
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Auto-rotate hero slides every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // 1. Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => storeApi.getCategories(),
  });

  // 2. Fetch featured products
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => storeApi.getFeaturedProducts(12),
  });

  // Filter products by selected pill tab
  const filterTabs = ['All', 'Smartphones', 'Laptops', 'Audio', 'Smart Watches', 'Accessories'];

  const filteredProducts = (featuredProducts || []).filter((product) => {
    if (selectedFilter === 'All') return true;
    const catSlug = product.category?.slug || '';
    if (selectedFilter === 'Smartphones') return catSlug.includes('phone');
    if (selectedFilter === 'Laptops') return catSlug.includes('laptop');
    if (selectedFilter === 'Audio') return catSlug.includes('audio');
    if (selectedFilter === 'Smart Watches') return catSlug.includes('watch');
    if (selectedFilter === 'Accessories') return catSlug.includes('accessories');
    return true;
  });

  const activeHero = HERO_SLIDES[currentSlide];

  // Standard ordered category slugs for layout consistency matching Image 1
  const standardCategorySlugs = [
    'mobile-phones',
    'laptops',
    'tablets',
    'audio',
    'smart-watches',
    'accessories',
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* ── 1. HERO SHOWCASE SECTION (MATCHING REFERENCE DESIGN) ────────────────────── */}
      <section
        style={{
          width: '100%',
          backgroundColor: '#060d1b',
          backgroundImage:
            'radial-gradient(circle at 72% 50%, rgba(37, 99, 235, 0.4) 0%, rgba(168, 85, 247, 0.22) 35%, rgba(6, 13, 27, 0.95) 75%, #060d1b 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          padding: '3.5rem 0 4.25rem',
        }}
      >
        {/* Subtle Cosmic Glow Accents */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '25%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '5%',
            width: '550px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '3rem',
            }}
          >
            {/* Left Content */}
            <div style={{ maxWidth: '600px' }}>
              {/* Category / Pill tag with accent line */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    color: '#38bdf8',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {activeHero.tag}
                </span>
                <div
                  style={{
                    width: '45px',
                    height: '1.5px',
                    backgroundColor: 'rgba(56, 189, 248, 0.45)',
                  }}
                />
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.75rem, 5.2vw, 4.25rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  marginBottom: '1.35rem',
                }}
              >
                {activeHero.titleLine1}
                <br />
                {activeHero.highlightWord1 && (
                  <span style={{ color: activeHero.highlightColor1 }}>
                    {activeHero.highlightWord1}{' '}
                  </span>
                )}
                {activeHero.highlightWord2 && (
                  <span style={{ color: activeHero.highlightColor2 }}>
                    {activeHero.highlightWord2}
                  </span>
                )}
                {activeHero.titleLine3 && (
                  <>
                    <br />
                    <span>{activeHero.titleLine3}</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  maxWidth: '480px',
                  marginBottom: '2.5rem',
                  fontWeight: 400,
                }}
              >
                {activeHero.subtitle}
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '3.25rem',
                }}
              >
                <Link href={activeHero.primaryBtn.href} style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.9rem 2.25rem',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 22px rgba(37, 99, 235, 0.55)',
                      transition: 'transform 0.18s ease, background-color 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    <span>{activeHero.primaryBtn.text}</span>
                    <ArrowRight size={18} />
                  </button>
                </Link>

                <Link href={activeHero.secondaryBtn.href} style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      color: '#ffffff',
                      padding: '0.9rem 2rem',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'background-color 0.18s ease, border-color 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                    }}
                  >
                    {activeHero.secondaryBtn.text}
                  </button>
                </Link>
              </div>

              {/* Value Proposition Row (Directly below buttons) */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.25rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={26} color="#38bdf8" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>1-Year Official Warranty</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Genuine Products</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CreditCard size={26} color="#38bdf8" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>Secure Payment</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multiple Payment Options</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Truck size={26} color="#38bdf8" strokeWidth={2.2} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>Islandwide Delivery</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fast & Reliable</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <img
                src={activeHero.image}
                alt={activeHero.alt}
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  height: 'auto',
                  maxHeight: '480px',
                  display: 'block',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Carousel Arrows on the far left and right edges */}
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
          }
          type="button"
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.6)';
            e.currentTarget.style.borderColor = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.55)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          type="button"
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.6)';
            e.currentTarget.style.borderColor = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.55)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }}
        >
          <ChevronRight size={24} />
        </button>

        {/* Pagination Dots at Bottom Center */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.35rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.45rem',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: '6px',
                width: currentSlide === idx ? '26px' : '6px',
                borderRadius: '9999px',
                backgroundColor: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── 2. SHOP BY CATEGORY (MATCHING IMAGE 1) ─────────────────────────── */}
      <section className="container-custom">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Shop by Category
          </h2>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
              transition: 'gap 0.15s ease',
            }}
          >
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            width: '100%',
          }}
        >
          {loadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="auto" borderRadius="20px" style={{ aspectRatio: '1 / 1', width: '100%' }} />
            ))
          ) : (
            standardCategorySlugs.map((slug) => {
              // Match with DB category if present
              const dbCat = categories?.find((c) => c.slug === slug || c.slug.includes(slug));
              const meta = CATEGORY_META[slug] || {
                defaultImage: '/categories/accessories.webp',
                label: dbCat?.name || slug,
              };

              // Use custom DB imageUrl if available, otherwise high-res fallback
              const catImg = dbCat?.imageUrl || meta.defaultImage;
              const catName = meta.label || dbCat?.name || slug;

              return (
                <Link
                  key={slug}
                  href={`/shop?category=${dbCat?.slug || slug}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'block',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 16px 32px -6px rgba(15, 23, 42, 0.12)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.0)';
                  }}
                >
                  {/* Category Image (Full Size 1:1 Aspect Ratio) */}
                  <img
                    src={catImg}
                    alt={catName}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== meta.defaultImage) {
                        target.src = meta.defaultImage;
                      }
                    }}
                  />

                  {/* Text & Button Overlaid Directly On The Image */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.5rem 1.15rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 60%, rgba(255, 255, 255, 0) 100%)',
                      zIndex: 2,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.0625rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: '-0.01em',
                        margin: 0,
                      }}
                    >
                      {catName}
                    </h3>

                    {/* Circular Arrow Action Icon */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        border: '1.5px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        flexShrink: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                        transition: 'background-color 0.2s ease, color 0.2s ease',
                      }}
                    >
                      <ArrowRight size={16} strokeWidth={2.2} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS (MATCHING IMAGE 1) ────────────────────────── */}
      <section className="container-custom">
        {/* Header with Title and Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Featured Products
          </h2>

          {/* Interactive Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  type="button"
                  style={{
                    padding: '0.45rem 1.1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#2563eb' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
              color: '#2563eb',
              fontSize: '0.9375rem',
              textDecoration: 'none',
            }}
          >
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            width: '100%',
          }}
        >
          {loadingFeatured ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="380px" borderRadius="18px" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                color: '#64748b',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                No products found under &quot;{selectedFilter}&quot;. Explore our complete catalog below.
              </p>
              <Link href="/shop" style={{ marginTop: '1rem', display: 'inline-block' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Browse Full Catalog
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
