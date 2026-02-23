# DevMindX Supabase Deployment Guide

## 🚀 Supabase + Vercel Deployment

Supabase provides a complete backend solution with PostgreSQL database, authentication, storage, and edge functions.

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Node.js**: Version 18 or higher

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: devmindx
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### Step 2: Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: Your publishable API key
   - **service_role key**: Your secret key (keep secure!)

**Your Credentials:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
```

### Step 3: Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'local',
  provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT,
  files JSONB DEFAULT '{}',
  preview_url TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration sessions table
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  host_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participants JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX idx_collaboration_sessions_session_id ON collaboration_sessions(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id OR is_demo = true);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_history
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history" ON chat_history
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for collaboration_sessions
CREATE POLICY "Users can view sessions they're part of" ON collaboration_sessions
  FOR SELECT USING (
    auth.uid() = host_user_id OR 
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(participants))
  );

CREATE POLICY "Users can create collaboration sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Host can update sessions" ON collaboration_sessions
  FOR UPDATE USING (auth.uid() = host_user_id);
```

### Step 4: Enable Authentication Providers

1. Go to **Authentication** → **Providers**
2. Enable:
   - **Email** (for email/password auth)
   - **Google** (add your OAuth credentials)
   - **GitHub** (add your OAuth credentials)

---

## Part 2: Backend Setup

### Step 1: Install Supabase Client

```bash
cd DevMindX/MindCoder
npm install @supabase/supabase-js
```

### Step 2: Update Environment Variables

Update `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT (Supabase handles this, but keep for compatibility)
JWT_SECRET=your_jwt_secret_here

# AI APIs
GEMINI_API_KEY=AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
CHATGPT_API_KEY=your_openai_key (optional)
CLAUDE_API_KEY=your_claude_key (optional)

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.vercel.app/api/auth/github/callback

# Email
EMAIL_USER=webdevx.ai@gmail.com
EMAIL_PASS=your_app_password

# CodeSandbox
CODESANDBOX_API_TOKEN=csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg

# Together AI
TOGETHER_API_KEY=c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a
```

---

## Part 3: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `DevMindX/MindCoder`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

4. Add Environment Variables (click "Environment Variables"):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
   SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
   GEMINI_API_KEY=AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   GITHUB_CLIENT_ID=your_id
   GITHUB_CLIENT_SECRET=your_secret
   CODESANDBOX_API_TOKEN=your_token
   TOGETHER_API_KEY=your_key
   NODE_ENV=production
   ```

5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd DevMindX/MindCoder
vercel --prod
```

---

## Part 4: Configure Supabase Edge Functions (Optional)

For serverless backend functions:

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase Functions

```bash
supabase init
supabase functions new generate-project
```

### Step 3: Deploy Functions

```bash
supabase functions deploy generate-project --project-ref your-project-ref
```

---

## Part 5: Update OAuth Callbacks

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Update Authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-app.vercel.app/api/auth/google/callback`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Update Authorization callback URL:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-app.vercel.app/api/auth/github/callback`

---

## Part 6: Realtime Collaboration Setup

Supabase provides built-in realtime capabilities:

```typescript
// Enable realtime on tables
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to changes
const channel = supabase
  .channel('collaboration')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'collaboration_sessions' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

---

## Architecture Overview

```
┌─────────────────┐
│   Vercel        │
│   (Frontend +   │
│    API Routes)  │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐ ┌──▼──────────────┐
│   Supabase      │ │  External APIs  │
│   - PostgreSQL  │ │  - Gemini       │
│   - Auth        │ │  - CodeSandbox  │
│   - Storage     │ │  - Together AI  │
│   - Realtime    │ └─────────────────┘
└─────────────────┘
```

---

## Deployment Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "deploy:vercel": "vercel --prod",
    "deploy:supabase": "supabase db push && supabase functions deploy",
    "deploy:all": "npm run deploy:supabase && npm run deploy:vercel"
  }
}
```

---

## Database Migration

If migrating from MongoDB:

```bash
# Export MongoDB data
mongoexport --uri="mongodb://localhost:27017/devmindx" --collection=users --out=users.json

# Import to Supabase (use a migration script)
node scripts/migrate-to-supabase.js
```

---

## Monitoring & Logs

### Vercel Logs
```bash
vercel logs your-deployment-url
```

### Supabase Logs
- Go to Supabase Dashboard → Logs
- View API logs, Database logs, and Auth logs

---

## Cost Estimation

### Supabase Free Tier
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### Vercel Free Tier
- 100 GB bandwidth
- Unlimited deployments
- Automatic HTTPS

### Paid Plans
- **Supabase Pro**: $25/month
- **Vercel Pro**: $20/month

---

## Troubleshooting

### Issue: CORS errors

**Solution**: Configure CORS in Supabase:
1. Go to Settings → API
2. Add your Vercel domain to allowed origins

### Issue: Authentication not working

**Solution**: 
1. Check OAuth callback URLs
2. Verify Supabase auth settings
3. Ensure environment variables are set

### Issue: Database connection errors

**Solution**:
1. Check Supabase project status
2. Verify connection string
3. Check RLS policies

---

## Security Best Practices

1. **Never expose service_role key** in client-side code
2. **Use Row Level Security (RLS)** for all tables
3. **Enable MFA** for Supabase dashboard access
4. **Rotate API keys** regularly
5. **Use environment variables** for all secrets

---

## Quick Deploy Commands

```bash
# Full deployment
npm run build
vercel --prod

# Update environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Redeploy
vercel --prod --force
```

---

## Demo Projects Notice

The app showcases demo projects while custom AI generation is being set up:
- 🐍 Snake Game
- ✅ Todo App
- 🌤️ Weather Dashboard
- 🛒 E-commerce
- 💬 Social App

Users can type keywords like "demo snake" to generate these projects.

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Discord](https://discord.gg/vercel)

---

**Happy Deploying! 🚀**
