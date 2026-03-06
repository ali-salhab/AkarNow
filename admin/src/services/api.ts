import axios from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  User,
  Property,
  City,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const adminAPI = {
  login: (email: string, password: string) =>
    api.post<
      ApiResponse<{
        token: string;
        user: { _id: string; name: string; email: string; role: string };
      }>
    >("/admin/login", { email, password }),

  getStats: () => api.get<ApiResponse<DashboardStats>>("/admin/stats"),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<User>>("/admin/users", { params }),

  getById: (id: string) =>
    api.get<
      ApiResponse<User & { propertiesCount: number; favoritesCount: number }>
    >(`/admin/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),
};

// ─── Properties ───────────────────────────────────────────────────────────────
export const propertiesAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Property>>("/admin/properties", { params }),

  create: (data: FormData) =>
    api.post<ApiResponse<Property>>("/admin/properties", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: Partial<Property> | FormData) =>
    data instanceof FormData
      ? api.patch<ApiResponse<Property>>(`/admin/properties/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : api.patch<ApiResponse<Property>>(`/admin/properties/${id}`, data),

  approve: (id: string) =>
    api.patch<ApiResponse<Property>>(`/admin/properties/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.patch<ApiResponse<Property>>(`/admin/properties/${id}/reject`, {
      reason,
    }),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/properties/${id}`),
};

// ─── Verifications ────────────────────────────────────────────────────────────
export const verificationsAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<User>>("/admin/verifications", { params }),

  approve: (id: string) =>
    api.patch<ApiResponse<User>>(`/admin/verifications/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.patch<ApiResponse<User>>(`/admin/verifications/${id}/reject`, {
      reason,
    }),
};

// ─── Cities ───────────────────────────────────────────────────────────────────
export const citiesAPI = {
  getAll: () => api.get<ApiResponse<City[]>>("/admin/cities"),

  create: (data: { name: string; nameAr: string; countryCode: string }) =>
    api.post<ApiResponse<City>>("/admin/cities", data),

  update: (id: string, data: Partial<City>) =>
    api.put<ApiResponse<City>>(`/admin/cities/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/admin/cities/${id}`),
};
