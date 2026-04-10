import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "tailwindcss";

/** Used only when Express embeds Vite (npm run dev:server without DEV_API_ONLY). Prefer `front/` + DEV_API_ONLY. */
const mindCoderRoot = path.dirname(fileURLToPath(import.meta.url));
const frontRoot = path.resolve(mindCoderRoot, "../front");

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      "/api": "http://localhost:5001",
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
      },
    },
  },

  root: frontRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.join(frontRoot, "src"),
    },
  },
  build: {
    outDir: path.join(mindCoderRoot, "dist/public"),
    emptyOutDir: true,
    minify: mode === "production" ? "esbuild" : false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-editor": ["monaco-editor", "@monaco-editor/react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode !== "production",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react", "@monaco-editor/react", "monaco-editor"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
    devSourcemap: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
