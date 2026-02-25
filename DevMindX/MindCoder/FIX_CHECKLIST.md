# Fix Production Errors - Quick Checklist

## Current Problem
- ❌ Frontend calling `devmindx.onrender.com` (Render)
- ❌ Getting 404 and CORS errors
- ❌ Backend not responding

## Solution: Use Vercel for Everything

### ✅ Step 1: Choose Database & Set Environment Variables (10 min)

**CRITICAL:** Local MongoDB won't work with Vercel! Choose one:

#### Option A: Use Supabase (EASIEST - You already have it!) ⭐

1. Go to: https://vercel.com/dashboard
2. Click on your "devmindx" project
3. Go to: Settings → Environment Variables
4. Add these variables:

```
# Database - Supabase (you already have this!)
SUPABASE_URL = https://csexvydhnfulvfezqoit.supabase.co
SUPABASE_ANON_KEY = sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY = sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP

# AI Services
GEMINI_API_KEY = AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
TOGETHER_API_KEY = c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
CODESANDBOX_API_TOKEN = csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg

# Authentication
JWT_SECRET = QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
JWT_EXPIRATION = 86400000
SESSION_SECRET = QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890

# OAuth
GOOGLE_CLIENT_ID = 692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
GOOGLE_CALLBACK_URL = https://devmindx.vercel.app/api/auth/google/callback
GITHUB_CLIENT_ID = Ov23li1DxFPHl6zgI6zE
GITHUB_CLIENT_SECRET = afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1
GITHUB_CALLBACK_URL = https://devmindx.vercel.app/api/auth/github/callback

# Email
EMAIL_USER = webdevx.ai@gmail.com
EMAIL_PASS = hjowcklyhohvanfe
FORCE_EMAIL = true

# URLs
FRONTEND_URL = https://devmindx.vercel.app
ALLOWED_ORIGINS = https://devmindx.vercel.app

# Environment
NODE_ENV = production
PORT = 5000
```

#### Option B: Use MongoDB Atlas (Free Cloud MongoDB)

See `MONGODB_ATLAS_SETUP.md` for step-by-step guide to:
1. Create free MongoDB Atlas account
2. Get connection string
3. Set `MONGODB_URI` in Vercel

**Note:** See `setup-vercel-env.bat` for complete list

### ✅ Step 2: Update OAuth Callbacks (3 min)

**Google OAuth:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: `692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o`
3. Edit → Authorized redirect URIs
4. Change from: `https://devmindx.onrender.com/api/auth/google/callback`
5. Change to: `https://devmindx.vercel.app/api/auth/google/callback`
6. Save

**GitHub OAuth:**
1. Go to: https://github.com/settings/developers
2. Find OAuth App: `Ov23li1DxFPHl6zgI6zE`
3. Edit → Authorization callback URL
4. Change from: `https://devmindx.onrender.com/api/auth/github/callback`
5. Change to: `https://devmindx.vercel.app/api/auth/github/callback`
6. Save

### ✅ Step 3: Remove VITE_API_URL (1 min)

In Vercel Dashboard → Environment Variables:
- If `VITE_API_URL` exists, DELETE it
- This makes frontend use same origin (Vercel)

### ✅ Step 4: Redeploy (2 min)

**Option A - Vercel Dashboard:**
1. Go to: Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Option B - Git Push:**
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

### ✅ Step 5: Test (2 min)

Wait for deployment to complete, then test:

```bash
# Should return: {"status":"ok","timestamp":"..."}
curl https://devmindx.vercel.app/api/health

# Should return: {"message":"Access token required"} (not 404!)
curl https://devmindx.vercel.app/api/projects

# Should return: {"error":"Unauthorized"} (not 404!)
curl https://devmindx.vercel.app/api/llm/models
```

**In Browser:**
1. Go to: https://devmindx.vercel.app
2. Open DevTools → Console
3. Should see NO 404 errors
4. Should see NO CORS errors

## Expected Results

### Before Fix:
```
❌ 404 - /api/projects
❌ 404 - /api/llm/models
❌ CORS error from devmindx.onrender.com
❌ Failed to fetch
```

### After Fix:
```
✅ 200 - /api/health
✅ 401 - /api/projects (needs auth, but route exists!)
✅ 401 - /api/llm/models (needs auth, but route exists!)
✅ No CORS errors
✅ All routes accessible
```

## Troubleshooting

### Still Getting 404s?

1. Check Vercel deployment logs:
   - Go to: Deployments → Click on deployment → View Function Logs
   - Look for: "MongoDB connected" and "Routes initialized"

2. Verify `MONGODB_URI` is set:
   - Settings → Environment Variables
   - Must be set for routes to work

3. Check if deployment succeeded:
   - Should see "Deployment completed" in Vercel

### Still Getting CORS Errors?

1. Make sure `VITE_API_URL` is NOT set in Vercel
2. Clear browser cache and hard refresh (Ctrl+Shift+R)
3. Check `ALLOWED_ORIGINS` includes your domain

### Database Connection Errors?

**IMPORTANT:** Local MongoDB won't work with Vercel!

1. **If using Supabase (RECOMMENDED):**
   - Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` in Vercel
   - Don't set `MONGODB_URI`
   - Your code already supports Supabase!

2. **If using MongoDB Atlas:**
   - Follow `MONGODB_ATLAS_SETUP.md` to create free cloud database
   - Get connection string from Atlas
   - Set `MONGODB_URI` in Vercel
   - Format: `mongodb+srv://user:pass@cluster.mongodb.net/devmindx`

3. **Cannot use local MongoDB:**
   - `mongodb://localhost:27017` won't work in production
   - Vercel runs in the cloud, can't access your computer
   - Must use cloud database (Atlas or Supabase)

## Quick Commands

```bash
# View this checklist
cat FIX_CHECKLIST.md

# See environment variables helper
setup-vercel-env.bat

# See detailed setup guide
cat VERCEL_ONLY_SETUP.md

# See issue explanation
cat CURRENT_ISSUE_EXPLAINED.md
```

## Time Estimate

- ⏱️ Total time: ~15 minutes
- ⏱️ Set env vars: 5 min
- ⏱️ Update OAuth: 3 min
- ⏱️ Redeploy: 2 min
- ⏱️ Test: 2 min
- ⏱️ Troubleshoot: 3 min (if needed)

## Success Criteria

✅ No 404 errors in browser console
✅ No CORS errors
✅ `/api/health` returns 200 OK
✅ Other endpoints return 401 (not 404)
✅ Can login and use the app

---

**Ready to fix?** Start with Step 1! 🚀
