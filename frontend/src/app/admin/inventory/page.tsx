'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  AlertTriangle,
  History,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  X,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { storeApi } from '@/lib/api/store';
import { Product, InventoryTransaction, AdjustStockInput } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'levels' | 'ledger'>('levels');
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'RESTOCK' | 'ADJUSTMENT' | 'STOCK_IN'>('RESTOCK');
  const [adjustQuantity, setAdjustQuantity] = useState('10');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustReference, setAdjustReference] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'inventory-products', { search }],
    queryFn: () => adminApi.getProducts({ search: search || undefined, limit: 100 }),
  });

  const { data: transactionsData, isLoading: loadingLedger } = useQuery({
    queryKey: ['admin', 'inventory-transactions'],
    queryFn: () => adminApi.getTransactions({ limit: 50 }),
    enabled: activeTab === 'ledger',
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['admin', 'low-stock-items'],
    queryFn: () => adminApi.getLowStock(5),
  });

  // Adjustment mutation
  const adjustMutation = useMutation({
    mutationFn: (payload: AdjustStockInput) => adminApi.adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'low-stock-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeAdjustModal();
    },
    onError: (err: any) => setErrorMsg(err.message || 'Failed to adjust inventory.'),
  });

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustType('RESTOCK');
    setAdjustQuantity('10');
    setAdjustReason('Shipment replenishment from authorized distributor');
    setAdjustReference(`PO-${Date.now().toString().slice(-4)}`);
    setErrorMsg(null);
    setIsAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setSelectedProduct(null);
    setErrorMsg(null);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMsg(null);

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty === 0) {
      setErrorMsg('Quantity change must not be zero.');
      return;
    }

    if (adjustType === 'ADJUSTMENT' && selectedProduct.stockQuantity + qty < 0) {
      setErrorMsg(`Adjustment cannot result in negative stock (Current: ${selectedProduct.stockQuantity}).`);
      return;
    }

    adjustMutation.mutate({
      productId: selectedProduct.id,
      quantity: qty,
      type: adjustType,
      reason: adjustReason.trim() || undefined,
      reference: adjustReference.trim() || undefined,
    });
  };

  const displayedProducts = productsData?.data?.filter((p) => {
    if (onlyLowStock) return p.stockQuantity <= 5;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Inventory Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Atomic stock balance tracking, supplier replenishment, and audit trail ledger
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '0.3rem', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('levels')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'levels' ? '#ffffff' : 'transparent',
              color: activeTab === 'levels' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'levels' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Live Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'ledger' ? '#ffffff' : 'transparent',
              color: activeTab === 'ledger' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'ledger' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Transaction Ledger
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9375rem' }}>
                {lowStockItems.length} Products Require Stock Replenishment
              </div>
              <div style={{ color: '#b45309', fontSize: '0.8125rem' }}>
                Stock levels are below the safety threshold (≤ 5 units). Click to filter.
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            style={{ borderColor: '#d97706', color: '#b45309' }}
          >
            {onlyLowStock ? 'Show All Products' : 'Filter Low Stock Only'}
          </Button>
        </div>
      )}

      {activeTab === 'levels' ? (
        <>
          {/* Search bar */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1rem', border: '1px solid var(--color-border)', maxWidth: '400px' }}>
            <Input
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>

          {/* Stock Levels Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Product</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>SKU</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Current Units</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Stock Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem' }}>
                      <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                      <Skeleton height="40px" />
                    </td>
                  </tr>
                ) : !displayedProducts || displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-slate-50">
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {p.category?.name} • {p.brand?.name}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '1rem' }}>
                        {p.stockQuantity}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <Badge
                          variant={
                            p.stockQuantity <= 0
                              ? 'danger'
                              : p.stockQuantity <= 5
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {p.stockQuantity <= 0
                            ? 'Out of Stock'
                            : p.stockQuantity <= 5
                            ? 'Critical Low'
                            : 'Well Stocked'}
                        </Badge>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openAdjustModal(p)}
                          leftIcon={<PlusCircle size={14} />}
                        >
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Transaction Ledger View */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Date & Time</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Product</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Event Type</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Movement</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Stock Transition</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Reason / Reference</th>
              </tr>
            </thead>
            <tbody>
              {loadingLedger ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem' }}>
                    <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton height="40px" />
                  </td>
                </tr>
              ) : !transactionsData?.data || transactionsData.data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No inventory movement records found in audit log.
                  </td>
                </tr>
              ) : (
                transactionsData.data.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-slate-50">
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{tx.product?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        {tx.product?.sku}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <Badge
                        variant={
                          tx.type === 'RESTOCK' || tx.type === 'STOCK_IN'
                            ? 'success'
                            : tx.type === 'SALE'
                            ? 'info'
                            : tx.type === 'CANCELLATION'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: tx.quantity > 0 ? '#10b981' : '#ef4444' }}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace' }}>
                      {tx.previousStock} → <strong>{tx.newStock}</strong>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                      <div>{tx.reason || '—'}</div>
                      {tx.reference && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Ref: {tx.reference}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Adjust Stock Level</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button onClick={closeAdjustModal}><X size={20} /></button>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Current Stock:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedProduct.stockQuantity} units</span>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--color-danger-bg)', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Select
                label="Adjustment Reason Category"
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as any)}
                options={[
                  { value: 'RESTOCK', label: 'RESTOCK (Supplier replenishment)' },
                  { value: 'STOCK_IN', label: 'STOCK_IN (Initial or new inventory batch)' },
                  { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Count correction, damage, or audit)' },
                ]}
              />

              <Input
                label="Quantity Change"
                type="number"
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                helperText={adjustType === 'ADJUSTMENT' ? 'Positive to increase, negative (e.g. -2) to write off' : 'Units to add to inventory'}
              />

              <Input
                label="Reason / Note"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Received shipment from official distributor"
              />

              <Input
                label="Purchase Order or Reference Code"
                value={adjustReference}
                onChange={(e) => setAdjustReference(e.target.value)}
                placeholder="e.g. PO-2026-042"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={closeAdjustModal}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={adjustMutation.isPending}>
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
