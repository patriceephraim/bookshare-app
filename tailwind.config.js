/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cozy + literary palette
        cream: {
          50: "#FBF8F2",   // page background
          100: "#F5EFE2",  // surfaces
          200: "#EAE0CB",  // borders, dividers
        },
        ink: {
          900: "#1F1B16",  // primary text
          700: "#3D362C",  // secondary text
          500: "#7A6F5E",  // tertiary, hints
          300: "#B5AB99",  // disabled
        },
        teal: {
          50:  "#E8F0EE",
          500: "#3F7C6E",  // brand accent (buttons, active states)
          700: "#2E5C52",  // pressed state
          900: "#1A3530",  // dark text on teal
        },
        terracotta: {
          50:  "#FBEFE8",
          500: "#C8624A",  // secondary accent (errors, alerts when needed)
          700: "#9D4A36",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        serif: ["SourceSerif4_400Regular"],
        "serif-bold": ["SourceSerif4_600SemiBold"],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};