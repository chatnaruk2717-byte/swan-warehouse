/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warehouse: {
          dark: '#051610',      // Deepest background green-black
          navy: '#1B4D3E',      // Primary corporate green (Green)
          slate: '#0F271E',     // Card slate green in dark mode
          light: '#F4F9F6',     // Light background green-white
          orange: '#F97316',    // Accent Orange (Orange)
          amber: '#F59E0B',     // Level indicators
          green: '#10B981',     // Success green
          red: '#EF4444'        // Alarm red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
