import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        purple: "#2D1B4E",
        "purple-deep": "#1C1030",
        pitch: "#0F3D2E",
        "pitch-bright": "#2E8B57",
        chalk: "#F7F5F2",
        paper: "#FDFCFA",
        line: "#E4E0D8",
        ink: "#1A1620",
        "ink-soft": "#6B6577",
        live: "#D9364A",
        gold: "#C9A24B",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
