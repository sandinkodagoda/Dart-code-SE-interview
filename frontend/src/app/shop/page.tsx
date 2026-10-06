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
  const paramPage = parseInt(searchParams.get('page') || '1', 10);

  // Local filter state
  const [searchInput, setSearchInput] = useState(paramSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    setSearchInput(paramSearch);
  }, [paramSearch]);

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
        page: paramPage,
        limit: 9,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(
    paramSearch || paramCategory || paramBrand || paramInStock || paramSort !== 'newest',
  );

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* 1. Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Electronics Catalog
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
              {productsData?.pagination?.total !== undefined
                ? `Showing ${productsData.pagination.total} products available`
                : 'Browse our range of genuine smartphones, laptops, and gadgets'}
            </p>
          </div>

          {/* Sort & Mobile Filter Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <Filter size={16} /> Filters
            </button>

            <div style={{ width: '190px' }}>
              <Select
                value={paramSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                options={[
                  { value: 'newest', label: 'Sort: Newest' },
                  { value: 'price-asc', label: 'Price: Low → High' },
                  { value: 'price-desc', label: 'Price: High → Low' },
                  { value: 'name-asc', label: 'Name: A → Z' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Active Filters:
            </span>

            {paramSearch && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                Search: "{paramSearch}"
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => updateFilters({ search: null })} />
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
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                Category: {paramCategory}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => updateFilters({ category: null })} />
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
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                Brand: {paramBrand}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => updateFilters({ brand: null })} />
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
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                In Stock Only
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => updateFilters({ inStock: null })} />
              </span>
            )}

            <button
              onClick={clearAllFilters}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-danger)',
                fontWeight: 600,
                marginLeft: '0.5rem',
                textDecoration: 'underline',
              }}
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="lg:grid-cols-[260px_1fr]">
        {/* ── Left Sidebar: Desktop Filters ─────────────────── */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            height: 'fit-content',
          }}
          className="hidden lg:flex"
        >
          {/* Search Box */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Search
            </h3>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Product, SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 2rem 0.55rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-secondary)',
                }}
              />
              <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                <Search size={15} color="var(--color-text-muted)" />
              </button>
            </form>
          </div>

          {/* Categories Filter */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
              <button
                onClick={() => updateFilters({ category: null })}
                style={{
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: !paramCategory ? 700 : 500,
                  color: !paramCategory ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '0.3rem 0',
                }}
              >
                All Categories
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: paramCategory === cat.slug ? 700 : 500,
                    color: paramCategory === cat.slug ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    padding: '0.3rem 0',
                  }}
                >
                  <span>{cat.name}</span>
                  {cat._count?.products !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      ({cat._count.products})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Brands
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
              <button
                onClick={() => updateFilters({ brand: null })}
                style={{
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: !paramBrand ? 700 : 500,
                  color: !paramBrand ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '0.3rem 0',
                }}
              >
                All Brands
              </button>
              {brands?.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilters({ brand: b.slug })}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: paramBrand === b.slug ? 700 : 500,
                    color: paramBrand === b.slug ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    padding: '0.3rem 0',
                  }}
                >
                  <span>{b.name}</span>
                  {b._count?.products !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      ({b._count.products})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={paramInStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              In Stock Only
            </label>
          </div>
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
            <EmptyState
              icon={<PackageOpen size={48} />}
              title="No Products Found"
              description="No electronics matched your search and filter criteria. Try adjusting your filters or search terms."
              actionLabel="Clear All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              {/* Product Grid */}
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
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '3.5rem',
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

                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0.5rem' }}>
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          className="lg:hidden"
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              backgroundColor: '#ffffff',
              height: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* Mobile Categories */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => {
                      updateFilters({ category: null });
                      setMobileFiltersOpen(false);
                    }}
                    style={{ textAlign: 'left', fontWeight: !paramCategory ? 700 : 500 }}
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
                      style={{
                        textAlign: 'left',
                        fontWeight: paramCategory === cat.slug ? 700 : 500,
                        color: paramCategory === cat.slug ? 'var(--color-primary)' : 'inherit',
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Brands */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Brands</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => {
                      updateFilters({ brand: null });
                      setMobileFiltersOpen(false);
                    }}
                    style={{ textAlign: 'left', fontWeight: !paramBrand ? 700 : 500 }}
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
                      style={{
                        textAlign: 'left',
                        fontWeight: paramBrand === b.slug ? 700 : 500,
                        color: paramBrand === b.slug ? 'var(--color-primary)' : 'inherit',
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setMobileFiltersOpen(false)}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-custom" style={{ padding: '3rem 1rem' }}><Skeleton height="500px" borderRadius="16px" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
