'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>⚡ FLASH OFFER:</span>
            <span>Free Islandwide Express Delivery on Orders Over LKR 10,000!</span>
          </div>

          <div style={{ display: 'none', gap: '1.25rem', alignItems: 'center' }} className="sm:flex">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#10b981" /> Official Manufacturer Warranty
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} color="#60a5fa" /> WhatsApp: +94 77 123 4567
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
              gap: '0.5rem',
              fontWeight: 800,
              fontSize: '1.45rem',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              TG
            </div>
            <span>
              Tech<span style={{ color: 'var(--color-primary)' }}>Gadgets</span>
            </span>
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
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                {isSearching && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    Searching products...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>PRODUCTS SUGGESTIONS</span>
                      <span>{searchResults.length} matches</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {searchResults.map((product) => {
                        const img =
                          product.images?.[0] ||
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product.slug)}
                            className="p-3 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition"
                          >
                            <div className="relative w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
                              <Image
                                src={img}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {product.brand?.name || 'Brand'} · {product.category?.name || 'Category'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-blue-600">
                                {formatLKR(Number(product.price))}
                              </div>
                              {product.isFeatured && (
                                <span className="inline-block text-[10px] text-emerald-600 font-semibold">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={handleSearch}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
                      >
                        <span>View all results for &quot;{searchQuery}&quot;</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">
                      No products found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-slate-400">
                      Try checking spelling or search by brand like Apple, Sony, Dell.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: Shop, Cart, Mobile Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/shop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--color-text-secondary)',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
              }}
            >
              <SlidersHorizontal size={18} />
              <span>Catalog</span>
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
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ShoppingCart size={20} color="var(--color-primary)" />
              <span>Cart</span>
              {mounted && itemCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                padding: '0.5rem',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
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
            gap: '2rem',
            overflowX: 'auto',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          <Link href="/shop" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            All Products
          </Link>
          <Link href="/shop?category=mobile-phones" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Smartphone size={15} /> Smartphones
          </Link>
          <Link href="/shop?category=laptops" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Laptop size={15} /> Laptops
          </Link>
          <Link href="/shop?category=tablets">Tablets</Link>
          <Link href="/shop?category=audio" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Headphones size={15} /> Audio
          </Link>
          <Link href="/shop?category=smart-watches" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Watch size={15} /> Smart Watches
          </Link>
          <Link href="/shop?category=accessories">Accessories</Link>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--color-border)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="md:hidden"
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
