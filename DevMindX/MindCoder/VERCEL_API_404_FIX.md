# Vercel API 404 Fix - Complete Solution

## Problem
All API routes were returning 404 errors in production on Vercel:
- `GET /api/projects` → 404
- `GET /api/llm/models` → 404
- All other API endpoints → 404

## Root Causes

### 1. Frontend API Configuration Issue
The `apiUrl()` function in `client/src/config/api.ts` was not properly handling empty `API_BASE_URL` in production, causing malformed fetch URLs.

### 2. Serverless Function Initialization Issue
The `api/index.ts` serverless function was not properly ensuring routes were registered before handling requests. The async initialization was racing with incoming requests.

## Solutions Applied

### Fix 1: Frontend API Configuration
**File:** `client/src/config/api.ts`

```typescript
export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
```

**What this does:**
- Normalizes paths to always start with `/`
- When `API_BASE_URL` is empty (correct for Vercel), returns `/api/projects` instead of `api/projects`
- Ensures fetch calls work as relative URLs on the same domain

### Fix 2: Serverless Function Initialization
**File:** `api/index.ts`

**Changes made:**
1. Created `ensureInitialized()` function that properly manages initialization state
2. Added middleware to wait for initialization before processing requests
3. Made initialization retry-able if it fails
4. Added proper error handling with 503 status codes during initialization

```typescript
let initPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectToMongoDB();
        await registerRoutes(app);
      } catch (error) {
        initPromise = null; // Reset so it can retry
        throw error;
      }
    })();
  }
  return initPromise;
}

// Middleware to ensure initialization
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (error) {
    res.status(503).json({ 
      message: 'Server initialization in progress or failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## How Vercel Serverless Works

1. **Cold Start:** When a request comes in, Vercel spins up a new instance
2. **Module Load:** The `api/index.ts` file is loaded and executed
3. **Request Handling:** The Express app handles the incoming request
4. **Warm Instance:** Subsequent requests reuse the same instance (if within ~5 minutes)

## Why This Fix Works

### Before:
- Routes were being registered asynchronously
- Requests could arrive before routes were registered
- Result: 404 errors because no routes matched

### After:
- Every request waits for initialization to complete
- Routes are guaranteed to be registered before handling requests
- Initialization is cached, so it only happens once per instance
- If initialization fails, it can retry on the next request

## Testing the Fix

After deployment, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://devmindx.vercel.app/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Projects API:**
   ```bash
   curl https://devmindx.vercel.app/api/projects \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Should return: Array of projects (or 401 if not authenticated)

3. **LLM Models:**
   ```bash
   curl https://devmindx.vercel.app/api/llm/models \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Should return: Available LLM models

## Environment Variables Required

Make sure these are set in Vercel:

### Required:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `GEMINI_API_KEY` - Google Gemini API key

### Optional (for OAuth):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

### NOT Required:
- `VITE_API_URL` - Should NOT be set (API is on same domain)
- `VITE_SOCKET_URL` - Should NOT be set (defaults to window.location.origin)

## Monitoring

Check Vercel logs for:
- "Connecting to MongoDB..." - Should appear on cold starts
- "MongoDB connected" - Confirms DB connection
- "Initializing routes..." - Routes being registered
- "Routes initialized successfully" - All good!

If you see errors, check:
1. MongoDB connection string is correct
2. All required environment variables are set
3. MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)

## Common Issues

### Issue: Still getting 404s
**Solution:** 
- Clear Vercel cache and redeploy
- Check Vercel logs for initialization errors
- Verify MongoDB connection

### Issue: 503 Service Unavailable
**Solution:**
- Check MongoDB connection
- Verify environment variables
- Look at Vercel function logs for specific errors

### Issue: Slow first request
**Solution:**
- This is normal (cold start)
- First request initializes everything
- Subsequent requests are fast (warm instance)

## Deployment Checklist

- [x] Frontend API configuration fixed
- [x] Serverless function initialization fixed
- [x] Environment variables set in Vercel
- [x] MongoDB Atlas allows Vercel connections
- [x] Code pushed to GitHub
- [x] Vercel auto-deployed
- [ ] Test all API endpoints
- [ ] Monitor Vercel logs for errors
- [ ] Test account page loads correctly
- [ ] Test projects page loads correctly

## Next Steps

1. Wait for Vercel deployment to complete
2. Test the account page at `https://devmindx.vercel.app/account`
3. Check browser console - should see no 404 errors
4. Test other pages that use API calls
5. Monitor Vercel function logs for any issues
