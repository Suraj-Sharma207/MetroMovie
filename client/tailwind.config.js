/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0a0c10',
          card: '#141721',
          cardHover: '#1c202d',
          border: '#232838',
          accent: '#e50914',
          accentHover: '#f40612',
          gold: '#f5c518',
          muted: '#8e95a5',
          text: '#f1f3f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
