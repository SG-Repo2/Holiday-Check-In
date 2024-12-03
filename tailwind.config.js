/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'hydro-blue': '#17458F',
        'hydro-blue-light': '#2563eb',
        'hydro-blue-dark': '#1e3a8a',
      },
      spacing: {
        '18': '4.5rem',
        '32': '8rem',
      },
      zIndex: {
        '20': '20',
        '30': '30',
        '40': '40',
      },
    },
  },
  plugins: [],
}

