# DevMindX Firebase Deployment Guide

## 🔥 Firebase Deployment Options

Firebase offers multiple hosting solutions for your full-stack application:

### Architecture Overview

**Frontend (Firebase Hosting)** → **Backend (Cloud Run/Cloud Functions)** → **Database (MongoDB Atlas/Firestore)**

---

## Prerequisites

1. **Firebase Account**: Sign up at [firebase.google.com](https://firebase.google.com)
2. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```
3. **Google Cloud Account**: For Cloud Run (backend hosting)

---

## Option 1: Firebase Hosting + Cloud Run (Recommended)

This setup provides the best performance for your Express + Socket.IO backend.

### Step 1: Initialize Firebase Project

```bash
cd DevMindX/MindCoder

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Hosting
# - (Optional) Firestore if you want to migrate from MongoDB
```

### Step 2: Configure Firebase Hosting

Create/update `firebase.json`:

```json
{
  "hosting": {
    "public": "dist/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "devmindx-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "/socket.io/**",
        "run": {
          "serviceId": "devmindx-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 3: Build Frontend

```bash
npm run build:client
```

### Step 4: Deploy Backend to Cloud Run

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server ./server
COPY dist ./dist

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
```

Build and deploy:

```bash
# Build the app
npm run build

# Deploy to Cloud Run
gcloud run deploy devmindx-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### Step 5: Set Environment Variables in Cloud Run

```bash
gcloud run services update devmindx-backend \
  --set-env-vars \
  MONGODB_URI=your_mongodb_uri,\
  JWT_SECRET=your_secret,\
  GEMINI_API_KEY=your_key,\
  GOOGLE_CLIENT_ID=your_id,\
  GOOGLE_CLIENT_SECRET=your_secret,\
  GITHUB_CLIENT_ID=your_id,\
  GITHUB_CLIENT_SECRET=your_secret
```

### Step 6: Deploy Frontend to Firebase Hosting

```bash
firebase deploy --only hosting
```

---

## Option 2: Firebase Hosting + Cloud Functions

For a fully serverless approach (note: Socket.IO limitations apply).

### Step 1: Initialize Cloud Functions

```bash
firebase init functions

# Select TypeScript or JavaScript
# Install dependencies
```

### Step 2: Convert Express to Cloud Functions

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import express from 'express';
import { registerRoutes } from './routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
registerRoutes(app);

// Export as Cloud Function
export const api = functions.https.onRequest(app);
```

### Step 3: Update firebase.json

```json
{
  "hosting": {
    "public": "dist/public",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

### Step 4: Deploy

```bash
# Build frontend
npm run build:client

# Deploy everything
firebase deploy
```

---

## Option 3: Using Firestore Instead of MongoDB

If you want to use Firebase's native database:

### Step 1: Initialize Firestore

```bash
firebase init firestore
```

### Step 2: Update Database Logic

Replace MongoDB calls with Firestore:

```typescript
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

// Example: Save user
await db.collection('users').doc(userId).set({
  email: user.email,
  name: user.name,
  createdAt: new Date()
});

// Example: Get projects
const projectsSnapshot = await db
  .collection('projects')
  .where('userId', '==', userId)
  .get();

const projects = projectsSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

## Environment Variables Setup

### For Cloud Run

Use Google Cloud Console or CLI:

```bash
gcloud run services update devmindx-backend \
  --update-env-vars KEY=VALUE
```

### For Cloud Functions

Create `.env` file in `functions/` directory:

```env
MONGODB_URI=your_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
```

Or use Firebase Config:

```bash
firebase functions:config:set \
  mongodb.uri="your_uri" \
  jwt.secret="your_secret" \
  gemini.key="your_key"
```

---

## Complete Environment Variables

```env
# Server
NODE_ENV=production
PORT=8080

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devmindx

# JWT
JWT_SECRET=your_secure_random_string_here

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
CHATGPT_API_KEY=your_openai_key (optional)
CLAUDE_API_KEY=your_claude_key (optional)

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.web.app/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.web.app/api/auth/github/callback

# Email (SendGrid or Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CodeSandbox (for preview)
CODESANDBOX_API_TOKEN=your_token

# CORS
ALLOWED_ORIGINS=https://your-app.web.app,https://your-app.firebaseapp.com
```

---

## Deployment Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "deploy:frontend": "npm run build:client && firebase deploy --only hosting",
    "deploy:backend": "npm run build && gcloud run deploy devmindx-backend --source .",
    "deploy:all": "npm run build && firebase deploy && gcloud run deploy devmindx-backend --source ."
  }
}
```

---

## Post-Deployment Steps

### 1. Update OAuth Callbacks

**Google Cloud Console:**
- Go to APIs & Services → Credentials
- Update Authorized redirect URIs:
  - `https://your-app.web.app/api/auth/google/callback`
  - `https://your-backend-url.run.app/api/auth/google/callback`

**GitHub Developer Settings:**
- Go to Settings → Developer settings → OAuth Apps
- Update Authorization callback URL:
  - `https://your-app.web.app/api/auth/github/callback`

### 2. Configure CORS

Update your backend to allow Firebase Hosting domain:

```typescript
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://your-app.web.app',
    'https://your-app.firebaseapp.com'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  next();
});
```

### 3. Set Up Custom Domain (Optional)

```bash
firebase hosting:channel:deploy production
firebase hosting:site:create your-custom-domain
```

---

## Monitoring & Logs

### View Cloud Run Logs

```bash
gcloud run services logs read devmindx-backend --limit 50
```

### View Firebase Hosting Logs

Go to Firebase Console → Hosting → Usage tab

### Set Up Alerts

```bash
# Cloud Run alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-threshold-value=0.05
```

---

## Cost Optimization

### Firebase Hosting
- **Free tier**: 10 GB storage, 360 MB/day transfer
- **Paid**: $0.026/GB storage, $0.15/GB transfer

### Cloud Run
- **Free tier**: 2 million requests/month
- **Paid**: $0.00002400/request after free tier

### Firestore (if used)
- **Free tier**: 1 GB storage, 50K reads, 20K writes/day
- **Paid**: $0.18/GB storage, $0.06/100K reads

---

## Troubleshooting

### Issue: Socket.IO not connecting

**Solution**: Ensure Cloud Run allows WebSocket connections:
```bash
gcloud run services update devmindx-backend \
  --session-affinity
```

### Issue: CORS errors

**Solution**: Add proper CORS headers in your backend and update `ALLOWED_ORIGINS`.

### Issue: Environment variables not loading

**Solution**: Verify env vars are set:
```bash
gcloud run services describe devmindx-backend
```

---

## Quick Deploy Commands

```bash
# Full deployment
npm run build
firebase deploy --only hosting
gcloud run deploy devmindx-backend --source .

# Frontend only
npm run build:client
firebase deploy --only hosting

# Backend only
npm run build
gcloud run deploy devmindx-backend --source .
```

---

## Demo Projects Notice

Since AI generation requires API keys, the app currently showcases demo projects:
- 🐍 Snake Game
- ✅ Todo App
- 🌤️ Weather Dashboard
- 🛒 E-commerce
- 💬 Social App

Users can explore these demos from the Projects page while custom generation is being set up.

---

## Support

For issues:
1. Check Firebase Console logs
2. Check Cloud Run logs
3. Verify environment variables
4. Test OAuth callbacks
5. Check MongoDB connection

---

**Happy Deploying! 🚀**
