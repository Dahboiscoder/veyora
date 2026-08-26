import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#06070a",
          50: "#f4f5f7",
          100: "#e3e5ea",
          200: "#c3c7d1",
          300: "#9a9fae",
          400: "#6b7080",
          500: "#4a4e5c",
          600: "#33363f",
          700: "#212329",
          800: "#15161b",
          900: "#0c0d10",
          950: "#06070a",
        },
        ember: {
          50: "#fff6ed",
          100: "#ffe9d3",
          200: "#ffcfa1",
          300: "#ffab5f",
          400: "#ff8a3d",
          500: "#f96a1f",
          600: "#ea4d15",
          700: "#c23713",
          800: "#9a2c17",
          900: "#7c2716",
        },
        aurora: {
          50: "#edfcff",
          100: "#d3f7ff",
          200: "#aef0ff",
          300: "#72e5ff",
          400: "#2fd2f5",
          500: "#0cb4db",
          600: "#0090b8",
          700: "#057395",
          800: "#0c5d7a",
          900: "#0f4d67",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 50% 0%, rgba(249,106,31,0.18), transparent 60%), radial-gradient(circle at 80% 20%, rgba(12,180,219,0.12), transparent 55%)",
        "ember-aurora": "linear-gradient(120deg, #f96a1f 0%, #ff8a3d 35%, #0cb4db 100%)",
        "glass-sheen": "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(249,106,31,0.45)",
        "glow-cyan": "0 0 40px -10px rgba(12,180,219,0.45)",
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        glow: "glow 3s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin 18s linear infinite",
        "pulse-live": "pulse-live 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.15)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
