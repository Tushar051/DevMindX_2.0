import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from 'http';
import { registerRoutes } from './routes.js';
import { setupVite, serveStatic, log } from "./vite.js";
import { setupSocketIO } from "./realtime/socket.js";
import { connectToMongoDB } from './db.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Production security headers
if (isProduction) {
  app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // CORS for production
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    next();
  });
  
  // Trust proxy for production (behind load balancer)
  app.set('trust proxy', 1);
}

// Request body parsing with limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Compression for production
if (isProduction) {
  // Note: In production, use nginx/cloudflare for compression
  // This is a fallback
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Connect to MongoDB at server startup and initialize collections
import { ensureChatHistoryCollection } from './models/chatHistory.js';

// Connect to MongoDB and initialize collections
(async () => {
  try {
    const db = await connectToMongoDB();
    // Initialize collections with proper schemas
    if (db) {
      await ensureChatHistoryCollection(db);
      console.log('MongoDB collections initialized');
    }
  } catch (err: any) {
    console.error('Failed to connect to MongoDB:', err);
  }
})();

(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Create HTTP server
  const httpServer = createServer(app);

  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Start the HTTP server first
  httpServer.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });

  // Attach Socket.IO realtime collaboration (single instance)
  const io = setupSocketIO(httpServer);
  console.log('Socket.IO collaboration server initialized');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
})();
