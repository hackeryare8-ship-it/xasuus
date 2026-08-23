/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xasuus: {
          dark: '#0e382b',
          darkHover: '#0b2d22',
          cream: '#fbf9f0',
          creamCard: '#ffffff',
          creamBorder: '#f0ede0',
          inputBg: '#e6eef8',
          iconCircle: '#e7eef8',
          textDark: '#1a202c',
          textMuted: '#5a6578',
          accent: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
