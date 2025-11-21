/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#191919",   // 👈 aquí agregamos tu color
      },
    },
  },
  plugins: [],
};
