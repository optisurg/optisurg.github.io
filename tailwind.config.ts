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
        // Oscilloscope-inspired palette
        background: "#050806",
        foreground: "#E7F5EC",
        "lab-accent": "#4CFF9B",
        "lab-laser": "#0B120D",
        "lab-gray": "#1C2A22",
      },
      fontFamily: {
        serif: ["var(--font-plex-sans)", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-plex-mono)", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
