/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#f4f4f8',
          950: '#08080b',
          900: '#0d0d12',
          800: '#141419',
          700: '#1b1b22',
          600: '#24242d',
          500: '#2f2f3a',
          400: '#4a4a58',
          300: '#6f6f80',
          200: '#9d9dad',
          100: '#cfcfda',
          50: '#f4f4f8',
          muted: '#8f8fa0',
          faint: '#6f6f80',
        },
        surface: {
          DEFAULT: '#141419',
          raised: '#1b1b22',
          border: '#24242d',
        },
        flame: {
          50: '#ffe9ec',
          100: '#ffc7cf',
          300: '#ff8fa0',
          400: '#ff4d61',
          500: '#ef2f47',
          600: '#d31e37',
          700: '#a8172c',
        },
        brand: {
          50: '#ffe9ec',
          100: '#ffc7cf',
          300: '#ff8fa0',
          400: '#ff4d61',
          500: '#ef2f47',
          600: '#d31e37',
          700: '#a8172c',
        },
        ember: {
          400: '#ffb020',
          500: '#ff8a2b',
          600: '#ff5f2e',
        },
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #ff5f2e 0%, #ff8a2b 50%, #ffb020 100%)',
        'flame-gradient': 'linear-gradient(135deg, #ef2f47 0%, #d31e37 100%)',
      },
      blur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(239,47,71,0.25), 0 8px 30px -8px rgba(239,47,71,0.35)',
      },
    },
  },
  plugins: [],
};
