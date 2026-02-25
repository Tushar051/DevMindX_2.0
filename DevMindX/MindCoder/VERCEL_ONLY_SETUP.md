# Vercel-Only Deployment Setup

## Current Issue

Your frontend (Vercel) is trying to call backend on Render (`devmindx.onrender.com`), but:
1. The Render backend might not be running
2. CORS is not configured properly
3. Routes are returning 404

## Solution: Use Vercel for Everything

Deploy both frontend AND backend on Vercel using serverless functions.

## Step 1: Update Environment Variables in Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Required Variables:

```bash
# Database - MongoDB (REQUIRED!)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devmindx?retryWrites=true&w=majority
MONGODB_DB=devmindx
MONGODB_TLS=true

# OR use Supabase (if you prefer)
SUPABASE_URL=https://csexvydhnfulvfezqoit.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP

# AI Services
GEMINI_API_KEY=AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
TOGETHER_API_KEY=c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
CODESANDBOX_API_TOKEN=csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg

# Authentication
JWT_SECRET=QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
JWT_EXPIRATION=86400000
SESSION_SECRET=your_random_session_secret_min_32_chars

# OAuth - IMPORTANT: Change callbacks to Vercel!
GOOGLE_CLIENT_ID=692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://devmindx.vercel.app/api/auth/google/callback

GITHUB_CLIENT_ID=Ov23li1DxFPHl6zgI6zE
GITHUB_CLIENT_SECRET=afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1
GITHUB_CALLBACK_URL=https://devmindx.vercel.app/api/auth/github/callback

# Email
EMAIL_USER=webdevx.ai@gmail.com
EMAIL_PASS=hjowcklyhohvanfe
FORCE_EMAIL=true

# URLs
FRONTEND_URL=https://devmindx.vercel.app
ALLOWED_ORIGINS=https://devmindx.vercel.app

# Environment
NODE_ENV=production
PORT=5000
```

## Step 2: Update OAuth Redirect URIs

### Google OAuth Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Update Authorized redirect URIs:
   - Remove: `https://devmindx.onrender.com/api/auth/google/callback`
   - Add: `https://devmindx.vercel.app/api/auth/google/callback`

### GitHub OAuth Settings
1. Go to: https://github.com/settings/developers
2. Find your OAuth App
3. Update Authorization callback URL:
   - Change to: `https://devmindx.vercel.app/api/auth/github/callback`

## Step 3: Remove VITE_API_URL (Use Same Origin)

Since frontend and backend are on the same domain (Vercel), you don't need to set `VITE_API_URL`.

The API config will automatically use the same origin:
```typescript
// In production on Vercel, this will be empty string
// which means same origin (https://devmindx.vercel.app)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

## Step 4: Verify Vercel Build Settings

In Vercel Dashboard → Settings → General:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`

## Step 5: Redeploy

After setting all environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

Or in Vercel Dashboard:
- Go to Deployments
- Click "Redeploy" on the latest deployment

## Step 6: Test Endpoints

After deployment, test these:

```bash
# Health check (should return 200)
curl https://devmindx.vercel.app/api/health

# Projects (should return 401 without auth, not 404)
curl https://devmindx.vercel.app/api/projects

# Models (should return 401 without auth, not 404)
curl https://devmindx.vercel.app/api/llm/models
```

## Troubleshooting

### Still Getting 404s?

1. Check Vercel deployment logs for errors
2. Verify `MONGODB_URI` is set (required for routes to work)
3. Check if routes are being registered (look for "Routes initialized" in logs)

### CORS Errors?

1. Make sure `ALLOWED_ORIGINS` includes `https://devmindx.vercel.app`
2. Check that frontend is NOT setting `VITE_API_URL` to external domain
3. Verify both frontend and backend are on same domain

### Database Errors?

1. If using MongoDB:
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
   - Verify database user has read/write permissions

2. If using Supabase:
   - Verify `SUPABASE_URL` and keys are correct
   - Check Supabase project is active

## Architecture

```
┌─────────────────────────────────────┐
│     Vercel (devmindx.vercel.app)    │
├─────────────────────────────────────┤
│  Frontend (Static Files)            │
│  - React/Vite app                   │
│  - Served from /dist/public         │
├─────────────────────────────────────┤
│  Backend (Serverless Functions)     │
│  - /api/* routes                    │
│  - Express app in api/index.ts      │
│  - Auto-scales, no cold starts      │
├─────────────────────────────────────┤
│  Database                           │
│  - MongoDB Atlas (external)         │
│  OR                                 │
│  - Supabase (external)              │
└─────────────────────────────────────┘
```

## Benefits of Vercel-Only Setup

✅ Single domain - no CORS issues
✅ Automatic HTTPS
✅ Global CDN for frontend
✅ Serverless functions for backend
✅ Easy deployment (git push)
✅ Free tier available
✅ Automatic preview deployments

## Next Steps

1. ✅ Set all environment variables in Vercel
2. ✅ Update OAuth redirect URIs
3. ✅ Redeploy
4. ✅ Test all endpoints
5. ✅ Monitor logs for any errors

---

**Status:** Ready to configure and deploy! 🚀
