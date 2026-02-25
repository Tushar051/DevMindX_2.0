# Fix Production Errors - Quick Checklist

## Current Problem
- ❌ Frontend calling `devmindx.onrender.com` (Render)
- ❌ Getting 404 and CORS errors
- ❌ Backend not responding

## Solution: Use Vercel for Everything

### ✅ Step 1: Set Environment Variables in Vercel (5 min)

1. Go to: https://vercel.com/dashboard
2. Click on your "devmindx" project
3. Go to: Settings → Environment Variables
4. Add these CRITICAL variables:

```
MONGODB_URI = mongodb+srv://your_connection_string
MONGODB_DB = devmindx
MONGODB_TLS = true

GEMINI_API_KEY = AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
TOGETHER_API_KEY = c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a

JWT_SECRET = QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
SESSION_SECRET = your_random_32_char_string

GOOGLE_CALLBACK_URL = https://devmindx.vercel.app/api/auth/google/callback
GITHUB_CALLBACK_URL = https://devmindx.vercel.app/api/auth/github/callback

FRONTEND_URL = https://devmindx.vercel.app
ALLOWED_ORIGINS = https://devmindx.vercel.app

NODE_ENV = production
```

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

1. **MongoDB:**
   - Verify connection string format
   - Check MongoDB Atlas → Network Access → Allow all IPs (0.0.0.0/0)
   - Verify database user has read/write permissions

2. **Supabase (alternative):**
   - Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - Don't need MongoDB if using Supabase

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
