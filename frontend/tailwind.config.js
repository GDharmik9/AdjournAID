/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBFBFA',
          100: '#F5F5F3',
          200: '#E9E9E6',
          300: '#D9D9D4',
          800: '#262624',
          900: '#1C1C1A',
        },
        slate: {
          850: '#162032',
          900: '#0F172A',
          950: '#090D16',
        },
        brand: {
          primary: '#4F46E5',  // Soothing Indigo
          accent: '#0EA5E9',   // Soft Sky
          warm: '#D97706',     // Muted Amber
          danger: '#E11D48',   // Muted Rose/Crimson
          success: '#059669',  // Calm Emerald
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        legal: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'monospace'],
      }
    },
  },
  plugins: [],
}
