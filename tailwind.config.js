const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        around: "0 4px 15px rgba(0,0,0,0.25)",
      },
    },
  },
  screens: {
    xs: "480px",
  },
  darkMode: "class",
  plugins: [heroui(), require("tailwindcss-animate")],
};

module.exports = config;
