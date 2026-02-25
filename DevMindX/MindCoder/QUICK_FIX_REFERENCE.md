# Quick Fix Reference Card

## 🚨 Problem
- CORS errors blocking frontend → backend communication
- 500 errors on account page and API endpoints
- 404 errors on features (projects, research, architecture, learning)

## ✅ Solution Applied

### Code Changes (Already Done)
1. ✅ Fixed CORS in `server/index.ts`
2. ✅ Fixed MongoDB connection in `server/db.ts`
3. ✅ Fixed API config in `client/src/config/api.ts`
4. ✅ Added health check in `server/routes.ts`

### What You Need to Do Now

#### Step 1: Set Up MongoDB Atlas (5 minutes)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user with password
4. Network Access → Add IP: 0.0.0.0/0 (allow all)
5. Copy connection string
```

#### Step 2: Configure Render Backend (3 minutes)
```
Go to Render Dashboard → Your Service → Environment

Add these variables:
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB = devmindx
ALLOWED_ORIGINS = https://devmindx.vercel.app
JWT_SECRET = (generate random 64-char string)
TOGETHER_API_KEY = (your Together AI key)
GEMINI_API_KEY = (your Gemini key)
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-gmail-app-password

Save → Render will auto-redeploy
```

#### Step 3: Configure Vercel Frontend (2 minutes)
```
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for Production:
VITE_API_URL = https://devmindx.onrender.com
VITE_SOCKET_URL = https://devmindx.onrender.com

Save → Redeploy
```

#### Step 4: Deploy (1 minute)
```bash
cd DevMindX/MindCoder
git add .
git commit -m "Fix production CORS and MongoDB issues"
git push origin main
```

#### Step 5: Verify (2 minutes)
```
1. Wait for deployments to complete
2. Visit: https://devmindx.onrender.com/api/health
   Should show: {"status":"healthy","mongodb":"connected"}
3. Visit: https://devmindx.vercel.app
4. Test account page, projects, research engine
```

## 🔍 Quick Troubleshooting

### Still getting CORS errors?
```
Check: ALLOWED_ORIGINS on Render = https://devmindx.vercel.app
No trailing slash!
```

### Still getting 500 errors?
```
Check: MONGODB_URI is set on Render
Test: https://devmindx.onrender.com/api/health
Should show "mongodb":"connected"
```

### Still getting 404 errors?
```
Check: VITE_API_URL on Vercel = https://devmindx.onrender.com
Redeploy Vercel after setting
```

## 📋 Environment Variables Quick Copy

### For Render:
```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/
MONGODB_DB=devmindx
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://devmindx.vercel.app
JWT_SECRET=YOUR_RANDOM_64_CHAR_STRING
JWT_EXPIRATION=86400000
FORCE_EMAIL=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
TOGETHER_API_KEY=your-together-key
GEMINI_API_KEY=your-gemini-key
```

### For Vercel:
```
VITE_API_URL=https://devmindx.onrender.com
VITE_SOCKET_URL=https://devmindx.onrender.com
```

## 🎯 Success Indicators

✅ Health check returns "healthy"
✅ No CORS errors in browser console
✅ Account page loads
✅ Projects page works
✅ Research engine works
✅ Architecture generator works
✅ Learning mode works

## 📞 Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Check browser console: F12 → Console tab
3. Test health: https://devmindx.onrender.com/api/health
4. Verify MongoDB: Can you connect from MongoDB Compass?

## ⏱️ Total Time: ~15 minutes

- MongoDB setup: 5 min
- Render config: 3 min
- Vercel config: 2 min
- Deploy: 1 min
- Wait for deployment: 3 min
- Verify: 2 min

## 🎉 Done!

Your app should now be fully functional in production!
