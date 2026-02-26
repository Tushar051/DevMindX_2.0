import { users, projects, chatSessions, type User, type InsertUser, type Project, type InsertProject, type ChatSession, type InsertChatSession } from "@shared/schema.js";
import { connectToMongoDB, createMongoIdFilter } from './db.js';
import { ObjectId, Document, OptionalId } from 'mongodb';
import path from 'path';
import { PurchasedModel } from "../shared/types.js";

export interface IStorage {
  // User operations
  getUser(id: number | string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User>;
  updateUser(id: number | string, updates: Partial<User>): Promise<User>;
  verifyUser(token: string): Promise<User | undefined>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject & { userId: string; files?: any }): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Chat operations
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  getProjectChatSession(projectId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession & { userId: string }): Promise<ChatSession>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession>;

  // File operations for IDE
  createFile(file: { userId: string; path: string; content?: string; type: 'file' | 'folder' }): Promise<any>;
  updateFile(path: string, updates: { content?: string }): Promise<any>;
  deleteFile(path: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<any>;
  getUserFiles(userId: string, path?: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string | number, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private files: Map<string, any> = new Map();
  private currentUserId = 1;
  private currentProjectId = 1;
  private currentChatId = 1;

  async getUser(id: number | string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.githubId === githubId);
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User> {
    const id = String(this.currentUserId++);
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password || null,
      isVerified: false,
      verificationToken: insertUser.verificationToken || null,
      otp: insertUser.otp || null,
      otpExpiry: insertUser.otpExpiry || null,
      googleId: insertUser.googleId || null,
      githubId: insertUser.githubId || null,
      createdAt: new Date(),
      purchasedModels: [],
      usage: {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date(),
      }
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number | string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    
    // Ensure usage.lastReset is correctly preserved if not updated or initialized
    if (user.usage && updatedUser.usage && !updates.usage?.lastReset) {
      updatedUser.usage.lastReset = user.usage.lastReset;
    } else if (!updatedUser.usage) {
      updatedUser.usage = { totalTokens: 0, totalCost: 0, lastReset: new Date() };
    }

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.verificationToken === token);
    if (user) {
      const verified = await this.updateUser(user.id, { isVerified: true, verificationToken: null });
      return verified;
    }
    return undefined;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(insertProject: InsertProject & { userId: string; files?: any }): Promise<Project> {
    const id = String(this.currentProjectId++);
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description || null,
      framework: insertProject.framework,
      userId: insertProject.userId,
      files: insertProject.files || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error('Project not found');
    
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
  }

  async getProjectChatSession(projectId: string): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values()).find(session => session.projectId === projectId);
  }

  async createChatSession(insertSession: InsertChatSession & { userId: string }): Promise<ChatSession> {
    const id = String(this.currentChatId++);
    const session: ChatSession = {
      id,
      userId: insertSession.userId,
      projectId: insertSession.projectId || null,
      messages: insertSession.messages || [],
      createdAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const session = this.chatSessions.get(id);
    if (!session) throw new Error('Chat session not found');
    
    const updatedSession = { ...session, ...updates };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // File operations
  async createFile(file: { userId: string; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
    const fileRecord = {
      id: Date.now().toString(),
      userId: file.userId,
      path: file.path,
      content: file.content || '',
      type: file.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.files.set(file.path, fileRecord);
    return fileRecord;
  }

  async updateFile(path: string, updates: { content?: string }): Promise<any> {
    const file = this.files.get(path);
    if (!file) throw new Error('File not found');
    
    const updatedFile = { ...file, ...updates, updatedAt: new Date() };
    this.files.set(path, updatedFile);
    return updatedFile;
  }

  async deleteFile(path: string): Promise<void> {
    this.files.delete(path);
  }

  async renameFile(oldPath: string, newPath: string): Promise<any> {
    const file = this.files.get(oldPath);
    if (!file) throw new Error('File not found');
    
    const renamedFile = { ...file, path: newPath, updatedAt: new Date() };
    this.files.set(newPath, renamedFile);
    this.files.delete(oldPath);
    return renamedFile;
  }

  async getUserFiles(userId: string, path?: string): Promise<any[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && file.path.startsWith(path || '/')
    );
  }
}

class MongoStorage implements IStorage {
  private normalizeUserId(userId: string | number | ObjectId) {
    if (userId instanceof ObjectId) return userId;

    if (typeof userId === 'number') return userId;

    if (typeof userId === 'string') {
      if (ObjectId.isValid(userId)) {
        return new ObjectId(userId);
      }

      const numericId = Number(userId);
      if (!Number.isNaN(numericId)) {
        return numericId;
      }

      return userId;
    }

    return userId;
  }
  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const filter = createMongoIdFilter(id);
    const user = await db.collection('users').findOne(filter as any);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels || [],
      usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ email } as any);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels || [],
      usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ username } as any);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels || [],
      usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ googleId } as any);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels || [],
      usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ githubId } as any);
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels || [],
      usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User> {
    const db = await connectToMongoDB();
    const user: User = {
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password || null,
      isVerified: false,
      verificationToken: insertUser.verificationToken || null,
      otp: insertUser.otp || null,
      otpExpiry: insertUser.otpExpiry || null,
      googleId: insertUser.googleId || null,
      githubId: insertUser.githubId || null,
      createdAt: new Date(),
      purchasedModels: [],
      usage: {
        totalTokens: 0,
        totalCost: 0,
        lastReset: new Date(),
      },
      id: "" // Temporary empty string, will be replaced by _id.toString()
    };
    const result = await db.collection('users').insertOne(user);
    // Construct the returned user object to ensure all User properties are present
    const createdUser: User = {
      id: result.insertedId.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      otp: user.otp,
      otpExpiry: user.otpExpiry,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
      purchasedModels: user.purchasedModels,
      usage: user.usage
    };
    return createdUser;
  }

  async updateUser(id: number | string, updates: Partial<User>): Promise<User> {
    const db = await connectToMongoDB();
    const filter = createMongoIdFilter(id);
    const existingUser = await db.collection('users').findOne(filter as any);
    if (!existingUser) throw new Error('User not found');

    const newUpdates: Partial<User> = { ...updates };

    if (updates.purchasedModels !== undefined) {
      newUpdates.purchasedModels = updates.purchasedModels;
    } else if (existingUser.purchasedModels) {
      newUpdates.purchasedModels = existingUser.purchasedModels as PurchasedModel[];
    } else {
      newUpdates.purchasedModels = [];
    }

    if (updates.usage !== undefined) {
      newUpdates.usage = updates.usage;
    } else if (existingUser.usage) {
      newUpdates.usage = existingUser.usage;
    } else {
      newUpdates.usage = { totalTokens: 0, totalCost: 0, lastReset: new Date() };
    }

    await db.collection('users').updateOne(
      filter as any,
      { $set: newUpdates }
    );
    const updatedUser = await db.collection('users').findOne(filter as any);
    if (!updatedUser) throw new Error('User not found');
    // Explicitly map all properties to ensure full User object is returned
    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      isVerified: updatedUser.isVerified,
      verificationToken: updatedUser.verificationToken,
      otp: updatedUser.otp,
      otpExpiry: updatedUser.otpExpiry,
      googleId: updatedUser.googleId,
      githubId: updatedUser.githubId,
      createdAt: updatedUser.createdAt,
      purchasedModels: updatedUser.purchasedModels || [],
      usage: updatedUser.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
    } as User;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ verificationToken: token } as any);
    if (user) {
      await db.collection('users').updateOne({ _id: user._id }, { $set: { isVerified: true, verificationToken: null } });
      const verifiedUser = await db.collection('users').findOne({ _id: user._id } as any);
      if (!verifiedUser) return undefined;
      return { 
        id: verifiedUser._id.toString(),
        username: verifiedUser.username,
        email: verifiedUser.email,
        password: verifiedUser.password,
        isVerified: verifiedUser.isVerified,
        verificationToken: verifiedUser.verificationToken,
        otp: verifiedUser.otp,
        otpExpiry: verifiedUser.otpExpiry,
        googleId: verifiedUser.googleId,
        githubId: verifiedUser.githubId,
        createdAt: verifiedUser.createdAt,
        purchasedModels: verifiedUser.purchasedModels || [],
        usage: verifiedUser.usage || { totalTokens: 0, totalCost: 0, lastReset: new Date() }
      } as User;
    }
    return undefined;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const db = await connectToMongoDB();
    // Assuming project ID is stored as _id in MongoDB for projects collection
    const project = await db.collection('projects').findOne({ _id: new ObjectId(id) } as any);
    if (!project) return undefined;
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      framework: project.framework,
      userId: project.userId.toString(),
      files: project.files,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    } as Project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const db = await connectToMongoDB();
    const ownerId = this.normalizeUserId(userId);
    const projects = await db.collection('projects').find({ userId: ownerId }).toArray();
    return projects.map(project => ({ 
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      framework: project.framework,
      userId: project.userId.toString(),
      files: project.files,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })) as Project[];
  }

  async createProject(insertProject: InsertProject & { userId: string; files?: any }): Promise<Project> {
    const db = await connectToMongoDB();
    // Let MongoDB generate _id, then use it as the project's ID
    const projectToInsert = {
      name: insertProject.name,
      description: insertProject.description || null,
      framework: insertProject.framework,
      userId: this.normalizeUserId(insertProject.userId),
      files: insertProject.files || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('projects').insertOne(projectToInsert);
    const createdProject: Project = {
      id: result.insertedId.toString(),
      name: projectToInsert.name,
      description: projectToInsert.description,
      framework: projectToInsert.framework,
      userId: insertProject.userId, // Keep original string userId for the returned object
      files: projectToInsert.files,
      createdAt: projectToInsert.createdAt,
      updatedAt: projectToInsert.updatedAt,
    };
    return createdProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const db = await connectToMongoDB();
    const updateDoc: any = { ...updates, updatedAt: new Date() };
    // Convert userId to ObjectId if it's being updated
    if (updateDoc.userId) {
      updateDoc.userId = this.normalizeUserId(updateDoc.userId as any);
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    const updatedProject = await db.collection('projects').findOne({ _id: new ObjectId(id) } as any);
    if (!updatedProject) throw new Error('Project not found');
    return {
      id: updatedProject._id.toString(),
      name: updatedProject.name,
      description: updatedProject.description,
      framework: updatedProject.framework,
      userId: updatedProject.userId.toString(),
      files: updatedProject.files,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    } as Project;
  }

  async deleteProject(id: string): Promise<void> {
    const db = await connectToMongoDB();
    await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
  }

  // Chat operations
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const db = await connectToMongoDB();
    // Assuming chat session ID is stored as _id
    const session = await db.collection('chatSessions').findOne({ _id: new ObjectId(id) } as any);
    if (!session) return undefined;
    return {
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      projectId: session.projectId ? session.projectId.toString() : null,
      messages: session.messages,
      createdAt: session.createdAt,
    } as ChatSession;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    const db = await connectToMongoDB();
    const normalizedUserId = this.normalizeUserId(userId);
    const sessions = await db.collection('chatSessions').find({ userId: normalizedUserId }).toArray();
    return sessions.map(session => ({
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      projectId: session.projectId ? session.projectId.toString() : null,
      messages: session.messages,
      createdAt: session.createdAt,
    })) as ChatSession[];
  }

  async getProjectChatSession(projectId: string): Promise<ChatSession | undefined> {
    const db = await connectToMongoDB();
    const projectKey = ObjectId.isValid(projectId) ? new ObjectId(projectId) : projectId;
    const session = await db.collection('chatSessions').findOne({ projectId: projectKey } as any);
    if (!session) return undefined;
    return {
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      projectId: session.projectId ? session.projectId.toString() : null,
      messages: session.messages,
      createdAt: session.createdAt,
    } as ChatSession;
  }

  async createChatSession(insertSession: InsertChatSession & { userId: string }): Promise<ChatSession> {
    const db = await connectToMongoDB();
    const sessionToInsert = {
      userId: this.normalizeUserId(insertSession.userId),
      projectId: insertSession.projectId && ObjectId.isValid(insertSession.projectId)
        ? new ObjectId(insertSession.projectId)
        : insertSession.projectId ?? null,
      messages: insertSession.messages || [],
      createdAt: new Date(),
    };
    const result = await db.collection('chatSessions').insertOne(sessionToInsert);
    const createdSession: ChatSession = {
      id: result.insertedId.toString(),
      userId: insertSession.userId, // Keep original userId type for returned object
      projectId: insertSession.projectId || null,
      messages: sessionToInsert.messages,
      createdAt: sessionToInsert.createdAt,
    };
    return createdSession;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const db = await connectToMongoDB();
    const updateDoc: any = { ...updates };
    if (updateDoc.userId) updateDoc.userId = this.normalizeUserId(updateDoc.userId);
    if (updateDoc.projectId && ObjectId.isValid(updateDoc.projectId)) {
      updateDoc.projectId = new ObjectId(updateDoc.projectId);
    }

    await db.collection('chatSessions').updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
    const updatedSession = await db.collection('chatSessions').findOne({ _id: new ObjectId(id) } as any);
    if (!updatedSession) throw new Error('Chat session not found');
    return {
      id: updatedSession._id.toString(),
      userId: updatedSession.userId ? updatedSession.userId.toString() : null,
      projectId: updatedSession.projectId ? updatedSession.projectId.toString() : null,
      messages: updatedSession.messages,
      createdAt: updatedSession.createdAt,
    } as ChatSession;
  }

  // File operations
  async createFile(file: { userId: string; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
    const db = await connectToMongoDB();
    const fileRecord = {
      userId: this.normalizeUserId(file.userId),
      path: file.path,
      content: file.content || '',
      type: file.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('files').insertOne(fileRecord);
    return { ...fileRecord, id: result.insertedId.toString() };
  }

  async updateFile(path: string, updates: { content?: string }): Promise<any> {
    const db = await connectToMongoDB();
    await db.collection('files').updateOne(
      { path }, 
      { $set: { ...updates, updatedAt: new Date() } }
    );
    const updatedFile = await db.collection('files').findOne({ path } as any);
    if (!updatedFile) throw new Error('File not found');
    return updatedFile;
  }

  async deleteFile(path: string): Promise<void> {
    const db = await connectToMongoDB();
    await db.collection('files').deleteOne({ path });
  }

  async renameFile(oldPath: string, newPath: string): Promise<any> {
    const db = await connectToMongoDB();
    await db.collection('files').updateOne(
      { path: oldPath },
      { $set: { path: newPath, updatedAt: new Date() } }
    );
    const renamedFile = await db.collection('files').findOne({ path: newPath } as any);
    if (!renamedFile) throw new Error('File not found');
    return renamedFile;
  }

  async getUserFiles(userId: string, path: string = '/'): Promise<any[]> {
    const db = await connectToMongoDB();
    const normalizedUserId = this.normalizeUserId(userId);
    return await db.collection('files')
      .find({ userId: normalizedUserId, path: { $regex: `^${path}` } })
      .toArray();
  }
}

// Storage instance with proper initialization
let storage: IStorage | null = null;

async function initializeStorage(): Promise<IStorage> {
  if (storage) return storage;
  
  // Try Supabase first (preferred for production)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      console.log('🔄 Initializing Supabase storage...');
      const { SupabaseStorage } = await import('./storage-supabase.js');
      storage = new SupabaseStorage();
      console.log('✅ Using Supabase storage');
      return storage;
    } catch (error) {
      console.warn('⚠️  Failed to initialize Supabase storage:', error instanceof Error ? error.message : error);
    }
  }
  
  // Try MongoDB as fallback
  if (process.env.MONGODB_URI) {
    try {
      console.log('🔄 Attempting MongoDB connection...');
      const db = await connectToMongoDB();
      
      if (db) {
        await db.command({ ping: 1 });
        console.log('✅ MongoDB connection successful, using MongoStorage');
        storage = new MongoStorage();
        return storage;
      }
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed:', error instanceof Error ? error.message : error);
    }
  }
  
  // Fall back to MemStorage
  console.warn('⚠️  No database configured, using MemStorage (data will not persist)');
  console.warn('💡 Set SUPABASE_URL and SUPABASE_SERVICE_KEY for persistent storage');
  storage = new MemStorage();
  return storage;
}

// Function to get storage instance
export async function getStorage(): Promise<IStorage> {
  if (!storage) {
    return await initializeStorage();
  }
  return storage;
}

// Initialize storage on module load
const storagePromise = initializeStorage().catch(error => {
  console.error('Failed to initialize storage:', error);
  // Fallback to MemStorage if initialization fails
  storage = new MemStorage();
  return storage;
});












