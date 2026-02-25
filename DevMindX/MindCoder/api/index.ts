import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from '../server/routes.js';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security headers and CORS
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS - Allow all origins in production for now
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://devmindx.vercel.app'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback to first allowed origin
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize routes
let routesInitialized = false;
let initError: Error | null = null;

const initPromise = (async () => {
  if (!routesInitialized) {
    try {
      console.log('Initializing routes...');
      await registerRoutes(app);
      routesInitialized = true;
      console.log('Routes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize routes:', error);
      initError = error as Error;
      throw error;
    }
  }
})();

// Middleware to ensure routes are initialized
app.use(async (req, res, next) => {
  try {
    await initPromise;
    if (initError) {
      throw initError;
    }
    next();
  } catch (error) {
    console.error('Route initialization error:', error);
    res.status(500).json({ 
      message: 'Server initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('Error:', err);
  res.status(status).json({ message, error: err.toString() });
});

// Export for Vercel serverless
export default app;
