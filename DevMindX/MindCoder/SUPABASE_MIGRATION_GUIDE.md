# Supabase Migration Guide - Complete Setup

## Overview
This guide will help you migrate from MongoDB to Supabase so you can view and manage all your data in the Supabase dashboard.

## Why Migrate to Supabase?

✅ **Visual Dashboard** - See all your data in a beautiful UI  
✅ **Real-time Updates** - Built-in real-time subscriptions  
✅ **Better Performance** - Optimized PostgreSQL database  
✅ **Row Level Security** - Built-in security policies  
✅ **Free Tier** - Generous free tier for development  
✅ **Easy Backups** - Automatic backups and point-in-time recovery  

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `devmindx` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (for development)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### 1.3 Get Your Credentials
Once your project is ready:

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

## Step 2: Update Environment Variables

### 2.1 Update `.env` File
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# You can comment out or remove MongoDB
# MONGODB_URI=mongodb://localhost:27017/devmindx
```

### 2.2 Update Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add/Update these variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```
5. Click "Save"
6. Redeploy your application

## Step 3: Create Database Schema

### 3.1 Run Schema in Supabase
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

You should see:
```
✅ DevMindX database schema created successfully!
📊 Tables: users, projects, chat_history, collaboration_sessions
🔒 Row Level Security enabled on all tables
🎮 Demo projects inserted
```

### 3.2 Verify Tables Created
1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `projects`
   - `chat_history`
   - `collaboration_sessions`
3. Click on each table to view its structure

## Step 4: Create Supabase Storage Implementation

I'll create a new storage implementation that uses Supabase instead of MongoDB.

### 4.1 Create SupabaseStorage Class

Create file: `server/storage-supabase.ts`

```typescript
import { supabaseAdmin } from './lib/supabase.js';
import { IStorage } from './storage.js';
import type { User, InsertUser, Project, InsertProject, ChatSession, InsertChatSession } from "@shared/schema.js";

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }

    return this.mapSupabaseUserToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
      return undefined;
    }

    return data ? this.mapSupabaseUserToUser(data) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by username:', error);
      return undefined;
    }

    return data ? this.mapSupabaseUserToUser(data) : undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('provider', 'google')
      .eq('provider_id', googleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by Google ID:', error);
      return undefined;
    }

    return data ? this.mapSupabaseUserToUser(data) : undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('provider', 'github')
      .eq('provider_id', githubId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by GitHub ID:', error);
      return undefined;
    }

    return data ? this.mapSupabaseUserToUser(data) : undefined;
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User> {
    const userData = {
      email: insertUser.email,
      username: insertUser.username,
      password_hash: insertUser.password,
      provider: insertUser.googleId ? 'google' : insertUser.githubId ? 'github' : 'local',
      provider_id: insertUser.googleId || insertUser.githubId || null,
      display_name: insertUser.username,
      // Store additional fields in metadata (you may want to add a metadata JSONB column)
      metadata: {
        isVerified: false,
        verificationToken: insertUser.verificationToken,
        otp: insertUser.otp,
        otpExpiry: insertUser.otpExpiry,
        purchasedModels: [],
        usage: {
          totalTokens: 0,
          totalCost: 0,
          lastReset: new Date()
        }
      }
    };

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapSupabaseUserToUser(data);
  }

  async updateUser(id: number | string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        username: updates.username,
        email: updates.email,
        password_hash: updates.password,
        display_name: updates.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return this.mapSupabaseUserToUser(data);
  }

  async verifyUser(token: string): Promise<User | undefined> {
    // This requires a metadata column or separate verification table
    // For now, we'll implement a simple version
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1000);

    if (error) {
      console.error('Error fetching users for verification:', error);
      return undefined;
    }

    // Find user with matching verification token in metadata
    const user = users?.find((u: any) => u.metadata?.verificationToken === token);
    
    if (user) {
      return this.updateUser(user.id, { isVerified: true } as any);
    }

    return undefined;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return undefined;
    }

    return this.mapSupabaseProjectToProject(data);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }

    return data.map(p => this.mapSupabaseProjectToProject(p));
  }

  async createProject(insertProject: InsertProject & { userId: string; files?: any }): Promise<Project> {
    const projectData = {
      user_id: insertProject.userId,
      name: insertProject.name,
      description: insertProject.description,
      framework: insertProject.framework,
      files: insertProject.files || {},
      is_demo: false
    };

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return this.mapSupabaseProjectToProject(data);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        framework: updates.framework,
        files: updates.files,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return this.mapSupabaseProjectToProject(data);
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Chat operations
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching chat session:', error);
      return undefined;
    }

    return this.mapSupabaseChatToChat(data);
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user chat sessions:', error);
      return [];
    }

    return data.map(c => this.mapSupabaseChatToChat(c));
  }

  async getProjectChatSession(projectId: string): Promise<ChatSession | undefined> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('session_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching project chat session:', error);
      return undefined;
    }

    return data ? this.mapSupabaseChatToChat(data) : undefined;
  }

  async createChatSession(insertSession: InsertChatSession & { userId: string }): Promise<ChatSession> {
    const sessionData = {
      user_id: insertSession.userId,
      session_id: insertSession.projectId || `session_${Date.now()}`,
      messages: insertSession.messages || []
    };

    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      throw new Error(`Failed to create chat session: ${error.message}`);
    }

    return this.mapSupabaseChatToChat(data);
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .update({
        messages: updates.messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat session:', error);
      throw new Error(`Failed to update chat session: ${error.message}`);
    }

    return this.mapSupabaseChatToChat(data);
  }

  // File operations (you may want to use Supabase Storage for this)
  async createFile(file: { userId: string; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
    // Implement using Supabase Storage or a files table
    throw new Error('Not implemented yet');
  }

  async updateFile(path: string, updates: { content?: string }): Promise<any> {
    throw new Error('Not implemented yet');
  }

  async deleteFile(path: string): Promise<void> {
    throw new Error('Not implemented yet');
  }

  async renameFile(oldPath: string, newPath: string): Promise<any> {
    throw new Error('Not implemented yet');
  }

  async getUserFiles(userId: string, path?: string): Promise<any[]> {
    return [];
  }

  // Helper methods to map Supabase data to app data
  private mapSupabaseUserToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      username: supabaseUser.username || supabaseUser.email.split('@')[0],
      email: supabaseUser.email,
      password: supabaseUser.password_hash,
      isVerified: supabaseUser.metadata?.isVerified || true,
      verificationToken: supabaseUser.metadata?.verificationToken || null,
      otp: supabaseUser.metadata?.otp || null,
      otpExpiry: supabaseUser.metadata?.otpExpiry || null,
      googleId: supabaseUser.provider === 'google' ? supabaseUser.provider_id : null,
      githubId: supabaseUser.provider === 'github' ? supabaseUser.provider_id : null,
      createdAt: new Date(supabaseUser.created_at),
      purchasedModels: supabaseUser.metadata?.purchasedModels || [],
      usage: supabaseUser.metadata?.usage || {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date()
      }
    };
  }

  private mapSupabaseProjectToProject(supabaseProject: any): Project {
    return {
      id: supabaseProject.id,
      name: supabaseProject.name,
      description: supabaseProject.description,
      framework: supabaseProject.framework,
      userId: supabaseProject.user_id,
      files: supabaseProject.files || {},
      createdAt: new Date(supabaseProject.created_at),
      updatedAt: new Date(supabaseProject.updated_at)
    };
  }

  private mapSupabaseChatToChat(supabaseChat: any): ChatSession {
    return {
      id: supabaseChat.id,
      userId: supabaseChat.user_id,
      projectId: supabaseChat.session_id,
      messages: supabaseChat.messages || [],
      createdAt: new Date(supabaseChat.created_at)
    };
  }
}
```

## Step 5: Update Storage Configuration

Update `server/storage.ts` to use Supabase:

```typescript
import { SupabaseStorage } from './storage-supabase.js';

// Storage instance
let storage: IStorage | null = null;

async function initializeStorage(): Promise<IStorage> {
  if (storage) return storage;
  
  try {
    // Try Supabase first
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      console.log('Using Supabase storage');
      storage = new SupabaseStorage();
      return storage;
    }
    
    // Fallback to MongoDB
    const db = await connectToMongoDB();
    await db.command({ ping: 1 });
    console.log('Using MongoDB storage');
    storage = new MongoStorage();
  } catch (error) {
    console.warn('Failed to connect to database, using MemStorage:', error);
    storage = new MemStorage();
  }
  
  return storage;
}
```

## Step 6: View Your Data in Supabase

### 6.1 Access Table Editor
1. Go to your Supabase project dashboard
2. Click **Table Editor** in the left sidebar
3. Select a table (e.g., `users`, `projects`)
4. You'll see all your data in a spreadsheet-like interface

### 6.2 Features Available
- **View Data**: See all rows in a table
- **Add Row**: Click "+ Insert row" to add data manually
- **Edit Row**: Click on any cell to edit
- **Delete Row**: Click the trash icon
- **Filter**: Use the filter button to search
- **Sort**: Click column headers to sort
- **Export**: Export data as CSV

### 6.3 Run SQL Queries
1. Click **SQL Editor**
2. Write custom queries:
   ```sql
   -- View all users
   SELECT * FROM users;
   
   -- View projects with user info
   SELECT p.*, u.email, u.username
   FROM projects p
   JOIN users u ON p.user_id = u.id;
   
   -- Count projects per user
   SELECT u.username, COUNT(p.id) as project_count
   FROM users u
   LEFT JOIN projects p ON u.id = p.user_id
   GROUP BY u.id, u.username;
   ```

## Step 7: Migrate Existing Data (Optional)

If you have existing data in MongoDB that you want to migrate:

### 7.1 Export from MongoDB
```bash
# Export users
mongoexport --db=devmindx --collection=users --out=users.json

# Export projects
mongoexport --db=devmindx --collection=projects --out=projects.json
```

### 7.2 Create Migration Script
Create `migrate-to-supabase.ts`:

```typescript
import { supabaseAdmin } from './server/lib/supabase.js';
import { readFileSync } from 'fs';

async function migrateData() {
  // Read MongoDB exports
  const users = JSON.parse(readFileSync('users.json', 'utf-8'));
  const projects = JSON.parse(readFileSync('projects.json', 'utf-8'));

  // Migrate users
  for (const user of users) {
    await supabaseAdmin.from('users').insert({
      email: user.email,
      username: user.username,
      password_hash: user.password,
      created_at: user.createdAt
    });
  }

  // Migrate projects
  for (const project of projects) {
    await supabaseAdmin.from('projects').insert({
      user_id: project.userId,
      name: project.name,
      description: project.description,
      framework: project.framework,
      files: project.files,
      created_at: project.createdAt
    });
  }

  console.log('Migration complete!');
}

migrateData();
```

Run it:
```bash
npx tsx migrate-to-supabase.ts
```

## Step 8: Test the Integration

### 8.1 Test Locally
```bash
npm run dev
```

### 8.2 Test Features
1. Sign up a new user
2. Create a project
3. Check Supabase dashboard - you should see the data!

### 8.3 Deploy to Production
```bash
git add .
git commit -m "feat: Migrate to Supabase database"
git push
vercel --prod
```

## Troubleshooting

### Issue: Can't see data in Supabase
**Solution**: Check Row Level Security policies. You may need to temporarily disable RLS for testing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

### Issue: Connection errors
**Solution**: Verify environment variables are correct:
```bash
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### Issue: Insert fails
**Solution**: Check the error message in Supabase logs:
1. Go to **Logs** > **Postgres Logs**
2. Look for error details

## Benefits of Supabase Dashboard

✅ **Real-time View**: See data updates instantly  
✅ **Easy Editing**: Edit data directly in the UI  
✅ **SQL Editor**: Run custom queries  
✅ **API Docs**: Auto-generated API documentation  
✅ **Logs**: View all database queries and errors  
✅ **Backups**: Automatic backups (paid plans)  
✅ **Monitoring**: Performance metrics and insights  

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run schema SQL
3. ✅ Update environment variables
4. ✅ Implement SupabaseStorage class
5. ✅ Test locally
6. ✅ Deploy to production
7. ✅ View your data in Supabase dashboard!

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify environment variables
3. Test SQL queries in SQL Editor
4. Check RLS policies
5. Review Supabase documentation: https://supabase.com/docs

Your data will now be visible and manageable in the beautiful Supabase dashboard! 🎉
