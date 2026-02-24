# 🚀 Quick Deploy Guide

Deploy your DevMindX application in 5 minutes!

---

## Prerequisites

- ✅ Code pushed to GitHub
- ✅ Supabase project created
- ✅ All API keys ready

---

## Step 1: Deploy to Vercel (2 minutes)

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tushar051/DevMindX&project-name=devmindx&root-directory=DevMindX/MindCoder)

### Option B: Manual Deploy

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set root directory: `DevMindX/MindCoder`
4. Click "Deploy"

---

## Step 2: Add Environment Variables (2 minutes)

In Vercel Dashboard → Settings → Environment Variables, add:

```env
SUPABASE_URL=https://csexvydhnfulvfezqoit.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
NODE_ENV=production
JWT_SECRET=QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM
GEMINI_API_KEY=AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
GOOGLE_CLIENT_ID=692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=Ov23li1DxFPHl6zgI6zE
GITHUB_CLIENT_SECRET=afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1
CODESANDBOX_API_TOKEN=csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg
TOGETHER_API_KEY=c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
```

Then redeploy.

---

## Step 3: Update OAuth Callbacks (1 minute)

After deployment, get your Vercel URL (e.g., `https://devmindx.vercel.app`)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`

### GitHub OAuth
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Update callback: `https://your-app.vercel.app/api/auth/github/callback`

### Update Vercel Environment Variables
1. Update `GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL`
2. Redeploy

---

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

Test:
- Sign up / Login
- Generate demo projects
- Try OAuth login

---

## 🆘 Need Help?

See full guide: [VERCEL_COMPLETE_DEPLOYMENT.md](./VERCEL_COMPLETE_DEPLOYMENT.md)

---

## 📦 Using CLI?

```bash
# Windows
deploy-vercel.bat

# Linux/Mac
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

---

**That's it! Your app is deployed! 🎉**
