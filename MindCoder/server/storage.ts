import { users, projects, chatSessions, type User, type InsertUser, type Project, type InsertProject, type ChatSession, type InsertChatSession } from "@shared/schema";
import { connectToMongoDB } from './db';
import { ObjectId } from 'mongodb';
import path from 'path';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  verifyUser(token: string): Promise<User | undefined>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: number): Promise<Project[]>;
  createProject(project: InsertProject & { userId: number; files?: any }): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Chat operations
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: number): Promise<ChatSession[]>;
  getProjectChatSession(projectId: number): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession & { userId: number }): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession>;

  // File operations for IDE
  createFile(file: { userId: number; path: string; content?: string; type: 'file' | 'folder' }): Promise<any>;
  updateFile(path: string, updates: { content?: string }): Promise<any>;
  deleteFile(path: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<any>;
  getUserFiles(userId: number, path?: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private chatSessions: Map<number, ChatSession> = new Map();
  private files: Map<string, any> = new Map();
  private currentUserId = 1;
  private currentProjectId = 1;
  private currentChatId = 1;

  async getUser(id: number): Promise<User | undefined> {
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
    const id = this.currentUserId++;
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
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
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

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(insertProject: InsertProject & { userId: number; files?: any }): Promise<Project> {
    const id = this.currentProjectId++;
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

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error('Project not found');
    
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getUserChatSessions(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
  }

  async getProjectChatSession(projectId: number): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values()).find(session => session.projectId === projectId);
  }

  async createChatSession(insertSession: InsertChatSession & { userId: number }): Promise<ChatSession> {
    const id = this.currentChatId++;
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

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession> {
    const session = this.chatSessions.get(id);
    if (!session) throw new Error('Chat session not found');
    
    const updatedSession = { ...session, ...updates };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // File operations
  async createFile(file: { userId: number; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
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

  async getUserFiles(userId: number, path: string = '/'): Promise<any[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && file.path.startsWith(path)
    );
  }
}

class MongoStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ id });
    return user as unknown as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ email });
    return user as unknown as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ username });
    return user as unknown as User | undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ googleId });
    return user as unknown as User | undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ githubId });
    return user as unknown as User | undefined;
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string; otp?: string; otpExpiry?: Date }): Promise<User> {
    const db = await connectToMongoDB();
    // Find max id for auto-increment
    const lastUser = await db.collection('users').find().sort({ id: -1 }).limit(1).toArray();
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
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
    };
    await db.collection('users').insertOne(user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const db = await connectToMongoDB();
    await db.collection('users').updateOne({ id }, { $set: updates });
    const updatedUser = await db.collection('users').findOne({ id });
    if (!updatedUser) throw new Error('User not found');
    return updatedUser as unknown as User;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ verificationToken: token });
    if (user) {
      await db.collection('users').updateOne({ id: user.id }, { $set: { isVerified: true, verificationToken: null } });
      const verifiedUser = await db.collection('users').findOne({ id: user.id });
      return verifiedUser as unknown as User;
    }
    return undefined;
  }

  // Project and chat methods can fallback to MemStorage for now
  getProject = MemStorage.prototype.getProject;
  getUserProjects = MemStorage.prototype.getUserProjects;
  createProject = MemStorage.prototype.createProject;
  updateProject = MemStorage.prototype.updateProject;
  deleteProject = MemStorage.prototype.deleteProject;
  getChatSession = MemStorage.prototype.getChatSession;
  getUserChatSessions = MemStorage.prototype.getUserChatSessions;
  getProjectChatSession = MemStorage.prototype.getProjectChatSession;
  createChatSession = MemStorage.prototype.createChatSession;
  updateChatSession = MemStorage.prototype.updateChatSession;

  // File operations
  async createFile(file: { userId: number; path: string; content?: string; type: 'file' | 'folder' }): Promise<any> {
    const db = await connectToMongoDB();
    const fileRecord = {
      id: Date.now().toString(),
      userId: file.userId,
      path: file.path,
      content: file.content || '',
      type: file.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('files').insertOne(fileRecord);
    return fileRecord;
  }

  async updateFile(path: string, updates: { content?: string }): Promise<any> {
    const db = await connectToMongoDB();
    await db.collection('files').updateOne(
      { path }, 
      { $set: { ...updates, updatedAt: new Date() } }
    );
    const updatedFile = await db.collection('files').findOne({ path });
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
    const renamedFile = await db.collection('files').findOne({ path: newPath });
    if (!renamedFile) throw new Error('File not found');
    return renamedFile;
  }

  async getUserFiles(userId: number, path: string = '/'): Promise<any[]> {
    const db = await connectToMongoDB();
    return await db.collection('files')
      .find({ userId, path: { $regex: `^${path}` } })
      .toArray();
  }
}

export const storage = new MongoStorage();

