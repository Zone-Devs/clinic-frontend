// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/@shadcn/ui/dist/**/*.{js,ts,jsx,tsx}"  // para que Tailwind “vea” las clases usadas dentro de los componentes
  ],
  theme: { extend: { /* tus colores, tipografías… */ } },
  plugins: [],
}
