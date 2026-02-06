/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
        'wine-slate': {
          950: '#0f1115',
          900: '#1a1d23',
        },
        'somm-red': {
          900: '#2D1B22',
          500: '#783543',
        },
        champagne: {
          400: '#D4C4A3',
          100: '#F5F0E6',
        },
        'vine-green': '#4A5D44',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
