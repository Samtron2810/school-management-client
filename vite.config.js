import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split vendor code into stable, separately-cacheable chunks.
        // When you push a new deploy, only the chunks that actually changed
        // get re-downloaded — users keep the rest from their browser cache.
        // NOTE: Vite 8 uses Rolldown, which requires manualChunks to be a
        // function (the object form was removed).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // Order matters: check more specific paths first,
          // since "react-router-dom" also contains "react".
          if (id.includes("react-router-dom")) return "vendor-router";
          if (id.includes("react-icons")) return "vendor-icons";
          if (id.includes("react-hot-toast")) return "vendor-toast";
          if (id.includes("react")) return "vendor-react"; // catches react + react-dom

          return undefined;
        },
      },
    },
  },
});
