import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from '../server/routes.js';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  next();
});

// Request body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Initialize routes
let routesInitialized = false;
const initPromise = (async () => {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
})();

// Middleware to ensure routes are initialized
app.use(async (req, res, next) => {
  await initPromise;
  next();
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('Error:', err);
  res.status(status).json({ message });
});

// Export for Vercel serverless
export default app;
