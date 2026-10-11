/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b0f1a",
          900: "#0f1420",
          800: "#141b2c",
          700: "#1b2438",
        },
        accent: {
          500: "#7c5cff",
          600: "#6c46ff",
          400: "#9b82ff",
        },
        brandblue: {
          500: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(20, 20, 43, 0.08)",
        cardDark: "0 4px 24px -4px rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
