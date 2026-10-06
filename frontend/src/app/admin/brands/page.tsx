'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Edit, Trash2, Search, X, Globe, ExternalLink, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Brand, CreateBrandInput, UpdateBrandInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageUploadInput } from '@/components/admin/ImageUploadInput';

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBrandInput>({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true,
  });

  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['admin', 'brands', { search }],
    queryFn: () => adminApi.getBrands({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateBrandInput) => adminApi.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || err.message || 'Failed to create brand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandInput }) =>
      adminApi.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || err.message || 'Failed to update brand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => alert(err.response?.data?.message || err.message || 'Cannot delete brand containing associated products.'),
  });

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      website: '',
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
      website: (brand as any).website || '',
      description: (brand as any).description || '',
      isActive: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: CreateBrandInput = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      logoUrl: formData.logoUrl?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      isActive: formData.isActive,
    };

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Tech Brands
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage authorized technology manufacturers, brand identities, and logos
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus size={16} />}
          style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
        >
          Add New Brand
        </Button>
      </div>

      {/* Search Bar */}
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
            placeholder="Search brands by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
          Total Brands: <strong style={{ color: '#0f172a' }}>{brandsData?.data?.length || 0}</strong>
        </div>
      </div>

      {/* Brands Table */}
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
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', width: '35%' }}>Brand & Logo</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Slug</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Website</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569' }}>Products</th>
              <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
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
            ) : !brandsData?.data || brandsData.data.length === 0 ? (
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
                    <Award size={24} />
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>No brands found</div>
                  <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Add authorized hardware manufacturers like Apple, Sony, Dell, or Samsung.
                  </p>
                </td>
              </tr>
            ) : (
              brandsData.data.map((brand) => (
                <tr
                  key={brand.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                  className="hover:bg-slate-50/80"
                >
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Award size={20} style={{ color: '#8b5cf6' }} />
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                        {brand.name}
                      </span>
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
                      /{brand.slug}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    {(brand as any).website ? (
                      <a
                        href={(brand as any).website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', fontWeight: 600 }}
                      >
                        Visit Portal <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <Badge variant="neutral">{brand._count?.products ?? 0} products</Badge>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(brand)}
                        title="Edit Brand"
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
                          if (confirm(`Delete brand "${brand.name}"?`)) {
                            deleteMutation.mutate(brand.id);
                          }
                        }}
                        title="Delete Brand"
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

      {/* Create / Edit Modal */}
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
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Brand logo will be converted to WebP and saved in backend uploads folder
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
                label="Brand Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apple, Sony, Samsung, Dell"
              />

              <Input
                label="Slug (URL identifier)"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. apple (auto-derived if blank)"
              />

              {/* Logo Upload with WebP */}
              <ImageUploadInput
                label="Brand Logo"
                folder="general"
                value={formData.logoUrl || ''}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                hint="Brand mark or manufacturer logo."
              />

              <Input
                label="Official Website URL"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.apple.com"
              />

              <Input
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Authorized distributor or manufacturer details"
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
                  {editingBrand ? 'Save Changes' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
