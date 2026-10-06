'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  X,
  CreditCard,
  Phone,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Order, OrderStatus, PaymentStatus, UpdateOrderStatusInput } from '@/types';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal / Drawer state for viewing and transitioning order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { search, orderStatus, paymentStatus, paymentMethod, page }],
    queryFn: () =>
      adminApi.getOrders({
        search: search || undefined,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        page,
        limit: 15,
      }),
  });

  // Status transition mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderStatusInput }) =>
      adminApi.updateOrderStatus(id, payload),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setSelectedOrder(updatedOrder);
      setNextStatus('');
      setStatusNote('');
      setCancelReason('');
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update order status');
    },
  });

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNextStatus('');
    setStatusNote('');
    setCancelReason('');
    setErrorMsg(null);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setErrorMsg(null);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !nextStatus) return;

    updateStatusMutation.mutate({
      id: selectedOrder.id,
      payload: {
        status: nextStatus as OrderStatus,
        note: statusNote.trim() || undefined,
        cancellationReason: nextStatus === 'CANCELLED' ? cancelReason.trim() : undefined,
      },
    });
  };

  // State machine transition helper
  const getAllowedNextStatuses = (current: OrderStatus): OrderStatus[] => {
    switch (current) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['READY_TO_SHIP', 'CANCELLED'];
      case 'READY_TO_SHIP':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      default:
        return [];
    }
  };

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'SHIPPED':
      case 'READY_TO_SHIP':
        return 'info';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Order Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Process customer orders, verify payments, and advance dispatch milestones
          </p>
        </div>
      </div>

      {/* Filter Bar */}
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
            placeholder="Search by order #, customer, phone, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search size={16} />}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Order Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'PROCESSING', label: 'Processing' },
              { value: 'READY_TO_SHIP', label: 'Ready to Ship' },
              { value: 'SHIPPED', label: 'Shipped' },
              { value: 'DELIVERED', label: 'Delivered' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
        </div>

        <div style={{ width: '170px' }}>
          <Select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Payment Statuses' },
              { value: 'PAID', label: 'Paid' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'REFUNDED', label: 'Refunded' },
            ]}
          />
        </div>

        <div style={{ width: '160px' }}>
          <Select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Methods' },
              { value: 'PAYHERE', label: 'PayHere Gateway' },
              { value: 'WHATSAPP', label: 'WhatsApp Order' },
            ]}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Order #</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Date</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Customer</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Items</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Order Status</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Payment</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem' }}>
                    <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton height="40px" style={{ marginBottom: '0.5rem' }} />
                    <Skeleton height="40px" />
                  </td>
                </tr>
              ) : !ordersData?.data || ordersData.data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No customer orders found matching filter criteria.
                  </td>
                </tr>
              ) : (
                ordersData.data.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-slate-50">
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {order.customerPhone} • {order.city}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)' }}>
                      {order.items?.length || 0} items
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>
                      <Price amount={order.total} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <Badge variant={getOrderStatusVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: order.paymentMethod === 'WHATSAPP' ? '#16a34a' : '#2563eb' }}>
                          {order.paymentMethod}
                        </span>
                        <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <Button variant="secondary" size="sm" onClick={() => openOrderModal(order)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Lifecycle Transition Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order {selectedOrder.orderNumber}</h2>
                  <Badge variant={getOrderStatusVariant(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</Badge>
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <button onClick={closeOrderModal}><X size={22} /></button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--color-danger-bg)', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer & Delivery Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                  <User size={16} color="#2563eb" /> Customer Information
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{selectedOrder.customerEmail}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{selectedOrder.customerPhone}</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                  <MapPin size={16} color="#10b981" /> Delivery Destination
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  <div>{selectedOrder.addressLine1}</div>
                  {selectedOrder.addressLine2 && <div>{selectedOrder.addressLine2}</div>}
                  <div>{selectedOrder.city} {selectedOrder.postalCode ? `• ${selectedOrder.postalCode}` : ''}</div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontWeight: 700, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>
                Order Line Items
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <tbody>
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{item.sku}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {item.quantity} × <Price amount={item.unitPrice} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        <Price amount={item.total} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ padding: '1rem', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Subtotal:</span>
                  <Price amount={selectedOrder.subtotal} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Delivery Fee:</span>
                  <Price amount={selectedOrder.deliveryFee} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span>Authoritative Total:</span>
                  <Price amount={selectedOrder.total} />
                </div>
              </div>
            </div>

            {/* Status Transition Action Box */}
            <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem' }}>
                Order Lifecycle Progression
              </h3>

              {getAllowedNextStatuses(selectedOrder.orderStatus).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  This order has reached terminal status (<strong>{selectedOrder.orderStatus}</strong>) and cannot be transitioned further.
                </p>
              ) : (
                <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                  <Select
                    label="Advance To Next Status"
                    required
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                    options={[
                      { value: '', label: 'Select next milestone...' },
                      ...getAllowedNextStatuses(selectedOrder.orderStatus).map((st) => ({
                        value: st,
                        label: `${st} ${st === 'CANCELLED' ? '(Restores reserved inventory)' : ''}`,
                      })),
                    ]}
                  />

                  {nextStatus === 'CANCELLED' && (
                    <Input
                      label="Cancellation Reason (Required for Audit Log)"
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Customer cancelled order by phone"
                    />
                  )}

                  <Input
                    label="Dispatch or Internal Operational Note (Optional)"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Handed to DHL courier (Tracking: DHL-99823)"
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button
                      type="submit"
                      variant={nextStatus === 'CANCELLED' ? 'danger' : 'primary'}
                      isLoading={updateStatusMutation.isPending}
                      disabled={!nextStatus}
                    >
                      Update Order Status to {nextStatus || '...'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
