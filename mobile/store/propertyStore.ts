/**
 * Property Store (Zustand)
 * Manages property listings, search, and filter state
 */

import { create } from "zustand";
import { propertiesAPI } from "../services/api";
import { Property, PropertyFilters, Pagination } from "../types";

interface PropertyStore {
  properties: Property[];
  featured: Property[];
  selectedProperty: Property | null;
  filters: PropertyFilters;
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchProperties: (
    filters?: PropertyFilters,
    reset?: boolean,
  ) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  loadMore: () => Promise<void>;
  setFilters: (filters: PropertyFilters) => void;
  clearFilters: () => void;
  setSearchQuery: (q: string) => void;
  setPropertyFavorited: (id: string, isFavorited: boolean) => void;
}

const DEFAULT_FILTERS: PropertyFilters = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  featured: [],
  selectedProperty: null,
  filters: DEFAULT_FILTERS,
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  searchQuery: "",

  fetchProperties: async (filters?: PropertyFilters, reset = true) => {
    const currentFilters = { ...get().filters, ...filters };

    if (reset) {
      set({
        isLoading: true,
        error: null,
        filters: { ...currentFilters, page: 1 },
      });
    } else {
      set({ isLoadingMore: true });
    }

    try {
      const response = await propertiesAPI.getAll(get().filters);
      const { data, pagination } = response.data;

      set((state) => ({
        properties: reset ? data : [...state.properties, ...data],
        pagination,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to load properties",
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  fetchFeatured: async () => {
    try {
      const response = await propertiesAPI.getFeatured();
      set({ featured: response.data.data });
    } catch (error) {
      // Silent fail for featured
    }
  },

  fetchPropertyById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await propertiesAPI.getById(id);
      set({ selectedProperty: response.data.data, isLoading: false });
      return response.data.data;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  loadMore: async () => {
    const { pagination, isLoadingMore } = get();
    if (!pagination?.hasNextPage || isLoadingMore) return;

    const nextPage = (pagination.page || 1) + 1;
    set((state) => ({
      filters: { ...state.filters, page: nextPage },
    }));

    await get().fetchProperties(undefined, false);
  },

  setFilters: (filters: PropertyFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 },
    }));
  },

  clearFilters: () => {
    set({ filters: DEFAULT_FILTERS, searchQuery: "" });
  },

  setSearchQuery: (q: string) => {
    set({
      searchQuery: q,
      filters: { ...get().filters, search: q, page: 1 },
    });
  },

  setPropertyFavorited: (id: string, isFavorited: boolean) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p._id === id ? { ...p, isFavorited } : p,
      ),
      featured: state.featured.map((p) =>
        p._id === id ? { ...p, isFavorited } : p,
      ),
      selectedProperty:
        state.selectedProperty?._id === id
          ? { ...state.selectedProperty, isFavorited }
          : state.selectedProperty,
    }));
  },
}));
