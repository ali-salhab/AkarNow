/**
 * Auth Store (Zustand)
 * Manages authentication state with SecureStore persistence
 */

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";
import { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  initialize: () => Promise<void>;
  sendOTP: (phone: string) => Promise<{ devCode?: string }>;
  verifyOTP: (phone: string, code: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setOnboarded: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,

  /**
   * Initialize auth from SecureStore on app launch
   */
  initialize: async () => {
    try {
      const [token, userStr, onboarded] = await Promise.all([
        SecureStore.getItemAsync("auth_token"),
        SecureStore.getItemAsync("auth_user"),
        SecureStore.getItemAsync("is_onboarded"),
      ]);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
          isOnboarded: onboarded === "true",
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          isOnboarded: onboarded === "true",
        });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  /**
   * Send OTP – returns devCode in development
   */
  sendOTP: async (phone: string) => {
    const response = await authAPI.sendOTP(phone);
    return { devCode: response.data?.devCode };
  },

  /**
   * Verify OTP and persist auth state
   */
  verifyOTP: async (phone: string, code: string, name?: string) => {
    try {
      const response = await authAPI.verifyOTP(phone, code, name);
      const { token, user } = response.data;

      // Persist to SecureStore
      await Promise.all([
        SecureStore.setItemAsync("auth_token", token),
        SecureStore.setItemAsync("auth_user", JSON.stringify(user)),
      ]);

      set({ token, user, isAuthenticated: true });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Logout — clear all persisted data
   */
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("auth_token"),
      SecureStore.deleteItemAsync("auth_user"),
    ]);
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (data: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...data };
      set({ user: updated });
      SecureStore.setItemAsync("auth_user", JSON.stringify(updated));
    }
  },

  setOnboarded: async () => {
    await SecureStore.setItemAsync("is_onboarded", "true");
    set({ isOnboarded: true });
  },
}));
