/**
 * Favorites Store (Zustand)
 */

import { create } from "zustand";
import { favoritesAPI } from "../services/api";
import { Property } from "../types";

interface FavoriteStore {
  favorites: Property[];
  favoriteIds: Set<string>;
  isLoading: boolean;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorited: (propertyId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const response = await favoritesAPI.getAll();
      const properties = response.data.data;
      const ids = new Set(properties.map((p: Property) => p._id));
      set({ favorites: properties, favoriteIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (propertyId: string) => {
    const current = get().favoriteIds;
    const isFav = current.has(propertyId);

    // Optimistic update
    const newIds = new Set(current);
    if (isFav) {
      newIds.delete(propertyId);
    } else {
      newIds.add(propertyId);
    }
    set({ favoriteIds: newIds });

    try {
      await favoritesAPI.toggle(propertyId);
      if (isFav) {
        set((state) => ({
          favorites: state.favorites.filter((f) => f._id !== propertyId),
        }));
      }
    } catch {
      // Revert on failure
      set({ favoriteIds: current });
    }
  },

  isFavorited: (propertyId: string) => get().favoriteIds.has(propertyId),
}));
