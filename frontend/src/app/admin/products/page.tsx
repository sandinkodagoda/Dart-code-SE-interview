'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { storeApi } from '@/lib/api/store';
import { Product, CreateProductInput, UpdateProductInput } from '@/types';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    slug: string;
    description: string;
    categoryId: string;
    brandId: string;
    price: string;
    compareAtPrice: string;
    stockQuantity: string;
    warranty: string;
    isFeatured: boolean;
    isActive: boolean;
    imageUrl: string;
  }>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    categoryId: '',
    brandId: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '10',
    warranty: '1 Year Manufacturer Warranty',
    isFeatured: false,
    isActive: true,
    imageUrl: '',
  });

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
    queryKey: ['admin', 'products', { search, category: selectedCategory, brand: selectedBrand, page }],
    queryFn: () =>
      adminApi.getProducts({
        search: search || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        page,
        limit: 15,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductInput) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductInput }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update product');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      slug: '',
      description: '',
      categoryId: categories?.[0]?.id || '',
      brandId: brands?.[0]?.id || '',
      price: '',
      compareAtPrice: '',
      stockQuantity: '10',
      warranty: '1 Year Manufacturer Warranty',
      isFeatured: false,
      isActive: true,
      imageUrl: '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      description: product.description,
      categoryId: product.category?.id || '',
      brandId: product.brand?.id || '',
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
      stockQuantity: product.stockQuantity.toString(),
      warranty: product.warranty || '',
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      imageUrl: product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl || '',
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid price greater than 0.');
      return;
    }

    if (editingProduct) {
      // Update
      const payload: UpdateProductInput = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        price: priceNum,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        warranty: formData.warranty.trim() || undefined,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      // Create
      const payload: CreateProductInput = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        price: priceNum,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        warranty: formData.warranty.trim() || undefined,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        images: formData.imageUrl
          ? [
              {
                imageUrl: formData.imageUrl.trim(),
                isPrimary: true,
                displayOrder: 0,
              },
            ]
          : undefined,
      };
      createMutation.mutate(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Product Catalog
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage electronic devices, specifications, pricing, and visibility
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} />}>
          Add New Product
        </Button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--color-border)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
          <Input
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search size={16} />}
          />
        </div>

        <div style={{ width: '200px' }}>
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Categories' },
              ...(categories?.map((c) => ({ value: c.slug, label: c.name })) || []),
            ]}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Brands' },
              ...(brands?.map((b) => ({ value: b.slug, label: b.name })) || []),
            ]}
          />
        </div>
      </div>

      {/* ── Products Table ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Product
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  SKU
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Category & Brand
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Price
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Stock
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Status
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem' }}>
                    <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton height="40px" />
                  </td>
                </tr>
              ) : !productsData?.data || productsData.data.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                productsData.data.map((product) => {
                  const img =
                    product.primaryImage?.imageUrl ||
                    product.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100';

                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.1s' }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={img}
                            alt={product.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid var(--color-border)',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {product.sku}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500 }}>{product.category?.name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {product.brand?.name || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700 }}>
                          <Price amount={product.price} />
                        </div>
                        {product.compareAtPrice && (
                          <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                            <Price amount={product.compareAtPrice} />
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <Badge
                          variant={
                            product.stockQuantity <= 0
                              ? 'danger'
                              : product.stockQuantity <= 5
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {product.stockQuantity} in stock
                        </Badge>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <Badge variant={product.isActive !== false ? 'success' : 'neutral'}>
                            {product.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.isFeatured && (
                            <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(product)}
                            style={{
                              padding: '0.4rem',
                              color: '#2563eb',
                              borderRadius: '4px',
                            }}
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate product "${product.name}"?`)) {
                                deactivateMutation.mutate(product.id);
                              }
                            }}
                            style={{
                              padding: '0.4rem',
                              color: '#ef4444',
                              borderRadius: '4px',
                            }}
                            title="Deactivate"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ────────────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {editingProduct ? 'Edit Product' : 'Add New Tech Product'}
              </h2>
              <button onClick={closeModal} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'var(--color-danger-bg)',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Product Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="SKU Code"
                  required
                  disabled={Boolean(editingProduct)}
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SNY-WH1000XM5-BLK"
                />
                <Input
                  label="Slug (optional URL key)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-derived if blank"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Category"
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categories?.map((c) => ({ value: c.id, label: c.name })) || []}
                />
                <Select
                  label="Brand"
                  required
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  options={brands?.map((b) => ({ value: b.id, label: b.name })) || []}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Selling Price (LKR)"
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 115000"
                />
                <Input
                  label="Compare At Price (optional strike-through)"
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  placeholder="e.g. 125000"
                />
              </div>

              {!editingProduct && (
                <Input
                  label="Initial Stock Quantity"
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="10"
                />
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High performance specifications, features, warranty details..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <Input
                label="Primary Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
              />

              <Input
                label="Warranty Terms"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                placeholder="e.g. 1 Year Official Manufacturer Warranty"
              />

              <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active Online in Storefront</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
