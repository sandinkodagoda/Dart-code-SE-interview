'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  X,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  RotateCcw,
} from 'lucide-react';
import { storeApi } from '@/lib/api/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramBrand = searchParams.get('brand') || '';
  const paramSort = (searchParams.get('sort') as any) || 'newest';
  const paramInStock = searchParams.get('inStock') === 'true';
  const paramMinPrice = searchParams.get('minPrice') || '';
  const paramMaxPrice = searchParams.get('maxPrice') || '';
  const paramPage = parseInt(searchParams.get('page') || '1', 10);

  // Local filter states
  const [searchInput, setSearchInput] = useState(paramSearch);
  const [minPriceInput, setMinPriceInput] = useState(paramMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(paramMaxPrice);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    setSearchInput(paramSearch);
    setMinPriceInput(paramMinPrice);
    setMaxPriceInput(paramMaxPrice);
  }, [paramSearch, paramMinPrice, paramMaxPrice]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter change if not changing page
    if (!('page' in newParams)) {
      params.delete('page');
    }
    router.push(`/shop?${params.toString()}`);
  };

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => storeApi.getCategories(),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => storeApi.getBrands(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'products',
      {
        search: paramSearch,
        category: paramCategory,
        brand: paramBrand,
        sort: paramSort,
        inStock: paramInStock,
        minPrice: paramMinPrice ? Number(paramMinPrice) : undefined,
        maxPrice: paramMaxPrice ? Number(paramMaxPrice) : undefined,
        page: paramPage,
      },
    ],
    queryFn: () =>
      storeApi.getProducts({
        search: paramSearch || undefined,
        category: paramCategory || undefined,
        brand: paramBrand || undefined,
        sort: paramSort,
        inStock: paramInStock || undefined,
        minPrice: paramMinPrice ? Number(paramMinPrice) : undefined,
        maxPrice: paramMaxPrice ? Number(paramMaxPrice) : undefined,
        page: paramPage,
        limit: 12,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput ? minPriceInput : null,
      maxPrice: maxPriceInput ? maxPriceInput : null,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(
    paramSearch ||
      paramCategory ||
      paramBrand ||
      paramInStock ||
      paramMinPrice ||
      paramMaxPrice ||
      paramSort !== 'newest',
  );

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      {/* ── Top Bar: Title & Sort Toolbar ─────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Electronics & Gadgets Catalog
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            {productsData?.pagination?.total !== undefined
              ? `Showing ${productsData.items.length} of ${productsData.pagination.total} genuine tech products`
              : 'Explore flagship laptops, smartphones, audio, and accessories'}
          </p>
        </div>

        {/* Toolbar: Sort & Mobile Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <Filter size={15} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            )}
          </button>

          <div style={{ width: '200px' }}>
            <Select
              value={paramSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              options={[
                { value: 'newest', label: 'Sort: Newest Arrivals' },
                { value: 'price-asc', label: 'Price: Low → High' },
                { value: 'price-desc', label: 'Price: High → Low' },
                { value: 'name-asc', label: 'Name: A → Z' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Active Filter Pills Bar ────────────────────────── */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
            Active:
          </span>

          {paramSearch && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Search: &ldquo;{paramSearch}&rdquo;
              <X
                size={13}
                style={{ cursor: 'pointer' }}
                onClick={() => updateFilters({ search: null })}
              />
            </span>
          )}

          {paramCategory && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Category: {paramCategory}
              <X
                size={13}
                style={{ cursor: 'pointer' }}
                onClick={() => updateFilters({ category: null })}
              />
            </span>
          )}

          {paramBrand && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Brand: {paramBrand}
              <X
                size={13}
                style={{ cursor: 'pointer' }}
                onClick={() => updateFilters({ brand: null })}
              />
            </span>
          )}

          {(paramMinPrice || paramMaxPrice) && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Price: {paramMinPrice ? `LKR ${paramMinPrice}` : '0'} - {paramMaxPrice ? `LKR ${paramMaxPrice}` : 'Max'}
              <X
                size={13}
                style={{ cursor: 'pointer' }}
                onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
              />
            </span>
          )}

          {paramInStock && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              In Stock Only
              <X
                size={13}
                style={{ cursor: 'pointer' }}
                onClick={() => updateFilters({ inStock: null })}
              />
            </span>
          )}

          <button
            onClick={clearAllFilters}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#ef4444',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* ── Two-Column Desktop Grid Layout ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        
        {/* ── Left Sidebar (Sticky Desktop Filters Card) ────── */}
        <aside
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
          className="hidden lg:flex"
        >
          
          {/* 1. Search Filter Box */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Search size={14} color="#2563eb" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
                Search Catalog
              </span>
            </div>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Product, model, SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 2.2rem 0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                aria-label="Search"
              >
                <Search size={14} color="#94a3b8" />
              </button>
            </form>
          </div>

          {/* 2. Categories Filter */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
                Categories
              </span>
              {paramCategory && (
                <button
                  onClick={() => updateFilters({ category: null })}
                  style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '220px', overflowY: 'auto' }}>
              <button
                onClick={() => updateFilters({ category: null })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: !paramCategory ? 700 : 500,
                  backgroundColor: !paramCategory ? '#eff6ff' : 'transparent',
                  color: !paramCategory ? '#2563eb' : '#475569',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>All Categories</span>
              </button>
              {categories?.map((cat) => {
                const isActive = paramCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters({ category: cat.slug })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : '#475569',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                    {cat._count?.products !== undefined && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                          color: isActive ? '#1d4ed8' : '#94a3b8',
                          marginLeft: '0.5rem',
                        }}
                      >
                        {cat._count.products}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Brands Filter */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
                Brands
              </span>
              {paramBrand && (
                <button
                  onClick={() => updateFilters({ brand: null })}
                  style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '200px', overflowY: 'auto' }}>
              <button
                onClick={() => updateFilters({ brand: null })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: !paramBrand ? 700 : 500,
                  backgroundColor: !paramBrand ? '#eff6ff' : 'transparent',
                  color: !paramBrand ? '#2563eb' : '#475569',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>All Brands</span>
              </button>
              {brands?.map((b) => {
                const isActive = paramBrand === b.slug;
                return (
                  <button
                    key={b.id}
                    onClick={() => updateFilters({ brand: b.slug })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : '#475569',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.name}
                    </span>
                    {b._count?.products !== undefined && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                          color: isActive ? '#1d4ed8' : '#94a3b8',
                          marginLeft: '0.5rem',
                        }}
                      >
                        {b._count.products}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Price Range Filter */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', display: 'block', marginBottom: '0.65rem' }}>
              Price Range (LKR)
            </span>
            <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Min</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.8125rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Max</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.8125rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                }}
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* 5. In-Stock Availability */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={paramInStock}
                onChange={(e) =>
                  updateFilters({ inStock: e.target.checked ? 'true' : null })
                }
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button
                onClick={clearAllFilters}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </aside>

        {/* ── Right Content: Product Grid & Pagination ───────── */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height="360px" borderRadius="16px" />
              ))}
            </div>
          ) : !productsData?.items || productsData.items.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1.5px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
              <EmptyState
                icon={<PackageOpen size={48} />}
                title="No Products Found"
                description="No electronics matched your active filter criteria. Try adjusting the price, brand, or search terms."
                actionLabel="Reset All Filters"
                onAction={clearAllFilters}
              />
            </div>
          ) : (
            <>
              {/* Responsive Product Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {productsData.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Server-side Pagination */}
              {productsData.pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginTop: '3.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paramPage <= 1}
                    onClick={() => updateFilters({ page: String(paramPage - 1) })}
                    leftIcon={<ChevronLeft size={16} />}
                  >
                    Previous
                  </Button>

                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', padding: '0.35rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                    Page {productsData.pagination.page} of {productsData.pagination.totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={paramPage >= productsData.pagination.totalPages}
                    onClick={() => updateFilters({ page: String(paramPage + 1) })}
                    rightIcon={<ChevronRight size={16} />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* ── Mobile Filters Drawer ─────────────────────────── */}
      {mobileFiltersOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, overflow: 'hidden' }} className="lg:hidden">
          <div
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div style={{ position: 'fixed', inset: '0 0 0 auto', maxWidth: '100%', display: 'flex', paddingLeft: '2.5rem' }}>
            <div style={{ width: '100vw', maxWidth: '320px', backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={16} color="#2563eb" />
                    <span>Filter Products</span>
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    style={{ padding: '0.25rem', borderRadius: '9999px', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                    Categories
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '160px', overflowY: 'auto' }}>
                    <button
                      onClick={() => {
                        updateFilters({ category: null });
                        setMobileFiltersOpen(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', padding: '0.35rem 0', color: !paramCategory ? '#2563eb' : '#475569', fontWeight: !paramCategory ? 700 : 500, border: 'none', background: 'none' }}
                    >
                      All Categories
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          updateFilters({ category: cat.slug });
                          setMobileFiltersOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', padding: '0.35rem 0', display: 'flex', justifyContent: 'space-between', color: paramCategory === cat.slug ? '#2563eb' : '#475569', fontWeight: paramCategory === cat.slug ? 700 : 500, border: 'none', background: 'none' }}
                      >
                        <span>{cat.name}</span>
                        {cat._count?.products !== undefined && (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({cat._count.products})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Brands */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                    Brands
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '160px', overflowY: 'auto' }}>
                    <button
                      onClick={() => {
                        updateFilters({ brand: null });
                        setMobileFiltersOpen(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', padding: '0.35rem 0', color: !paramBrand ? '#2563eb' : '#475569', fontWeight: !paramBrand ? 700 : 500, border: 'none', background: 'none' }}
                    >
                      All Brands
                    </button>
                    {brands?.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          updateFilters({ brand: b.slug });
                          setMobileFiltersOpen(false);
                        }}
                        style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', padding: '0.35rem 0', display: 'flex', justifyContent: 'space-between', color: paramBrand === b.slug ? '#2563eb' : '#475569', fontWeight: paramBrand === b.slug ? 700 : 500, border: 'none', background: 'none' }}
                      >
                        <span>{b.name}</span>
                        {b._count?.products !== undefined && (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({b._count.products})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Stock */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={paramInStock}
                      onChange={(e) => {
                        updateFilters({ inStock: e.target.checked ? 'true' : null });
                        setMobileFiltersOpen(false);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                    />
                    <span>In Stock Items Only</span>
                  </label>
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  View Results
                </button>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Reset All Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom" style={{ padding: '3rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="360px" borderRadius="16px" />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
