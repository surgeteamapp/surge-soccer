/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#8a2be2',
          'purple-light': '#a855f7',
          'purple-lighter': '#c084fc',
          'purple-lightest': '#e9d5ff',
        },
        glass: {
          bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(138, 43, 226, 0.12) 50%, rgba(255, 255, 255, 0.06) 100%)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        card: {
          bg: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
          border: 'rgba(138, 43, 226, 0.3)',
        },
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(138, 43, 226, 0.12) 50%, rgba(255, 255, 255, 0.06) 100%)',
        'card': 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
