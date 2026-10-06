import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '@/types';

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  setAdmin: (admin: AdminUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: (token: string, admin: AdminUser) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('techgadgets_admin_token', token);
        }
        set({
          token,
          admin,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('techgadgets_admin_token');
        }
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        });
      },

      setAdmin: (admin: AdminUser) => {
        set({ admin });
      },
    }),
    {
      name: 'techgadgets_admin_auth',
    },
  ),
);
