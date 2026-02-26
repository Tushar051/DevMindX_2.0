# Render MongoDB SSL/TLS Connection Fix

## Problem
Render deployment fails with MongoDB Atlas connection error:
```
Error: C0FCD31D6A790000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This occurs because Node.js v22 on Render has stricter SSL/TLS requirements.

## Root Cause
- Node.js v22 has updated OpenSSL with stricter TLS validation
- MongoDB Atlas connection requires specific SSL configuration for compatibility
- Render's environment needs longer timeouts for cold starts (free tier)

## Solution Applied

### 1. Updated MongoDB Connection Options in `server/db.ts`

Added Node.js v22 compatible SSL options:
- `ssl: true` - Explicit SSL enablement
- `sslValidate: true` - Proper certificate validation
- `directConnection: false` - Use replica set connection
- `useNewUrlParser: true` - Modern connection string parser
- `useUnifiedTopology: true` - New topology engine
- Increased timeouts to 30000ms for Render cold starts
- Reduced `minPoolSize` to 1 for free tier optimization

### 2. Verify MongoDB Atlas Configuration

Ensure your MongoDB Atlas cluster allows connections from Render:

1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (allow all) OR add Render's IP ranges
4. Ensure your cluster is running (not paused)

### 3. Verify Connection String Format

Your `MONGODB_URI` should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Important**: 
- Use `mongodb+srv://` (not `mongodb://`)
- Ensure password is URL-encoded if it contains special characters
- Include `retryWrites=true&w=majority` parameters

### 4. Render Environment Variables

In Render Dashboard → Environment → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_DB=devmindx
```

### 5. Alternative: Use MongoDB Connection String with All Options

If issues persist, use a full connection string with all options:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&ssl=true&authSource=admin&maxPoolSize=10
```

## Testing

### Local Test
```bash
cd DevMindX/MindCoder
npm run dev
```

### After Render Deployment
1. Check Render logs for "✅ Connected to MongoDB successfully"
2. Test health endpoint: `https://your-app.onrender.com/api/health`
3. Monitor for connection errors in logs

## Troubleshooting

### If Still Failing

1. **Check MongoDB Atlas Status**
   - Ensure cluster is not paused
   - Verify network access allows Render IPs

2. **Verify Connection String**
   - Test locally first
   - Ensure no typos in username/password
   - URL-encode special characters in password

3. **Check Render Logs**
   ```bash
   # In Render Dashboard → Logs
   # Look for specific MongoDB error messages
   ```

4. **Try Simplified Connection**
   Remove all query parameters except `retryWrites=true&w=majority`

5. **MongoDB Atlas Free Tier Limits**
   - Free tier (M0) has connection limits
   - Consider upgrading if hitting limits

## Additional Notes

- Render free tier sleeps after 15 minutes of inactivity
- First connection after sleep takes 30-60 seconds
- Connection pooling helps with subsequent requests
- Consider upgrading to paid Render plan for production use

## Deployment Command

After making changes:
```bash
git add .
git commit -m "Fix MongoDB SSL connection for Node.js v22 on Render"
git push origin main
```

Render will auto-deploy and the MongoDB connection should work.
