'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Shield, Sparkles, Heart } from 'lucide-react';
import { Product } from '@/types';
import { Price } from '../ui/Price';
import { Badge } from '../ui/Badge';
import { useCartStore } from '@/stores/cart.store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const fallbackImage = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600';
  const primaryImg =
    product.primaryImage?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    fallbackImage;

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity <= 0;

  const discountPercent =
    product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
      ? Math.round(
          ((Number(product.compareAtPrice) - Number(product.price)) /
            Number(product.compareAtPrice)) *
            100,
        )
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1, true); // Opens cart drawer
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* 1. Image Thumbnail Container */}
      <Link
        href={`/product/${product.slug}`}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          background: 'radial-gradient(circle at center, #ffffff 40%, #f8fafc 100%)',
          display: 'block',
          overflow: 'hidden',
          borderBottom: '1px solid #f1f5f9',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            width: 'calc(100% - 1.5rem)',
            height: 'calc(100% - 1.5rem)',
            objectFit: 'contain',
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Badges Overlay (Top-Left) */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            zIndex: 2,
          }}
        >
          {discountPercent && discountPercent > 0 && (
            <span
              style={{
                backgroundColor: '#f43f5e',
                color: '#ffffff',
                fontSize: '0.725rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                boxShadow: '0 2px 6px rgba(244, 63, 94, 0.35)',
              }}
            >
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.675rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Heart & Stock Status */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.35rem',
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            type="button"
            aria-label="Save to Wishlist"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isWishlisted ? '#f43f5e' : '#94a3b8',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
            }}
          >
            <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} />
          </button>

          {isOutOfStock ? (
            <span
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '0.675rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '9999px',
              }}
            >
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              Only {product.stockQuantity} Left
            </span>
          ) : (
            <span
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              In-stock
            </span>
          )}
        </div>
      </Link>

      {/* 2. Product Details */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Brand & Category Micro-Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.45rem',
              fontSize: '0.75rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            <span>{product.brand?.name || 'Nexora'}</span>
            <span style={{ color: '#94a3b8' }}>{product.category?.name}</span>
          </div>

          {/* Product Title (2-line clamped with stable height) */}
          <Link
            href={`/product/${product.slug}`}
            style={{
              fontWeight: 700,
              fontSize: '0.975rem',
              color: '#0f172a',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.75rem',
              marginBottom: '0.45rem',
              textDecoration: 'none',
            }}
          >
            {product.name}
          </Link>

          {/* Star Rating snippet */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#eab308',
              marginBottom: '0.5rem',
            }}
          >
            <span>★★★★★</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem', marginLeft: '0.25rem' }}>
              (4.9)
            </span>
          </div>

          {/* Warranty Callout */}
          {product.warranty && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: '#059669',
                marginBottom: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Shield size={13} />
              <span>{product.warranty}</span>
            </div>
          )}
        </div>

        {/* 3. Footer: Price & Add to Cart Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.85rem',
            marginTop: '0.5rem',
          }}
        >
          <div>
            <Price
              amount={Number(product.price)}
              compareAtAmount={product.compareAtPrice ? Number(product.compareAtPrice) : null}
              size="md"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Item is out of stock' : 'Add to Shopping Cart'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: isOutOfStock
                ? '#e2e8f0'
                : added
                ? '#10b981'
                : '#2563eb',
              color: isOutOfStock ? '#94a3b8' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              boxShadow: isOutOfStock ? 'none' : '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
