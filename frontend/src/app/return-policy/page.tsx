import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, Phone, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Nexora',
  description: 'Understand Nexora return procedures, 7-day replacement warranty, eligible conditions, and refund timelines.',
};

export default function ReturnPolicyPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container-custom" style={{ maxWidth: '880px' }}>
        {/* Breadcrumb / Back button */}
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

        {/* Page Header */}
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
            <RotateCcw size={15} /> Customer Protection Guarantee
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Return & Refund Policy
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Last updated: October 2026. At <strong>Nexora</strong>, we take pride in delivering 100% genuine electronics,
            smartphones, laptops, and smart gadgets. If you experience an issue with your purchase, our straightforward policy ensures your satisfaction.
          </p>
        </div>

        {/* Policy Content Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: 7-Day Replacement Guarantee */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} color="#2563eb" /> 1. 7-Day Replacement Guarantee
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              We provide a <strong>7-day replacement warranty</strong> on all brand new tech items starting from the date of physical delivery:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>
                <strong>Dead on Arrival (DOA) / Hardware Faults:</strong> If a device suffers from a verified manufacturer defect or fails to turn on upon unboxing, it qualifies for a direct replacement.
              </li>
              <li>
                <strong>Incorrect Item Received:</strong> If the model, storage capacity, color, or specification differs from your confirmed invoice, notify us immediately for an exchange.
              </li>
              <li>
                <strong>Transit Damage:</strong> In the rare event of transit damage, notify our WhatsApp support desk within 24 hours of package delivery with unboxing photos/videos.
              </li>
            </ul>
          </section>

          {/* Section 2: Eligibility Requirements */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="#10b981" /> 2. Eligibility & Inspection Criteria
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              To qualify for an exchange or refund under our return policy:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Original Packaging</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                  The item must be returned with all original box packaging, manuals, power adapters, and bundled cables.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.35rem' }}>No User Tampering</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                  Devices showing signs of water damage, physical drops, screen cracks, or unauthorized rooting/flashing are excluded.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Proof of Purchase</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
                  Provide your Nexora Order Number (e.g., ORD-XXXXX) or PayHere payment receipt confirmation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Non-Returnable Items */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={20} color="#f59e0b" /> 3. Non-Returnable & Warranty Claims
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              The following circumstances fall outside standard return eligibility:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li>Change of mind after breaking manufacturer security seals or activating device cloud accounts (Apple ID, Google Account).</li>
              <li>Consumable accessories (screen protectors once applied, thermal paste, opened in-ear tips for hygiene reasons).</li>
              <li>Issues arising beyond 7 days of delivery: these are covered under our <strong>Official 1-Year / 2-Year Manufacturer Warranty</strong> with authorized service centers across Sri Lanka.</li>
            </ul>
          </section>

          {/* Section 4: Refund Process */}
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              4. Refund Processing & Timelines
            </h2>
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              Where a replacement unit is unavailable, Nexora will issue a 100% full refund:
            </p>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.925rem', lineHeight: 1.8 }}>
              <li><strong>Card Payments (Visa / MasterCard / Amex via PayHere):</strong> Reversal is triggered back to your originating bank card within 3 to 7 business days depending on the issuing bank.</li>
              <li><strong>Direct Bank Transfer / WhatsApp Orders:</strong> Funds are transferred directly to your nominated Sri Lankan bank account within 24 to 48 hours following inspection.</li>
            </ul>
          </section>

          {/* Section 5: How to initiate a return */}
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Need to start a return or warranty claim?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Contact our dedicated Colombo support desk via WhatsApp. Send your order number and a quick description or video of the hardware issue.
            </p>
            <div>
              <a
                href="https://wa.me/94711093799?text=Hello%20Nexora%2C%20I%20would%20like%20to%20inquire%20about%20a%20return%2Fwarranty%20claim"
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
                <Phone size={18} /> Contact WhatsApp Support (+94 71 109 3799)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
