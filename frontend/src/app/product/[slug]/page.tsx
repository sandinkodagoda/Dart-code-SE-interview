'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Check,
  ChevronRight,
  ChevronLeft,
  Phone,
  PackageCheck,
  AlertTriangle,
  Star,
  Camera,
  Battery,
  Cpu,
  Smartphone,
  Share2,
  Heart,
  CreditCard,
  Zap,
  Info,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { useCartStore } from '@/stores/cart.store';
import { formatLKR } from '@/lib/currency';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'shipping'>('specs');
  const [selectedStorage, setSelectedStorage] = useState('512GB');
  const [selectedColor, setSelectedColor] = useState('Titanium Black');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  // 1. Fetch product by slug
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => storeApi.getProductBySlug(slug),
    enabled: Boolean(slug),
  });

  // 2. Fetch related products from category
  const { data: relatedData } = useQuery({
    queryKey: ['products', 'related', product?.category?.slug],
    queryFn: () => storeApi.getProducts({ category: product?.category?.slug, limit: 4 }),
    enabled: Boolean(product?.category?.slug),
  });

  if (isLoading) {
    return (
      <div className="container-custom animate-fade-in" style={{ padding: '3rem 1.25rem' }}>
        <div className="product-hero-grid">
          <div>
            <Skeleton height="460px" borderRadius="24px" />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} width="80px" height="80px" borderRadius="14px" />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Skeleton height="28px" width="30%" />
            <Skeleton height="42px" width="85%" />
            <Skeleton height="24px" width="40%" />
            <Skeleton height="90px" borderRadius="16px" />
            <Skeleton height="50px" borderRadius="12px" />
            <Skeleton height="120px" borderRadius="16px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom animate-fade-in" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Product Not Found
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          The requested electronic device could not be found or is currently unavailable.
        </p>
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.primaryImage
      ? [product.primaryImage]
      : [];

  // Supplemental angles for rich interactive gallery if only 1 image exists in database
  const displayGallery =
    galleryImages.length > 1
      ? galleryImages
      : galleryImages.length === 1
      ? [
          galleryImages[0],
          {
            id: 'angle-back',
            imageUrl:
              'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
            altText: `${product.name} Rear Angle`,
          },
          {
            id: 'angle-side',
            imageUrl:
              'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
            altText: `${product.name} Profile View`,
          },
          {
            id: 'angle-detail',
            imageUrl:
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
            altText: `${product.name} Studio View`,
          },
        ]
      : [];

  const activeImage =
    displayGallery[selectedImgIndex]?.imageUrl ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const currentPrice = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : null;
  const savingsAmount =
    compareAtPrice && compareAtPrice > currentPrice ? compareAtPrice - currentPrice : 0;

  const installmentAmount = Math.round(currentPrice / 3);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    router.push('/checkout');
  };

  const scrollThumbnails = (dir: 'left' | 'right') => {
    if (thumbScrollRef.current) {
      thumbScrollRef.current.scrollBy({
        left: dir === 'left' ? -180 : 180,
        behavior: 'smooth',
      });
    }
  };

  // Helper to extract clean concise specs for quick badges
  const getConciseSpec = (val: string, fallback: string) => {
    if (!val) return fallback;
    if (val.length > 20) {
      const parts = val.split(/[+,;•]/);
      if (parts[0] && parts[0].trim().length <= 20) return parts[0].trim();
      return val.slice(0, 18) + '...';
    }
    return val;
  };

  // Extract quick specifications
  const specs = (product.specifications || {}) as Record<string, any>;
  const quickCamera = specs.Camera || specs.camera || '200MP Quad';
  const quickBattery = specs.Battery || specs.battery || '5000 mAh';
  const quickChip = specs.Chip || specs.chip || specs.Processor || specs.processor || 'Snapdragon 8 Gen 3';
  const quickDisplay = specs.Display || specs.display || '6.8" AMOLED 2X';

  const colorSwatches = [
    { name: 'Titanium Black', color: '#1e293b' },
    { name: 'Titanium Gray', color: '#64748b' },
    { name: 'Titanium Violet', color: '#8b5cf6' },
    { name: 'Titanium Yellow', color: '#fef08a' },
  ];

  const storageOptions = ['256GB', '512GB', '1TB'];

  return (
    <div className="container-custom animate-fade-in" style={{ padding: '2rem 1.25rem 5rem' }}>
      {/* ── 1. BREADCRUMBS ─────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.85rem',
          color: '#64748b',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>
          Home
        </Link>
        <ChevronRight size={14} color="#94a3b8" />
        <Link href="/shop" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <Link
              href={`/shop?category=${product.category.slug}`}
              style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} color="#94a3b8" />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* ── 2. MAIN PRODUCT HERO: 2-COLUMN SPLIT LAYOUT ──────────────── */}
      <div className="product-hero-grid" style={{ marginBottom: '4.5rem' }}>
        {/* ── LEFT COLUMN: PRODUCT GALLERY & QUICK SPECS ──────────────── */}
        <div>
          {/* Main Photo Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              padding: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '460px',
              position: 'relative',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
            }}
          >
            <img
              src={activeImage}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                transition: 'transform 0.35s ease',
              }}
            />

            {/* Badges on Top Left */}
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.isFeatured && (
                <Badge variant="primary" style={{ fontWeight: 700, padding: '0.35rem 0.75rem' }}>
                  Featured
                </Badge>
              )}
              {discountPercent && (
                <span
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.02em',
                  }}
                >
                  -{discountPercent}% OFF
                </span>
              )}
              {isOutOfStock ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="warning">Only {product.stockQuantity} Left</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>

            {/* Wishlist Button Top Right */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              type="button"
              aria-label="Wishlist"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              <Heart size={18} color={isWishlisted ? '#ef4444' : '#64748b'} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Thumbnail Carousel Row */}
          {displayGallery.length > 1 && (
            <div style={{ position: 'relative', marginTop: '1.25rem', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => scrollThumbnails('left')}
                type="button"
                aria-label="Previous image"
                style={{
                  position: 'absolute',
                  left: '-14px',
                  zIndex: 2,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronLeft size={16} color="#0f172a" />
              </button>

              <div
                ref={thumbScrollRef}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  overflowX: 'auto',
                  padding: '0.25rem 0.5rem',
                  scrollBehavior: 'smooth',
                  width: '100%',
                }}
              >
                {displayGallery.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    style={{
                      width: '82px',
                      height: '82px',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      border: `2px solid ${selectedImgIndex === idx ? '#2563eb' : '#e2e8f0'}`,
                      padding: '0.5rem',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedImgIndex === idx ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: selectedImgIndex === idx ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollThumbnails('right')}
                type="button"
                aria-label="Next image"
                style={{
                  position: 'absolute',
                  right: '-14px',
                  zIndex: 2,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronRight size={16} color="#0f172a" />
              </button>
            </div>
          )}

          {/* Quick Specs Highlight Bar (Underneath Gallery) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem 0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={22} color="#0f172a" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                {getConciseSpec(quickCamera, '200MP')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                Camera
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem 0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Battery size={22} color="#0f172a" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                {getConciseSpec(quickBattery, '5000mAh')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                Battery
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem 0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={22} color="#0f172a" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                {getConciseSpec(quickChip, 'Snapdragon 8')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                Processor
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem 0.5rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={22} color="#0f172a" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                {getConciseSpec(quickDisplay, '6.8" AMOLED')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                Display
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: STICKY PURCHASING BUY BOX ──────────────── */}
        <div style={{ position: 'sticky', top: '90px' }}>
          {/* Brand Chip & SKU */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {product.brand?.name || 'GENUINE'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              SKU: {product.sku}
            </span>
          </div>

          {/* Product Title */}
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.22,
              marginBottom: '0.85rem',
              letterSpacing: '-0.02em',
            }}
          >
            {product.name}
          </h1>

          {/* Rating, Reviews & Stock Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="#eab308" color="#eab308" />
              ))}
              <span style={{ fontWeight: 800, color: '#0f172a', marginLeft: '0.25rem', fontSize: '0.9rem' }}>4.9</span>
            </div>
            <span style={{ color: '#94a3b8' }}>•</span>
            <a href="#reviews" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              128 reviews
            </a>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              ✓ Verified Genuine
            </span>
          </div>

          {/* Pricing Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
              padding: '1.35rem 1.6rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {formatLKR(currentPrice)}
              </span>
              {compareAtPrice && compareAtPrice > currentPrice && (
                <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                  {formatLKR(compareAtPrice)}
                </span>
              )}
              {discountPercent && (
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.01em',
                  }}
                >
                  -{discountPercent}% off
                </span>
              )}
            </div>

            {/* Installment note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.85rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.825rem',
                color: '#475569',
              }}
            >
              <CreditCard size={16} color="#2563eb" />
              <span>
                Or 3 interest-free installments of <strong>{formatLKR(installmentAmount)}</strong> with Koko / Mintpay
              </span>
            </div>
          </div>

          {/* Color Variant Swatches */}
          <div style={{ marginBottom: '1.35rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
              Color: <span style={{ fontWeight: 500, color: '#475569' }}>{selectedColor}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {colorSwatches.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedColor(item.name)}
                  type="button"
                  title={item.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    border: selectedColor === item.name ? '3px solid #ffffff' : '2px solid transparent',
                    outline: selectedColor === item.name ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Storage Variant Selectors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
              Storage Capacity: <span style={{ fontWeight: 500, color: '#475569' }}>{selectedStorage}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {storageOptions.map((cap) => (
                <button
                  key={cap}
                  onClick={() => setSelectedStorage(cap)}
                  type="button"
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: selectedStorage === cap ? '#0f172a' : '#ffffff',
                    color: selectedStorage === cap ? '#ffffff' : '#334155',
                    border: `1.5px solid ${selectedStorage === cap ? '#0f172a' : '#e2e8f0'}`,
                  }}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Notification */}
          <div style={{ marginBottom: '1.75rem' }}>
            {isOutOfStock ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} />
                <span>Currently Out of Stock — Inquire via WhatsApp for restocking</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#059669', fontWeight: 600, fontSize: '0.875rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>In Stock • Ready for dispatch from Colombo central facility</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
            {/* Stepper + Add to Cart Row */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              {/* Quantity Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  padding: '0.2rem',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  type="button"
                  style={{
                    width: '38px',
                    height: '38px',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={isOutOfStock || quantity >= product.stockQuantity}
                  type="button"
                  style={{
                    width: '38px',
                    height: '38px',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  background: added ? '#10b981' : isOutOfStock ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  borderRadius: '14px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  boxShadow: isOutOfStock ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.35)',
                  transition: 'all 0.2s ease',
                  padding: '0.85rem 1.5rem',
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock && !added) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock && !added) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                <span>{added ? 'Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                borderRadius: '14px',
                padding: '0.85rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isOutOfStock) {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOutOfStock) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
            >
              Buy Now
            </button>

            {/* Direct WhatsApp Quick Chat */}
            <a
              href={`https://wa.me/94711093799?text=${encodeURIComponent(
                `Hi Nexora, I'm interested in purchasing: ${product.name} (SKU: ${product.sku}) priced at LKR ${Number(
                  product.price
                ).toLocaleString('en-LK')}`
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.85rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
              >
                <Phone size={18} fill="#ffffff" color="#ffffff" />
                <span>Inquire on WhatsApp</span>
              </button>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.1rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={24} color="#2563eb" />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.85rem' }}>
                  {product.warranty || '1 Year Official Warranty'}
                </strong>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Genuine manufacturer guarantee</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Truck size={24} color="#10b981" />
              <div>
                <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.85rem' }}>
                  Islandwide Delivery
                </strong>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>1-3 business days express</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BELOW THE FOLD: TABBED PRODUCT INFORMATION ───────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          marginBottom: '4.5rem',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('specs')}
            type="button"
            style={{
              padding: '1.25rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              border: 'none',
              background: 'none',
              color: activeTab === 'specs' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'specs' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Technical Specifications
          </button>

          <button
            onClick={() => setActiveTab('description')}
            type="button"
            style={{
              padding: '1.25rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              border: 'none',
              background: 'none',
              color: activeTab === 'description' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'description' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Product Overview
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            type="button"
            style={{
              padding: '1.25rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              border: 'none',
              background: 'none',
              color: activeTab === 'shipping' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'shipping' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Warranty & Delivery
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '2.5rem' }}>
          {activeTab === 'specs' && (
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Full Technical Specifications
              </h3>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Standard manufacturer electronics specifications apply.</p>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                About the {product.name}
              </h3>
              <p style={{ fontSize: '1.025rem', lineHeight: 1.8, color: '#334155', maxWidth: '850px' }}>
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#2563eb" /> Genuine Warranty Policy
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                  All items sold on Nexora are 100% brand new, authentic, and backed by manufacturer warranty. Warranty claims can be initiated through our contact support or authorized service centers.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={20} color="#10b981" /> Express Islandwide Delivery
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                  Colombo & suburbs enjoy Next-Day delivery on orders placed before 3:00 PM. Outstation deliveries typically arrive within 2–3 business days via verified logistics partners.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. RELATED PRODUCTS ────────────────────────────── */}
      {relatedData?.items && relatedData.items.filter((p) => p.id !== product.id).length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Similar Devices
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0' }}>
                Related {product.category?.name || 'Products'}
              </h2>
            </div>
            <Link
              href={product.category ? `/shop?category=${product.category.slug}` : '/shop'}
              style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {relatedData.items
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
