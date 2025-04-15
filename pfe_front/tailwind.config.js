/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ocp-green": {
          100: "#e8f5e9",
          300: "#81c784",
          500: "#4caf50",
          600: "#2e7d32",
          700: "#1b5e20",
          800: "#0d3b13",
          900: "#051f09",
        },
      },
    },
  },

  plugins: [],
};
