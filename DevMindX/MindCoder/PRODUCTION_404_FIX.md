# Production 404 Error Fix Guide

## Problem
Features like Project Management, Research Engine, Architecture Generator, Learning Mode, and Account Section are returning 404 errors in production.

## Root Causes Identified

1. **Incomplete Vercel Configuration**: The `vercel.json` was missing API route rewrites
2. **CORS Issues**: Missing proper CORS headers for cross-origin requests
3. **Missing x-user-id Header**: Some routes require this header but it wasn't being sent
4. **Route Registration**: Routes might not be properly initialized in serverless environment

## Fixes Applied

### 1. Updated `vercel.json`
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
  ]
}
```

### 2. Enhanced `api/index.ts`
- Added proper CORS headers with x-user-id support
- Added health check endpoint at `/api/health`
- Improved error handling and logging
- Added 404 handler for debugging
- Better route initialization with error catching

### 3. Environment Variables Required

Make sure these are set in Vercel:

```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

# Frontend
FRONTEND_URL=https://devmindx.vercel.app
ALLOWED_ORIGINS=https://devmindx.vercel.app

# AI APIs
TOGETHER_API_KEY=your_together_key
GEMINI_API_KEY=your_gemini_key

# Email
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FORCE_EMAIL=true

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/api/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
GITHUB_CALLBACK_URL=https://your-domain.vercel.app/api/auth/github/callback
```

## Deployment Steps

### Step 1: Commit Changes
```bash
cd DevMindX/MindCoder
git add .
git commit -m "Fix: Production 404 errors for API routes"
git push
```

### Step 2: Deploy to Vercel
```bash
npm run deploy:vercel
```

Or use Vercel CLI:
```bash
vercel --prod
```

### Step 3: Verify Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Ensure all required variables are set
5. Redeploy if you added/changed any variables

### Step 4: Test Endpoints

Test these endpoints after deployment:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Projects (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "x-user-id: YOUR_USER_ID" \
     https://your-domain.vercel.app/api/projects

# Research Engine (requires auth token)
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"idea":"test project"}' \
     https://your-domain.vercel.app/api/research/analyze

# Architecture Generator (requires auth token)
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"description":"test architecture"}' \
     https://your-domain.vercel.app/api/architecture/generate

# Learning Mode (requires auth token)
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"code":"console.log(\"test\")"}' \
     https://your-domain.vercel.app/api/learning/analyze

# Account/LLM Models (requires auth token and x-user-id)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "x-user-id: YOUR_USER_ID" \
     https://your-domain.vercel.app/api/llm/models
```

## Common Issues & Solutions

### Issue 1: Still Getting 404
**Solution**: Check Vercel deployment logs
```bash
vercel logs
```

Look for route registration errors or missing dependencies.

### Issue 2: CORS Errors
**Solution**: Verify ALLOWED_ORIGINS environment variable includes your frontend domain:
```
ALLOWED_ORIGINS=https://devmindx.vercel.app
```

### Issue 3: Database Connection Errors
**Solution**: Verify Supabase credentials are correct and the database is accessible from Vercel's IP ranges.

### Issue 4: Missing x-user-id Header
**Solution**: Update frontend API calls to include the header:
```typescript
fetch(apiUrl('/api/llm/models'), {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-user-id': user.id.toString()
  }
})
```

## Monitoring

### Check Vercel Logs
```bash
vercel logs --follow
```

### Check Function Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments > Latest
4. Click on Functions tab
5. View logs for `/api/index`

### Enable Debug Mode
Add to environment variables:
```
DEBUG=*
NODE_ENV=production
```

## Rollback Plan

If issues persist:

1. **Revert to previous deployment**:
   ```bash
   vercel rollback
   ```

2. **Check previous working version**:
   - Go to Vercel Dashboard > Deployments
   - Find last working deployment
   - Click "..." > "Promote to Production"

## Additional Optimizations

### 1. Add Caching Headers
For static assets, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Enable Edge Functions (Optional)
For better performance, consider using Vercel Edge Functions for API routes.

### 3. Database Connection Pooling
Ensure Supabase connection pooling is enabled to handle serverless function cold starts.

## Support

If issues persist after following this guide:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test endpoints using curl/Postman
4. Check browser console for specific error messages
5. Review Vercel function logs for detailed error traces

## Success Indicators

✅ `/api/health` returns 200 OK
✅ `/api/projects` returns projects list (with auth)
✅ `/api/research/analyze` accepts POST requests
✅ `/api/architecture/generate` accepts POST requests
✅ `/api/learning/analyze` accepts POST requests
✅ `/api/llm/models` returns model list (with auth + x-user-id)
✅ No CORS errors in browser console
✅ All features work in production frontend
