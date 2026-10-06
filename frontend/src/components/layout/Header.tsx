'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  Phone,
  Menu,
  X,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  SlidersHorizontal,
  Loader2,
  ArrowRight,
  User,
  CreditCard,
  Truck,
  Gamepad2,
  Tag,
  Percent,
  Tablet,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { storeApi } from '@/lib/api/store';
import { Product } from '@/types';
import { formatLKR } from '@/lib/currency';

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Live Autocomplete state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((state) => state.getItemCount());
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await storeApi.getProducts({ search: trimmed, limit: 5 });
        setSearchResults(res.items || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Failed to fetch search suggestions', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectProduct = (slug: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(`/product/${slug}`);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
      {/* 1. Announcement Bar */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          fontSize: '0.8125rem',
          padding: '0.45rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="container-custom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={14} color="#60a5fa" />
            <span>Free Islandwide Express Delivery on Orders Over LKR 10,000!</span>
          </div>

          <div style={{ display: 'none', gap: '1.25rem', alignItems: 'center' }} className="sm:flex">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#10b981" /> 1-Year Official Warranty
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CreditCard size={14} color="#60a5fa" /> Secure Payments
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Truck size={14} color="#a78bfa" /> Islandwide Delivery
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div style={{ padding: '0.85rem 0' }}>
        <div
          className="container-custom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.svg"
              alt="Nexora"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>

          {/* Search Bar with Live Autocomplete Dropdown (Desktop) */}
          <div
            ref={searchContainerRef}
            style={{
              flex: 1,
              maxWidth: '650px',
              position: 'relative',
            }}
            className="hidden md:block"
          >
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search smartphones, laptops, audio, accessories (e.g., iPhone 15, M3, Sony)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowDropdown(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 3rem 0.7rem 1.1rem',
                  fontSize: '0.9375rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-secondary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  minWidth: '100%',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {isSearching && searchResults.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 size={16} className="animate-spin" color="#2563eb" />
                    <span>Searching products catalog...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span>Suggested Products</span>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem' }}>
                        {searchResults.length} matches
                      </span>
                    </div>

                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                      {searchResults.map((product) => {
                        const img =
                          product.primaryImage?.imageUrl ||
                          product.images?.[0]?.imageUrl ||
                          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300';
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product.slug)}
                            style={{
                              padding: '0.85rem 1.25rem',
                              borderBottom: '1px solid #f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {/* Product Thumbnail */}
                            <div
                              style={{
                                position: 'relative',
                                width: '56px',
                                height: '56px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1.5px solid #e2e8f0',
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
                                  padding: '4px',
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300';
                                }}
                              />
                            </div>

                            {/* Details */}
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
                                {product.name}
                              </h4>
                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  fontWeight: 500,
                                }}
                              >
                                {product.brand?.name || 'Brand'} · {product.category?.name || 'Gadgets'}
                              </p>
                            </div>

                            {/* Price & Tag */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.925rem',
                                  fontWeight: 800,
                                  color: '#2563eb',
                                  lineHeight: 1.2,
                                }}
                              >
                                {formatLKR(Number(product.price))}
                              </div>
                              {product.isFeatured && (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    marginTop: '0.25rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: '#059669',
                                    backgroundColor: '#ecfdf5',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '9999px',
                                  }}
                                >
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Call to Action */}
                    <div
                      style={{
                        padding: '0.85rem 1.25rem',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #f1f5f9',
                        textAlign: 'center',
                      }}
                    >
                      <button
                        onClick={handleSearch}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span>View all matching results for &ldquo;{searchQuery}&rdquo;</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                      No gadgets found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      Try searching by brand like Apple, Sony, or Dell, or check your spelling.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: Account, Cart, Mobile Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Account Link */}
            <Link
              href="/admin/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#334155',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
              className="hidden sm:flex"
            >
              <User size={18} color="#475569" />
              <span>Account</span>
            </Link>

            {/* Cart Drawer Trigger Button */}
            <button
              onClick={openDrawer}
              type="button"
              aria-label="Open Shopping Cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                color: '#0f172a',
                padding: '0.5rem 0.95rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                border: '1.5px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              <ShoppingCart size={19} color="#2563eb" />
              <span>Cart</span>
              {mounted && (
                <span
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle (hidden on desktop) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-only md:hidden"
              style={{
                padding: '0.5rem',
                color: 'var(--color-text-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Bar (Desktop) */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
        }}
        className="hidden md:block"
      >
        <div
          className="container-custom"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            overflowX: 'auto',
            paddingTop: '0.6rem',
            paddingBottom: '0.6rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <Link href="/shop" style={{ color: '#2563eb', fontWeight: 700, borderBottom: '2px solid #2563eb', paddingBottom: '0.2rem', textDecoration: 'none' }}>
            All Products
          </Link>
          <Link href="/shop?category=mobile-phones" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Smartphone size={15} /> Smartphones
          </Link>
          <Link href="/shop?category=laptops" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Laptop size={15} /> Laptops
          </Link>
          <Link href="/shop?category=tablets" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Tablet size={15} /> Tablets
          </Link>
          <Link href="/shop?category=audio" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Headphones size={15} /> Audio
          </Link>
          <Link href="/shop?category=smart-watches" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Watch size={15} /> Smart Watches
          </Link>
          <Link href="/shop?category=accessories" style={{ textDecoration: 'none', color: '#475569' }}>
            Accessories
          </Link>
          <Link href="/shop?category=laptops" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Gamepad2 size={15} /> Gaming
          </Link>
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#475569' }}>
            <Tag size={15} /> Brands
          </Link>
          <Link
            href="/shop?deals=true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginLeft: 'auto',
              textDecoration: 'none',
            }}
          >
            <Percent size={12} /> Deals
          </Link>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu (strictly hidden on desktop) */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--color-border)',
            padding: '1.25rem',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="mobile-only md:hidden"
        >
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-secondary)',
              }}
            />
            <button
              type="submit"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <Search size={18} color="var(--color-primary)" />
            </button>
          </form>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontWeight: 600 }}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link href="/shop?category=mobile-phones" onClick={() => setMobileMenuOpen(false)}>Smartphones</Link>
            <Link href="/shop?category=laptops" onClick={() => setMobileMenuOpen(false)}>Laptops</Link>
            <Link href="/shop?category=tablets" onClick={() => setMobileMenuOpen(false)}>Tablets</Link>
            <Link href="/shop?category=audio" onClick={() => setMobileMenuOpen(false)}>Audio & Headphones</Link>
            <Link href="/shop?category=smart-watches" onClick={() => setMobileMenuOpen(false)}>Smart Watches</Link>
            <Link href="/shop?category=accessories" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openDrawer();
              }}
              style={{
                textAlign: 'left',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Shopping Cart ({itemCount})
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
