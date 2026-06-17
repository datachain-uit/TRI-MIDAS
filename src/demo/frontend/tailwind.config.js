/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      text: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
      },
      keyframes: {
        "sway-1": {
          "0%": { transform: "translate(0, -10vh)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "25%": { transform: "translate(-30px, 25vh)" },
          "50%": { transform: "translate(15px, 50vh)" },
          "75%": { transform: "translate(-10px, 75vh)" },
          "100%": { transform: "translate(0, 110vh)", opacity: "0.2" },
        },
        "sway-2": {
          "0%": { transform: "translate(0, -10vh)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "30%": { transform: "translate(20px, 30vh)" },
          "60%": { transform: "translate(-25px, 60vh)" },
          "100%": { transform: "translate(0, 110vh)", opacity: "0.2" },
        },
        "sway-3": {
          "0%": { transform: "translate(0, -10vh)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "40%": { transform: "translate(-15px, 40vh)" },
          "80%": { transform: "translate(15px, 80vh)" },
          "100%": { transform: "translate(0, 110vh)", opacity: "0.2" },
        },
      },
      animation: {
        "fall-1": "sway-1 linear infinite",
        "fall-2": "sway-2 linear infinite",
        "fall-3": "sway-3 linear infinite",
      },
      "spin-slow": {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
