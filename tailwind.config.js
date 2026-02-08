/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'wine-slate': {
          900: '#292524', // Warm stone-like charcoal
          950: '#121011', // Warm Charcoal (Main Background)
        },
        'somm-red': {
          500: '#783543',
          900: '#2D1B22',
        },
        champagne: {
          100: '#F5F0E6', // High contrast off-white
          400: '#D4C4A3', // Gold accent
        },
        vine: '#4A5D44',
        wine: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a8b8',
          400: '#ed7491',
          500: '#e04a6e',
          600: '#cc2952',
          700: '#ab1d43',
          800: '#722F37',
          900: '#5e2730',
          950: '#3a0e17',
        },
        cream: {
          50: '#FFFDF7',
          100: '#FEFCF3',
          200: '#FDF8E8',
          300: '#F9F0D0',
          400: '#F5E6B0',
          500: '#EDD98B',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        hand: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
