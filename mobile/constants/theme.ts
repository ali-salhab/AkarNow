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
  { key: "apartment", label: "شقة", labelAr: "شقة", icon: "business" },
  { key: "villa", label: "فيلا", labelAr: "فيلا", icon: "home" },
  { key: "chalet", label: "شاليه", labelAr: "شاليه", icon: "beach-access" },
  { key: "studio", label: "استوديو", labelAr: "استوديو", icon: "bed" },
  { key: "office", label: "مكتب", labelAr: "مكتب", icon: "work" },
  { key: "land", label: "أرض", labelAr: "أرض", icon: "landscape" },
];

export const LISTING_TYPES = [
  { key: "rent", label: "للإيجار", labelAr: "للإيجار", color: "#0EC6E3" },
  { key: "sale", label: "للبيع", labelAr: "للبيع", color: "#1A85E6" },
  { key: "buy", label: "شراء", labelAr: "شراء", color: "#22C55E" },
];

export const VIEW_TYPES = [
  { key: "sea", label: "إطلالة بحرية", labelAr: "إطلالة بحرية", icon: "🌊" },
  { key: "garden", label: "إطلالة حديقة", labelAr: "إطلالة حديقة", icon: "🌿" },
  {
    key: "city",
    label: "إطلالة المدينة",
    labelAr: "إطلالة المدينة",
    icon: "🏙️",
  },
  { key: "pool", label: "إطلالة مسبح", labelAr: "إطلالة مسبح", icon: "🏊" },
  {
    key: "mountain",
    label: "إطلالة جبلية",
    labelAr: "إطلالة جبلية",
    icon: "⛰️",
  },
];

export const AMENITIES = [
  { key: "parking", label: "مواقف سيارات", icon: "car-outline" },
  { key: "gym", label: "صالة رياضية", icon: "barbell-outline" },
  { key: "pool", label: "مسبح", icon: "water-outline" },
  { key: "security", label: "أمن وحراسة", icon: "shield-checkmark-outline" },
  { key: "elevator", label: "مصعد", icon: "arrow-up-circle-outline" },
  { key: "balcony", label: "شرفة", icon: "sunny-outline" },
  { key: "maid_room", label: "غرفة خادمة", icon: "person-outline" },
  { key: "furnished", label: "مفروش", icon: "home-outline" },
  { key: "central_ac", label: "تكييف مركزي", icon: "snow-outline" },
  { key: "internet", label: "إنترنت", icon: "wifi-outline" },
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
