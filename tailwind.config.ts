import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C6FE0",
          50: "#F3F1FB",
          100: "#E9E5F8",
          200: "#D3CBF1",
          300: "#B6A9E7",
          400: "#9C8CE0",
          500: "#7C6FE0",
          600: "#6455C9",
          700: "#4E42A3",
          800: "#3A3178",
          900: "#272151",
        },
        lilac: "#F3F1FB",
        ink: "#0A0A0B",
        muted: "#8A8894",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(76, 62, 150, 0.08)",
        nav: "0 -2px 20px 0 rgba(76, 62, 150, 0.10)",
      },
      maxWidth: {
        app: "440px",
      },
    },
  },
  plugins: [],
};

export default config;
