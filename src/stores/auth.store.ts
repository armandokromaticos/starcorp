/**
 * Auth Store — Zustand
 *
 * Manages OAuth tokens and user session.
 * Tokens are persisted in SecureStore for security.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  name: string;
  email: string;
  companyId: string;
}

interface AuthState {
  qbAccessToken: string | null;
  qbRefreshToken: string | null;
  azureAccessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setQBTokens: (access: string, refresh: string) => void;
  setAzureToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrateFromSecureStore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  qbAccessToken: null,
  qbRefreshToken: null,
  azureAccessToken: null,
  user: null,
  isAuthenticated: false,

  setQBTokens: async (access, refresh) => {
    await SecureStore.setItemAsync('qb_access_token', access);
    await SecureStore.setItemAsync('qb_refresh_token', refresh);
    set({ qbAccessToken: access, qbRefreshToken: refresh });
  },

  setAzureToken: async (token) => {
    await SecureStore.setItemAsync('azure_token', token);
    set({ azureAccessToken: token });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  logout: async () => {
    await SecureStore.deleteItemAsync('qb_access_token');
    await SecureStore.deleteItemAsync('qb_refresh_token');
    await SecureStore.deleteItemAsync('azure_token');
    set({
      qbAccessToken: null,
      qbRefreshToken: null,
      azureAccessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  hydrateFromSecureStore: async () => {
    const [qbAccess, qbRefresh, azure] = await Promise.all([
      SecureStore.getItemAsync('qb_access_token'),
      SecureStore.getItemAsync('qb_refresh_token'),
      SecureStore.getItemAsync('azure_token'),
    ]);
    set({
      qbAccessToken: qbAccess,
      qbRefreshToken: qbRefresh,
      azureAccessToken: azure,
      isAuthenticated: !!(qbAccess && azure),
    });
  },
}));
