/**
 * AqarNow TypeScript Type Definitions
 */

export interface User {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: "user" | "agent" | "admin";
  isVerified: boolean;
  preferredLanguage: "ar" | "en";
  createdAt: string;
  updatedAt: string;
}

export interface City {
  _id: string;
  name: string;
  nameAr: string;
  country: string;
  countryCode: string;
  propertiesCount: number;
}

export type ListingType = "rent" | "sale" | "buy";
export type PropertyType =
  | "apartment"
  | "villa"
  | "chalet"
  | "studio"
  | "office"
  | "land"
  | "warehouse";
export type ViewType =
  | "sea"
  | "garden"
  | "city"
  | "pool"
  | "street"
  | "mountain"
  | "desert";
export type PropertyStatus =
  | "available"
  | "rented"
  | "sold"
  | "reserved"
  | "inactive";

export interface Property {
  _id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  currency: string;
  rentPeriod?: "daily" | "monthly" | "quarterly" | "yearly";
  city: City;
  district?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  area: number;
  rooms: number;
  bathrooms: number;
  floors?: number;
  floorNumber?: number;
  viewType: ViewType[];
  amenities: string[];
  images: string[];
  coverImage?: string;
  contactPhone: string;
  contactWhatsApp?: string;
  agentName?: string;
  agentAvatar?: string;
  status: PropertyStatus;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  // Client-side only
  isFavorited?: boolean;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  viewType?: ViewType[];
  minArea?: number;
  maxArea?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
}

export interface SearchSuggestion {
  type: "city" | "property";
  id: string;
  label: string;
  labelAr?: string;
}
