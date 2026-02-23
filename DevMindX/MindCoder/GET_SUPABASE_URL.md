# How to Get Your Supabase URL

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: [supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create an account

2. **Create a New Project** (if you don't have one)
   - Click "New Project"
   - Fill in:
     - **Name**: devmindx (or any name you prefer)
     - **Database Password**: Create a strong password (save it!)
     - **Region**: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

3. **Get Your Project URL**
   - Once project is ready, go to **Settings** (gear icon in sidebar)
   - Click **API** in the settings menu
   - You'll see:
     - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
     - **anon/public key**: Your publishable key
     - **service_role key**: Your secret key (click "Reveal" to see it)

4. **Update Your .env File**
   
   Replace in `DevMindX/MindCoder/.env`:
   
   ```env
   # Change this line:
   SUPABASE_URL=https://your-project.supabase.co
   
   # To your actual URL:
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

   Your keys are already set:
   ```env
   SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
   SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
   ```

## Visual Guide

```
Supabase Dashboard
├── Projects
│   └── Your Project (devmindx)
│       └── Settings ⚙️
│           └── API
│               ├── Project URL ← Copy this!
│               ├── anon public key (already in .env)
│               └── service_role key (already in .env)
```

## Example

If your project URL is: `https://abcdefghijklmnop.supabase.co`

Your .env should have:
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
```

## Next Steps After Getting URL

1. **Set up database tables**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Paste and click "Run"

2. **Test connection**:
   ```bash
   npm install
   npm run dev
   ```

3. **Deploy**:
   ```bash
   npm run deploy:vercel
   ```

## Troubleshooting

### Can't find Project URL?
- Make sure you're in the correct project
- Check Settings → API section
- URL format: `https://[project-ref].supabase.co`

### Keys don't match?
- The keys in your .env are correct
- Just need to add the URL
- Don't change the keys unless you have different ones from Supabase

### Project not created yet?
- Follow step 2 above to create a new project
- Wait for setup to complete (2-3 minutes)
- Then get the URL from Settings → API

---

**Need Help?**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
