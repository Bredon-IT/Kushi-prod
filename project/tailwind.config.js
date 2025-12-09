/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        coral: {
          50: '#fef7f0',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff5a1f',
          600: '#d03801',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7c2d12',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        peach: {
          50: '#feffff',
          100: '#fedbd1',
          200: '#fad9c3',
          300: '#F2C0B3',
          400: '#f4ab7b',
          500: '#f19457',
          600: '#d97d3e',
          700: '#b56625',
          800: '#914f0c',
          900: '#6d3800',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#084061',
          800: '#1e293b',
          900: '#0f172a',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },

      // 🔥 All Keyframes (Existing + Updated borderMove)
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'marquee-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },

        // 🚀 Updated animation effect for border movement
        borderMove: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "25%": { clipPath: "inset(0 0 0 0)" },
          "50%": { clipPath: "inset(0 0 0 0)" },
          "75%": { clipPath: "inset(0 0 0 0)" },
          "100%": { clipPath: "inset(0 100% 0 0)" },
        },
      },

      // 🔥 All Animations (Existing + borderMove)
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        scroll: 'scroll 20s linear infinite',
        'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
        'marquee-scroll': 'marquee-scroll 30s linear infinite',

        // 🚀 Animate border movement
        borderMove: 'borderMove 1.2s linear infinite',
      },

      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
