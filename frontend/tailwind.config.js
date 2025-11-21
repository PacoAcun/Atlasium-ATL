/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#191919",
        azulito: "#3B82F6",
      },
    },
  },
  plugins: [],
};
