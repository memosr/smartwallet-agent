import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#1a1a1a",
        border: "#2a2a2a",
        accent: "#22c55e",
        danger: "#ef4444",
        muted: "#6b7280",
        text: "#f5f5f5",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        flash: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.7)" },
          "50%": { boxShadow: "0 0 0 16px rgba(34,197,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        scanline: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
      },
      animation: {
        flash: "flash 0.6s ease-out",
        shake: "shake 0.4s ease-in-out",
        fadeIn: "fadeIn 0.3s ease-out",
        pulse: "pulse 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
