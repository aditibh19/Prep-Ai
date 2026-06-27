/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#EF2222",
        "primary-dark": "#C81B1B",
        surface: "#0A0A0A",
        card: "#111111",
        border: "#1E1E1E",
      },
      fontFamily: {
        sans:    ["Space Grotesk", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tight:   "-0.03em",
        tighter: "-0.04em",
      },
      animation: {
        "voice-bar":  "voiceBar 0.8s ease-in-out infinite",
        "pulse-ring": "pulseRing 1.5s ease-out infinite",
      },
      keyframes: {
        voiceBar: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%":      { transform: "scaleY(1)" },
        },
        pulseRing: {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};