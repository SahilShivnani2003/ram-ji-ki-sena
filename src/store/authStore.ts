// ─── Sanatan Seva Platform – Auth Store ──────────────────────────────────────
// Zustand store for authentication state management

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI, User, LoginPayload, RegisterPayload, TokenService } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;

  // Computed
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      status: 'idle',
      error: null,

      // Computed
      get isAuthenticated() {
        return get().status === 'authenticated' && get().user !== null;
      },
      get isLoading() {
        return get().status === 'loading';
      },

      // ── Actions ──────────────────────────────────────────────────────────

      login: async (payload: LoginPayload) => {
        set({ status: 'loading', error: null });

        const res = await AuthAPI.login(payload);

        if (res.success && res.data?.user) {
          set({
            user: res.data.user,
            token: res.token ?? null,
            status: 'authenticated',
            error: null,
          });
          return { success: true };
        }

        set({
          status: 'unauthenticated',
          error: res.message ?? 'लॉगिन विफल हुआ',
        });
        return { success: false, message: res.message };
      },

      register: async (payload: RegisterPayload) => {
        set({ status: 'loading', error: null });

        const res = await AuthAPI.register(payload);

        if (res.success && res.data?.user) {
          set({
            user: res.data.user,
            token: res.token ?? null,
            status: 'authenticated',
            error: null,
          });
          return { success: true };
        }

        set({
          status: 'unauthenticated',
          error: res.message ?? 'पंजीकरण विफल हुआ',
        });
        return { success: false, message: res.message };
      },

      logout: async () => {
        set({ status: 'loading' });
        await AuthAPI.logout();
        set({
          user: null,
          token: null,
          status: 'unauthenticated',
          error: null,
        });
      },

      restoreSession: async () => {
        const token = await TokenService.get();

        if (!token) {
          set({ status: 'unauthenticated' });
          return;
        }

        set({ status: 'loading' });
        const res = await AuthAPI.getMe();

        if (res.success && res.data?.user) {
          set({
            user: res.data.user,
            token,
            status: 'authenticated',
            error: null,
          });
        } else {
          await TokenService.remove();
          set({
            user: null,
            token: null,
            status: 'unauthenticated',
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'sanatan-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields; status is recalculated on boot
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAuthStatus = (state: AuthState) => state.status;
export const selectAuthError = (state: AuthState) => state.error;
