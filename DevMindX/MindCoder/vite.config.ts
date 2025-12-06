import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
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
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          'vendor-motion': ['framer-motion'],
          'vendor-editor': ['monaco-editor', '@monaco-editor/react'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional)
    sourcemap: mode !== 'production',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
  // CSS optimizations
  css: {
    devSourcemap: true,
  },
  // Preview server config
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
