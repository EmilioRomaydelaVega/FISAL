import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Librerías estables en chunks propios para aprovechar la caché del navegador.
        // jsPDF no aparece aquí: se carga bajo demanda al exportar.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@tanstack")) return "router";
          if (id.includes("@supabase")) return "supabase";
          if (/[\\/]zod[\\/]/.test(id)) return "zod";
          return undefined;
        },
      },
    },
  },
});
