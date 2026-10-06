import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#cbd5e1', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      {/* 1. Value Proposition Banner */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2.5rem 0' }}>
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={24} color="#60a5fa" />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Islandwide Delivery</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Fast express delivery across Sri Lanka</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="#34d399" />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>100% Genuine Tech</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Verified manufacturer warranties</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={24} color="#fbbf24" />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Secure Payments</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>PayHere Sandbox & WhatsApp order</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={24} color="#a78bfa" />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Dedicated Support</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>WhatsApp consultation & live assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="container-custom" style={{ padding: '3.5rem 1.25rem 2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                TG
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Tech<span style={{ color: '#60a5fa' }}>Gadgets</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Sri Lanka's leading electronics and tech gadgets destination for flagship mobile phones, ultrabooks, audio devices, and smart hardware.
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Colombo, Sri Lanka • +94 77 123 4567
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem' }}>Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link href="/shop?category=mobile-phones" style={{ color: '#94a3b8' }}>Smartphones & iPhones</Link></li>
              <li><Link href="/shop?category=laptops" style={{ color: '#94a3b8' }}>Laptops & MacBooks</Link></li>
              <li><Link href="/shop?category=tablets" style={{ color: '#94a3b8' }}>Tablets & iPads</Link></li>
              <li><Link href="/shop?category=audio" style={{ color: '#94a3b8' }}>Audio & Noise Cancelling</Link></li>
              <li><Link href="/shop?category=accessories" style={{ color: '#94a3b8' }}>GaN Chargers & Cables</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link href="/cart" style={{ color: '#94a3b8' }}>View Shopping Cart</Link></li>
              <li><Link href="/shop" style={{ color: '#94a3b8' }}>Product Catalog</Link></li>
              <li><a href="https://wa.me/94771234567" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>WhatsApp Support</a></li>
              <li><Link href="/admin/login" style={{ color: '#60a5fa', fontWeight: 600 }}>Staff Admin Portal</Link></li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem' }}>Payment Methods</h4>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              We support instant checkout via PayHere Sandbox (Visa, MasterCard, Amex) and direct WhatsApp orders.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#1e293b', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>VISA</span>
              <span style={{ backgroundColor: '#1e293b', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>MasterCard</span>
              <span style={{ backgroundColor: '#1e293b', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>WhatsApp Pay</span>
              <span style={{ backgroundColor: '#1e293b', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>PayHere</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748b' }}>
          <span>© {new Date().getFullYear()} TechGadgets Store. All rights reserved.</span>
          <span>Software Engineer Technical Assessment • Full Stack E-Commerce</span>
        </div>
      </div>
    </footer>
  );
};
