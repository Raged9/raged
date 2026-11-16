import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        base: "rgb(var(--base-rgb) / <alpha-value>)",
        fg: "rgb(var(--base-rgb) / <alpha-value>)",
        light: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        text: "rgb(var(--base-rgb) / <alpha-value>)",
        "text-muted": "var(--text-muted)",
        paper: "var(--paper)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        serif: ["var(--font-caveat)", "cursive", "serif"],
        display: ["var(--font-poppins)", "-apple-system", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
        mono: ["var(--font-mono)", '"IBM Plex Mono"', "monospace"],
        monocraft: ['"Monocraft"', "monospace"],
        pixel: ['"Monocraft"', "var(--font-press-start)", '"Press Start 2P"', "monospace"],
        borel: ['"Borel"', "cursive"],
        impact: ["var(--font-anton)", '"Anton"', "Impact", '"Arial Black"', "sans-serif"],
      },
      maxWidth: {
        "304": "76rem", // 1216px - standard max container from Tayo
      },
    },
  },
  plugins: [],
};

export default config;
