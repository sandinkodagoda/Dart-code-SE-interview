import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getEstimatedTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (product: Product, quantity = 1, shouldOpenDrawer = true) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id,
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = Math.min(
              updated[existingIndex].quantity + quantity,
              product.stockQuantity,
            );
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
            };
            return {
              items: updated,
              isDrawerOpen: shouldOpenDrawer ? true : state.isDrawerOpen,
            };
          }

          const safeQty = Math.min(quantity, Math.max(product.stockQuantity, 1));
          return {
            items: [...state.items, { product, quantity: safeQty }],
            isDrawerOpen: shouldOpenDrawer ? true : state.isDrawerOpen,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            };
          }

          return {
            items: state.items.map((item) => {
              if (item.product.id === productId) {
                const maxStock = item.product.stockQuantity || 99;
                return {
                  ...item,
                  quantity: Math.min(quantity, maxStock),
                };
              }
              return item;
            }),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0,
        );
      },

      getDeliveryFee: () => {
        // Flat standard delivery fee in LKR; free over 10,000 LKR
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 10000 ? 0 : 350;
      },

      getEstimatedTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },
    }),
    {
      name: 'techgadgets_shopping_cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
