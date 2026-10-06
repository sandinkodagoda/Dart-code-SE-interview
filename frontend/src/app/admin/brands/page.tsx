'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Plus, Edit, Trash2, Search, X, Globe, ExternalLink } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Brand, CreateBrandInput, UpdateBrandInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

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
    onError: (err: any) => setErrorMsg(err.message || 'Failed to create brand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandInput }) =>
      adminApi.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeModal();
    },
    onError: (err: any) => setErrorMsg(err.message || 'Failed to update brand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => alert(err.message || 'Cannot delete brand containing associated products.'),
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

    const payload = {
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Tech Brands
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage authorized tech gadget brands, partners, and manufacturer details
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} />}>
          Add Brand
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1rem', border: '1px solid var(--color-border)', maxWidth: '400px' }}>
        <Input
          placeholder="Search brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      {/* Brands Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Brand</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Slug</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Website</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Products</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem' }}>
                  <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                  <Skeleton height="40px" />
                </td>
              </tr>
            ) : !brandsData?.data || brandsData.data.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No brands found.
                </td>
              </tr>
            ) : (
              brandsData.data.map((brand) => (
                <tr key={brand.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-slate-50">
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}
                        />
                      ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Award size={18} />
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{brand.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                    /{brand.slug}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {(brand as any).website ? (
                      <a
                        href={(brand as any).website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}
                      >
                        Visit <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <Badge variant="neutral">{brand._count?.products ?? 0} products</Badge>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(brand)} style={{ color: '#2563eb', padding: '0.3rem' }}>
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete brand "${brand.name}"?`)) {
                            deleteMutation.mutate(brand.id);
                          }
                        }}
                        style={{ color: '#ef4444', padding: '0.3rem' }}
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingBrand ? 'Edit Brand' : 'Create Brand'}
              </h2>
              <button onClick={closeModal}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--color-danger-bg)', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Brand Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Anker / Apple / Sony"
              />
              <Input
                label="Slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. anker (auto-derived if blank)"
              />
              <Input
                label="Logo Image URL"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <Input
                label="Official Website URL"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.apple.com"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingBrand ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
