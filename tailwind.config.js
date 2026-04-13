/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030913',
          900: '#070f1f',
          800: '#0b1426',
          700: '#111d35',
          600: '#1a2c4e',
          500: '#2a3f6b',
          400: '#3d5a8a',
        },
        gold: {
          100: '#fdf6e3',
          200: '#f5e8c7',
          300: '#ecd49a',
          400: '#e0bc68',
          500: '#c9a84c',
          600: '#a07c2e',
          700: '#7a5c1a',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        crimson: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
