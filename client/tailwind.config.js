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
        primary: "#2563eb",       // plava, za akcije i dugmad
        primaryHover: "#1d4ed8",  // hover za plavu
        secondary: "#0f172a",     // tamna pozadina
        secondaryLight: "#1e293b",// svetlija tamna
        accent: "#ef4444",        // crvena akcija (brisanje)
        accentLight: "#f87171",   // svetlija crvena
        muted: "#f1f5f9",         // svetlo-siva pozadina
        gray400: "#9ca3af",       // Tailwind gray-400 override
        gray500: "#6b7280",       // Tailwind gray-500 override
        black: "#000000",
        white: "#ffffff",
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
