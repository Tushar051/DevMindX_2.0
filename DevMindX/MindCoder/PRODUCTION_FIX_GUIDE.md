# Production Issues Fix Guide

## Issues Identified

1. **CORS Errors** - Backend not allowing requests from Vercel frontend
2. **500 Errors** - MongoDB connection not configured on Render
3. **404 Errors** - API routes not accessible

## Solutions Applied

### 1. Fixed CORS Configuration

Updated `server/index.ts` to:
- Allow requests from all configured origins
- Properly handle preflight OPTIONS requests
- Add necessary CORS headers for all requests
- Return 204 status for OPTIONS (standard practice)

### 2. Fixed MongoDB Connection

Updated `server/db.ts` to:
- Require MONGODB_URI to be set (no default fallback)
- Add better error messages
- Add connection timeouts
- Improve error handling

### 3. Fixed API Configuration

Updated `client/src/config/api.ts` to:
- Point to Render backend in production: `https://devmindx.onrender.com`
- Use localhost in development
- Allow override via VITE_API_URL environment variable

## Required Environment Variables on Render

You MUST set these environment variables on your Render backend service:

### Critical (Required for app to work):

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=devmindx

# Node Environment
NODE_ENV=production
PORT=5000

# CORS Configuration
ALLOWED_ORIGINS=https://devmindx.vercel.app

# JWT Configuration
JWT_SECRET=your-secure-random-string-here
JWT_EXPIRATION=86400000

# Email Configuration (for OTP)
FORCE_EMAIL=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI API Keys (at least one required)
TOGETHER_API_KEY=your-together-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Optional (for OAuth):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://devmindx.onrender.com/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://devmindx.onrender.com/api/auth/github/callback
```

## Required Environment Variables on Vercel

Set these in your Vercel project settings:

```bash
# Backend API URL
VITE_API_URL=https://devmindx.onrender.com

# Socket.IO URL (same as API)
VITE_SOCKET_URL=https://devmindx.onrender.com
```

## Step-by-Step Deployment Instructions

### Step 1: Set Up MongoDB Atlas (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 2: Configure Render Backend

1. Go to your Render dashboard
2. Select your `devmindx-backend` service
3. Go to "Environment" tab
4. Add/Update these variables:

```
MONGODB_URI = mongodb+srv://your-connection-string
MONGODB_DB = devmindx
NODE_ENV = production
PORT = 5000
ALLOWED_ORIGINS = https://devmindx.vercel.app
JWT_SECRET = (generate a random 64-character string)
JWT_EXPIRATION = 86400000
FORCE_EMAIL = true
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
TOGETHER_API_KEY = your-together-api-key
GEMINI_API_KEY = your-gemini-api-key
```

5. Click "Save Changes"
6. Render will automatically redeploy

### Step 3: Configure Vercel Frontend

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables for Production:

```
VITE_API_URL = https://devmindx.onrender.com
VITE_SOCKET_URL = https://devmindx.onrender.com
```

5. Redeploy your frontend

### Step 4: Test the Deployment

1. Wait for both deployments to complete
2. Visit `https://devmindx.vercel.app`
3. Test these features:
   - Account page (should load without 500 error)
   - Project Management (should not get CORS error)
   - Research Engine (should work)
   - Architecture Generator (should work)
   - Learning Mode (should work)

## Troubleshooting

### Still Getting CORS Errors?

1. Check that `ALLOWED_ORIGINS` on Render includes your Vercel URL
2. Make sure there are no trailing slashes in the URL
3. Check Render logs for CORS-related messages

### Still Getting 500 Errors?

1. Check Render logs: Dashboard → Your Service → Logs
2. Look for MongoDB connection errors
3. Verify `MONGODB_URI` is correct and accessible
4. Test MongoDB connection from your local machine

### Still Getting 404 Errors?

1. Verify the backend is running on Render
2. Check that `VITE_API_URL` on Vercel points to correct Render URL
3. Test API directly: `https://devmindx.onrender.com/api/health`

### Check Backend Health

Visit these URLs to verify backend is working:

- Health check: `https://devmindx.onrender.com/api/health`
- Models endpoint: `https://devmindx.onrender.com/api/llm/models` (requires x-user-id header)

## Quick Deploy Commands

If you need to redeploy manually:

```bash
# Commit changes
git add .
git commit -m "Fix production CORS and MongoDB issues"
git push origin main

# Render will auto-deploy from GitHub
# Vercel will auto-deploy from GitHub
```

## Verification Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] MongoDB connection string is correct in Render
- [ ] All required environment variables are set on Render
- [ ] VITE_API_URL is set on Vercel
- [ ] Backend is deployed and running on Render
- [ ] Frontend is deployed on Vercel
- [ ] Can access account page without errors
- [ ] Can use project management features
- [ ] Can use research engine
- [ ] Can use architecture generator
- [ ] Can use learning mode

## Support

If issues persist:

1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
