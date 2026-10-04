/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif']
      },
      colors: {
        bg: '#F3F5FB',
        surface: '#FFFFFF',
        surface2: '#F1F3F9',
        line: '#E7E9F5',
        ink: '#1E2333',
        'ink-dim': '#6B7280',
        'ink-faint': '#9AA1B5',
        em: '#12B886',
        rose: '#FF6B6B',
        amber: '#FFA94D',
        blue: '#4C7BF3',
        violet: '#6C5CE7'
      },
      boxShadow: { card: '0 2px 10px rgba(30,35,51,.06)' }
    }
  },
  plugins: []
}
