import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

/** Repo layout: DevMindX/front (UI) next to DevMindX/MindCoder (this server). Run dev/start with cwd = MindCoder. */
function frontIndexPath(): string {
  return path.resolve(process.cwd(), "..", "front", "index.html");
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic import to avoid loading Vite in production
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { nanoid } = await import("nanoid");
  
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Don't exit on errors in development, just log them
        console.error('Vite error:', msg);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = await fs.promises.readFile(frontIndexPath(), "utf-8");
      template = template.replace(
        /\.\/src\/index\.tsx/,
        `/src/index.tsx?v=${nanoid()}`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    // In backend-only deployment, just return a simple message
    console.log('No client build found - running as backend-only server');
    app.use("*", (_req, res) => {
      res.status(200).json({ 
        message: "DevMindX Backend API",
        status: "running",
        endpoints: {
          api: "/api/*",
          auth: "/api/auth/*",
          health: "/api/health"
        }
      });
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
