/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agent: {
          primary: "var(--agent-primary)",
          "primary-hover": "var(--agent-primary-hover)",
          surface: "var(--agent-surface)",
          "surface-light": "var(--agent-surface-light)",
          bg: "var(--agent-bg)",
          text: "var(--agent-text)",
          "text-muted": "var(--agent-text-muted)",
          success: "var(--agent-success)",
          error: "var(--agent-error)",
          warning: "var(--agent-warning)",
        },
      },
      boxShadow: {
        neu: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        'neu-sm': '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        'neu-inset': 'inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)',
        'neu-inset-sm': 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 2s linear infinite",
        "flash-success": "flashSuccess 1.5s ease-out",
        "flash-error": "flashError 1.5s ease-out",
      },
      keyframes: {
        flashSuccess: {
          "0%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0.7)" },
          "100%": { boxShadow: "0 0 0 20px rgba(52, 211, 153, 0)" },
        },
        flashError: {
          "0%": { boxShadow: "0 0 0 0 rgba(248, 113, 113, 0.7)" },
          "100%": { boxShadow: "0 0 0 20px rgba(248, 113, 113, 0)" },
        },
      },
    },
  },
  plugins: [],
};
