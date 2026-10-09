/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg0: "#0b0b0c",
        bg1: "#111113",
        bg2: "#17171a",
        ink: "#e8e4da",
        mute: "#8a8578",
        faint: "#55524a",
        gold: "#c9a227",
        goldb: "#e3c15c",
        line: "#232320",
        line2: "#2e2d28",
        ok: "#7fa06b",
        bad: "#c25b4e",
        priv: "#9a7fb8",
      },
      fontFamily: {
        serif: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
        mono: ["SF Mono", "Cascadia Code", "JetBrains Mono", "Consolas", "monospace"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: {
        label: "0.26em",
      },
    },
  },
  plugins: [],
};
