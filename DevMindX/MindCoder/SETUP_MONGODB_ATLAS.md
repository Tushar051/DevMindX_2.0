# Set Up MongoDB Atlas for Production

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com/
2. Sign up or log in
3. Click "Build a Database"
4. Choose "M0 FREE" tier
5. Select a cloud provider (AWS recommended)
6. Choose a region close to your Render server (Oregon/US-West)
7. Click "Create Cluster"

### Step 2: Create Database User
1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `devmindx_user`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 3: Allow Network Access
1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Get Connection String
1. Go back to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string

It will look like:
```
mongodb+srv://devmindx_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Format Connection String
Replace `<password>` with your actual password and add database name:

```
mongodb+srv://devmindx_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/devmindx?retryWrites=true&w=majority
```

### Step 6: Add to Render
1. Go to https://dashboard.render.com/
2. Find "devmindx-backend" service
3. Click "Environment"
4. Add variable:
   - Key: `MONGODB_URI`
   - Value: (paste your connection string)
5. Click "Save Changes"
6. Render will automatically redeploy

### Step 7: Verify
Wait 2-3 minutes for Render to redeploy, then check logs:
- Should see: "Connected to MongoDB"
- Should NOT see: "ECONNREFUSED"

## Done!
Your backend is now connected to MongoDB Atlas.
