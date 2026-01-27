/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette GEN ALIXIR - Inspirée de l'Afrique
        primary: {
          50: '#fef3e7',
          100: '#fde7cf',
          200: '#fbcf9f',
          300: '#f9b76f',
          400: '#f79f3f',
          500: '#f5870f', // Orange principal (soleil africain)
          600: '#c46c0c',
          700: '#935109',
          800: '#623606',
          900: '#311b03',
        },
        secondary: {
          50: '#e8f5f1',
          100: '#d1ebe3',
          200: '#a3d7c7',
          300: '#75c3ab',
          400: '#47af8f',
          500: '#199b73', // Vert (nature, croissance)
          600: '#147c5c',
          700: '#0f5d45',
          800: '#0a3e2e',
          900: '#051f17',
        },
        accent: {
          50: '#f0f4fb',
          100: '#e1e9f7',
          200: '#c3d3ef',
          300: '#a5bde7',
          400: '#87a7df',
          500: '#6991d7', // Bleu (digital, innovation)
          600: '#5474ac',
          700: '#3f5781',
          800: '#2a3a56',
          900: '#151d2b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
