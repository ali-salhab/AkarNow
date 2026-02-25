/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 content pattern
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // AqarNow Brand Colors
        primary: {
          50: "#EBF5FF",
          100: "#DBEFFE",
          200: "#BAE0FD",
          300: "#7CC5FB",
          400: "#38A4F5",
          500: "#1A85E6",
          600: "#0F67C5",
          700: "#0E52A0",
          800: "#1A3C6E", // Main brand dark blue
          900: "#162D54",
        },
        accent: {
          400: "#38D9F5",
          500: "#0EC6E3", // Main accent cyan
          600: "#0BACCC",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
        },
        // Status colors
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        // Listing type badges
        rent: "#0EC6E3",
        sale: "#1A85E6",
        buy: "#22C55E",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 4px 20px rgba(26, 60, 110, 0.08)",
        "card-lg": "0 8px 40px rgba(26, 60, 110, 0.12)",
      },
    },
  },
  plugins: [],
};
