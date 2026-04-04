import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import passport from "passport";
import { registerRoutes } from '../server/routes.js';
import { connectToMongoDB } from '../server/db.js';
import { registerPassportStrategies } from '../server/auth/passport-setup.js';

registerPassportStrategies();

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security headers and CORS
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS - Allow all origins in production for now
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://devmindx.vercel.app',
    'https://devmindx.onrender.com'
  ];
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
app.use(passport.initialize());

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
app.get('/api/health', async (req, res) => {
  try {
    await ensureInitialized();
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MongoDB only — must not register Express routes here; see comment below.
let initPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('Connecting to MongoDB...');
        await connectToMongoDB();
        console.log('MongoDB connected');
      } catch (error) {
        console.error('Failed to connect MongoDB:', error);
        initPromise = null;
        throw error;
      }
    })();
  }
  return initPromise;
}

// Middleware to ensure DB is ready before API handlers run
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(503).json({
      message: 'Server initialization in progress or failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Register API routes once, before the 404 handler.
 * Previously registerRoutes() ran inside ensureInitialized() after this 404 middleware
 * was already mounted, so new routes were appended *after* the catch-all and never ran
 * (every /api/auth/* request returned 404).
 */
registerRoutes(app);

// Warm MongoDB on cold start
ensureInitialized().catch((err) => {
  console.error('Initial setup failed:', err);
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      '/api/health',
      '/api/auth/*',
      '/api/projects',
      '/api/llm/models',
      '/api/learning/analyze',
      '/api/architecture/generate',
      '/api/research/*',
      '/api/ide/*'
    ]
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
