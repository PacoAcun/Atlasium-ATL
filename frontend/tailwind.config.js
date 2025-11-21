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
        azulito: "#3B82F6", // 👈 aquí agregamos tu color
      },
    },
  },
  plugins: [],
};
