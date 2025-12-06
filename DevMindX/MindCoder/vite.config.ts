import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },

  plugins: [react()],
  root: "./client",
  resolve: {
    alias: {
      "@": path.resolve("./client/src"),
    },
  },
  build: {
    outDir: "../dist/public",
  },
});
