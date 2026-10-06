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
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
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
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';
import { ProductExcelImportModal } from '@/components/admin/ProductExcelImportModal';
import { exportProductsToExcel, downloadProductImportTemplate } from '@/lib/utils/excel';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
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
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => storeApi.getCategories(),
  });

  const { data: brands = [] } = useQuery({
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

  // Fetch all products for Excel export
  const handleExportAll = async () => {
    try {
      const res = await adminApi.getProducts({ limit: 1000 });
      if (res.data && res.data.length > 0) {
        exportProductsToExcel(res.data);
      } else if (productsData?.data) {
        exportProductsToExcel(productsData.data);
      } else {
        alert('No products available to export.');
      }
    } catch (err: any) {
      alert('Failed to export products: ' + (err.message || 'Unknown error'));
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductInput) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductInput }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: async (updatedProduct) => {
      // If image changed and exists, ensure primary image is updated
      if (formData.imageUrl && (!editingProduct?.images?.length || editingProduct.images[0]?.imageUrl !== formData.imageUrl)) {
        try {
          await adminApi.addProductImage(updatedProduct.id, {
            imageUrl: formData.imageUrl,
            isPrimary: true,
            displayOrder: 0,
          });
        } catch (imgErr) {
          console.warn('Image sync notice:', imgErr);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to deactivate product');
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `TG-${Date.now().toString().slice(-6)}`,
      slug: '',
      description: '',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
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

  const totalPages = productsData?.pagination?.totalPages || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header & Action Buttons ────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Products Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage electronic devices, 1:1 square media assets, Excel imports/exports, and inventory
          </p>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Download Template Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadProductImportTemplate}
            leftIcon={<Download size={15} />}
            style={{ backgroundColor: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }}
            title="Download dummy Excel template with sample products"
          >
            Excel Template
          </Button>

          {/* Export to Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            leftIcon={<FileSpreadsheet size={15} />}
            style={{ backgroundColor: '#ffffff', color: '#059669', borderColor: '#a7f3d0' }}
          >
            Export Excel (.xlsx)
          </Button>

          {/* Import Excel */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExcelImportOpen(true)}
            leftIcon={<Upload size={15} />}
            style={{ backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#6ee7b7' }}
          >
            Import Excel
          </Button>

          {/* Add Product */}
          <Button
            variant="primary"
            onClick={openCreateModal}
            leftIcon={<Plus size={16} />}
            style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* ── Filter Toolbar ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
          <Input
            placeholder="Search by product name, SKU, or model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search size={16} />}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.8125rem',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory || selectedBrand) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedBrand('');
                setPage(1);
              }}
              style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Products Table ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', width: '38%' }}>
                  Product
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>SKU</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Category & Brand</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Price (LKR)</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Stock</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem' }}>
                    <Skeleton height="45px" style={{ marginBottom: '0.75rem' }} />
                    <Skeleton height="45px" style={{ marginBottom: '0.75rem' }} />
                    <Skeleton height="45px" />
                  </td>
                </tr>
              ) : !productsData?.data || productsData.data.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <Package size={24} />
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>No products found</div>
                    <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                      Try adjusting your search criteria or add new electronic products.
                    </p>
                  </td>
                </tr>
              ) : (
                productsData.data.map((product) => {
                  const imageSrc =
                    product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl;
                  const isStockLow = product.stockQuantity > 0 && product.stockQuantity <= 5;
                  const isOutOfStock = product.stockQuantity <= 0;

                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                      className="hover:bg-slate-50/80"
                    >
                      {/* Product Name & 1:1 Image */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              backgroundColor: '#f1f5f9',
                              flexShrink: 0,
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}
                          >
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={product.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  aspectRatio: '1/1',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon size={18} style={{ color: '#94a3b8' }} />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '340px',
                              }}
                              title={product.name}
                            >
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                              <span>/{product.slug}</span>
                              {product.isFeatured && (
                                <span
                                  style={{
                                    backgroundColor: '#fef3c7',
                                    color: '#b45309',
                                    padding: '0.05rem 0.35rem',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                  }}
                                >
                                  FEATURED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#334155',
                            backgroundColor: '#f1f5f9',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          {product.sku}
                        </span>
                      </td>

                      {/* Category & Brand */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {product.category?.name || 'Unassigned'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {product.brand?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>
                            LKR {Number(product.price).toLocaleString()}
                          </span>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                              LKR {Number(product.compareAtPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        {isOutOfStock ? (
                          <span
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            Out of stock
                          </span>
                        ) : isStockLow ? (
                          <span
                            style={{
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            {product.stockQuantity} in stock (Low)
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            {product.stockQuantity} in stock
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: product.isActive ? '#ecfdf5' : '#f1f5f9',
                            color: product.isActive ? '#047857' : '#64748b',
                          }}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <a
                            href={`/product/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview on Storefront"
                            style={{
                              padding: '0.4rem',
                              borderRadius: '6px',
                              color: '#64748b',
                              display: 'inline-flex',
                            }}
                          >
                            <ExternalLink size={15} />
                          </a>

                          <button
                            onClick={() => openEditModal(product)}
                            title="Edit Product"
                            style={{
                              padding: '0.4rem',
                              borderRadius: '6px',
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                            }}
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deactivate product "${product.name}"?`)) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            title="Deactivate Product"
                            style={{
                              padding: '0.4rem',
                              borderRadius: '6px',
                              color: '#dc2626',
                              backgroundColor: '#fef2f2',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                            }}
                          >
                            <Trash2 size={15} />
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft size={14} />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Create / Edit Modal ────────────────────── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Configure device specifications, 1:1 image asset, and pricing
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
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
                {/* 1:1 Image Upload Component */}
                <ImageUploadInput
                  label="Product Primary Image"
                  folder="products"
                  isSquare={true}
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Product Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apple iPhone 15 Pro Max 256GB"
                  />
                  <Input
                    label="SKU (Stock Keeping Unit) *"
                    required
                    disabled={!!editingProduct}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. APL-IP15PM-256"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Category *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Brand *
                    </label>
                    <select
                      required
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">Select Brand...</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Price (LKR) *"
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="489000"
                  />
                  <Input
                    label="Compare At Price (LKR)"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="520000"
                  />
                  {!editingProduct ? (
                    <Input
                      label="Initial Stock Quantity *"
                      required
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="10"
                    />
                  ) : (
                    <Input
                      label="Current Stock"
                      disabled
                      value={formData.stockQuantity}
                      placeholder="Use Inventory to adjust"
                    />
                  )}
                </div>

                <Input
                  label="Warranty Terms"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="e.g. 1 Year Official AppleCare Warranty"
                />

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Product Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive description of product specifications, materials, and box contents..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Highlight as Featured Product</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active in Public Store</span>
                  </label>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProduct ? 'Save Product Changes' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Excel Import Modal ─────────────────────────────── */}
      <ProductExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        categories={categories}
        brands={brands}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        }}
      />
    </div>
  );
}
