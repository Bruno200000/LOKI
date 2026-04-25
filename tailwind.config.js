/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ci-orange': {
          50: '#FFF5EB',
          100: '#FFE6CC',
          200: '#FFCC99',
          300: '#FFB266',
          400: '#FF9933',
          500: '#FF9000',
          600: '#CC7300',
          700: '#995600',
          800: '#663A00',
          900: '#331D00',
        },
        'ci-green': {
          50: '#E6F9F0',
          100: '#CCF2E0',
          200: '#99E5C1',
          300: '#66D9A3',
          400: '#33CC84',
          500: '#00CD66',
          600: '#00A452',
          700: '#007B3D',
          800: '#005229',
          900: '#002914',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
