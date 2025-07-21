/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        "portfolio-bg": "#E8E0D4",
        "portfolio-card": "#F5F1EB",
        "portfolio-red": "#E85A5A",
        "portfolio-orange": "#F4A623",
      },
    },
  },
  plugins: [],
};
