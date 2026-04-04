import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mindCoderRoot = path.resolve(__dirname, "../MindCoder");

// UI lives here; API is MindCoder/server (run via npm scripts).
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        /** Prefer 5173; if another Vite/IDE instance holds it, use the next free port. */
        strictPort: false,
        proxy: {
            "/api": { target: "http://localhost:5000", changeOrigin: true },
            "/socket.io": { target: "http://localhost:5000", ws: true },
        },
    },
    publicDir: "./static",
    base: "./",
    build: {
        outDir: path.join(mindCoderRoot, "dist/public"),
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [tailwind()],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
