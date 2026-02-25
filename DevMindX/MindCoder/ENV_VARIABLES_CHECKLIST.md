# Environment Variables Checklist

## 🔴 CRITICAL - Must Set on Render Backend

These are REQUIRED for the app to work:

```bash
# MongoDB Connection (REQUIRED - App will crash without this)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=devmindx

# Node Environment
NODE_ENV=production
PORT=5000

# CORS Configuration (REQUIRED - Frontend won't be able to connect)
ALLOWED_ORIGINS=https://devmindx.vercel.app

# JWT Configuration (REQUIRED - Authentication won't work)
JWT_SECRET=your-secure-random-64-character-string-here
JWT_EXPIRATION=86400000

# Email Configuration (REQUIRED - OTP verification won't work)
FORCE_EMAIL=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# AI API Keys (At least TOGETHER_API_KEY is REQUIRED)
TOGETHER_API_KEY=your-together-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## 🟡 OPTIONAL - OAuth Features

Only needed if you want Google/GitHub login:

```bash
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://devmindx.onrender.com/api/auth/google/callback

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://devmindx.onrender.com/api/auth/github/callback
```

## 🟢 OPTIONAL - Additional AI Models

Only needed if you want to offer these models:

```bash
# OpenAI ChatGPT (Optional)
CHATGPT_API_KEY=your-openai-api-key

# Anthropic Claude (Optional)
CLAUDE_API_KEY=your-claude-api-key

# DeepSeek (Optional)
DEEPSEEK_API_KEY=your-deepseek-api-key
```

## 🔵 Vercel Frontend Variables

Set these in Vercel project settings:

```bash
# Backend API URL (REQUIRED)
VITE_API_URL=https://devmindx.onrender.com

# Socket.IO URL (REQUIRED)
VITE_SOCKET_URL=https://devmindx.onrender.com
```

## How to Get Each Variable

### MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Example: `mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/`

### JWT Secret
Generate a secure random string:
```bash
# On Linux/Mac:
openssl rand -base64 64

# Or use online generator:
# https://www.random.org/strings/
```

### Email Configuration
1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this as EMAIL_PASS

### Together AI API Key
1. Go to [Together AI](https://api.together.xyz/)
2. Sign up for free account
3. Go to API Keys section
4. Create new API key

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

## Verification Commands

After setting variables, verify they're working:

### Test MongoDB Connection
```bash
curl https://devmindx.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "environment": "production"
}
```

### Test CORS
```bash
curl -H "Origin: https://devmindx.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://devmindx.onrender.com/api/projects
```

Should return 204 with CORS headers.

### Test API Endpoint
```bash
curl https://devmindx.onrender.com/api/llm/models \
     -H "x-user-id: test"
```

Should return models list (not 500 error).

## Common Issues

### Issue: "Cannot read properties of undefined (reading 'collection')"
**Solution:** MONGODB_URI is not set or invalid. Check:
1. Variable is set on Render
2. Connection string is correct
3. Database user has proper permissions
4. IP whitelist includes 0.0.0.0/0

### Issue: CORS errors
**Solution:** ALLOWED_ORIGINS is not set or incorrect. Check:
1. Variable is set on Render
2. Value is exactly: `https://devmindx.vercel.app`
3. No trailing slash
4. Backend has redeployed after setting variable

### Issue: 404 errors on API routes
**Solution:** Frontend is pointing to wrong backend URL. Check:
1. VITE_API_URL is set on Vercel
2. Value is: `https://devmindx.onrender.com`
3. Frontend has redeployed after setting variable

## Quick Setup Script

Copy and paste this into Render environment variables (replace values):

```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/
MONGODB_DB=devmindx
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://devmindx.vercel.app
JWT_SECRET=YOUR_RANDOM_64_CHAR_STRING
JWT_EXPIRATION=86400000
FORCE_EMAIL=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
TOGETHER_API_KEY=your-together-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## Deployment Order

1. ✅ Set all CRITICAL variables on Render
2. ✅ Wait for Render to redeploy (check logs)
3. ✅ Test health endpoint
4. ✅ Set variables on Vercel
5. ✅ Redeploy Vercel frontend
6. ✅ Test the application

## Support

If you're still having issues after following this guide:
1. Check Render logs for errors
2. Check browser console for errors
3. Verify all CRITICAL variables are set
4. Test health endpoint
5. Ensure MongoDB Atlas allows connections from anywhere
