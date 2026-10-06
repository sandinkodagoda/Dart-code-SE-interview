import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertCircle, Scale, Truck, ArrowLeft, Phone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Nexora',
  description: 'Review the Terms and Conditions of Nexora covering orders, payments, delivery terms, warranties, and platform use.',
};

export default function TermsAndConditionsPage() {
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
            <Scale size={15} /> Legal Agreement
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Effective as of October 2026. Welcome to <strong>Nexora</strong>. By accessing our platform, placing orders through our website,
            or transacting via our PayHere gateway and WhatsApp desk, you agree to comply with and be bound by the following terms.
          </p>
        </div>

        {/* Sections */}
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
              <FileText size={20} color="#2563eb" /> 1. General Product Information & Pricing
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              All prices listed on Nexora are in <strong>Sri Lankan Rupees (LKR)</strong>.
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>We strive to ensure all catalog details, technical specifications, and prices are accurate. However, typographical errors or market exchange rate fluctuations may occasionally occur.</li>
              <li>Nexora reserves the right to correct pricing errors and cancel orders placed under incorrect price listings prior to dispatch, with an immediate full refund.</li>
              <li>Stock availability is updated in real time. In the event an item becomes sold out prior to processing, our team will offer an alternative model or a prompt refund.</li>
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
              <CheckCircle2 size={20} color="#10b981" /> 2. Order Confirmation & Acceptance
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              When you submit an order on our platform:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>You will receive an automated order confirmation displaying your unique Order Number (e.g., ORD-XXXXX).</li>
              <li>Orders placed via WhatsApp are verified directly by our customer representative before fulfillment.</li>
              <li>Nexora reserves the right to decline or cancel any order suspected of fraudulent activity, unauthorized card usage, or invalid shipping coordinates.</li>
            </ul>
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
              <Truck size={20} color="#6366f1" /> 3. Islandwide Delivery & Inspection
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              We partner with trusted courier networks across all districts of Sri Lanka:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li><strong>Colombo & Suburbs:</strong> Standard delivery within 1 to 2 business days.</li>
              <li><strong>Outstation Deliveries:</strong> Standard delivery within 2 to 4 business days.</li>
              <li>Customers must inspect exterior package seals upon handover by the courier driver. If signs of tampering or severe physical box crushing are present, please sign as &quot;Received Damaged&quot; or decline acceptance.</li>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={20} color="#f59e0b" /> 4. Warranty & Liability Limitations
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Nexora sells brand-new, factory-sealed devices backed by legitimate manufacturer warranties:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>Warranty terms, durations, and covered components are determined by the respective brand (Apple, Samsung, ASUS, Sony, Xiaomi, etc.).</li>
              <li>Accidental damage (drops, liquid spills, cracked displays, lightning surges) is excluded from warranty coverage unless separate accidental insurance was specifically contracted.</li>
              <li>Nexora shall not be held liable for indirect, incidental, or consequential damages resulting from data loss or device downtime. We strongly advise regular backups.</li>
            </ul>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Need clarification on our terms?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Our customer advocacy desk is ready to answer questions regarding policies, contracts, or business inquiries.
            </p>
            <a
              href="https://wa.me/94711093799?text=Hello%20Nexora%2C%20I%20have%20a%20question%20regarding%20your%20terms%20and%20conditions"
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
              <Phone size={18} /> Contact Support Desk (+94 71 109 3799)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
