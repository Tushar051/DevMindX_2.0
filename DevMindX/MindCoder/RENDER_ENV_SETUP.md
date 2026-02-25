# Render Environment Variables Setup

## Problem
Render is trying to connect to `localhost:27017` instead of MongoDB Atlas because `MONGODB_URI` is not set.

## Solution
Set environment variables in Render Dashboard.

## Steps

### 1. Access Render Dashboard
- Go to: https://dashboard.render.com/
- Find service: **devmindx-backend**
- Click on the service

### 2. Navigate to Environment Variables
- Click "Environment" in the left sidebar
- You'll see a list of environment variables

### 3. Required Environment Variables

Copy these from your local `.env` file and add them to Render:

#### Database (REQUIRED)
```
MONGODB_URI = mongodb+srv://your_username:your_password@your_cluster.mongodb.net/devmindx?retryWrites=true&w=majority
```
Get this from your MongoDB Atlas dashboard or local `.env` file.

#### Authentication (REQUIRED)
```
JWT_SECRET = your_jwt_secret_here
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_KEY = your_supabase_service_key
```

#### AI Services (REQUIRED for AI features)
```
GEMINI_API_KEY = your_gemini_api_key
TOGETHER_API_KEY = your_together_api_key
```

#### OAuth (Optional - for Google/GitHub login)
```
GOOGLE_CLIENT_ID = your_google_client_id
GOOGLE_CLIENT_SECRET = your_google_client_secret
GOOGLE_CALLBACK_URL = https://your-render-url.onrender.com/api/auth/google/callback

GITHUB_CLIENT_ID = your_github_client_id
GITHUB_CLIENT_SECRET = your_github_client_secret
GITHUB_CALLBACK_URL = https://your-render-url.onrender.com/api/auth/github/callback
```

#### CORS (REQUIRED)
```
ALLOWED_ORIGINS = https://devmindx.vercel.app,https://your-render-url.onrender.com
```

#### Email (Optional - for verification emails)
```
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password
```

### 4. Get Your MongoDB URI

If you don't have MongoDB Atlas set up:

1. Go to https://cloud.mongodb.com/
2. Sign in or create account
3. Create a cluster (free tier available)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with `devmindx`

Example:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/devmindx?retryWrites=true&w=majority
```

### 5. Save and Redeploy

After adding all environment variables:
1. Click "Save Changes" at the bottom
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete
4. Check logs for "Connected to MongoDB" message

## Verify Setup

### Check Render Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Look for:
   - ✅ "Connected to MongoDB" - Good!
   - ❌ "ECONNREFUSED" - MongoDB URI not set or incorrect
   - ❌ "Authentication failed" - Wrong password in MongoDB URI

### Test API Endpoint
```bash
curl https://your-render-url.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Update Frontend to Use Render Backend

In Vercel, set this environment variable:

```
VITE_API_URL = https://your-render-url.onrender.com
```

This tells your Vercel frontend where to find the Render backend.

## Common Issues

### Issue: Still getting ECONNREFUSED
**Solution:** 
- Double-check MongoDB URI is correct
- Make sure there are no extra spaces
- Verify password doesn't contain special characters that need URL encoding

### Issue: Authentication failed
**Solution:**
- Check MongoDB Atlas user password
- Make sure user has read/write permissions
- Verify database name is correct

### Issue: Network timeout
**Solution:**
- In MongoDB Atlas, go to Network Access
- Add IP address: `0.0.0.0/0` (allow from anywhere)
- This allows Render to connect

## Architecture Overview

```
User Browser
    ↓
Vercel (Frontend)
    ↓ API calls via VITE_API_URL
Render (Backend)
    ↓ MONGODB_URI
MongoDB Atlas (Database)
```

## Quick Copy-Paste from Local .env

Your local `.env` file has all these values. Just copy them to Render:

```bash
# From DevMindX/MindCoder/.env
MONGODB_URI=...
JWT_SECRET=...
GEMINI_API_KEY=...
# etc.
```
