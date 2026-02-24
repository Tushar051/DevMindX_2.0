# DevMindX Complete Vercel Deployment Guide

## 🚀 Full-Stack Deployment with Vercel + Supabase

This guide will help you deploy your complete DevMindX application (Frontend + Backend + Database) to production.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ GitHub account with your code pushed
2. ✅ Vercel account ([vercel.com](https://vercel.com))
3. ✅ Supabase project set up ([supabase.com](https://supabase.com))
4. ✅ All API keys ready (Gemini, Google OAuth, GitHub OAuth, etc.)

---

## Part 1: Prepare Your Application

### Step 1: Update vercel.json

Your `vercel.json` should be configured for full-stack deployment:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/socket.io/:path*",
      "destination": "/api/socket"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Step 2: Create API Directory for Serverless Functions

Create `api/index.js` for serverless backend:

```javascript
// api/index.js
import '../dist/index.js';
```

This will be created automatically during build.

---

## Part 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

#### 1. Connect GitHub Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository: `Tushar051/DevMindX`
5. Click "Import"

#### 2. Configure Project Settings

**Framework Preset**: Vite

**Root Directory**: `DevMindX/MindCoder`

**Build Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

**Node.js Version**: 20.x (recommended)

#### 3. Add Environment Variables

Click "Environment Variables" and add ALL of these:

```env
# Supabase Configuration
SUPABASE_URL=https://csexvydhnfulvfezqoit.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP

# Server Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
JWT_EXPIRATION=86400000

# Email Configuration
FORCE_EMAIL=true
EMAIL_USER=webdevx.ai@gmail.com
EMAIL_PASS=hjowcklyhohvanfe

# Google OAuth
GOOGLE_CLIENT_ID=692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23li1DxFPHl6zgI6zE
GITHUB_CLIENT_SECRET=afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1
GITHUB_CALLBACK_URL=https://your-app.vercel.app/api/auth/github/callback

# AI API Keys
GEMINI_API_KEY=AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
TOGETHER_API_KEY=c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
CHATGPT_API_KEY=your_openai_key_if_you_have_one
CLAUDE_API_KEY=your_claude_key_if_you_have_one

# CodeSandbox
CODESANDBOX_API_TOKEN=csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg
CODESANDBOX_API_VERSION=2023-07-01
```

**Important**: Replace `your-app.vercel.app` with your actual Vercel domain after first deployment.

#### 4. Deploy

Click "Deploy" button and wait for the build to complete (usually 2-5 minutes).

---

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd DevMindX/MindCoder

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? devmindx
# - Directory? ./
# - Override settings? No
```

---

## Part 3: Post-Deployment Configuration

### Step 1: Get Your Vercel URL

After deployment, you'll get a URL like:
- `https://devmindx.vercel.app`
- or `https://devmindx-username.vercel.app`

### Step 2: Update OAuth Callback URLs

#### Google OAuth Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: APIs & Services → Credentials
3. Select your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   ```
   https://your-app.vercel.app/api/auth/google/callback
   https://csexvydhnfulvfezqoit.supabase.co/auth/v1/callback
   ```
5. Click "Save"

#### GitHub OAuth Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update "Authorization callback URL":
   ```
   https://your-app.vercel.app/api/auth/github/callback
   ```
4. Click "Update application"

#### Supabase Auth Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/csexvydhnfulvfezqoit)
2. Navigate to: Authentication → URL Configuration
3. Add to "Site URL":
   ```
   https://your-app.vercel.app
   ```
4. Add to "Redirect URLs":
   ```
   https://your-app.vercel.app/**
   ```

### Step 3: Update Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Update these variables with your actual Vercel URL:
   - `GOOGLE_CALLBACK_URL`
   - `GITHUB_CALLBACK_URL`
4. Click "Save"
5. Redeploy: Go to "Deployments" → Click "..." → "Redeploy"

---

## Part 4: Verify Deployment

### Test Checklist

Visit your deployed app and test:

- [ ] ✅ Homepage loads correctly
- [ ] ✅ Can sign up with email
- [ ] ✅ Can log in with email
- [ ] ✅ Google OAuth works
- [ ] ✅ GitHub OAuth works
- [ ] ✅ Can access generator page
- [ ] ✅ Demo projects work (type "demo snake", etc.)
- [ ] ✅ Can view projects
- [ ] ✅ Real-time collaboration works
- [ ] ✅ Socket.IO connections work

### Check Logs

If something doesn't work:

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Latest deployment
3. Click "View Function Logs"
4. Check for errors

---

## Part 5: Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `devmindx.com`)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-30 minutes)

### Update OAuth Callbacks for Custom Domain

Repeat Step 2 from Part 3, but use your custom domain instead of `.vercel.app`

---

## Part 6: Troubleshooting

### Issue: Build Fails

**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility
4. Try building locally: `npm run build`

### Issue: Environment Variables Not Working

**Solution**:
1. Verify all variables are set in Vercel dashboard
2. Check for typos in variable names
3. Redeploy after adding/updating variables
4. Ensure no spaces in variable values

### Issue: OAuth Redirect Fails

**Solution**:
1. Verify callback URLs match exactly
2. Check that URLs use HTTPS (not HTTP)
3. Ensure no trailing slashes in URLs
4. Wait a few minutes after updating OAuth settings

### Issue: Supabase Connection Fails

**Solution**:
1. Verify `SUPABASE_URL` is correct
2. Check `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY`
3. Ensure Supabase project is active
4. Check Supabase dashboard for service status

### Issue: Socket.IO Not Working

**Solution**:
1. Vercel has limitations with WebSockets
2. Consider using Supabase Realtime instead
3. Or deploy backend separately (Railway, Render)

### Issue: API Routes Return 404

**Solution**:
1. Check `vercel.json` rewrites configuration
2. Ensure API routes are in correct directory
3. Verify build output includes server code
4. Check function logs for errors

---

## Part 7: Performance Optimization

### Enable Caching

Add to `vercel.json`:

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

### Enable Compression

Vercel automatically compresses responses, but you can optimize:

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## Part 8: Monitoring & Analytics

### Enable Vercel Analytics

1. Go to Vercel Dashboard → Your Project
2. Click "Analytics" tab
3. Click "Enable Analytics"
4. View real-time traffic and performance

### Enable Vercel Speed Insights

1. Install package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to your app:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/react';
   
   function App() {
     return (
       <>
         <YourApp />
         <SpeedInsights />
       </>
     );
   }
   ```

---

## Part 9: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

---

## Part 10: Cost Estimation

### Vercel Pricing

**Hobby (Free)**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Perfect for demos and testing

**Pro ($20/month)**:
- 1 TB bandwidth/month
- Advanced analytics
- Password protection
- Team collaboration

### Supabase Pricing

**Free Tier**:
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Pro ($25/month)**:
- 8 GB database
- 100 GB file storage
- 250 GB bandwidth
- 100,000 monthly active users

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm deployment-url

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables
vercel env pull
```

---

## 🎯 Deployment Checklist

Before going live:

- [ ] ✅ All environment variables set in Vercel
- [ ] ✅ Supabase database tables created
- [ ] ✅ OAuth callback URLs updated
- [ ] ✅ Custom domain configured (if using)
- [ ] ✅ SSL certificate active (automatic with Vercel)
- [ ] ✅ All features tested in production
- [ ] ✅ Error monitoring set up
- [ ] ✅ Analytics enabled
- [ ] ✅ Backup strategy in place

---

## 🆘 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

---

## 🎉 Success!

Your DevMindX application is now live on Vercel with Supabase!

**Your URLs**:
- Production: `https://your-app.vercel.app`
- Supabase: `https://csexvydhnfulvfezqoit.supabase.co`

**Next Steps**:
1. Share your app with users
2. Monitor performance and errors
3. Collect feedback
4. Iterate and improve

---

**Happy Deploying! 🚀**
