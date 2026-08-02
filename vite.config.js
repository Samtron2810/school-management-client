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
        manualChunks: {
          // Core React runtime — almost never changes between deploys.
          "vendor-react": ["react", "react-dom"],
          // Router — changes independently of React itself.
          "vendor-router": ["react-router-dom"],
          // Icon library — large, changes only when you bump the package.
          "vendor-icons": ["react-icons"],
          // Toast — small but stable, worth isolating so it's always cached.
          "vendor-toast": ["react-hot-toast"],
        },
      },
    },
  },
});
