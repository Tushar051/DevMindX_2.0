import { supabaseAdmin } from './lib/supabase.js';
import { IStorage } from './storage.js';
import type { User, InsertUser, Project, InsertProject, ChatSession, InsertChatSession } from "../shared/schema.js";

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    const attempts: (string | number)[] = [id];
    if (typeof id === 'string') {
      const n = Number(id);
      if (!Number.isNaN(n) && Number.isFinite(n)) attempts.push(n);
    } else {
      attempts.push(String(id));
    }

    const tried = new Set<string>();
    for (const attempt of attempts) {
      const key = `${typeof attempt}:${attempt}`;
      if (tried.has(key)) continue;
      tried.add(key);

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', attempt)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error);
        continue;
      }
      if (data) return this.mapSupabaseUserToUser(data);
    }

    return undefined;
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
    const { data, error} = await supabaseAdmin
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
      metadata: {
        isVerified: false,
        verificationToken: insertUser.verificationToken,
        otp: insertUser.otp,
        otpExpiry: insertUser.otpExpiry,
        purchasedModels: [],
        usage: {
          totalTokens: 0,
          totalCost: 0,
          lastReset: new Date().toISOString()
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
    // Get existing user to merge metadata
    const existing = await this.getUser(id);
    if (!existing) throw new Error('User not found');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.username) updateData.username = updates.username;
    if (updates.email) updateData.email = updates.email;
    if (updates.password) updateData.password_hash = updates.password;
    if (updates.username) updateData.display_name = updates.username;

    // Merge metadata
    const metadata = existing.metadata || {};
    if (updates.isVerified !== undefined) metadata.isVerified = updates.isVerified;
    if (updates.verificationToken !== undefined) metadata.verificationToken = updates.verificationToken;
    if (updates.otp !== undefined) metadata.otp = updates.otp;
    if (updates.otpExpiry !== undefined) metadata.otpExpiry = updates.otpExpiry;
    if (updates.purchasedModels !== undefined) metadata.purchasedModels = updates.purchasedModels;
    if (updates.usage !== undefined) metadata.usage = updates.usage;

    updateData.metadata = metadata;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
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
    // Query users and check metadata for verification token
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users for verification:', error);
      return undefined;
    }

    const user = users?.find((u: any) => u.metadata?.verificationToken === token);
    
    if (user) {
      return this.updateUser(user.id, { isVerified: true, verificationToken: null } as any);
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
      if (error.code !== 'PGRST116') {
        console.error('Error fetching project:', error);
      }
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

    return (data || []).map(p => this.mapSupabaseProjectToProject(p));
  }

  async createProject(insertProject: InsertProject & { userId: string; files?: any }): Promise<Project> {
    const projectData = {
      user_id: insertProject.userId,
      name: insertProject.name,
      description: insertProject.description || null,
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
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.framework) updateData.framework = updates.framework;
    if (updates.files) updateData.files = updates.files;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
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
      if (error.code !== 'PGRST116') {
        console.error('Error fetching chat session:', error);
      }
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

    return (data || []).map(c => this.mapSupabaseChatToChat(c));
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
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.messages) updateData.messages = updates.messages;

    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat session:', error);
      throw new Error(`Failed to update chat session: ${error.message}`);
    }

    return this.mapSupabaseChatToChat(data);
  }

  // File operations - using Supabase Storage would be better for this
  async createFile(file: { userId: string; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
    // For now, store in project files JSONB
    // In production, consider using Supabase Storage
    return {
      id: Date.now().toString(),
      userId: file.userId,
      path: file.path,
      content: file.content || '',
      type: file.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateFile(path: string, updates: { content?: string }): Promise<any> {
    return { path, ...updates, updatedAt: new Date() };
  }

  async deleteFile(path: string): Promise<void> {
    // Implement if needed
  }

  async renameFile(oldPath: string, newPath: string): Promise<any> {
    return { path: newPath, updatedAt: new Date() };
  }

  async getUserFiles(userId: string, path?: string): Promise<any[]> {
    return [];
  }

  // Helper methods to map Supabase data to app data
  private mapSupabaseUserToUser(supabaseUser: any): User {
    const metadata = supabaseUser.metadata || {};
    return {
      id: supabaseUser.id,
      username: supabaseUser.username || supabaseUser.email.split('@')[0],
      email: supabaseUser.email,
      password: supabaseUser.password_hash,
      isVerified: metadata.isVerified !== undefined ? metadata.isVerified : true,
      verificationToken: metadata.verificationToken || null,
      otp: metadata.otp || null,
      otpExpiry: metadata.otpExpiry ? new Date(metadata.otpExpiry) : null,
      googleId: supabaseUser.provider === 'google' ? supabaseUser.provider_id : null,
      githubId: supabaseUser.provider === 'github' ? supabaseUser.provider_id : null,
      createdAt: new Date(supabaseUser.created_at),
      purchasedModels: metadata.purchasedModels || [],
      usage: metadata.usage || {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date()
      },
      metadata: metadata
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
