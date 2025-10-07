import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-bg) / <alpha-value>)",
        foreground: "rgb(var(--color-fg) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-on-primary) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-on-secondary) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-on-accent) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-on-success) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-on-danger) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-on-warning) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "grid-sleek":
          "radial-gradient(circle at top left, rgba(124,58,237,0.28), transparent 55%), radial-gradient(circle at bottom right, rgba(2,132,199,0.25), transparent 60%)",
        "mesh-radiance":
          "radial-gradient(120% 120% at 10% 10%, rgba(124,58,237,0.24), rgba(255,255,255,0)), radial-gradient(120% 120% at 90% 40%, rgba(14,165,233,0.22), rgba(255,255,255,0)), linear-gradient(160deg, rgba(248,250,255,0.8), rgba(240,249,255,0.45))",
        "spotlight-faint":
          "radial-gradient(650px circle at 0% 0%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(600px circle at 100% 0%, rgba(6,182,212,0.28), transparent 55%)",
      },
      boxShadow: {
        soft: "0 12px 40px -18px rgba(15,23,42,0.35)",
        glow: "0 22px 65px -28px rgba(79,70,229,0.55)",
        "inner-border": "inset 0 1px 0 rgba(255,255,255,0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
        "pan-slow": {
          "0%": { transform: "translate3d(0%, 0%, 0)" },
          "50%": { transform: "translate3d(-3%, 4%, 0)" },
          "100%": { transform: "translate3d(0%, 0%, 0)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        "pan-slow": "pan-slow 20s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;