import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'emerald-glow': 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'emerald-glow-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
