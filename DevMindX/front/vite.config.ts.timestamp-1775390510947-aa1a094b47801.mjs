// vite.config.ts
import react from "file:///C:/Users/tusha/Desktop/DevMindX/DevMindX/front/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwind from "file:///C:/Users/tusha/Desktop/DevMindX/DevMindX/front/node_modules/tailwindcss/lib/index.js";
import { defineConfig } from "file:///C:/Users/tusha/Desktop/DevMindX/DevMindX/front/node_modules/vite/dist/node/index.js";
import path from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/tusha/Desktop/DevMindX/DevMindX/front/vite.config.ts";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var mindCoderRoot = path.resolve(__dirname, "../MindCoder");
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /** Prefer 5173; if another Vite/IDE instance holds it, use the next free port. */
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        timeout: 12e4,
        // 2 minutes
        proxyTimeout: 12e4
      },
      "/socket.io": { target: "http://localhost:5000", ws: true }
    }
  },
  publicDir: "./static",
  base: "./",
  build: {
    outDir: path.join(mindCoderRoot, "dist/public"),
    emptyOutDir: true
  },
  css: {
    postcss: {
      plugins: [tailwind()]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0dXNoYVxcXFxEZXNrdG9wXFxcXERldk1pbmRYXFxcXERldk1pbmRYXFxcXGZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0dXNoYVxcXFxEZXNrdG9wXFxcXERldk1pbmRYXFxcXERldk1pbmRYXFxcXGZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy90dXNoYS9EZXNrdG9wL0Rldk1pbmRYL0Rldk1pbmRYL2Zyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgdGFpbHdpbmQgZnJvbSBcInRhaWx3aW5kY3NzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tIFwidXJsXCI7XHJcblxyXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcclxuY29uc3QgbWluZENvZGVyUm9vdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vTWluZENvZGVyXCIpO1xyXG5cclxuLy8gVUkgbGl2ZXMgaGVyZTsgQVBJIGlzIE1pbmRDb2Rlci9zZXJ2ZXIgKHJ1biB2aWEgbnBtIHNjcmlwdHMpLlxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgICAvKiogUHJlZmVyIDUxNzM7IGlmIGFub3RoZXIgVml0ZS9JREUgaW5zdGFuY2UgaG9sZHMgaXQsIHVzZSB0aGUgbmV4dCBmcmVlIHBvcnQuICovXHJcbiAgICAgICAgc3RyaWN0UG9ydDogZmFsc2UsXHJcbiAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgXCIvYXBpXCI6IHsgXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwXCIsIFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTIwMDAwLCAvLyAyIG1pbnV0ZXNcclxuICAgICAgICAgICAgICAgIHByb3h5VGltZW91dDogMTIwMDAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiL3NvY2tldC5pb1wiOiB7IHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjUwMDBcIiwgd3M6IHRydWUgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHB1YmxpY0RpcjogXCIuL3N0YXRpY1wiLFxyXG4gICAgYmFzZTogXCIuL1wiLFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgICBvdXREaXI6IHBhdGguam9pbihtaW5kQ29kZXJSb290LCBcImRpc3QvcHVibGljXCIpLFxyXG4gICAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGNzczoge1xyXG4gICAgICAgIHBvc3Rjc3M6IHtcclxuICAgICAgICAgICAgcGx1Z2luczogW3RhaWx3aW5kKCldLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFUsT0FBTyxXQUFXO0FBQzVWLE9BQU8sY0FBYztBQUNyQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFKbUwsSUFBTSwyQ0FBMkM7QUFNbFEsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFDN0QsSUFBTSxnQkFBZ0IsS0FBSyxRQUFRLFdBQVcsY0FBYztBQUc1RCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBO0FBQUEsSUFFTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTO0FBQUE7QUFBQSxRQUNULGNBQWM7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsY0FBYyxFQUFFLFFBQVEseUJBQXlCLElBQUksS0FBSztBQUFBLElBQzlEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsV0FBVztBQUFBLEVBQ1gsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0gsUUFBUSxLQUFLLEtBQUssZUFBZSxhQUFhO0FBQUEsSUFDOUMsYUFBYTtBQUFBLEVBQ2pCO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDRCxTQUFTO0FBQUEsTUFDTCxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQUEsSUFDeEI7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEtBQUssUUFBUSxXQUFXLEtBQUs7QUFBQSxJQUN0QztBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
