/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#111113',
        'surface-elevated': '#18181b',
        'surface-hover': '#27272a',
        border: '#27272a',
        'border-subtle': '#3f3f46',
        foreground: '#fafafa',
        muted: '#a1a1aa',
        'muted-foreground': '#71717a',
        primary: '#8b5cf6',
        'primary-foreground': '#ffffff',
        'primary-hover': '#7c3aed',
        danger: '#ef4444',
        'danger-foreground': '#ffffff',
        warning: '#f59e0b',
        'warning-foreground': '#000000',
        success: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
          },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

