'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart.store';
import { formatLKR } from '@/lib/currency';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, MessageSquare, ShieldCheck, Truck } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 10000;

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getItemCount,
    getSubtotal,
    getDeliveryFee,
    getEstimatedTotal,
  } = useCartStore();

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getEstimatedTotal();

  // Progress toward free shipping
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const textLines = [
      '👋 Hello TechGadgets! I would like to order the following items from my cart:',
      '',
      ...items.map(
        (item) => `• ${item.product.name} (x${item.quantity}) - ${formatLKR(Number(item.product.price) * item.quantity)}`
      ),
      '',
      `Subtotal: ${formatLKR(subtotal)}`,
      `Delivery: ${deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}`,
      `Total: ${formatLKR(total)}`,
      '',
      'Please confirm availability and bank transfer details!',
    ];
    const encoded = encodeURIComponent(textLines.join('\n'));
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94770000000';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                YOUR SHOPPING CART <span className="text-blue-600">({itemCount})</span>
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Alert & Progress Meter */}
          <div className="px-6 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/60">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>🎉 You unlocked <strong>FREE Express Delivery</strong> nationwide!</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 font-medium mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Add <strong className="text-blue-700">{formatLKR(amountNeeded)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                  <span className="font-bold text-blue-600">{shippingProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-xs">
                  Looks like you haven't added any gear yet. Discover top gadgets now!
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/shop');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product;
                const img = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                return (
                  <div key={product.id} className="py-4 flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate mb-0.5">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeDrawer}
                          className="hover:text-blue-600 transition"
                        >
                          {product.name}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-2">
                        {product.brand?.name || 'Official Tech'} · {product.category?.name || 'Gadgets'}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:bg-slate-200 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:bg-slate-200 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-slate-900">
                          {formatLKR(Number(product.price) * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Icon */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition ml-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Checkout Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className={deliveryFee === 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-slate-900'}>
                    {deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-blue-600 text-base">{formatLKR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition duration-200"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>

              {/* View Full Cart Link */}
              <div className="text-center pt-1">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline transition"
                >
                  View Full Cart & Edit Notes →
                </Link>
              </div>

              {/* Assurance Trust Tag */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>100% Genuine Products · PayHere SSL Secured</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
