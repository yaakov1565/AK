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
        navy: {
          900: '#0a1128',
          800: '#0f172a',
        },
        cosmic: {
          blue: '#1a2847',
          purple: '#4a1859',
          magenta: '#6b2d5c',
        },
        gold: {
          300: '#f9d367',
          400: '#e8c468',
          500: '#d4af37',
          600: '#c5a028',
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #1a2847 0%, #2d3561 25%, #4a1859 50%, #6b2d5c 75%, #4a1859 100%)',
      },
    },
  },
  plugins: [],
}
export default config
