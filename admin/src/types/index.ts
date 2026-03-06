// ─── Core Entities ────────────────────────────────────────────────────────────

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface User {
  _id: string;
  name?: string;
  phone: string;
  email?: string;
  role: "user" | "agent" | "admin";
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
  verificationRejectionReason?: string;
  hasOffice?: boolean;
  officeName?: string;
  officeLocation?: string;
  residenceCity?: string;
  createdAt: string;
  lastLogin?: string;
  propertiesCount?: number;
  favoritesCount?: number;
}

export interface City {
  _id: string;
  name: string;
  nameAr: string;
  countryCode: string;
  isActive: boolean;
  propertiesCount: number;
  liveCount?: number;
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  titleAr?: string;
  description?: string;
  listingType: "rent" | "sale" | "buy";
  propertyType: string;
  price: number;
  currency: string;
  city: City | string;
  district?: string;
  area: number;
  rooms?: number;
  bathrooms?: number;
  status: "available" | "rented" | "sold" | "inactive";
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  images: string[];
  coverImage?: string;
  owner?: { _id: string; name?: string; phone: string };
  contactPhone?: string;
  agentName?: string;
  address?: string;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalProperties: number;
    newPropertiesThisMonth: number;
    activeProperties: number;
    featuredProperties: number;
    totalFavorites: number;
    totalCities: number;
    totalViews: number;
  };
  charts: {
    propertyByType: Array<{ _id: string; count: number }>;
    propertyByListing: Array<{ _id: string; count: number }>;
    topCities: Array<{ _id: string; name: string; count: number }>;
    dailyUsers: Array<{ _id: string; count: number }>;
    dailyProperties: Array<{ _id: string; count: number }>;
  };
}

// ─── Table / UI ───────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}
