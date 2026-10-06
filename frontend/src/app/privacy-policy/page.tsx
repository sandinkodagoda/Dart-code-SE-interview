import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, Database, CreditCard, Bell, ArrowLeft, Phone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nexora',
  description: 'Learn how Nexora collects, protects, and uses your personal and transaction data in accordance with Sri Lankan e-commerce standards.',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container-custom" style={{ maxWidth: '880px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#64748b',
              fontSize: '0.875rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <Lock size={15} /> Privacy & Data Protection
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Last updated: October 2026. At <strong>Nexora</strong>, we respect your confidentiality and are committed to protecting
            the personal data you share with us while browsing our electronics catalog, ordering devices, or requesting customer support.
          </p>
        </div>

        {/* Content sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1 */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={20} color="#2563eb" /> 1. Information We Collect
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              When you purchase or inquire on Nexora, we collect minimal necessary details to fulfill your orders accurately:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li><strong>Contact Details:</strong> Your full name, delivery address, city, postal district, and telephone number.</li>
              <li><strong>Order History:</strong> Product items ordered, quantities, warranty serial registrations, and delivery preferences.</li>
              <li><strong>Device & Communication Records:</strong> WhatsApp order logs, customer support chats, and feedback communications.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CreditCard size={20} color="#10b981" /> 2. Payment Security & Zero Card Storage
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Your financial safety is our highest priority. <strong>Nexora does not store or process your credit or debit card numbers on our servers.</strong>
            </p>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
              <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                💳 All online payments are securely handed over to <strong>PayHere</strong> (Central Bank of Sri Lanka approved payment service provider).
                Transactions are encrypted with bank-grade 256-bit TLS encryption under PCI-DSS Level 1 compliance.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="#6366f1" /> 3. How We Use Your Data
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Your information is exclusively used for:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>Processing and dispatching your orders with registered islandwide courier partners (Pronto, Prompt Xpress, Domex).</li>
              <li>Sending live WhatsApp/SMS dispatch notifications, courier tracking numbers, and delivery confirmation OTPs.</li>
              <li>Managing official manufacturer warranty verification when repairs or service visits are required.</li>
              <li>Fraud prevention and ensuring legitimate order authentications.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              4. Third-Party Sharing Policy
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7 }}>
              We <strong>never sell, rent, or trade</strong> your personal information to third-party marketing companies.
              Information is only shared with verified partners strictly essential for order fulfillment (e.g., our delivery couriers and payment gateways).
            </p>
          </section>

          {/* Contact Box */}
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Have questions about your data?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              If you wish to review, update, or request the deletion of your account information, reach out to our privacy officer.
            </p>
            <a
              href="https://wa.me/94711093799?text=Hello%20Nexora%2C%20I%20have%20an%20inquiry%20regarding%20my%20privacy%20and%20data"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
              }}
            >
              <Phone size={18} /> WhatsApp Privacy Desk (+94 71 109 3799)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
