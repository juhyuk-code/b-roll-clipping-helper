/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#090909',
        surface: '#111111',
        border: 'rgba(255,255,255,0.06)',
        'border-light': 'rgba(255,255,255,0.12)',
        accent: {
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          teal: '#14b8a6',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '760px',
      },
    },
  },
  plugins: [],
};
