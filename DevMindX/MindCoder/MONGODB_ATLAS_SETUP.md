# MongoDB Atlas Setup for Production

## Why You Need This

Your local MongoDB (`mongodb://localhost:27017`) cannot be accessed by Vercel's cloud servers. You need a cloud-hosted database.

## Option 1: MongoDB Atlas (FREE) ⭐

### Step 1: Create MongoDB Atlas Account (2 min)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose "Free" tier (M0 Sandbox - 512MB storage)

### Step 2: Create a Cluster (3 min)

1. After signup, click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a cloud provider and region (choose closest to you)
4. Cluster Name: `devmindx-cluster` (or any name)
5. Click "Create"
6. Wait 1-3 minutes for cluster to be created

### Step 3: Create Database User (1 min)

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `devmindx_user` (or any name)
5. Password: Click "Autogenerate Secure Password" and COPY IT
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Allow Network Access (1 min)

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Vercel)
4. IP Address: `0.0.0.0/0` (automatically filled)
5. Click "Confirm"

**Note:** This allows all IPs. For better security, you can add specific Vercel IPs later.

### Step 5: Get Connection String (2 min)

1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string (looks like):
   ```
   mongodb+srv://devmindx_user:<password>@devmindx-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with the password you copied in Step 3
8. Add database name at the end: `/devmindx`

**Final connection string:**
```
mongodb+srv://devmindx_user:YOUR_PASSWORD@devmindx-cluster.xxxxx.mongodb.net/devmindx?retryWrites=true&w=majority
```

### Step 6: Set in Vercel (2 min)

1. Go to: https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Add:
   ```
   MONGODB_URI = mongodb+srv://devmindx_user:YOUR_PASSWORD@devmindx-cluster.xxxxx.mongodb.net/devmindx?retryWrites=true&w=majority
   MONGODB_DB = devmindx
   MONGODB_TLS = true
   ```

### Step 7: Migrate Your Local Data (Optional)

If you have data in local MongoDB you want to keep:

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/devmindx" --out=./backup

# Import to MongoDB Atlas
mongorestore --uri="mongodb+srv://devmindx_user:YOUR_PASSWORD@devmindx-cluster.xxxxx.mongodb.net/devmindx" ./backup/devmindx
```

### Step 8: Test Connection

```bash
# Test locally first
# Update your .env file with the Atlas connection string
MONGODB_URI=mongodb+srv://devmindx_user:YOUR_PASSWORD@devmindx-cluster.xxxxx.mongodb.net/devmindx?retryWrites=true&w=majority

# Run your app
npm run dev

# Should see: "Connected to MongoDB"
```

### Step 9: Redeploy Vercel

After setting environment variables in Vercel:

```bash
git commit --allow-empty -m "Trigger deployment with MongoDB Atlas"
git push
```

Or in Vercel Dashboard → Deployments → Redeploy

## Option 2: Use Supabase (You Already Have It!)

You already have Supabase configured in your `.env`:

```bash
SUPABASE_URL=https://csexvydhnfulvfezqoit.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
```

Just set these in Vercel instead of MongoDB:

1. Go to Vercel → Settings → Environment Variables
2. Add:
   ```
   SUPABASE_URL=https://csexvydhnfulvfezqoit.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c
   SUPABASE_SERVICE_KEY=sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP
   ```
3. Don't set MONGODB_URI
4. Redeploy

**Note:** Your code already supports Supabase. Check `server/storage-supabase.ts`.

## Option 3: Deploy Backend to Render (Keep Local MongoDB)

If you want to keep using local MongoDB, deploy backend to Render:

1. Backend on Render (can access your local MongoDB via tunnel)
2. Frontend on Vercel
3. Set `VITE_API_URL=https://devmindx.onrender.com` in Vercel

**But this is complex and not recommended.**

## Comparison

| Option | Cost | Setup Time | Recommended |
|--------|------|------------|-------------|
| MongoDB Atlas | FREE (512MB) | 10 min | ⭐ YES |
| Supabase | FREE (500MB) | 2 min | ⭐ YES (already have it!) |
| Local MongoDB | FREE | Complex | ❌ NO (won't work with Vercel) |

## Recommended: Use Supabase (Easiest!)

Since you already have Supabase configured:

1. Set Supabase env vars in Vercel (see above)
2. Don't set MONGODB_URI
3. Redeploy
4. Done!

Your code will automatically use Supabase storage instead of MongoDB.

## Quick Decision Guide

**Choose MongoDB Atlas if:**
- ✅ You want to use MongoDB
- ✅ You have MongoDB data to migrate
- ✅ You prefer MongoDB syntax

**Choose Supabase if:**
- ✅ You already have it configured (YOU DO!)
- ✅ You want PostgreSQL instead of MongoDB
- ✅ You want faster setup (2 min vs 10 min)
- ✅ You want built-in auth and storage

## Next Steps

1. Choose: MongoDB Atlas OR Supabase
2. Set environment variables in Vercel
3. Redeploy
4. Test: `https://devmindx.vercel.app/api/health`

---

**Recommendation:** Use Supabase since you already have it! Just set the env vars in Vercel and redeploy.
