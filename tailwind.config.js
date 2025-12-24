const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts,jsx,js}",
    "./pages/**/*.{tsx,ts,jsx,js}",
    "./components/**/*.{tsx,ts,jsx,js}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1b26',
        surface: '#232533',
        primary: colors.indigo, // You can now use primary-500, primary-600, etc.
        secondary: colors.emerald, // You can now use secondary-400, secondary-500 etc.
        text: colors.slate[100],
        'text-muted': colors.slate[400],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -30px) scale(1.1)' },
          '50%': { transform: 'translate(0, 40px) scale(1)' },
          '75%': { transform: 'translate(-30px, -20px) scale(0.9)' },
        }
      },
      animation: {
        blob: 'blob 8s infinite ease-in-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}