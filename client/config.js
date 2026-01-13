/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tailwind traži klase u ovim fajlovima
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   // Bokadirekt plava
        secondary: '#0f172a',
        muted: '#f1f5f9',
        keyframes: {
          fadeInUp: {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        },
        animation: {
          fadeInUp: 'fadeInUp 0.6s ease-out',
        },
      },
    },
    plugins: [],
  };

