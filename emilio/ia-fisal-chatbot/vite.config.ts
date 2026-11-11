import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Rutas relativas: la app funciona igual en la raíz de un dominio o en una subcarpeta.
  base: "./",
  plugins: [react(), tailwindcss()],
});
