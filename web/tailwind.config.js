/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#16213e',
          dark: '#0f0f23',
        },
        accent: {
          DEFAULT: '#00d4ff',
          purple: '#7c3aed',
          green: '#10b981',
          orange: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
