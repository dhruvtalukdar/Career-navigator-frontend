import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        teal: {
          DEFAULT: "hsl(var(--teal))",
          dark: "hsl(var(--teal-dark))",
          light: "hsl(var(--teal-light))",
        },
        match: {
          good: "hsl(var(--match-good))",
          medium: "hsl(var(--match-medium))",
          low: "hsl(var(--match-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
keyframes: {
          "radar-pulse-1": {
            "0%": { r: "50", opacity: "0.8", strokeWidth: "3" },
            "100%": { r: "400", opacity: "0", strokeWidth: "1" }
          },
          "radar-pulse-2": {
            "0%": { r: "50", opacity: "0.6", strokeWidth: "2" },
            "100%": { r: "400", opacity: "0", strokeWidth: "1" }
          },
          "radar-pulse-3": {
            "0%": { r: "50", opacity: "0.4", strokeWidth: "2" },
            "100%": { r: "400", opacity: "0", strokeWidth: "1" }
          },
          "radar-sweep": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" }
          },
          "line-draw": {
            "0%": { strokeDasharray: "0 1000", opacity: "0" },
            "100%": { strokeDasharray: "1000 0", opacity: "1" }
          },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
animation: {
          "radar-pulse-1": "radar-pulse-1 2s ease-out infinite",
          "radar-pulse-2": "radar-pulse-2 2s ease-out infinite 0.5s",
          "radar-pulse-3": "radar-pulse-3 2s ease-out infinite 1s",
          "radar-sweep": "radar-sweep 2s linear infinite",
          "line-draw": "line-draw 0.5s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
