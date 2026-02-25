/**
 * AqarNow Spacing & Design System Constants
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 40,
};

export const Shadow = {
  sm: {
    shadowColor: "#1A3C6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#1A3C6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: "#1A3C6E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const PROPERTY_TYPES = [
  { key: "apartment", label: "Apartment", labelAr: "شقة", icon: "business" },
  { key: "villa", label: "Villa", labelAr: "فيلا", icon: "home" },
  { key: "chalet", label: "Chalet", labelAr: "شاليه", icon: "beach-access" },
  { key: "studio", label: "Studio", labelAr: "استوديو", icon: "bed" },
  { key: "office", label: "Office", labelAr: "مكتب", icon: "work" },
  { key: "land", label: "Land", labelAr: "أرض", icon: "landscape" },
];

export const LISTING_TYPES = [
  { key: "rent", label: "For Rent", labelAr: "للإيجار", color: "#0EC6E3" },
  { key: "sale", label: "For Sale", labelAr: "للبيع", color: "#1A85E6" },
  { key: "buy", label: "Buy", labelAr: "شراء", color: "#22C55E" },
];

export const VIEW_TYPES = [
  { key: "sea", label: "Sea View", labelAr: "إطلالة بحرية", icon: "🌊" },
  { key: "garden", label: "Garden View", labelAr: "إطلالة حديقة", icon: "🌿" },
  { key: "city", label: "City View", labelAr: "إطلالة المدينة", icon: "🏙️" },
  { key: "pool", label: "Pool View", labelAr: "إطلالة مسبح", icon: "🏊" },
  {
    key: "mountain",
    label: "Mountain View",
    labelAr: "إطلالة جبلية",
    icon: "⛰️",
  },
];

export const AMENITIES = [
  { key: "parking", label: "Parking", icon: "car-outline" },
  { key: "gym", label: "Gym", icon: "barbell-outline" },
  { key: "pool", label: "Pool", icon: "water-outline" },
  { key: "security", label: "Security", icon: "shield-checkmark-outline" },
  { key: "elevator", label: "Elevator", icon: "arrow-up-circle-outline" },
  { key: "balcony", label: "Balcony", icon: "sunny-outline" },
  { key: "maid_room", label: "Maid's Room", icon: "person-outline" },
  { key: "furnished", label: "Furnished", icon: "home-outline" },
  { key: "central_ac", label: "Central A/C", icon: "snow-outline" },
  { key: "internet", label: "Internet", icon: "wifi-outline" },
];

export const CURRENCIES: Record<string, string> = {
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  BHD: "د.ب",
  QAR: "ر.ق",
  OMR: "ر.ع",
  EGP: "ج.م",
  USD: "$",
};
