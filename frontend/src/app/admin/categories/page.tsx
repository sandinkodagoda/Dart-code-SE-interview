'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin', 'categories', { search }],
    queryFn: () => adminApi.getCategories({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryInput) => adminApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) =>
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryInput }) =>
      adminApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) =>
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) =>
      alert(err.response?.data?.message || err.message || 'Cannot delete category containing associated products.'),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: CreateCategoryInput = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
      isActive: formData.isActive,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ─────────────────────────────────────────── */}
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Product Categories
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Structure tech catalog taxonomy and storefront category showcase images (WebP format)
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus size={16} />}
          style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
        >
          Add New Category
        </Button>
      </div>

      {/* ── Search & Filter Toolbar ─────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Input
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
          Total Categories: <strong style={{ color: '#0f172a' }}>{categoriesData?.data?.length || 0}</strong>
        </div>
      </div>

      {/* ── Categories Table ────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', width: '35%' }}>
                Category Image & Name
              </th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Slug</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Description</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Products</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem' }}>
                  <Skeleton height="45px" style={{ marginBottom: '0.75rem' }} />
                  <Skeleton height="45px" />
                </td>
              </tr>
            ) : !categoriesData?.data || categoriesData.data.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
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
                    <Layers size={24} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>No categories found</div>
                  <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Create your first category with image to showcase on the homepage.
                  </p>
                </td>
              </tr>
            ) : (
              categoriesData.data.map((cat) => (
                <tr
                  key={cat.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                  className="hover:bg-slate-50/80"
                >
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #dbeafe',
                        }}
                      >
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Layers size={22} />
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem', display: 'block' }}>
                          {cat.name}
                        </span>
                        {cat.imageUrl && cat.imageUrl.includes('.webp') && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#15803d',
                              backgroundColor: '#dcfce7',
                              padding: '0.05rem 0.35rem',
                              borderRadius: '4px',
                            }}
                          >
                            WEBP IMAGE
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        color: '#475569',
                        backgroundColor: '#f1f5f9',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                      }}
                    >
                      /{cat.slug}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#64748b', maxWidth: '300px' }}>
                    {cat.description || '—'}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <Badge variant="neutral">{cat._count?.products ?? 0} products</Badge>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Edit Category"
                        style={{
                          color: '#2563eb',
                          backgroundColor: '#eff6ff',
                          padding: '0.4rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                        title="Delete Category"
                        style={{
                          color: '#ef4444',
                          backgroundColor: '#fee2e2',
                          padding: '0.4rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────── */}
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
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Category image will be displayed on the storefront homepage cards
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

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
              <Input
                label="Category Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Smart Watches & Wearables"
              />

              <Input
                label="Slug (URL identifier)"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. smart-watches (auto-derived if blank)"
              />

              {/* Category Image Upload (saved to backend uploads folder as 1:1 WebP) */}
              <ImageUploadInput
                label="Category Showcase Image (1:1 Ratio)"
                folder="categories"
                isSquare={true}
                value={formData.imageUrl || ''}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                hint="Displayed in 1:1 square ratio on the storefront homepage cards. Uploaded images are automatically converted to 1:1 WebP."
              />

              <Input
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short overview of gadgets in this category"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
