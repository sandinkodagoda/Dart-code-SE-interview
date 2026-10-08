import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';
import { VisaLogo, MastercardLogo, AmexLogo, WhatsAppLogo, PayHereLogo } from '@/components/ui/PaymentLogos';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#cbd5e1', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      {/* 1. Value Proposition Banner */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2.5rem 0' }}>
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                <RotateCcw size={24} color="#fbbf24" />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Easy Returns</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Hassle-free 7-day replacement guarantee</p>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img
                src="/logo-white.svg"
                alt="Nexora Logo"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Sri Lanka&apos;s leading electronics and tech destination for smartphones, ultrabooks, audio devices, and smart hardware.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
              <span>📍 Colombo, Sri Lanka</span>
              <span>
                📞 Phone / WhatsApp:{' '}
                <a
                  href="https://wa.me/94711093799"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}
                >
                  +94 71 109 3799
                </a>
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link href="/shop?category=mobile-phones" style={{ color: '#94a3b8', textDecoration: 'none' }}>Smartphones & iPhones</Link></li>
              <li><Link href="/shop?category=laptops" style={{ color: '#94a3b8', textDecoration: 'none' }}>Laptops & MacBooks</Link></li>
              <li><Link href="/shop?category=tablets" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tablets & iPads</Link></li>
              <li><Link href="/shop?category=audio" style={{ color: '#94a3b8', textDecoration: 'none' }}>Audio & Noise Cancelling</Link></li>
              <li><Link href="/shop?category=accessories" style={{ color: '#94a3b8', textDecoration: 'none' }}>GaN Chargers & Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li><Link href="/shop" style={{ color: '#94a3b8', textDecoration: 'none' }}>Browse All Products</Link></li>
              <li><Link href="/cart" style={{ color: '#94a3b8', textDecoration: 'none' }}>View Shopping Cart</Link></li>
              <li>
                <a
                  href="https://wa.me/94711093799"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  WhatsApp Support (+94 71 109 3799)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Legal & Policies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/return-policy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }}>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Payment Methods</h4>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              We support secure checkout via PayHere gateway and instant WhatsApp direct orders.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <VisaLogo height={26} />
              <MastercardLogo height={26} />
              <AmexLogo height={26} />
              <WhatsAppLogo height={26} />
              <PayHereLogo height={26} />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748b' }}>
          <span>© {new Date().getFullYear()} Nexora. All rights reserved.</span>
          <span>Software Engineer Technical Assessment • Full Stack E-Commerce</span>
        </div>
      </div>
    </footer>
  );
};
