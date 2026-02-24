# Deploy Backend to Render.com

## Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize Render to access your repositories

## Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Tushar051/DevMindX`
3. Configure the service:
   - **Name**: `devmindx-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `DevMindX/MindCoder`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

## Step 3: Add Environment Variables

Click "Advanced" and add these environment variables:

```
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your_mongodb_uri
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

# OAuth - UPDATE CALLBACK URLs!
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://devmindx-backend.onrender.com/api/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://devmindx-backend.onrender.com/api/auth/github/callback

# AI APIs
GEMINI_API_KEY=your_gemini_key
TOGETHER_API_KEY=your_together_key
CHATGPT_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
DEEPSEEK_API_KEY=your_deepseek_key

# CORS - Add your Vercel frontend URL
ALLOWED_ORIGINS=https://devmindx.vercel.app,http://localhost:5173

# Email
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FORCE_EMAIL=true
```

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes first time)
3. Your backend will be at: `https://devmindx-backend.onrender.com`

## Step 5: Update OAuth Callback URLs

### Google OAuth Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add to "Authorized redirect URIs":
   ```
   https://devmindx-backend.onrender.com/api/auth/google/callback
   ```

### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Update "Authorization callback URL":
   ```
   https://devmindx-backend.onrender.com/api/auth/github/callback
   ```

## Step 6: Update Vercel Frontend

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   ```
   VITE_API_URL=https://devmindx-backend.onrender.com
   ```
3. Redeploy Vercel

## Step 7: Update Vercel Configuration

Since backend is on Render, simplify `vercel.json`:

```json
{
  "buildCommand": "npm run build:client",
  "outputDirectory": "dist/public",
  "framework": null
}
```

## Testing

1. Visit: `https://devmindx-backend.onrender.com/api/health` (should return OK)
2. Visit your Vercel frontend
3. Try OAuth login - should work!

## Important Notes

- **Free tier sleeps after 15 min of inactivity** - first request after sleep takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on service
- Render auto-deploys on every git push to main branch
- Check logs in Render dashboard if issues occur

## Troubleshooting

If OAuth still doesn't work:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure callback URLs match exactly (no trailing slashes)
4. Check CORS settings (ALLOWED_ORIGINS)
