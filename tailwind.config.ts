import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#B3192B',
          dark: '#7C0F1E',
          bright: '#D8253B',
        },
        gold: {
          DEFAULT: '#B3995D',
          light: '#DBC79A',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          2: '#5C5C66',
          3: '#9A9AA3',
        },
        line: '#E8E8EC',
        bg: '#F5F5F7',
        card: '#FFFFFF',
        green: {
          DEFAULT: '#2E7D32',
        },
        amber: {
          DEFAULT: '#E08A00',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
