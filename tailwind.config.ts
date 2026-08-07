import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'psk': {
          'gold': '#FFD700',
          'gold-warm': '#FF9500',
          'teal-deep': '#1B4D5C',
          'green-deep': '#2D5F3F',
          'bg-base': '#091c28',
          'bg-surface': 'rgba(255,255,255,0.04)',
          'bg-elevated': 'rgba(255,255,255,0.07)',
          'border': 'rgba(255,255,255,0.10)',
          'border-strong': 'rgba(255,255,255,0.16)',
          'border-gold': 'rgba(255,215,0,0.28)',
          'text-primary': 'rgba(255,255,255,0.92)',
          'text-secondary': 'rgba(255,255,255,0.55)',
          'text-tertiary': 'rgba(255,255,255,0.28)',
          'text-muted': 'rgba(255,255,255,0.18)',
          'text-gold': 'rgba(255,215,0,0.88)',
        },
        'status': {
          'available': 'rgba(129,199,132,0.95)',
          'chauffeured': 'rgba(100,181,246,0.95)',
          'safari': 'rgba(206,147,216,0.95)',
          'service': 'rgba(255,183,77,0.95)',
          'overdue': 'rgba(239,154,154,0.98)',
          'returning': 'rgba(128,222,234,0.95)',
          'docs-expired': 'rgba(239,154,154,0.95)',
          'self-drive': 'rgba(100,181,246,0.95)',
          'grounded': 'rgba(150,150,150,0.85)',
        }
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '24px',
      },
      boxShadow: {
        'glass': '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-gold': '0 4px 20px rgba(255,215,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      borderRadius: {
        'glass-sm': '7px',
        'glass': '10px',
        'glass-lg': '12px',
        'glass-xl': '16px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
