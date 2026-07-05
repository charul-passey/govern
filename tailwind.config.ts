import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#FFFFFF",
        ink: "#1A1A1A",
        accent: "#E4F222", // scarce yellow: CTA, one stat, tally strip only
        panel: "#F5F4F1",
        verdict: {
          approved: "#1E7F4F",
          caution: "#B98900",
          blocked: "#C13515",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        shell: "1120px", // max page shell
        prose: "720px", // prose measure
      },
      keyframes: {
        "slide-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        // simulator cards only; nothing else animates
        "slide-fade-in": "slide-fade-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
