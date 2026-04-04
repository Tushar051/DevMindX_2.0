import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import passport from "passport";
import { createServer } from 'http';
import { registerPassportStrategies } from "./auth/passport-setup.js";
import { registerRoutes } from './routes.js';
import { setupVite, serveStatic, log } from "./vite.js";
import { setupSocketIO } from "./realtime/socket.js";
import { connectToMongoDB } from './db.js';

registerPassportStrategies();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for production (behind load balancer)
if (isProduction) {
  app.set('trust proxy', 1);
}

// CORS Configuration - Apply to all environments
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://devmindx.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5000'
  ];
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins or if no origin (same-origin)
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Security headers for production
  if (isProduction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  
  next();
});

// Request body parsing with limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(passport.initialize());

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

(async () => {
  // Start server first, then connect to MongoDB
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
  
  // Start the HTTP server first - CRITICAL for Render to detect the service is up
  httpServer.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });

  // Attach Socket.IO realtime collaboration (single instance)
  const io = setupSocketIO(httpServer);
  console.log('Socket.IO collaboration server initialized');

  // Connect to MongoDB after server is running (non-blocking)
  // This prevents server crash if MongoDB connection fails
  connectToMongoDB()
    .then(async (db) => {
      if (db) {
        await ensureChatHistoryCollection(db);
        console.log('✅ MongoDB collections initialized');
      }
    })
    .catch((err: any) => {
      console.error('⚠️  MongoDB connection failed, but server is still running:', err.message);
      console.error('Some features requiring MongoDB will not be available.');
    });

  // Dev: either embed Vite (single port 5000) or API-only when the UI runs from ../front (DEV_API_ONLY + Vite on 5173).
  const devApiOnly =
    process.env.DEV_API_ONLY === "1" || process.env.DEV_API_ONLY === "true";

  if (app.get("env") === "development") {
    if (!devApiOnly) {
      await setupVite(app, httpServer);
    }
  } else {
    serveStatic(app);
  }
})();
