/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          50: '#f0e8ff',
          100: '#ddd0ff',
          200: '#c4a8ff',
          300: '#a87aff',
          400: '#8c4fff',
          500: '#7028e4',
          600: '#5a1bb8',
          700: '#42128a',
          800: '#2c0a5e',
          900: '#180434',
          950: '#0d0220',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        stardust: '#e8d5ff',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.8)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
