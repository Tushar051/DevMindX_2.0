import { users, projects, chatSessions, type User, type InsertUser, type Project, type InsertProject, type ChatSession, type InsertChatSession } from "@shared/schema";
import { connectToMongoDB } from './db';
import { ObjectId } from 'mongodb';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string }): Promise<User>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private chatSessions: Map<number, ChatSession> = new Map();
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

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string }): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      ...insertUser,
      isVerified: false,
      createdAt: new Date(),
      googleId: insertUser.googleId || null,
      githubId: insertUser.githubId || null,
      verificationToken: insertUser.verificationToken || null,
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
      ...insertProject,
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
      ...insertSession,
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
}

class MongoStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ id });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ email });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ username });
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ googleId });
    return user || undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ githubId });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { googleId?: string; githubId?: string; verificationToken?: string }): Promise<User> {
    const db = await connectToMongoDB();
    // Find max id for auto-increment
    const lastUser = await db.collection('users').find().sort({ id: -1 }).limit(1).toArray();
    const id = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    const user: User = {
      id,
      ...insertUser,
      isVerified: false,
      createdAt: new Date(),
      googleId: insertUser.googleId || null,
      githubId: insertUser.githubId || null,
      verificationToken: insertUser.verificationToken || null,
    };
    await db.collection('users').insertOne(user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const db = await connectToMongoDB();
    await db.collection('users').updateOne({ id }, { $set: updates });
    const updatedUser = await db.collection('users').findOne({ id });
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ verificationToken: token });
    if (user) {
      await db.collection('users').updateOne({ id: user.id }, { $set: { isVerified: true, verificationToken: null } });
      return await db.collection('users').findOne({ id: user.id });
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
}

export const storage = new MongoStorage();
