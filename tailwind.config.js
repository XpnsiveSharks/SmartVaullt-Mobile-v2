/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          default: '#FFFFFF',
        },
        secondary: {
          default: '#333333',
        },
        text: {
          default: '#f5f5f5',
          light: '#FFFFFF',
          dark: '#000000',
        },
        icons: {
          default: '#f5f5f5',
          dark: '#000000',
          light: '#a3a3a3',
        },
        bg: {
          default: '#0a0a0a',
        },
        cards: {
          default: '#141414',
          dark: '#0f0f0f',
        },
        border: {
          default: '#2a2a2a',
          dark: '#3a3a3a',
        },
        muted: {
          default: '#a3a3a3',
          dark: '#a3a3a3',
        },
        accent: {
          default: '#BFFF00',
          dim: '#8fbf00',
        },
        accent2: {
          default: '#34d399',
          dim: '#059669',
        },
        status: {
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#EF4444',
          neutral: '#71717A',
        },
        surface: {
          default: '#141414',
          active: '#1b1b1b',
          dark: '#0a0a0a',
        },
        success: {
          default: '#FFFFFF',
          dark: '#A1A1AA',
          light: '#F4F4F5',
        },
        warning: {
          default: '#A1A1AA',
          dark: '#52525B',
          light: '#E4E4E7',
        },
        error: {
          default: '#FFFFFF',
          dark: '#71717A',
          light: '#F4F4F5',
        },
        info: {
          default: '#FFFFFF',
          dark: '#A1A1AA',
          light: '#F4F4F5',
        },
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};
