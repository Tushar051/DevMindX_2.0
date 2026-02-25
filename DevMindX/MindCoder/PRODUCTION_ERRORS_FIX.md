# Production Errors - Complete Fix Guide

## Issues Identified

You're experiencing multiple 404 and 500 errors in production:

1. **404 Errors:**
   - `/api/llm/models` - Not found
   - `/api/learning/analyze` - Not found  
   - `/api/architecture/generate` - Not found
   - Various other API endpoints

2. **500 Error:**
   - `Cannot read properties of undefined (reading 'collection')` - Database connection issue

## Root Causes

### 1. Vercel Serverless Function Routing Issue

The routes ARE defined in `server/routes.ts` but the Vercel serverless function in `api/index.ts` isn't properly handling all routes. The issue is that `registerRoutes()` is being called, but Vercel's serverless architecture requires special handling.

### 2. Database Connection Issue

The error `Cannot read properties of undefined (reading 'collection')` indicates that `mongoDb` is undefined when routes try to access it. This happens because:
- The database connection isn't being awaited properly in serverless functions
- Each serverless invocation needs to establish its own connection

## Solutions

### Fix 1: Update api/index.ts for Proper Route Handling

The current `api/index.ts` calls `registerRoutes(app)` but doesn't return the server properly for Vercel. Here's the fix:

```typescript
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from '../server/routes.js';
import { connectToMongoDB } from '../server/db.js';

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

// Initialize database and routes
let routesInitialized = false;
let initError: Error | null = null;

const initPromise = (async () => {
  if (!routesInitialized) {
    try {
      console.log('Connecting to MongoDB...');
      await connectToMongoDB();
      console.log('MongoDB connected');
      
      console.log('Initializing routes...');
      await registerRoutes(app);
      routesInitialized = true;
      console.log('Routes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize:', error);
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
    console.error('Initialization error:', error);
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
```

### Fix 2: Update server/db.ts for Better Connection Handling

Ensure the database connection is properly cached and reused:

```typescript
// Add at the top of db.ts
let cachedDb: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  // Return cached connection if available
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db();
    cachedDb = db;
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Update mongoDb export
export const mongoDb = connectToMongoDB();
```

### Fix 3: Update Environment Variables

Make sure these are set in your Vercel project:

```bash
MONGODB_URI=your_mongodb_connection_string
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
FRONTEND_URL=https://devmindx.vercel.app
ALLOWED_ORIGINS=https://devmindx.vercel.app,https://devmindx.onrender.com
NODE_ENV=production
```

### Fix 4: Update vercel.json

Ensure proper routing configuration:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## Deployment Steps

1. **Update the files:**
   ```bash
   # Update api/index.ts with the fix above
   # Update server/db.ts with connection caching
   # Update vercel.json with function configuration
   ```

2. **Set environment variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables listed in Fix 3

3. **Redeploy:**
   ```bash
   git add .
   git commit -m "Fix: Production API routing and database connection issues"
   git push
   ```

4. **Verify deployment:**
   - Check Vercel deployment logs
   - Test each endpoint:
     - https://devmindx.vercel.app/api/health
     - https://devmindx.vercel.app/api/llm/models
     - https://devmindx.vercel.app/api/projects

## Alternative: Use Render for Backend

If Vercel serverless continues to have issues, consider deploying the backend separately to Render:

1. **Keep frontend on Vercel** (static files)
2. **Deploy backend to Render** (full Node.js server)
3. **Update VITE_API_URL** to point to Render backend

This gives you:
- Better WebSocket support
- Persistent connections
- Easier debugging
- No serverless cold starts

## Testing Checklist

After deployment, test these endpoints:

- [ ] `/api/health` - Should return 200 OK
- [ ] `/api/llm/models` - Should return models list
- [ ] `/api/projects` - Should return projects (with auth)
- [ ] `/api/learning/analyze` - Should analyze code (with auth)
- [ ] `/api/architecture/generate` - Should generate architecture (with auth)
- [ ] `/api/research/search` - Should perform research (with auth)

## Quick Debug Commands

```bash
# Check Vercel logs
vercel logs

# Test API locally
npm run dev
curl http://localhost:5000/api/health

# Test production API
curl https://devmindx.vercel.app/api/health
curl -H "Authorization: Bearer YOUR_TOKEN" https://devmindx.vercel.app/api/llm/models
```

## Common Issues

1. **Still getting 404s:** Routes not registered properly - check logs
2. **Database errors:** MongoDB URI not set or connection failing
3. **CORS errors:** Update ALLOWED_ORIGINS environment variable
4. **Timeout errors:** Increase maxDuration in vercel.json
