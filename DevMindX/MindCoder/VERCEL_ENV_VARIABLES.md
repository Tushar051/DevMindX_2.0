# Vercel Environment Variables - Copy & Paste Guide

## ⚠️ IMPORTANT: Variable Name Rules
- Only use: letters, digits, and underscores (_)
- NO hyphens (-) allowed
- NO spaces allowed
- Cannot start with a digit

---

## 📋 Environment Variables for Vercel Dashboard

Copy each variable name and value exactly as shown below.

### Database Configuration

**Variable Name**: `SUPABASE_URL`
**Value**: `https://csexvydhnfulvfezqoit.supabase.co`

**Variable Name**: `SUPABASE_ANON_KEY`
**Value**: `sb_publishable_jP6ckQqg1jIo7vK6Ew6rDQ_oUK5x97c`

**Variable Name**: `SUPABASE_SERVICE_KEY`
**Value**: `sb_secret_u5sZieMAw8KnLpMP6Ma2MA_50VgxIFP`

---

### Server Configuration

**Variable Name**: `NODE_ENV`
**Value**: `production`

**Variable Name**: `PORT`
**Value**: `3000`

---

### JWT Configuration

**Variable Name**: `JWT_SECRET`
**Value**: `QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM`

**Variable Name**: `JWT_EXPIRATION`
**Value**: `86400000`

---

### Email Configuration

**Variable Name**: `FORCE_EMAIL`
**Value**: `true`

**Variable Name**: `EMAIL_USER`
**Value**: `webdevx.ai@gmail.com`

**Variable Name**: `EMAIL_PASS`
**Value**: `hjowcklyhohvanfe`

---

### Google OAuth

**Variable Name**: `GOOGLE_CLIENT_ID`
**Value**: `692286091038-bdol7pqup20k9mv98jgk4icijkhmoa8o.apps.googleusercontent.com`

**Variable Name**: `GOOGLE_CLIENT_SECRET`
**Value**: `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`

**Variable Name**: `GOOGLE_CALLBACK_URL`
**Value**: `http://localhost:5000/api/auth/google/callback`
*(Update this after first deployment with your actual Vercel URL)*

---

### GitHub OAuth

**Variable Name**: `GITHUB_CLIENT_ID`
**Value**: `Ov23li1DxFPHl6zgI6zE`

**Variable Name**: `GITHUB_CLIENT_SECRET`
**Value**: `afbe9fbc6db18f06f7ca89c5f3180e645f4dbac1`

**Variable Name**: `GITHUB_CALLBACK_URL`
**Value**: `http://localhost:5000/api/auth/github/callback`
*(Update this after first deployment with your actual Vercel URL)*

---

### AI API Keys

**Variable Name**: `GEMINI_API_KEY`
**Value**: `AIzaSyCgPrayZtswmC0q9Meb8CLe-MvVYqlnrGU`

**Variable Name**: `TOGETHER_API_KEY`
**Value**: `c8cab5691fed977960bb96539b28ef07d56cba6abaa50f88f46b82552027bc5a`

**Variable Name**: `CHATGPT_API_KEY`
**Value**: `fake_openai_api_key_for_development`
*(Optional - add real key if you have one)*

**Variable Name**: `CLAUDE_API_KEY`
**Value**: `fake_claude_api_key_for_development`
*(Optional - add real key if you have one)*

**Variable Name**: `DEEPSEEK_API_KEY`
**Value**: `fake_deepseek_api_key_for_development`
*(Optional - add real key if you have one)*

---

### CodeSandbox Configuration

**Variable Name**: `CODESANDBOX_API_TOKEN`
**Value**: `csb_v1_aqrKiblTMIUdE8Iq85n58L6SqR7AcHazALm9QXuc-Eg`

**Variable Name**: `CODESANDBOX_API_VERSION`
**Value**: `2023-07-01`

---

## 🎯 Step-by-Step Instructions for Vercel Dashboard

### 1. Go to Environment Variables Section
- Open your project in Vercel Dashboard
- Click "Settings" tab
- Click "Environment Variables" in the left sidebar

### 2. Add Each Variable
For each variable above:
1. Click "Add New" button
2. In "Key" field: Copy the **Variable Name** (e.g., `SUPABASE_URL`)
3. In "Value" field: Copy the **Value** (e.g., `https://csexvydhnfulvfezqoit.supabase.co`)
4. Select environment: Check all three boxes (Production, Preview, Development)
5. Click "Save"

### 3. Verify All Variables Added
After adding all variables, you should see 22 environment variables total.

### 4. Deploy
- Go to "Deployments" tab
- Click "Redeploy" on the latest deployment
- Or push a new commit to trigger automatic deployment

---

## 🔄 After First Deployment

Once your app is deployed and you have your Vercel URL (e.g., `https://devmindx-abc123.vercel.app`):

### Update These Variables:

1. **GOOGLE_CALLBACK_URL**
   - Old: `http://localhost:5000/api/auth/google/callback`
   - New: `https://YOUR-VERCEL-URL.vercel.app/api/auth/google/callback`

2. **GITHUB_CALLBACK_URL**
   - Old: `http://localhost:5000/api/auth/github/callback`
   - New: `https://YOUR-VERCEL-URL.vercel.app/api/auth/github/callback`

### How to Update:
1. Go to Settings → Environment Variables
2. Find the variable
3. Click "Edit" (pencil icon)
4. Update the value
5. Click "Save"
6. Redeploy the application

---

## ✅ Verification Checklist

Before deploying, make sure:
- [ ] All 22 environment variables are added
- [ ] No variable names contain hyphens (-)
- [ ] No variable names contain spaces
- [ ] All values are copied exactly (no extra spaces)
- [ ] All three environments are selected (Production, Preview, Development)

---

## 🚨 Common Mistakes to Avoid

1. ❌ Using hyphens in variable names
   - Wrong: `SUPABASE-URL`
   - Right: `SUPABASE_URL`

2. ❌ Adding extra spaces in values
   - Wrong: `https://example.com `
   - Right: `https://example.com`

3. ❌ Forgetting to select all environments
   - Make sure to check: Production, Preview, Development

4. ❌ Not redeploying after adding variables
   - Always redeploy after adding/updating environment variables

---

## 📞 Need Help?

If you still get errors:
1. Double-check variable names (no hyphens!)
2. Verify all values are correct
3. Check Vercel deployment logs for specific errors
4. Make sure Root Directory is set to: `DevMindX/MindCoder`

---

**Ready to deploy! 🚀**
