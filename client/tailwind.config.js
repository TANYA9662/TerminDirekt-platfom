/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        primaryHover: "#4338CA",
        secondary: "#F3F4F6",
        secondaryDark: "#374151",
        accent: "#EF4444",
        accentLight: "#F87171",
        muted: "#9CA3AF",
        textDark: "#111827",
        textLight: "#374151",
        cardBg: "#FFFFFF",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
