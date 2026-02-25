/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "delay-100",
    "delay-200",
    "delay-300",
    "delay-400",
    "delay-500",
    "delay-600",
    "delay-700",
    "delay-800",
    "animate-fadeIn",
    "animate-fadeInDown",
    "animate-fadeInUp",
    "animate-slideInRight",
    "animate-scaleIn",
    "animate-floatBubble",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#1A85E6",
          600: "#1A3C6E",
          700: "#153168",
          800: "#0F2557",
          900: "#091A3E",
        },
        accent: "#0EC6E3",
      },
      fontFamily: {
        sans: ["Cairo", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
