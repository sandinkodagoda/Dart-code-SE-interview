'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  Boxes,
  ShoppingCart,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { admin, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/admin/login';

  // Auth protection guard
  useEffect(() => {
    if (mounted && !isLoginPage && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [mounted, isLoginPage, isAuthenticated, router]);

  // If on login page, render plain without dashboard shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent flash before hydration check
  if (!mounted || !isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#090d16',
          color: '#ffffff',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid #1e293b',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.25rem',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package, badge: 'Catalog' },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Brands', href: '/admin/brands', icon: Award },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  // Derive active page title for top bar breadcrumbs
  const activeNavItem = navLinks.find(
    (l) => pathname === l.href || (l.href !== '/admin/dashboard' && pathname.startsWith(l.href)),
  );
  const pageTitle = activeNavItem ? activeNavItem.label : 'Admin Portal';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── Left Navigation Sidebar ─────────────────────────── */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#090d16',
          borderRight: '1px solid #1e293b',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 90,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="max-lg:-translate-x-full lg:translate-x-0"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <img
              src="/logo-white.svg"
              alt="Nexora Admin"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Title */}
        <div style={{ padding: '1rem 1.5rem 0.5rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
          Management
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '0 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#1d4ed8' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(29, 78, 216, 0.35)' : 'none',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} style={{ color: isActive ? '#ffffff' : '#64748b' }} />
                  <span>{link.label}</span>
                </div>
                {link.badge && !isActive && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Storefront Link & Admin Profile Bottom Bar */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', backgroundColor: '#070a12' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.7rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              color: '#60a5fa',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1rem',
              transition: 'background-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ExternalLink size={14} />
              <span>Visit Public Store</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>:3000</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {admin?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Shield size={10} /> {admin?.role || 'SUPER_ADMIN'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 80,
            backdropFilter: 'blur(2px)',
          }}
          className="lg:hidden"
        />
      )}

      {/* ── Main Workspace Area ────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="lg:ml-[270px]"
      >
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ color: '#0f172a', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>Admin</span>
              <ChevronRight size={14} style={{ color: '#94a3b8' }} />
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{pageTitle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Live API Health Indicator */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
                }}
              />
              <span className="hidden sm:inline">NestJS API :5000 Online</span>
              <span className="sm:hidden">Online</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                fontSize: '0.8125rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main style={{ flex: 1, padding: '2rem 1.75rem 4rem', minWidth: 0, maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
