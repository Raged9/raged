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
        sans: ["Poppins", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        serif: ["Caveat", "cursive", "serif"],
        display: ["Poppins", "-apple-system", "sans-serif"],
        body: ["Poppins", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
        monocraft: ['"Monocraft"', "monospace"],
        pixel: ['"Monocraft"', '"Press Start 2P"', "monospace"],
        borel: ['"Borel"', "cursive"],
      },
      maxWidth: {
        "304": "76rem", // 1216px - standard max container from Tayo
      },
    },
  },
  plugins: [],
};

export default config;
