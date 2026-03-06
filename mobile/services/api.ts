/**
 * AqarNow API Service
 * Axios instance with interceptors for auth & error handling
 */

import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { PropertyFilters, ApiResponse, Property, City, User } from "../types";

// On Android emulator 10.0.2.2 maps to host machine's localhost.
// In production (EAS build) EXPO_PUBLIC_API_URL is injected via eas.json env.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_user");
    }
    return Promise.reject(error);
  },
);

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (phone: string, password?: string) =>
    api.post("/auth/login", { phone, password }),

  sendOTP: (phone: string) => api.post("/auth/send-otp", { phone }),

  register: (
    phone: string,
    firstName: string,
    lastName: string,
    email?: string,
    password?: string,
  ) =>
    api.post("/auth/register", { phone, firstName, lastName, email, password }),

  verifyOTP: (
    phone: string,
    code: string,
    name?: string,
    email?: string,
    password?: string,
  ) => api.post("/auth/verify-otp", { phone, code, name, email, password }),

  getMe: () => api.get<ApiResponse<User>>("/auth/me"),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>("/auth/profile", data),
};

// ─── Properties API ────────────────────────────────────────────────────────────
export const propertiesAPI = {
  getAll: (filters?: PropertyFilters) =>
    api.get<ApiResponse<Property[]>>("/properties", { params: filters }),

  getFeatured: () => api.get<ApiResponse<Property[]>>("/properties/featured"),

  getById: (id: string) => api.get<ApiResponse<Property>>(`/properties/${id}`),

  getSuggestions: (q: string) =>
    api.get("/properties/suggestions", { params: { q } }),

  create: (data: Partial<Property>) =>
    api.post<ApiResponse<Property>>("/properties", data),

  update: (id: string, data: Partial<Property>) =>
    api.put<ApiResponse<Property>>(`/properties/${id}`, data),

  delete: (id: string) => api.delete(`/properties/${id}`),
};

// ─── Favorites API ─────────────────────────────────────────────────────────────
export const favoritesAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get<ApiResponse<Property[]>>("/favorites", { params: { page, limit } }),

  toggle: (propertyId: string) => api.post(`/favorites/${propertyId}`),

  check: (propertyIds: string[]) =>
    api.post("/favorites/check", { propertyIds }),
};

// ─── Cities API ────────────────────────────────────────────────────────────────
export const citiesAPI = {
  getAll: () => api.get<ApiResponse<City[]>>("/cities"),
};

export default api;
