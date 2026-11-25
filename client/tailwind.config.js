const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        sunken: token("sunken"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        brand: token("brand"),
        "brand-soft": token("brand-soft"),
        "on-brand": token("on-brand"),
        accent: token("accent"),
        danger: token("danger"),
        success: token("success"),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
