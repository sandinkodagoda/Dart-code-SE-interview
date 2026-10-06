'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Plus,
  Boxes,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboardMetrics(),
    refetchInterval: 15000, // Refresh operational metrics every 15s
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton height="32px" width="220px" />
            <Skeleton height="18px" width="340px" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="140px" borderRadius="16px" />
          <Skeleton height="140px" borderRadius="16px" />
          <Skeleton height="140px" borderRadius="16px" />
          <Skeleton height="140px" borderRadius="16px" />
        </div>
        <Skeleton height="380px" borderRadius="16px" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-danger)', fontWeight: 600, marginBottom: '1rem' }}>
          Failed to load dashboard metrics.
        </p>
        <Button onClick={() => refetch()} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  const { orders, products, customers, revenue, recentOrders } = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Top Header & Actions ───────────────────────────── */}
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
            Operations Overview
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Live performance, order flow, and inventory tracking for TechGadgets Store
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/inventory">
            <Button variant="secondary" size="sm" leftIcon={<Boxes size={16} />}>
              Adjust Inventory
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ─────────────────────────── */}
      {(products.lowStock > 0 || products.outOfStock > 0) && (
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
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9375rem' }}>
                Inventory Replenishment Required
              </div>
              <div style={{ color: '#b45309', fontSize: '0.8125rem' }}>
                {products.outOfStock > 0 && <span><strong>{products.outOfStock}</strong> item(s) are completely out of stock. </span>}
                {products.lowStock > 0 && <span><strong>{products.lowStock}</strong> item(s) are running critically low (≤ 5 units).</span>}
              </div>
            </div>
          </div>
          <Link href="/admin/inventory">
            <Button variant="outline" size="sm" style={{ borderColor: '#d97706', color: '#b45309' }}>
              View Stock Levels
            </Button>
          </Link>
        </div>
      )}

      {/* ── 4 Main KPI Cards ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Total Revenue */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Total Revenue
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            <Price amount={revenue.total} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> Authoritative settled payments
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Total Orders
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {orders.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            {orders.pending} pending • {orders.confirmed} confirmed • {orders.delivered} delivered
          </div>
        </div>

        {/* Card 3: Products Catalog */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Catalog Products
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f5f3ff',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {products.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            {products.active} active online • {products.outOfStock} out of stock
          </div>
        </div>

        {/* Card 4: Registered Customers */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Unique Customers
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {customers.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Storefront guest accounts & buyers
          </div>
        </div>
      </div>

      {/* ── Order Status Pipeline ──────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
          Order Lifecycle Pipeline
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{orders.pending}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Pending</div>
          </div>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{orders.confirmed}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>Confirmed</div>
          </div>
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{orders.processing}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>Processing</div>
          </div>
          <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{orders.delivered}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>Delivered</div>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{orders.cancelled}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b' }}>Cancelled</div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table ────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Recent Orders
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
              Latest customer orders processed through the platform
            </p>
          </div>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={16} />}>
              All Orders
            </Button>
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Order #
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Customer
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Items
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Total
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Order Status
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Payment
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No orders have been recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.1s' }}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#2563eb' }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customerPhone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)' }}>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>
                      <Price amount={order.total} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <Badge
                        variant={
                          order.orderStatus === 'DELIVERED'
                            ? 'success'
                            : order.orderStatus === 'CANCELLED'
                            ? 'danger'
                            : order.orderStatus === 'CONFIRMED'
                            ? 'primary'
                            : 'warning'
                        }
                      >
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
                      <Link href={`/admin/orders`}>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
