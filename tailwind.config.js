/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Coffee Browns
        coffee: {
          dark: '#4A3428',
          medium: '#6B4E3D',
          light: '#8B6F4C',
        },
        // Cream & Beige Tones
        cream: {
          primary: '#F5E6D3',
          secondary: '#E8D5C4',
          tertiary: '#DBC4A9',
        },
        // Accent Colors
        orange: {
          accent: '#D2691E',
        },
        golden: {
          accent: '#DAA520',
        },
        warm: {
          white: '#FAF7F2',
        },
        // Text Colors
        text: {
          primary: '#2C1810',
          secondary: '#5D4037',
          muted: '#8D6E63',
          inverse: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};