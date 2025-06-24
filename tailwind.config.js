/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nature Theme Colors
        'nature-green': '#4CAF50',
        'nature-dark-green': '#2E7D32',
        'nature-brown': '#8D6E63',
        'sun-yellow': '#FFEB3B',
        'fresh-orange': '#FFA726',
        'fresh-orange-hover': '#FFB74D',
        'soft-beige': '#F5F5DC',
        'cool-gray': '#616161',
        'light-beige': '#FAFAF7',
        'border-beige': '#E8E8E0',
      },
      animation: {
        'bounce': 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
};