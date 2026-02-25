/**
 * AqarNow Color System
 * Consistent color palette matching the brand identity
 */

export const Colors = {
  // Brand
  primary: "#1A3C6E", // Deep navy blue (main)
  primaryLight: "#1A85E6", // Bright blue
  primaryLighter: "#38A4F5",
  accent: "#0EC6E3", // Cyan accent
  accentLight: "#38D9F5",

  // Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  card: "#FFFFFF",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  // Status
  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Listing badges
  rent: "#0EC6E3",
  sale: "#1A85E6",
  buy: "#22C55E",

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ["#1A3C6E", "#1A85E6"] as const,
  gradientAccent: ["#0EC6E3", "#38D9F5"] as const,
  gradientSplash: ["#0F172A", "#1A3C6E", "#1A85E6"] as const,
  gradientCard: ["rgba(26,60,110,0)", "rgba(26,60,110,0.85)"] as const,

  // Overlay
  overlay: "rgba(0,0,0,0.5)",
  overlayLight: "rgba(0,0,0,0.3)",

  // Glass effect
  glass: "rgba(255,255,255,0.15)",
  glassBorder: "rgba(255,255,255,0.25)",

  transparent: "transparent",

  // Tab bar
  tabActive: "#1A3C6E",
  tabInactive: "#94A3B8",
};

export type ColorKey = keyof typeof Colors;
