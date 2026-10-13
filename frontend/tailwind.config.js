/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Foundation: deep navy for conclusions and major dark bands.
        navy: {
          DEFAULT: "#101D2C",
          deep: "#0A1420",
          soft: "#1B2B3D",
          line: "#2E4054",
        },
        // Paper stock for the report body.
        paper: {
          DEFAULT: "#F5F2EB",
          deep: "#EDE9DF",
          white: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#171A1D",
          soft: "#2C3136",
        },
        // Secondary information. Kept dark enough to clear 4.5:1 on paper.
        muted: {
          DEFAULT: "#63665F",
          onNavy: "#A8B0B8",
        },
        line: {
          DEFAULT: "#D6D3CB",
          strong: "#B9B5AA",
          onNavy: "#33465C",
        },
        // Restrained crimson: findings, flagged rows, the single decisive value.
        crimson: {
          DEFAULT: "#C83B43",
          deep: "#A32E35",
          bright: "#E8736F",
          wash: "#FBF0F0",
        },
      },
      fontFamily: {
        display: ['"Archivo"', "Helvetica Neue", "Arial", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", '"Times New Roman"', "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        micro: ["0.625rem", { lineHeight: "1.1", letterSpacing: "0.16em" }],
        label: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.14em" }],
        mono: ["0.75rem", { lineHeight: "1.45", letterSpacing: "0.02em" }],
        "mono-lg": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        caption: ["0.8125rem", { lineHeight: "1.55" }],
        body: ["0.9375rem", { lineHeight: "1.62" }],
        lede: ["1.0625rem", { lineHeight: "1.68" }],
        "serif-lg": ["1.1875rem", { lineHeight: "1.62" }],
        "serif-xl": ["1.4375rem", { lineHeight: "1.42" }],
        "display-sm": ["1.75rem", { lineHeight: "1.12", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem,3vw,2.5rem)", { lineHeight: "1.06", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.125rem,4.4vw,3.75rem)", { lineHeight: "1.0", letterSpacing: "-0.037em" }],
        "display-xl": ["clamp(2.75rem,6vw,5.25rem)", { lineHeight: "0.94", letterSpacing: "-0.045em" }],
      },
      maxWidth: {
        report: "1240px",
        measure: "44rem",
        measureTight: "34rem",
      },
      borderRadius: {
        none: "0px",
        hair: "2px",
      },
      transitionDuration: {
        quick: "140ms",
      },
    },
  },
  plugins: [],
};
