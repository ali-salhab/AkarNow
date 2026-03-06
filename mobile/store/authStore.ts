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
  login: (phone: string, password?: string) => Promise<{ devCode?: string }>;
  register: (
    phone: string,
    firstName: string,
    lastName: string,
    email?: string,
    password?: string,
  ) => Promise<{ devCode?: string }>;
  sendOTP: (phone: string) => Promise<{ devCode?: string }>;
  verifyOTP: (
    phone: string,
    code: string,
    name?: string,
    email?: string,
    password?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  devLogin: () => Promise<void>;
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
   * Register new account — sends OTP, returns devCode in dev
   */
  register: async (
    phone: string,
    firstName: string,
    lastName: string,
    email?: string,
    password?: string,
  ) => {
    const response = await authAPI.register(
      phone,
      firstName,
      lastName,
      email,
      password,
    );
    return { devCode: response.data?.devCode };
  },

  /**
   * Login with phone + optional password — sends OTP, returns devCode in dev
   */
  login: async (phone: string, password?: string) => {
    const response = await authAPI.login(phone, password);
    return { devCode: response.data?.devCode };
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
  verifyOTP: async (
    phone: string,
    code: string,
    name?: string,
    email?: string,
    password?: string,
  ) => {
    try {
      const response = await authAPI.verifyOTP(
        phone,
        code,
        name,
        email,
        password,
      );
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
   * DEV ONLY — bypass backend, inject a mock authenticated user
   */
  devLogin: async () => {
    const mockToken = "dev-mock-token-12345";
    const mockUser = {
      _id: "dev-user-001",
      phone: "+966500000000",
      name: "مستخدم تجريبي",
      email: "test@aqarnow.dev",
      avatar: null,
      role: "user" as const,
      isVerified: true,
      preferredLanguage: "ar" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await Promise.all([
      SecureStore.setItemAsync("auth_token", mockToken),
      SecureStore.setItemAsync("auth_user", JSON.stringify(mockUser)),
    ]);
    set({ token: mockToken, user: mockUser, isAuthenticated: true });
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
