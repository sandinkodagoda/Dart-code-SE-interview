'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Check,
  ChevronRight,
  Phone,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { useCartStore } from '@/stores/cart.store';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
      <div className="container-custom" style={{ padding: '3rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="md:grid-cols-2">
          <Skeleton height="450px" borderRadius="16px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Skeleton height="32px" width="70%" />
            <Skeleton height="24px" width="40%" />
            <Skeleton height="40px" width="50%" />
            <Skeleton height="120px" />
            <Skeleton height="50px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Product Not Found
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          The requested electronic item could not be found or is currently inactive.
        </p>
        <Link href="/shop">
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

  const activeImage =
    galleryImages[selectedImgIndex]?.imageUrl ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-custom" style={{ padding: '2rem 1.25rem 5rem' }}>
      {/* ── 1. BREADCRUMBS ─────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: 'var(--color-text-secondary)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop" style={{ color: 'var(--color-text-secondary)' }}>Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link href={`/shop?category=${product.category.slug}`} style={{ color: 'var(--color-text-secondary)' }}>
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* ── 2. PRODUCT HERO: GALLERY & DETAILS ──────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3.5rem',
          alignItems: 'start',
          marginBottom: '4.5rem',
        }}
        className="lg:grid-cols-2"
      >
        {/* Left: Image Gallery */}
        <div>
          {/* Main Hero Photo */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              padding: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '440px',
              position: 'relative',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <img
              src={activeImage}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
              }}
            />

            {/* Badges */}
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              {product.isFeatured && <Badge variant="primary">Featured</Badge>}
              {isOutOfStock ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="warning">Only {product.stockQuantity} Left</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>
          </div>

          {/* Thumbnails row */}
          {galleryImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: `2px solid ${selectedImgIndex === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    padding: '0.5rem',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
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
          )}
        </div>

        {/* Right: Product Buy Box & Specs */}
        <div>
          {/* Brand & SKU */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand?.name}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              SKU: {product.sku}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.25, marginBottom: '1.25rem' }}>
            {product.name}
          </h1>

          {/* Price Box */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            <Price
              amount={Number(product.price)}
              compareAtAmount={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              size="xl"
            />
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              Price includes all applicable local taxes. Cash on delivery & online card accepted.
            </p>
          </div>

          {/* Stock Status Notification */}
          <div style={{ marginBottom: '1.75rem' }}>
            {isOutOfStock ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} />
                <span>Currently Out of Stock — Check back soon or inquire via WhatsApp</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                <PackageCheck size={18} />
                <span>Ready for Dispatch • {product.stockQuantity} units in Colombo warehouse</span>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Quantity Selector */}
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
                style={{ padding: '0.625rem 0.85rem', fontSize: '1.1rem', fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ padding: '0 0.85rem', fontWeight: 700, minWidth: '35px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={isOutOfStock || quantity >= product.stockQuantity}
                style={{ padding: '0.625rem 0.85rem', fontSize: '1.1rem', fontWeight: 700 }}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              variant={added ? 'success' : 'primary'}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              leftIcon={added ? <Check size={20} /> : <ShoppingCart size={20} />}
              style={{ flex: 1, minWidth: '180px' }}
            >
              {added ? 'Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Direct WhatsApp Quick Buy */}
            <a
              href={`https://wa.me/94771234567?text=${encodeURIComponent(`Hi TechGadgets, I want to inquire about purchasing: ${product.name} (SKU: ${product.sku}) priced at LKR ${Number(product.price).toLocaleString('en-LK')}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<Phone size={18} color="#22c55e" />}
              >
                Inquire on WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--color-surface-secondary)',
              borderRadius: '12px',
              padding: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--color-primary)" />
              <div>
                <strong>{product.warranty || '1 Year Official Warranty'}</strong>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Original brand guarantee</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="#10b981" />
              <div>
                <strong>Fast Express Delivery</strong>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>1-3 business days islandwide</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. SPECIFICATIONS & DESCRIPTION ───────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
          marginBottom: '4rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Technical Specifications
        </h2>

        {product.specifications && Object.keys(product.specifications).length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            {Object.entries(product.specifications).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-light)',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'right' }}>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Standard electronics specifications apply.
          </p>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          Product Description
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
          {product.description}
        </p>
      </div>

      {/* ── 4. RELATED PRODUCTS ────────────────────────────── */}
      {relatedData?.items && relatedData.items.filter((p) => p.id !== product.id).length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
            Related {product.category?.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
