/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          green: '#5DA832',
          'green-dark': '#3D7A1E',
          'green-light': '#7BC442',
          dirt: '#866043',
          'dirt-dark': '#5C3D1E',
          stone: '#7F7F7F',
          'stone-dark': '#3F3F3F',
          'stone-light': '#AFAFAF',
          gold: '#FFAA00',
          diamond: '#3EEEFF',
          redstone: '#CC0000',
          lapis: '#1947A3',
          obsidian: '#1A1A2E',
          'obsidian-light': '#16213E',
          'obsidian-mid': '#0F3460',
          creeper: '#53A53E',
          sky: '#6EB3F3',
        }
      },
      fontFamily: {
        minecraft: ['"Press Start 2P"', 'monospace'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'mc-grid': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'mc-grid': '32px 32px',
      },
      boxShadow: {
        'mc': '4px 4px 0px rgba(0,0,0,0.5)',
        'mc-lg': '6px 6px 0px rgba(0,0,0,0.5)',
        'mc-inset': 'inset 2px 2px 0px rgba(0,0,0,0.3)',
        'glow-green': '0 0 20px rgba(93,168,50,0.4)',
        'glow-diamond': '0 0 20px rgba(62,238,255,0.3)',
        'glow-gold': '0 0 20px rgba(255,170,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }
    },
  },
  plugins: [],
}
