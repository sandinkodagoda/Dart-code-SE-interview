'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Phone,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { storeApi } from '@/lib/api/store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cart Store
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryFee = useCartStore((state) => state.getDeliveryFee);
  const getEstimatedTotal = useCartStore((state) => state.getEstimatedTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    customerNotes: '',
    paymentMethod: 'PAYHERE' as PaymentMethod,
  });

  // PayHere Auto-Submit Form State
  const [payhereForm, setPayhereForm] = useState<{
    action: string;
    params: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When PayHere params are set, auto-submit the hidden HTML form
  useEffect(() => {
    if (payhereForm) {
      const formEl = document.getElementById('payhere-checkout-form') as HTMLFormElement;
      if (formEl) {
        formEl.submit();
      }
    }
  }, [payhereForm]);

  if (!mounted) return null;

  if (items.length === 0 && !loading && !payhereForm) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>No Items to Checkout</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Your shopping cart is currently empty. Add products before proceeding to checkout.
        </p>
        <Link href="/shop">
          <Button variant="primary">Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // Validate line items
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const payload = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2 ? formData.addressLine2.trim() : undefined,
        city: formData.city.trim(),
        postalCode: formData.postalCode ? formData.postalCode.trim() : undefined,
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        customerNotes: formData.customerNotes ? formData.customerNotes.trim() : undefined,
      };

      if (formData.paymentMethod === 'WHATSAPP') {
        // ── WHATSAPP CHECKOUT FLOW (PHASE 10) ──────────────
        const res = await storeApi.createWhatsAppOrder(payload);
        clearCart();

        // Open WhatsApp in new tab and route user to order confirmation page
        if (typeof window !== 'undefined') {
          window.open(res.whatsappUrl, '_blank');
        }
        router.push(`/order/${res.order.orderNumber}`);
      } else {
        // ── PAYHERE CHECKOUT FLOW (PHASE 11) ───────────────
        // 1. Create order in PostgreSQL
        const order = await storeApi.createOrder(payload);

        // 2. Request signed PayHere parameters from backend
        const payhereInit = await storeApi.initiatePayHere(order.id);
        clearCart();

        // 3. Set parameters to auto-submit form to PayHere checkout
        setPayhereForm({
          action: payhereInit.checkoutUrl,
          params: payhereInit.paymentData as any,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please review your information.');
      setLoading(false);
    }
  };

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Guest Checkout
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
          No account needed. Enter your delivery information and select your preferred payment method.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Hidden PayHere Checkout Form for automatic redirection */}
      {payhereForm && (
        <form id="payhere-checkout-form" method="POST" action={payhereForm.action} style={{ display: 'none' }}>
          {Object.entries(payhereForm.params).map(([key, val]) => (
            <input key={key} type="hidden" name={key} value={val} />
          ))}
        </form>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
          className="lg:grid-cols-[1fr_420px]"
        >
          {/* ── Left Column: Checkout Fields ─────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Customer Information */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
                1. Customer Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Full Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Kasun Jayawardena"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="e.g. kasun@example.com"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Phone Number (Sri Lanka)"
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0711093799 or +94711093799"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
                2. Shipping Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address, building, floor"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 2 (Optional)"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit (optional)"
                  />
                </div>

                <div>
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Colombo, Kandy, Galle"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Postal Code (Optional)"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 00300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleChange}
                    placeholder="Special delivery instructions, gate code, or preferred contact time..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9375rem',
                      borderRadius: '8px',
                      border: '1.5px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
                3. Choose Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Option A: PayHere Online Payment */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: `2px solid ${formData.paymentMethod === 'PAYHERE' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: formData.paymentMethod === 'PAYHERE' ? 'var(--color-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYHERE"
                    checked={formData.paymentMethod === 'PAYHERE'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'PAYHERE' }))}
                    style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      <CreditCard size={20} color="var(--color-primary)" />
                      <span>Online Card Payment — PayHere Sandbox</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Secure card checkout supporting Visa, MasterCard, and AMEX via official PayHere Sandbox.
                    </p>
                  </div>
                </label>

                {/* Option B: WhatsApp Direct Ordering */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: `2px solid ${formData.paymentMethod === 'WHATSAPP' ? '#16a34a' : 'var(--color-border)'}`,
                    backgroundColor: formData.paymentMethod === 'WHATSAPP' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WHATSAPP"
                    checked={formData.paymentMethod === 'WHATSAPP'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'WHATSAPP' }))}
                    style={{ marginTop: '0.25rem', accentColor: '#16a34a' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#166534' }}>
                      <Phone size={20} color="#16a34a" />
                      <span>Direct WhatsApp Order</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Instant order reservation. Generates pre-formatted WhatsApp message to business staff for manual confirmation and bank transfer.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Review Sidebar ─────────────── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-card)',
              position: 'sticky',
              top: '100px',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
              Order Items ({items.length})
            </h2>

            {/* Items Mini List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
              {items.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      Qty: {item.quantity} × LKR {Number(item.product.price).toLocaleString('en-LK')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    LKR {(Number(item.product.price) * item.quantity).toLocaleString('en-LK')}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal</span>
                <span>LKR {getSubtotal().toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>Delivery</span>
                <span>
                  {getDeliveryFee() === 0 ? (
                    <strong style={{ color: '#059669' }}>FREE</strong>
                  ) : (
                    `LKR ${getDeliveryFee().toFixed(2)}`
                  )}
                </span>
              </div>

              <div
                style={{
                  borderTop: '1.5px dashed var(--color-border)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>Total</span>
                <Price amount={getEstimatedTotal()} size="lg" />
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ marginTop: '1.75rem' }}>
              <Button
                type="submit"
                size="lg"
                variant={formData.paymentMethod === 'WHATSAPP' ? 'success' : 'primary'}
                isLoading={loading}
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={18} />}
              >
                {formData.paymentMethod === 'WHATSAPP' ? 'Place WhatsApp Order' : 'Proceed to PayHere Checkout'}
              </Button>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Lock size={14} color="#10b981" /> 256-Bit Encrypted Secure Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
