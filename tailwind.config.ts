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
        bg: "#FBFAF9",
        base: "#302f2d",
        light: "#FBFAF9",
        surface: "#FFFFFF",
        "surface-muted": "#f5f5f5",
        text: "#302f2d",
        "text-muted": "rgba(48, 47, 45, 0.6)",
        paper: "#FAF8F5",
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
