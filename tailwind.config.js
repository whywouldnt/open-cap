/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        surface: {
          50: "#222228",
          100: "#1b1b20",
          200: "#16161a",
          300: "#111114",
          400: "#0d0d10",
        },
        brand: {
          cyan: "#00f0ff",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#a855f7",
          blue: "#3b82f6",
        },
        track: {
          video: "#1e3a8a",
          audio: "#065f46",
          text: "#7c2d12",
          effect: "#581c87",
          overlay: "#831843",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
