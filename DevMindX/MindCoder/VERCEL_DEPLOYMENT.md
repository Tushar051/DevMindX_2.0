# DevMindX Vercel Deployment Guide

## ⚠️ Important: Architecture Considerations

Your app uses **Socket.IO for real-time collaboration**, which requires persistent WebSocket connections. Vercel's serverless architecture **does not support WebSockets**.

### Recommended Architecture

**Frontend (Vercel)** → **Backend (Railway/Render/Fly.io)**

---

## Option 1: Split Deployment (Recommended)

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project → "Deploy from GitHub"
3. Select your repo and set root directory to `DevMindX/MindCoder`
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret
   GEMINI_API_KEY=your_key
   # Add all other env vars from .env
   ```
5. Railway will auto-detect and deploy your Express server
6. Note your Railway URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project" → Import your GitHub repo
3. Configure:
   - **Root Directory**: `DevMindX/MindCoder`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/public`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-app.railway.app
   VITE_SOCKET_URL=https://your-app.railway.app
   ```

5. Click Deploy

### Step 3: Update OAuth Callbacks

Update your OAuth providers (Google, GitHub) with the new URLs:
- Google Console: Add `https://your-app.railway.app/api/auth/google/callback`
- GitHub Settings: Add `https://your-app.railway.app/api/auth/github/callback`

---

## Option 2: Full Vercel Deployment (Limited Features)

If you want everything on Vercel, you'll need to:

1. **Disable real-time collaboration** (Socket.IO won't work)
2. **Convert Express to Vercel Serverless Functions**

### Create API Routes

Create `DevMindX/MindCoder/api/` folder with serverless functions:

```javascript
// api/auth/login.js
export default async function handler(req, res) {
  // Your login logic
}
```

This requires significant refactoring and you'll lose:
- Real-time collaboration
- Live cursors
- Video calls
- Chat functionality

---

## MongoDB Setup (Required for Both Options)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in your deployment

---

## Environment Variables Checklist

```env
# Required
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_secret

# AI APIs
GEMINI_API_KEY=your_key

# OAuth (update callback URLs!)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback

GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_CALLBACK_URL=https://your-backend.railway.app/api/auth/github/callback

# Frontend (Vercel)
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

---

## Quick Deploy Commands

### Using Vercel CLI (Frontend)

```bash
cd DevMindX/MindCoder
npm install -g vercel
vercel login
vercel --prod
```

### Using Railway CLI (Backend)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas connected
- [ ] OAuth callbacks updated
- [ ] Environment variables set
- [ ] CORS configured (add frontend URL to `ALLOWED_ORIGINS`)
- [ ] Test login flow
- [ ] Test real-time collaboration
