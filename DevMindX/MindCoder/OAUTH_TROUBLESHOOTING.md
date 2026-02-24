# OAuth Troubleshooting Guide

## Quick Test Checklist

### 1. Verify Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Required variables:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.vercel.app/api/auth/github/callback

JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 2. Verify OAuth Provider Settings

#### Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Check "Authorized redirect URIs" includes:
  - `https://your-app.vercel.app/api/auth/google/callback`
  - `http://localhost:5000/api/auth/google/callback` (for local dev)

#### GitHub OAuth App
- URL: https://github.com/settings/developers
- Check "Authorization callback URL" is:
  - `https://your-app.vercel.app/api/auth/google/callback`
- For local dev, create a separate OAuth app with `http://localhost:5000/api/auth/github/callback`

### 3. Test OAuth Flow

1. Open your Vercel app in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Click "Login with Google" or "Login with GitHub"
5. Watch for:
   - Initial redirect to `/api/auth/google` or `/api/auth/github`
   - Redirect to OAuth provider (google.com or github.com)
   - Callback to `/api/auth/google/callback` or `/api/auth/github/callback`
   - Final redirect to `/?token=...&user=...`

### 4. Common Errors and Solutions

#### Error: "redirect_uri_mismatch"
**Cause:** Callback URL in OAuth provider doesn't match the one in your code
**Solution:** 
- Check GOOGLE_CALLBACK_URL/GITHUB_CALLBACK_URL in Vercel env vars
- Verify it matches exactly in Google/GitHub console
- Redeploy after changing env vars

#### Error: "oauth_not_configured"
**Cause:** Missing CLIENT_ID or CLIENT_SECRET
**Solution:**
- Verify all OAuth env variables are set in Vercel
- Redeploy after adding env vars

#### Error: "auth_failed"
**Cause:** OAuth authentication failed on provider side
**Solution:**
- Check browser console for detailed error
- Verify OAuth app is not suspended
- Check if email scope is granted

#### Error: Database/Supabase errors
**Cause:** User creation failed
**Solution:**
- Verify SUPABASE_URL and keys are correct
- Check Supabase database has proper tables (run schema)
- Check Supabase logs for errors

### 5. Debug Mode

To see detailed OAuth errors, check:

1. **Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check for network errors

2. **Network Tab** (F12 → Network tab)
   - Filter by "auth"
   - Check response status codes
   - Look at response bodies for error messages

3. **Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → Runtime Logs
   - Look for OAuth-related errors

### 6. Force Redeploy

After updating environment variables:
```bash
# Trigger a redeploy
git commit --allow-empty -m "Trigger redeploy for OAuth fix"
git push
```

Or in Vercel Dashboard:
- Go to Deployments
- Click "..." on latest deployment
- Click "Redeploy"

### 7. Test Locally First

Before testing on Vercel, test locally:

1. Update `.env` file with localhost callback URLs:
```env
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

2. Run locally:
```bash
npm run dev
```

3. Test OAuth at http://localhost:5000

If it works locally but not on Vercel, the issue is with Vercel env vars or callback URLs.

## Still Not Working?

Check these additional items:

- [ ] OAuth apps are not in "suspended" or "pending" state
- [ ] Email scope is requested and granted
- [ ] Supabase database is accessible from Vercel
- [ ] JWT_SECRET is set and consistent
- [ ] No CORS issues (check ALLOWED_ORIGINS env var)
- [ ] Session middleware is properly configured
- [ ] Passport.js is initialized correctly

## Get Help

If still stuck, provide:
1. Exact error message from browser console
2. Network tab screenshot showing the failed request
3. Vercel runtime logs
4. Your Vercel app URL
