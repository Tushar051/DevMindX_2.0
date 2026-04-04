var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatSessions: () => chatSessions,
  insertChatSessionSchema: () => insertChatSessionSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertUserSchema: () => insertUserSchema,
  projects: () => projects,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, projects, chatSessions, insertUserSchema, insertProjectSchema, insertChatSessionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password"),
      isVerified: boolean("is_verified").default(false),
      verificationToken: text("verification_token"),
      otp: text("otp"),
      otpExpiry: timestamp("otp_expiry"),
      googleId: text("google_id"),
      githubId: text("github_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    projects = pgTable("projects", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      framework: text("framework").notNull(),
      userId: integer("user_id").references(() => users.id),
      files: jsonb("files").default({}),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    chatSessions = pgTable("chat_sessions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      projectId: integer("project_id").references(() => projects.id),
      messages: jsonb("messages").default([]),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      email: true,
      password: true
    });
    insertProjectSchema = createInsertSchema(projects).pick({
      name: true,
      description: true,
      framework: true
    });
    insertChatSessionSchema = createInsertSchema(chatSessions).pick({
      projectId: true,
      messages: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { MongoClient, ObjectId } from "mongodb";
function createMongoIdFilter(userId) {
  if (userId instanceof ObjectId) {
    return { _id: userId };
  }
  if (typeof userId === "number") {
    return { _id: userId };
  }
  if (typeof userId === "string") {
    if (ObjectId.isValid(userId)) {
      return { _id: new ObjectId(userId) };
    }
    const numericId = Number(userId);
    if (!Number.isNaN(numericId)) {
      return { _id: numericId };
    }
    return { _id: userId };
  }
  throw new Error(`Unsupported userId type: ${typeof userId}`);
}
async function connectToMongoDB() {
  if (!mongoUri) {
    console.warn("\u26A0\uFE0F  MONGODB_URI environment variable is not set. MongoDB features will be unavailable.");
    return null;
  }
  if (cachedMongoDb) {
    return cachedMongoDb;
  }
  if (!mongoClient) {
    try {
      const mongoOptions = {
        tls: true,
        serverSelectionTimeoutMS: 3e4,
        // Increased timeout for Render cold starts
        connectTimeoutMS: 3e4,
        socketTimeoutMS: 45e3,
        maxPoolSize: 10,
        minPoolSize: 1,
        // Reduced for free tier
        retryWrites: true,
        retryReads: true,
        w: "majority"
      };
      mongoClient = new MongoClient(mongoUri, mongoOptions);
      await mongoClient.connect();
      cachedMongoDb = mongoClient.db(mongoDbName);
      console.log("\u2705 Connected to MongoDB successfully");
    } catch (error) {
      console.error("\u274C Failed to connect to MongoDB:", error);
      mongoClient = null;
      cachedMongoDb = null;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`MongoDB connection failed: ${errorMessage}`);
      console.error("Server will continue with fallback storage (MemStorage)");
      return null;
    }
  }
  return cachedMongoDb;
}
var pool, db, mongoUri, mongoDbName, mongoClient, cachedMongoDb;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (process.env.DATABASE_URL) {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema: { ...schema_exports } });
    } else {
      console.warn("DATABASE_URL not set. Skipping Postgres/Neon connection. Only MongoDB will be used.");
    }
    mongoUri = process.env.MONGODB_URI;
    mongoDbName = process.env.MONGODB_DB || "devmindx";
    mongoClient = null;
    cachedMongoDb = null;
  }
});

// server/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl, supabaseAnonKey, supabaseServiceKey, supabase, supabaseAdmin;
var init_supabase = __esm({
  "server/lib/supabase.ts"() {
    "use strict";
    supabaseUrl = process.env.SUPABASE_URL || "";
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
    supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("\u26A0\uFE0F  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env");
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("\u2705 Supabase client initialized");
  }
});

// server/storage-supabase.ts
var storage_supabase_exports = {};
__export(storage_supabase_exports, {
  SupabaseStorage: () => SupabaseStorage
});
var SupabaseStorage;
var init_storage_supabase = __esm({
  "server/storage-supabase.ts"() {
    "use strict";
    init_supabase();
    SupabaseStorage = class {
      // User operations
      async getUser(id) {
        const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single();
        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error fetching user:", error);
          }
          return void 0;
        }
        return this.mapSupabaseUserToUser(data);
      }
      async getUserByEmail(email) {
        const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user by email:", error);
          return void 0;
        }
        return data ? this.mapSupabaseUserToUser(data) : void 0;
      }
      async getUserByUsername(username) {
        const { data, error } = await supabaseAdmin.from("users").select("*").eq("username", username).single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user by username:", error);
          return void 0;
        }
        return data ? this.mapSupabaseUserToUser(data) : void 0;
      }
      async getUserByGoogleId(googleId) {
        const { data, error } = await supabaseAdmin.from("users").select("*").eq("provider", "google").eq("provider_id", googleId).single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user by Google ID:", error);
          return void 0;
        }
        return data ? this.mapSupabaseUserToUser(data) : void 0;
      }
      async getUserByGithubId(githubId) {
        const { data, error } = await supabaseAdmin.from("users").select("*").eq("provider", "github").eq("provider_id", githubId).single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user by GitHub ID:", error);
          return void 0;
        }
        return data ? this.mapSupabaseUserToUser(data) : void 0;
      }
      async createUser(insertUser) {
        const userData = {
          email: insertUser.email,
          username: insertUser.username,
          password_hash: insertUser.password,
          provider: insertUser.googleId ? "google" : insertUser.githubId ? "github" : "local",
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
              lastReset: (/* @__PURE__ */ new Date()).toISOString()
            }
          }
        };
        const { data, error } = await supabaseAdmin.from("users").insert([userData]).select().single();
        if (error) {
          console.error("Error creating user:", error);
          throw new Error(`Failed to create user: ${error.message}`);
        }
        return this.mapSupabaseUserToUser(data);
      }
      async updateUser(id, updates) {
        const existing = await this.getUser(id);
        if (!existing) throw new Error("User not found");
        const updateData = {
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (updates.username) updateData.username = updates.username;
        if (updates.email) updateData.email = updates.email;
        if (updates.password) updateData.password_hash = updates.password;
        if (updates.username) updateData.display_name = updates.username;
        const metadata = existing.metadata || {};
        if (updates.isVerified !== void 0) metadata.isVerified = updates.isVerified;
        if (updates.verificationToken !== void 0) metadata.verificationToken = updates.verificationToken;
        if (updates.otp !== void 0) metadata.otp = updates.otp;
        if (updates.otpExpiry !== void 0) metadata.otpExpiry = updates.otpExpiry;
        if (updates.purchasedModels !== void 0) metadata.purchasedModels = updates.purchasedModels;
        if (updates.usage !== void 0) metadata.usage = updates.usage;
        updateData.metadata = metadata;
        const { data, error } = await supabaseAdmin.from("users").update(updateData).eq("id", id).select().single();
        if (error) {
          console.error("Error updating user:", error);
          throw new Error(`Failed to update user: ${error.message}`);
        }
        return this.mapSupabaseUserToUser(data);
      }
      async verifyUser(token) {
        const { data: users2, error } = await supabaseAdmin.from("users").select("*");
        if (error) {
          console.error("Error fetching users for verification:", error);
          return void 0;
        }
        const user = users2?.find((u) => u.metadata?.verificationToken === token);
        if (user) {
          return this.updateUser(user.id, { isVerified: true, verificationToken: null });
        }
        return void 0;
      }
      // Project operations
      async getProject(id) {
        const { data, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).single();
        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error fetching project:", error);
          }
          return void 0;
        }
        return this.mapSupabaseProjectToProject(data);
      }
      async getUserProjects(userId) {
        const { data, error } = await supabaseAdmin.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching user projects:", error);
          return [];
        }
        return (data || []).map((p) => this.mapSupabaseProjectToProject(p));
      }
      async createProject(insertProject) {
        const projectData = {
          user_id: insertProject.userId,
          name: insertProject.name,
          description: insertProject.description || null,
          framework: insertProject.framework,
          files: insertProject.files || {},
          is_demo: false
        };
        const { data, error } = await supabaseAdmin.from("projects").insert([projectData]).select().single();
        if (error) {
          console.error("Error creating project:", error);
          throw new Error(`Failed to create project: ${error.message}`);
        }
        return this.mapSupabaseProjectToProject(data);
      }
      async updateProject(id, updates) {
        const updateData = {
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (updates.name) updateData.name = updates.name;
        if (updates.description !== void 0) updateData.description = updates.description;
        if (updates.framework) updateData.framework = updates.framework;
        if (updates.files) updateData.files = updates.files;
        const { data, error } = await supabaseAdmin.from("projects").update(updateData).eq("id", id).select().single();
        if (error) {
          console.error("Error updating project:", error);
          throw new Error(`Failed to update project: ${error.message}`);
        }
        return this.mapSupabaseProjectToProject(data);
      }
      async deleteProject(id) {
        const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
        if (error) {
          console.error("Error deleting project:", error);
          throw new Error(`Failed to delete project: ${error.message}`);
        }
      }
      // Chat operations
      async getChatSession(id) {
        const { data, error } = await supabaseAdmin.from("chat_history").select("*").eq("id", id).single();
        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error fetching chat session:", error);
          }
          return void 0;
        }
        return this.mapSupabaseChatToChat(data);
      }
      async getUserChatSessions(userId) {
        const { data, error } = await supabaseAdmin.from("chat_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching user chat sessions:", error);
          return [];
        }
        return (data || []).map((c) => this.mapSupabaseChatToChat(c));
      }
      async getProjectChatSession(projectId) {
        const { data, error } = await supabaseAdmin.from("chat_history").select("*").eq("session_id", projectId).single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching project chat session:", error);
          return void 0;
        }
        return data ? this.mapSupabaseChatToChat(data) : void 0;
      }
      async createChatSession(insertSession) {
        const sessionData = {
          user_id: insertSession.userId,
          session_id: insertSession.projectId || `session_${Date.now()}`,
          messages: insertSession.messages || []
        };
        const { data, error } = await supabaseAdmin.from("chat_history").insert([sessionData]).select().single();
        if (error) {
          console.error("Error creating chat session:", error);
          throw new Error(`Failed to create chat session: ${error.message}`);
        }
        return this.mapSupabaseChatToChat(data);
      }
      async updateChatSession(id, updates) {
        const updateData = {
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (updates.messages) updateData.messages = updates.messages;
        const { data, error } = await supabaseAdmin.from("chat_history").update(updateData).eq("id", id).select().single();
        if (error) {
          console.error("Error updating chat session:", error);
          throw new Error(`Failed to update chat session: ${error.message}`);
        }
        return this.mapSupabaseChatToChat(data);
      }
      // File operations - using Supabase Storage would be better for this
      async createFile(file) {
        return {
          id: Date.now().toString(),
          userId: file.userId,
          path: file.path,
          content: file.content || "",
          type: file.type,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async updateFile(path3, updates) {
        return { path: path3, ...updates, updatedAt: /* @__PURE__ */ new Date() };
      }
      async deleteFile(path3) {
      }
      async renameFile(oldPath, newPath) {
        return { path: newPath, updatedAt: /* @__PURE__ */ new Date() };
      }
      async getUserFiles(userId, path3) {
        return [];
      }
      // Helper methods to map Supabase data to app data
      mapSupabaseUserToUser(supabaseUser) {
        const metadata = supabaseUser.metadata || {};
        return {
          id: supabaseUser.id,
          username: supabaseUser.username || supabaseUser.email.split("@")[0],
          email: supabaseUser.email,
          password: supabaseUser.password_hash,
          isVerified: metadata.isVerified !== void 0 ? metadata.isVerified : true,
          verificationToken: metadata.verificationToken || null,
          otp: metadata.otp || null,
          otpExpiry: metadata.otpExpiry ? new Date(metadata.otpExpiry) : null,
          googleId: supabaseUser.provider === "google" ? supabaseUser.provider_id : null,
          githubId: supabaseUser.provider === "github" ? supabaseUser.provider_id : null,
          createdAt: new Date(supabaseUser.created_at),
          purchasedModels: metadata.purchasedModels || [],
          usage: metadata.usage || {
            totalTokens: 0,
            totalCost: 0,
            lastReset: /* @__PURE__ */ new Date()
          },
          metadata
        };
      }
      mapSupabaseProjectToProject(supabaseProject) {
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
      mapSupabaseChatToChat(supabaseChat) {
        return {
          id: supabaseChat.id,
          userId: supabaseChat.user_id,
          projectId: supabaseChat.session_id,
          messages: supabaseChat.messages || [],
          createdAt: new Date(supabaseChat.created_at)
        };
      }
    };
  }
});

// server/storage.ts
import { ObjectId as ObjectId2 } from "mongodb";
async function initializeStorage() {
  if (storage) return storage;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      console.log("\u{1F504} Initializing Supabase storage...");
      const { SupabaseStorage: SupabaseStorage2 } = await Promise.resolve().then(() => (init_storage_supabase(), storage_supabase_exports));
      storage = new SupabaseStorage2();
      console.log("\u2705 Using Supabase storage");
      return storage;
    } catch (error) {
      console.warn("\u26A0\uFE0F  Failed to initialize Supabase storage:", error instanceof Error ? error.message : error);
    }
  }
  if (process.env.MONGODB_URI) {
    try {
      console.log("\u{1F504} Attempting MongoDB connection...");
      const db2 = await connectToMongoDB();
      if (db2) {
        await db2.command({ ping: 1 });
        console.log("\u2705 MongoDB connection successful, using MongoStorage");
        storage = new MongoStorage();
        return storage;
      }
    } catch (error) {
      console.warn("\u26A0\uFE0F  MongoDB connection failed:", error instanceof Error ? error.message : error);
    }
  }
  console.warn("\u26A0\uFE0F  No database configured, using MemStorage (data will not persist)");
  console.warn("\u{1F4A1} Set SUPABASE_URL and SUPABASE_SERVICE_KEY for persistent storage");
  storage = new MemStorage();
  return storage;
}
async function getStorage() {
  if (!storage) {
    return await initializeStorage();
  }
  return storage;
}
var MemStorage, MongoStorage, storage, storagePromise;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    MemStorage = class {
      users = /* @__PURE__ */ new Map();
      projects = /* @__PURE__ */ new Map();
      chatSessions = /* @__PURE__ */ new Map();
      files = /* @__PURE__ */ new Map();
      currentUserId = 1;
      currentProjectId = 1;
      currentChatId = 1;
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email === email);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
      }
      async getUserByGoogleId(googleId) {
        return Array.from(this.users.values()).find((user) => user.googleId === googleId);
      }
      async getUserByGithubId(githubId) {
        return Array.from(this.users.values()).find((user) => user.githubId === githubId);
      }
      async createUser(insertUser) {
        const id = String(this.currentUserId++);
        const user = {
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
          createdAt: /* @__PURE__ */ new Date(),
          purchasedModels: [],
          usage: {
            totalTokens: 0,
            totalCost: 0,
            lastReset: /* @__PURE__ */ new Date()
          }
        };
        this.users.set(id, user);
        return user;
      }
      async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) throw new Error("User not found");
        const updatedUser = { ...user, ...updates };
        if (user.usage && updatedUser.usage && !updates.usage?.lastReset) {
          updatedUser.usage.lastReset = user.usage.lastReset;
        } else if (!updatedUser.usage) {
          updatedUser.usage = { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() };
        }
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async verifyUser(token) {
        const user = Array.from(this.users.values()).find((u) => u.verificationToken === token);
        if (user) {
          const verified = await this.updateUser(user.id, { isVerified: true, verificationToken: null });
          return verified;
        }
        return void 0;
      }
      async getProject(id) {
        return this.projects.get(id);
      }
      async getUserProjects(userId) {
        return Array.from(this.projects.values()).filter((project) => project.userId === userId);
      }
      async createProject(insertProject) {
        const id = String(this.currentProjectId++);
        const project = {
          id,
          name: insertProject.name,
          description: insertProject.description || null,
          framework: insertProject.framework,
          userId: insertProject.userId,
          files: insertProject.files || {},
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.projects.set(id, project);
        return project;
      }
      async updateProject(id, updates) {
        const project = this.projects.get(id);
        if (!project) throw new Error("Project not found");
        const updatedProject = { ...project, ...updates, updatedAt: /* @__PURE__ */ new Date() };
        this.projects.set(id, updatedProject);
        return updatedProject;
      }
      async deleteProject(id) {
        this.projects.delete(id);
      }
      async getChatSession(id) {
        return this.chatSessions.get(id);
      }
      async getUserChatSessions(userId) {
        return Array.from(this.chatSessions.values()).filter((session) => session.userId === userId);
      }
      async getProjectChatSession(projectId) {
        return Array.from(this.chatSessions.values()).find((session) => session.projectId === projectId);
      }
      async createChatSession(insertSession) {
        const id = String(this.currentChatId++);
        const session = {
          id,
          userId: insertSession.userId,
          projectId: insertSession.projectId || null,
          messages: insertSession.messages || [],
          createdAt: /* @__PURE__ */ new Date()
        };
        this.chatSessions.set(id, session);
        return session;
      }
      async updateChatSession(id, updates) {
        const session = this.chatSessions.get(id);
        if (!session) throw new Error("Chat session not found");
        const updatedSession = { ...session, ...updates };
        this.chatSessions.set(id, updatedSession);
        return updatedSession;
      }
      // File operations
      async createFile(file) {
        const fileRecord = {
          id: Date.now().toString(),
          userId: file.userId,
          path: file.path,
          content: file.content || "",
          type: file.type,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.files.set(file.path, fileRecord);
        return fileRecord;
      }
      async updateFile(path3, updates) {
        const file = this.files.get(path3);
        if (!file) throw new Error("File not found");
        const updatedFile = { ...file, ...updates, updatedAt: /* @__PURE__ */ new Date() };
        this.files.set(path3, updatedFile);
        return updatedFile;
      }
      async deleteFile(path3) {
        this.files.delete(path3);
      }
      async renameFile(oldPath, newPath) {
        const file = this.files.get(oldPath);
        if (!file) throw new Error("File not found");
        const renamedFile = { ...file, path: newPath, updatedAt: /* @__PURE__ */ new Date() };
        this.files.set(newPath, renamedFile);
        this.files.delete(oldPath);
        return renamedFile;
      }
      async getUserFiles(userId, path3) {
        return Array.from(this.files.values()).filter(
          (file) => file.userId === userId && file.path.startsWith(path3 || "/")
        );
      }
    };
    MongoStorage = class {
      normalizeUserId(userId) {
        if (userId instanceof ObjectId2) return userId;
        if (typeof userId === "number") return userId;
        if (typeof userId === "string") {
          if (ObjectId2.isValid(userId)) {
            return new ObjectId2(userId);
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
      async getUser(id) {
        const db2 = await connectToMongoDB();
        if (!db2) {
          console.error("MongoDB connection unavailable in getUser");
          return void 0;
        }
        const filter = createMongoIdFilter(id);
        const user = await db2.collection("users").findOne(filter);
        if (!user) return void 0;
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
          usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async getUserByEmail(email) {
        const db2 = await connectToMongoDB();
        if (!db2) {
          console.error("MongoDB connection unavailable in getUserByEmail");
          return void 0;
        }
        const user = await db2.collection("users").findOne({ email });
        if (!user) return void 0;
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
          usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async getUserByUsername(username) {
        const db2 = await connectToMongoDB();
        const user = await db2.collection("users").findOne({ username });
        if (!user) return void 0;
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
          usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async getUserByGoogleId(googleId) {
        const db2 = await connectToMongoDB();
        const user = await db2.collection("users").findOne({ googleId });
        if (!user) return void 0;
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
          usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async getUserByGithubId(githubId) {
        const db2 = await connectToMongoDB();
        const user = await db2.collection("users").findOne({ githubId });
        if (!user) return void 0;
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
          usage: user.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async createUser(insertUser) {
        const db2 = await connectToMongoDB();
        const user = {
          username: insertUser.username,
          email: insertUser.email,
          password: insertUser.password || null,
          isVerified: false,
          verificationToken: insertUser.verificationToken || null,
          otp: insertUser.otp || null,
          otpExpiry: insertUser.otpExpiry || null,
          googleId: insertUser.googleId || null,
          githubId: insertUser.githubId || null,
          createdAt: /* @__PURE__ */ new Date(),
          purchasedModels: [],
          usage: {
            totalTokens: 0,
            totalCost: 0,
            lastReset: /* @__PURE__ */ new Date()
          },
          id: ""
          // Temporary empty string, will be replaced by _id.toString()
        };
        const result = await db2.collection("users").insertOne(user);
        const createdUser = {
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
      async updateUser(id, updates) {
        const db2 = await connectToMongoDB();
        const filter = createMongoIdFilter(id);
        const existingUser = await db2.collection("users").findOne(filter);
        if (!existingUser) throw new Error("User not found");
        const newUpdates = { ...updates };
        if (updates.purchasedModels !== void 0) {
          newUpdates.purchasedModels = updates.purchasedModels;
        } else if (existingUser.purchasedModels) {
          newUpdates.purchasedModels = existingUser.purchasedModels;
        } else {
          newUpdates.purchasedModels = [];
        }
        if (updates.usage !== void 0) {
          newUpdates.usage = updates.usage;
        } else if (existingUser.usage) {
          newUpdates.usage = existingUser.usage;
        } else {
          newUpdates.usage = { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() };
        }
        await db2.collection("users").updateOne(
          filter,
          { $set: newUpdates }
        );
        const updatedUser = await db2.collection("users").findOne(filter);
        if (!updatedUser) throw new Error("User not found");
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
          usage: updatedUser.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
        };
      }
      async verifyUser(token) {
        const db2 = await connectToMongoDB();
        const user = await db2.collection("users").findOne({ verificationToken: token });
        if (user) {
          await db2.collection("users").updateOne({ _id: user._id }, { $set: { isVerified: true, verificationToken: null } });
          const verifiedUser = await db2.collection("users").findOne({ _id: user._id });
          if (!verifiedUser) return void 0;
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
            usage: verifiedUser.usage || { totalTokens: 0, totalCost: 0, lastReset: /* @__PURE__ */ new Date() }
          };
        }
        return void 0;
      }
      // Project operations
      async getProject(id) {
        const db2 = await connectToMongoDB();
        const project = await db2.collection("projects").findOne({ _id: new ObjectId2(id) });
        if (!project) return void 0;
        return {
          id: project._id.toString(),
          name: project.name,
          description: project.description,
          framework: project.framework,
          userId: project.userId.toString(),
          files: project.files,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        };
      }
      async getUserProjects(userId) {
        const db2 = await connectToMongoDB();
        const ownerId = this.normalizeUserId(userId);
        const projects2 = await db2.collection("projects").find({ userId: ownerId }).toArray();
        return projects2.map((project) => ({
          id: project._id.toString(),
          name: project.name,
          description: project.description,
          framework: project.framework,
          userId: project.userId.toString(),
          files: project.files,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }));
      }
      async createProject(insertProject) {
        const db2 = await connectToMongoDB();
        const projectToInsert = {
          name: insertProject.name,
          description: insertProject.description || null,
          framework: insertProject.framework,
          userId: this.normalizeUserId(insertProject.userId),
          files: insertProject.files || {},
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        const result = await db2.collection("projects").insertOne(projectToInsert);
        const createdProject = {
          id: result.insertedId.toString(),
          name: projectToInsert.name,
          description: projectToInsert.description,
          framework: projectToInsert.framework,
          userId: insertProject.userId,
          // Keep original string userId for the returned object
          files: projectToInsert.files,
          createdAt: projectToInsert.createdAt,
          updatedAt: projectToInsert.updatedAt
        };
        return createdProject;
      }
      async updateProject(id, updates) {
        const db2 = await connectToMongoDB();
        const updateDoc = { ...updates, updatedAt: /* @__PURE__ */ new Date() };
        if (updateDoc.userId) {
          updateDoc.userId = this.normalizeUserId(updateDoc.userId);
        }
        await db2.collection("projects").updateOne(
          { _id: new ObjectId2(id) },
          { $set: updateDoc }
        );
        const updatedProject = await db2.collection("projects").findOne({ _id: new ObjectId2(id) });
        if (!updatedProject) throw new Error("Project not found");
        return {
          id: updatedProject._id.toString(),
          name: updatedProject.name,
          description: updatedProject.description,
          framework: updatedProject.framework,
          userId: updatedProject.userId.toString(),
          files: updatedProject.files,
          createdAt: updatedProject.createdAt,
          updatedAt: updatedProject.updatedAt
        };
      }
      async deleteProject(id) {
        const db2 = await connectToMongoDB();
        await db2.collection("projects").deleteOne({ _id: new ObjectId2(id) });
      }
      // Chat operations
      async getChatSession(id) {
        const db2 = await connectToMongoDB();
        const session = await db2.collection("chatSessions").findOne({ _id: new ObjectId2(id) });
        if (!session) return void 0;
        return {
          id: session._id.toString(),
          userId: session.userId ? session.userId.toString() : null,
          projectId: session.projectId ? session.projectId.toString() : null,
          messages: session.messages,
          createdAt: session.createdAt
        };
      }
      async getUserChatSessions(userId) {
        const db2 = await connectToMongoDB();
        const normalizedUserId = this.normalizeUserId(userId);
        const sessions2 = await db2.collection("chatSessions").find({ userId: normalizedUserId }).toArray();
        return sessions2.map((session) => ({
          id: session._id.toString(),
          userId: session.userId ? session.userId.toString() : null,
          projectId: session.projectId ? session.projectId.toString() : null,
          messages: session.messages,
          createdAt: session.createdAt
        }));
      }
      async getProjectChatSession(projectId) {
        const db2 = await connectToMongoDB();
        const projectKey = ObjectId2.isValid(projectId) ? new ObjectId2(projectId) : projectId;
        const session = await db2.collection("chatSessions").findOne({ projectId: projectKey });
        if (!session) return void 0;
        return {
          id: session._id.toString(),
          userId: session.userId ? session.userId.toString() : null,
          projectId: session.projectId ? session.projectId.toString() : null,
          messages: session.messages,
          createdAt: session.createdAt
        };
      }
      async createChatSession(insertSession) {
        const db2 = await connectToMongoDB();
        const sessionToInsert = {
          userId: this.normalizeUserId(insertSession.userId),
          projectId: insertSession.projectId && ObjectId2.isValid(insertSession.projectId) ? new ObjectId2(insertSession.projectId) : insertSession.projectId ?? null,
          messages: insertSession.messages || [],
          createdAt: /* @__PURE__ */ new Date()
        };
        const result = await db2.collection("chatSessions").insertOne(sessionToInsert);
        const createdSession = {
          id: result.insertedId.toString(),
          userId: insertSession.userId,
          // Keep original userId type for returned object
          projectId: insertSession.projectId || null,
          messages: sessionToInsert.messages,
          createdAt: sessionToInsert.createdAt
        };
        return createdSession;
      }
      async updateChatSession(id, updates) {
        const db2 = await connectToMongoDB();
        const updateDoc = { ...updates };
        if (updateDoc.userId) updateDoc.userId = this.normalizeUserId(updateDoc.userId);
        if (updateDoc.projectId && ObjectId2.isValid(updateDoc.projectId)) {
          updateDoc.projectId = new ObjectId2(updateDoc.projectId);
        }
        await db2.collection("chatSessions").updateOne({ _id: new ObjectId2(id) }, { $set: updateDoc });
        const updatedSession = await db2.collection("chatSessions").findOne({ _id: new ObjectId2(id) });
        if (!updatedSession) throw new Error("Chat session not found");
        return {
          id: updatedSession._id.toString(),
          userId: updatedSession.userId ? updatedSession.userId.toString() : null,
          projectId: updatedSession.projectId ? updatedSession.projectId.toString() : null,
          messages: updatedSession.messages,
          createdAt: updatedSession.createdAt
        };
      }
      // File operations
      async createFile(file) {
        const db2 = await connectToMongoDB();
        const fileRecord = {
          userId: this.normalizeUserId(file.userId),
          path: file.path,
          content: file.content || "",
          type: file.type,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        const result = await db2.collection("files").insertOne(fileRecord);
        return { ...fileRecord, id: result.insertedId.toString() };
      }
      async updateFile(path3, updates) {
        const db2 = await connectToMongoDB();
        await db2.collection("files").updateOne(
          { path: path3 },
          { $set: { ...updates, updatedAt: /* @__PURE__ */ new Date() } }
        );
        const updatedFile = await db2.collection("files").findOne({ path: path3 });
        if (!updatedFile) throw new Error("File not found");
        return updatedFile;
      }
      async deleteFile(path3) {
        const db2 = await connectToMongoDB();
        await db2.collection("files").deleteOne({ path: path3 });
      }
      async renameFile(oldPath, newPath) {
        const db2 = await connectToMongoDB();
        await db2.collection("files").updateOne(
          { path: oldPath },
          { $set: { path: newPath, updatedAt: /* @__PURE__ */ new Date() } }
        );
        const renamedFile = await db2.collection("files").findOne({ path: newPath });
        if (!renamedFile) throw new Error("File not found");
        return renamedFile;
      }
      async getUserFiles(userId, path3 = "/") {
        const db2 = await connectToMongoDB();
        const normalizedUserId = this.normalizeUserId(userId);
        return await db2.collection("files").find({ userId: normalizedUserId, path: { $regex: `^${path3}` } }).toArray();
      }
    };
    storage = null;
    storagePromise = initializeStorage().catch((error) => {
      console.error("Failed to initialize storage:", error);
      storage = new MemStorage();
      return storage;
    });
  }
});

// server/services/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authenticateUser: () => authenticateUser,
  comparePassword: () => comparePassword,
  generateOTP: () => generateOTP,
  generateToken: () => generateToken,
  generateVerificationToken: () => generateVerificationToken,
  getOTPExpiry: () => getOTPExpiry,
  hashPassword: () => hashPassword,
  verifyToken: () => verifyToken
});
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRATION) }
  );
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function generateOTP() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
function getOTPExpiry() {
  const expiryDate = /* @__PURE__ */ new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 10);
  return expiryDate;
}
async function authenticateUser(email, password) {
  const storage2 = await getStorage();
  console.log("Storage object in authenticateUser:", storage2);
  const user = await storage2.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in");
  }
  if (!user.password) {
    throw new Error("Please set a password or use OAuth login");
  }
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  return user;
}
var JWT_SECRET, JWT_EXPIRATION;
var init_auth = __esm({
  "server/services/auth.ts"() {
    "use strict";
    init_storage();
    JWT_SECRET = process.env.JWT_SECRET || "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
    JWT_EXPIRATION = process.env.JWT_EXPIRATION || "86400000";
  }
});

// server/services/together.ts
var together_exports = {};
__export(together_exports, {
  analyzeCodeWithTogether: () => analyzeCodeWithTogether,
  chatWithTogether: () => chatWithTogether,
  generateCodeWithTogether: () => generateCodeWithTogether,
  generateProjectWithTogether: () => generateProjectWithTogether
});
import Together from "together-ai";
import JSON52 from "json5";
async function generateProjectWithTogether(prompt, framework, name) {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");
    const projectFolderName = name?.toLowerCase().replace(/[^a-z0-9-]/g, "-") || "generated-project";
    const frameworkToUse = framework || "default";
    console.log("Calling Together AI for project generation with:", { prompt, framework: frameworkToUse, name });
    let enhancedPrompt = `Generate a full project structure and code for the following description:

"${prompt}"

You MUST follow these strict requirements:
1. Place all files inside a root folder named '${projectFolderName}'
2. Use consistent code indentation (2 spaces) and clean formatting
3. Include essential files like README.md, package.json, etc. if relevant
4. Follow modern development practices and the conventions of the chosen stack
5. Return the result strictly as a valid JSON object with this structure:

{
  "name": "${name || "Generated Project"}",
  "framework": "${frameworkToUse}",
  "description": "Project description",
  "files": {
    "${projectFolderName}/index.html": "file content",
    "${projectFolderName}/style.css": "file content",
    "${projectFolderName}/README.md": "project documentation"
  }
}

Do not include any markdown explanations or extra commentary. Just return the raw JSON object. Do not escape newlines inside the code content.
`;
    const response = await together.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: SYSTEM_PROMPT2.role, content: SYSTEM_PROMPT2.content },
        { role: "user", content: enhancedPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.5
    });
    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No response from Together AI");
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON52.parse(jsonMatch[0]);
        return {
          name: parsed.name || name || "Generated Project",
          framework: parsed.framework || framework || "web",
          description: parsed.description || prompt,
          files: parsed.files || {}
        };
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`);
      }
    }
    return {
      name: name || "Generated Project",
      framework: framework || "web",
      description: prompt,
      files: {
        "README.md": `# ${name || "Generated Project"}

${prompt}`,
        "main.js": content
      }
    };
  } catch (error) {
    console.error("Error in generateProjectWithTogether:", error);
    return {
      name: name || "Error Project",
      framework: framework || "web",
      description: prompt,
      files: {
        "README.md": `# ${name || "Error Project"}

Error: ${error instanceof Error ? error.message : "Unknown"}`,
        "index.html": `<html><body><h1>Error generating project</h1></body></html>`
      }
    };
  }
}
async function generateCodeWithTogether(instruction, context) {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");
    const userPrompt = context ? `Context:
${context}

Instruction:
${instruction}` : `Instruction:
${instruction}`;
    const response = await together.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: SYSTEM_PROMPT2.role, content: SYSTEM_PROMPT2.content },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });
    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No response from Together AI");
    return { content, fileChanges: [] };
  } catch (error) {
    console.error("Error in generateCodeWithTogether:", error);
    throw new Error(`Code generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function normalizeChatHistory(history = []) {
  const normalized = [];
  let expectedRole = "user";
  for (const entry of history) {
    if (entry.role !== expectedRole) {
      continue;
    }
    normalized.push({ role: entry.role, content: entry.content });
    expectedRole = expectedRole === "user" ? "assistant" : "user";
  }
  while (normalized.length > 0 && normalized[normalized.length - 1].role === "user") {
    normalized.pop();
    expectedRole = "assistant";
  }
  return normalized;
}
async function chatWithTogether(message, chatHistory = [], projectContext) {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");
    const limitedHistory = normalizeChatHistory(chatHistory.slice(-10));
    const messages = [
      SYSTEM_PROMPT2,
      ...limitedHistory,
      { role: "user", content: message }
    ];
    const response = await together.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content
      })),
      max_tokens: 700,
      temperature: 0.5
    });
    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No response from Together AI");
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON52.parse(jsonString);
        if (parsedContent && typeof parsedContent === "object" && parsedContent.fileChanges) {
          return { content: parsedContent.content || "", fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log("AI response contained JSON but failed to parse or was not expected structure. Treating as plain text.", parseError);
      }
    }
    return { content, fileChanges: [] };
  } catch (error) {
    console.error("Error in chatWithTogether:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key")) return { content: "AI service not configured.", fileChanges: [] };
      if (error.message.includes("rate limit")) return { content: "Service is rate-limited. Try again later.", fileChanges: [] };
      return { content: `Error: ${error.message}`, fileChanges: [] };
    }
    return { content: "Unexpected error occurred.", fileChanges: [] };
  }
}
async function analyzeCodeWithTogether(code, task) {
  try {
    if (!process.env.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");
    const formattedPrompt = `Task: "${task}"

Code:
\`\`\`
${code}
\`\`\``;
    const response = await together.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: SYSTEM_PROMPT2.role, content: SYSTEM_PROMPT2.content },
        { role: "user", content: formattedPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });
    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No response from Together AI");
    return content;
  } catch (error) {
    console.error("Error in analyzeCodeWithTogether:", error);
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
var together, SYSTEM_PROMPT2;
var init_together = __esm({
  "server/services/together.ts"() {
    "use strict";
    if (!process.env.TOGETHER_API_KEY) {
      console.warn("TOGETHER_API_KEY is not set. AI features will not work.");
    }
    together = new Together({
      apiKey: process.env.TOGETHER_API_KEY
    });
    SYSTEM_PROMPT2 = {
      role: "system",
      content: "You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question. If you are given diagnostic information (errors, warnings), prioritize addressing them by providing an updated file content. When suggesting code changes, provide a JSON object with a 'fileChanges' array, where each object in the array has 'filePath', 'action' (create, update, or delete), and 'newContent' (if action is create or update). If no specific file changes are needed, or if the response is purely conversational, return a simple text response. When providing file changes, ensure the content is complete and syntactically correct, including all necessary imports and surrounding code context."
    };
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";
import passport3 from "passport";
import { createServer as createServer2 } from "http";

// server/auth/passport-setup.ts
init_storage();
init_auth();
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
function apiBase() {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/$/, "");
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  const port = process.env.PORT || "5000";
  return `http://localhost:${port}`;
}
function googleCallbackURL() {
  return process.env.GOOGLE_CALLBACK_URL?.trim() || `${apiBase()}/api/auth/google/callback`;
}
function githubCallbackURL() {
  return process.env.GITHUB_CALLBACK_URL?.trim() || `${apiBase()}/api/auth/github/callback`;
}
async function ensureVerifiedOAuthUser(provider, profileId, email, displayName) {
  const storage2 = await getStorage();
  const randomPassword = await hashPassword(crypto.randomBytes(32).toString("hex"));
  if (provider === "google") {
    let user2 = await storage2.getUserByGoogleId(profileId);
    if (user2) return user2;
    const existing2 = await storage2.getUserByEmail(email);
    if (existing2) {
      return storage2.updateUser(existing2.id, { googleId: profileId, isVerified: true });
    }
    const base2 = (displayName || email.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24);
    const username2 = `${base2}_${profileId.slice(-4)}`;
    let created2 = await storage2.createUser({
      username: username2,
      email,
      password: randomPassword,
      googleId: profileId
    });
    return storage2.updateUser(created2.id, { isVerified: true });
  }
  let user = await storage2.getUserByGithubId(profileId);
  if (user) return user;
  const existing = await storage2.getUserByEmail(email);
  if (existing) {
    return storage2.updateUser(existing.id, { githubId: profileId, isVerified: true });
  }
  const base = (displayName || email.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24);
  const username = `${base}_${profileId.slice(-4)}`;
  let created = await storage2.createUser({
    username,
    email,
    password: randomPassword,
    githubId: profileId
  });
  return storage2.updateUser(created.id, { isVerified: true });
}
function registerPassportStrategies() {
  const gid = process.env.GOOGLE_CLIENT_ID?.trim();
  const gsec = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (gid && gsec) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: gid,
          clientSecret: gsec,
          callbackURL: googleCallbackURL()
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("Google did not return an email (check OAuth scopes)."));
            }
            const user = await ensureVerifiedOAuthUser(
              "google",
              profile.id,
              email,
              profile.displayName || email.split("@")[0]
            );
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  } else {
    console.warn("[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set \u2014 Google login disabled.");
  }
  const hid = process.env.GITHUB_CLIENT_ID?.trim();
  const hsec = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (hid && hsec) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: hid,
          clientSecret: hsec,
          callbackURL: githubCallbackURL()
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const githubId = String(profile.id);
            const email = profile.emails && profile.emails[0] && profile.emails[0].value || (profile.username ? `${profile.username}@users.noreply.github.com` : "");
            if (!email) {
              return done(new Error("GitHub did not return an email; try granting user:email scope."));
            }
            const displayName = profile.displayName || profile.username || email.split("@")[0];
            const user = await ensureVerifiedOAuthUser("github", githubId, email, displayName);
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  } else {
    console.warn("[auth] GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set \u2014 GitHub login disabled.");
  }
}
function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}
function isGitHubOAuthConfigured() {
  return Boolean(process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim());
}

// server/routes.ts
import { createServer } from "http";

// server/routes/auth.ts
init_storage();
init_auth();
import { Router } from "express";
import passport2 from "passport";

// server/services/email.ts
import nodemailer from "nodemailer";
var isDev = process.env.NODE_ENV !== "production";
var createTransporter = () => {
  if (isDev && !process.env.FORCE_EMAIL) {
    console.log("Running in development mode - emails will be logged instead of sent");
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`FORCE_EMAIL: ${process.env.FORCE_EMAIL}`);
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "webdevx.ai@gmail.com",
      pass: process.env.EMAIL_PASS || "lqzflcmjmxfxmmf"
    }
  });
};
async function sendOTPVerificationEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER || "webdevx.ai@gmail.com",
    to: email,
    subject: "Your DevMindX Verification Code",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #007acc; text-align: center;">Welcome to DevMindX</h1>
        <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with DevMindX, you can safely ignore this email.
        </p>
      </div>
    `
  };
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log("==== OTP VERIFICATION EMAIL (DEV MODE) ====");
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log("===========================================");
      return;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email error details:", error);
    throw new Error(`Failed to send OTP verification email: ${error.message}`);
  }
}

// server/routes/auth.ts
var router = Router();
function publicUser(u) {
  return { id: u.id, username: u.username, email: u.email };
}
function frontendBase() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}
function oauthFailureRedirect() {
  return `${frontendBase()}/login?error=oauth`;
}
function redirectWithJwt(res, user) {
  const token = generateToken(user);
  const u = encodeURIComponent(JSON.stringify(publicUser(user)));
  res.redirect(`${frontendBase()}/login?token=${encodeURIComponent(token)}&user=${u}`);
}
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.password) {
      return res.status(401).json({ message: "Please set a password or use OAuth login" });
    }
    if (!user.isVerified) {
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.json({ requiresOTP: true, email: user.email });
    }
    const u = await authenticateUser(String(email).trim(), password);
    const token = generateToken(u);
    return res.json({ token, user: publicUser(u) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    return res.status(401).json({ message: msg });
  }
});
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body ?? {};
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Username, email, and password required" });
    }
    const storage2 = await getStorage();
    const existing = await storage2.getUserByEmail(String(email).trim());
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const existingName = await storage2.getUserByUsername(String(username).trim());
    if (existingName) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const hashed = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    await storage2.createUser({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      password: hashed,
      otp,
      otpExpiry
    });
    await sendOTPVerificationEmail(String(email).trim(), otp);
    return res.json({ email: String(email).trim(), message: "Verification code sent" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    return res.status(400).json({ message: msg });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (String(user.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid code" });
    }
    if (user.otpExpiry && new Date(user.otpExpiry) < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ message: "Code expired \u2014 request a new one" });
    }
    const updated = await storage2.updateUser(user.id, {
      isVerified: true,
      otp: null,
      otpExpiry: null
    });
    const token = generateToken(updated);
    return res.json({ token, user: publicUser(updated) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return res.status(400).json({ message: msg });
  }
});
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUserByEmail(String(email).trim());
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    await storage2.updateUser(user.id, { otp, otpExpiry });
    await sendOTPVerificationEmail(String(email).trim(), otp);
    return res.json({ message: "Code sent" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to resend";
    return res.status(400).json({ message: msg });
  }
});
router.get("/verify", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }
  try {
    const storage2 = await getStorage();
    const user = await storage2.verifyUser(token);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }
    return res.redirect(`${frontendBase()}/login?verified=1`);
  } catch {
    return res.status(400).json({ message: "Verification failed" });
  }
});
router.get("/google", (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      message: "Google OAuth is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
      error: "oauth_not_configured",
      provider: "google"
    });
  }
  passport2.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
      return res.status(503).json({ message: "Google OAuth not configured" });
    }
    passport2.authenticate("google", {
      session: false,
      failureRedirect: oauthFailureRedirect()
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.redirect(oauthFailureRedirect());
    }
    return redirectWithJwt(res, user);
  }
);
router.get("/github", (req, res, next) => {
  if (!isGitHubOAuthConfigured()) {
    return res.status(503).json({
      message: "GitHub OAuth is not configured (set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)",
      error: "oauth_not_configured",
      provider: "github"
    });
  }
  passport2.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get(
  "/github/callback",
  (req, res, next) => {
    if (!isGitHubOAuthConfigured()) {
      return res.status(503).json({ message: "GitHub OAuth not configured" });
    }
    passport2.authenticate("github", {
      session: false,
      failureRedirect: oauthFailureRedirect()
    })(req, res, next);
  },
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.redirect(oauthFailureRedirect());
    }
    return redirectWithJwt(res, user);
  }
);
var auth_default = router;

// server/routes/ide.ts
import { Router as Router2 } from "express";

// server/services/sandbox-executor.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
var execAsync = promisify(exec);
var languageConfigs = {
  cpp: {
    image: "gcc:12-alpine",
    command: (filename) => `g++ ${filename} -o /tmp/out && /tmp/out`,
    extension: ".cpp"
  },
  c: {
    image: "gcc:12-alpine",
    command: (filename) => `gcc ${filename} -o /tmp/out && /tmp/out`,
    extension: ".c"
  },
  python: {
    image: "python:3.11-alpine",
    command: (filename) => `python ${filename}`,
    extension: ".py"
  },
  javascript: {
    image: "node:20-alpine",
    command: (filename) => `node ${filename}`,
    extension: ".js"
  },
  typescript: {
    image: "node:20-alpine",
    command: (filename) => `node ${filename}`,
    extension: ".ts"
  },
  java: {
    image: "eclipse-temurin:17-jdk-alpine",
    command: (filename) => {
      const className = filename.replace(".java", "");
      return `cp ${filename} /tmp/ && cd /tmp && javac ${filename} && java ${className}`;
    },
    extension: ".java"
  },
  go: {
    image: "golang:1.21-alpine",
    command: (filename) => `go run ${filename}`,
    extension: ".go"
  },
  rust: {
    image: "rust:1.75-alpine",
    command: (filename) => `rustc ${filename} -o /tmp/out && /tmp/out`,
    extension: ".rs"
  },
  php: {
    image: "php:8.3-cli-alpine",
    command: (filename) => `php ${filename}`,
    extension: ".php"
  },
  shell: {
    image: "alpine:3.19",
    command: (filename) => `sh ${filename}`,
    extension: ".sh"
  }
};
var SandboxExecutor = class {
  tempDir;
  constructor() {
    this.tempDir = path.join(process.cwd(), "temp-executions");
  }
  async initialize() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create temp directory:", error);
    }
  }
  async executeCode(code, language, filename, input) {
    const startTime = Date.now();
    const config = languageConfigs[language];
    if (!config) {
      return {
        output: "",
        error: `Unsupported language: ${language}`,
        exitCode: 1,
        executionTime: 0
      };
    }
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    const actualFilename = filename || `main${config.extension}`;
    const filePath = path.join(executionDir, actualFilename);
    try {
      await fs.mkdir(executionDir, { recursive: true });
      await fs.writeFile(filePath, code, "utf-8");
      const dockerCommand = [
        "docker run",
        "--rm",
        // Auto-remove container
        "--cpus=1",
        // Limit to 1 CPU core
        "--memory=256m",
        // Limit RAM to 256MB
        "--pids-limit=300",
        // Prevent fork bombs
        "--network=none",
        // No network access
        "--read-only",
        // Read-only filesystem
        "--tmpfs /tmp:rw,noexec,nosuid,size=50m",
        // Writable temp with limits
        `-v "${executionDir}:/app:ro"`,
        // Mount code as read-only
        `-w /app`,
        // Set working directory
        `--user 1000:1000`,
        // Run as non-root user
        `--security-opt=no-new-privileges`,
        // Prevent privilege escalation
        config.image,
        "sh -c",
        `"${config.command(actualFilename)}"`
      ].join(" ");
      console.log("Executing:", dockerCommand);
      if (input) {
        console.log("With input:", input);
      }
      let stdout, stderr;
      if (input) {
        const inputFilePath = path.join(executionDir, "input.txt");
        await fs.writeFile(inputFilePath, input, "utf-8");
        const dockerCommandWithInput = [
          "docker run",
          "--rm",
          "--cpus=1",
          "--memory=256m",
          "--pids-limit=300",
          "--network=none",
          "--read-only",
          "--tmpfs /tmp:rw,noexec,nosuid,size=50m",
          `-v "${executionDir}:/app:ro"`,
          `-w /app`,
          `--user 1000:1000`,
          `--security-opt=no-new-privileges`,
          config.image,
          "sh -c",
          `"${config.command(actualFilename)} < /app/input.txt"`
        ].join(" ");
        const result = await execAsync(dockerCommandWithInput, {
          timeout: 3e4,
          maxBuffer: 1024 * 1024
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } else {
        const result = await execAsync(dockerCommand, {
          timeout: 3e4,
          maxBuffer: 1024 * 1024
        });
        stdout = result.stdout;
        stderr = result.stderr;
      }
      const executionTime = Date.now() - startTime;
      return {
        output: stdout || stderr || "Execution completed with no output",
        error: stderr && !stdout ? stderr : void 0,
        exitCode: 0,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      let errorMessage = "Execution failed";
      if (error.killed) {
        errorMessage = "Execution timeout (30s limit exceeded)";
      } else if (error.stderr) {
        errorMessage = error.stderr;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        output: error.stdout || "",
        error: errorMessage,
        exitCode: error.code || 1,
        executionTime
      };
    } finally {
      try {
        await fs.rm(executionDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }
  }
  async checkDockerAvailability() {
    try {
      await execAsync("docker --version");
      return true;
    } catch {
      return false;
    }
  }
  async pullRequiredImages() {
    console.log("Pulling required Docker images...");
    const images = [...new Set(Object.values(languageConfigs).map((c) => c.image))];
    for (const image of images) {
      try {
        console.log(`Pulling ${image}...`);
        await execAsync(`docker pull ${image}`);
        console.log(`\u2713 ${image} ready`);
      } catch (error) {
        console.error(`Failed to pull ${image}:`, error);
      }
    }
  }
};
var sandboxExecutor = new SandboxExecutor();

// server/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from "json5";
var GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Gemini AI features will use simulated responses.");
}
var isFakeKey = (key) => {
  return key?.startsWith("fake_");
};
var simulateResponse = (prompt) => {
  return `[FAKE GEMINI] This is a simulated response for your prompt: "${prompt}"`;
};
var SYSTEM_PROMPT = {
  role: "system",
  content: "You are a concise programming assistant. Respond briefly. Avoid examples or code unless explicitly asked. Do not repeat the question. If you are given diagnostic information (errors, warnings), prioritize addressing them by providing an updated file content. When suggesting code changes, provide a JSON object with both 'content' (explanation of what you did) and 'fileChanges' array, where each object in the array has 'filePath', 'action' (create, update, or delete), and 'newContent' (if action is create or update). Always include a brief 'content' field explaining what changes were made. If no specific file changes are needed, return a simple text response. When providing file changes, ensure the content is complete and syntactically correct, including all necessary imports and surrounding code context."
};
async function retryWithBackoff(fn, attempts = 3, baseDelayMs = 300) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.statusCode;
      const retriable = status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
      if (!retriable || i === attempts - 1) break;
      const delay = baseDelayMs * Math.pow(2, i) + Math.floor(Math.random() * 100);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}
async function chatWithGemini(message, chatHistory, projectContext, image) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
    if (isFakeKey(process.env.GEMINI_API_KEY)) {
      return { content: simulateResponse(message), fileChanges: [] };
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const messageParts = [{ text: message }];
    if (image) {
      const imageMatch = image.match(/^data:([^;]+);base64,(.+)$/);
      if (imageMatch) {
        const mimeType = imageMatch[1];
        const imageData = imageMatch[2];
        const imagePrompt = `

I've uploaded an image. Please analyze it and help me with the following:
- If it's a UI/website design, convert it to HTML/CSS/JavaScript code
- If it's a wireframe or mockup, create a functional website based on it
- If it's a diagram or flowchart, explain it and create relevant code
- Be specific about colors, layout, components, and functionality you can see

Please provide complete, working code with proper file structure.`;
        messageParts[0].text = message + imagePrompt;
        messageParts.push({
          inlineData: {
            mimeType,
            data: imageData
          }
        });
      }
    }
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT.content }] },
        ...(chatHistory || []).map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }))
      ]
    });
    const result = await retryWithBackoff(() => chat.sendMessage(messageParts));
    const content = result.response.text();
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[2];
      try {
        const parsedContent = JSON5.parse(jsonString);
        if (parsedContent && typeof parsedContent === "object" && parsedContent.fileChanges) {
          const defaultContent = parsedContent.content || (parsedContent.fileChanges.length > 0 ? `I've made ${parsedContent.fileChanges.length} file change${parsedContent.fileChanges.length > 1 ? "s" : ""} as requested.` : "");
          return { content: defaultContent, fileChanges: parsedContent.fileChanges };
        }
      } catch (parseError) {
        console.log("Gemini chat response contained JSON but failed to parse or was not expected structure. Treating as plain text.", parseError);
      }
    }
    return { content, fileChanges: [] };
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    return { content: `Gemini error: ${error instanceof Error ? error.message : "Unknown error"}`, fileChanges: [] };
  }
}

// server/services/ollama.ts
var OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
var OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
var MODEL_MAPPING = {
  "together": process.env.OLLAMA_MODEL_TOGETHER || "llama3.2",
  "gemini": process.env.OLLAMA_MODEL_GEMINI || "llama3.2",
  "chatgpt": process.env.OLLAMA_MODEL_CHATGPT || "llama3.2",
  "claude": process.env.OLLAMA_MODEL_CLAUDE || "llama3.2",
  "deepseek": process.env.OLLAMA_MODEL_DEEPSEEK || "deepseek-coder"
};
async function checkOllamaAvailability() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    console.warn("Ollama is not available:", error);
    return false;
  }
}
function getOllamaModel(frontendModel) {
  if (!frontendModel) return OLLAMA_MODEL;
  return MODEL_MAPPING[frontendModel] || OLLAMA_MODEL;
}
async function callOllamaChat(messages, model, temperature = 0.7) {
  const ollamaModel = getOllamaModel(model);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        temperature,
        stream: false
      })
    });
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.message?.content || "";
  } catch (error) {
    console.error("Error calling Ollama chat:", error);
    throw new Error(`Failed to generate chat response with Ollama: ${error}`);
  }
}
function extractFileChanges(content) {
  const fileChanges = [];
  const fileBlockRegex = /```(\w+)?\s*(?:\/\/\s*)?([^\n]+\.[\w]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = fileBlockRegex.exec(content)) !== null) {
    const [, , filePath, fileContent] = match;
    if (filePath && fileContent) {
      fileChanges.push({
        filePath: filePath.trim(),
        newContent: fileContent.trim(),
        action: "update"
      });
    }
  }
  return fileChanges;
}
async function chatWithOllama(message, chatHistory, projectContext, model) {
  try {
    const messages = [];
    messages.push({
      role: "system",
      content: `You are an AI coding assistant integrated into an IDE. Help users with:
- Code generation and debugging
- Explaining concepts
- Suggesting improvements
- Fixing errors
- Answering questions

IMPORTANT: When providing code:
1. Always use markdown code blocks with language specification
2. Include the filename as a comment on the first line of the code block
3. Format: \`\`\`language
// filename.ext
code here
\`\`\`

Example:
\`\`\`javascript
// app.js
function hello() {
  console.log("Hello World");
}
\`\`\`

This allows the user to apply your code directly to files with one click.`
    });
    if (projectContext) {
      let contextStr = "Project Context:\n";
      if (projectContext.files) {
        contextStr += `Files: ${Object.keys(projectContext.files).join(", ")}
`;
      }
      if (projectContext.framework) {
        contextStr += `Framework: ${projectContext.framework}
`;
      }
      if (projectContext.diagnostics && projectContext.diagnostics.length > 0) {
        contextStr += `
Current Issues:
`;
        projectContext.diagnostics.forEach((d) => {
          contextStr += `- ${d.filePath}:${d.lineNumber} - ${d.message}
`;
        });
      }
      messages.push({
        role: "system",
        content: contextStr
      });
    }
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        });
      });
    }
    messages.push({
      role: "user",
      content: message
    });
    const response = await callOllamaChat(messages, model, 0.7);
    const fileChanges = extractFileChanges(response);
    return {
      content: response,
      fileChanges
    };
  } catch (error) {
    console.error("Error chatting with Ollama:", error);
    throw error;
  }
}

// server/services/aiService.ts
init_db();
init_db();
import { ObjectId as ObjectId3 } from "mongodb";
async function chatWithAIModel(request) {
  try {
    console.log("chatWithAIModel called with request:", request);
    const { message, model, chatHistory, projectContext, image } = request;
    if (!message) {
      throw new Error("Message is required for chat");
    }
    let content;
    let fileChanges = [];
    let fullMessage = message;
    if (projectContext && Array.isArray(projectContext.diagnostics) && projectContext.diagnostics.length > 0) {
      const diagnosticsString = projectContext.diagnostics.map(
        (d) => `File: ${d.filePath}, Line: ${d.lineNumber}, Column: ${d.columnNumber}, Severity: ${d.severity}, Message: ${d.message}`
      ).join("\n");
      fullMessage = `The user has provided the following request: "${message}".

Additionally, there are current diagnostics (errors/warnings) in the project that might need attention:
${diagnosticsString}

Please address these in your response and provide any necessary file changes.`;
    }
    const useOllama = process.env.USE_OLLAMA === "true" || await checkOllamaAvailability();
    if (useOllama) {
      console.log(`Routing ${model} to Ollama for chat`);
      try {
        const ollamaChatResult = await chatWithOllama(fullMessage, chatHistory, projectContext, model);
        content = ollamaChatResult.content;
        fileChanges = ollamaChatResult.fileChanges || [];
      } catch (ollamaError) {
        console.warn("Ollama failed, falling back to Gemini:", ollamaError);
        const geminiChatResult = await chatWithGemini(fullMessage, chatHistory, projectContext, image);
        content = geminiChatResult.content;
        fileChanges = geminiChatResult.fileChanges || [];
      }
    } else {
      switch (model) {
        case "together": {
          try {
            const { chatWithTogether: chatWithTogether2 } = await Promise.resolve().then(() => (init_together(), together_exports));
            const togetherChatResult = await chatWithTogether2(fullMessage, chatHistory, projectContext);
            content = togetherChatResult.content;
            fileChanges = togetherChatResult.fileChanges || [];
          } catch (e) {
            console.warn("Together AI not available, falling back to Gemini for chat.");
            const geminiChatResult2 = await chatWithGemini(fullMessage, chatHistory, projectContext, image);
            content = geminiChatResult2.content;
            fileChanges = geminiChatResult2.fileChanges || [];
          }
          break;
        }
        case "gemini":
          const geminiChatResult = await chatWithGemini(fullMessage, chatHistory, projectContext, image);
          content = geminiChatResult.content;
          fileChanges = geminiChatResult.fileChanges || [];
          break;
        case "chatgpt":
        case "claude":
        case "deepseek":
          const routedGeminiChat = await chatWithGemini(fullMessage, chatHistory, projectContext);
          content = routedGeminiChat.content;
          fileChanges = routedGeminiChat.fileChanges || [];
          break;
        default:
          throw new Error(`Unsupported AI model: ${model}`);
      }
    }
    console.log("Chat response generated:", { content: content.substring(0, 100) + "..." });
    return {
      content,
      model,
      timestamp: /* @__PURE__ */ new Date(),
      fileChanges
      // Include fileChanges in the response
    };
  } catch (error) {
    console.error("Error in chatWithAIModel:", error);
    throw error;
  }
}

// server/routes/ide.ts
var router2 = Router2();
router2.post("/execute", async (req, res) => {
  try {
    const { code, language, filename, input } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }
    const result = await sandboxExecutor.executeCode(code, language, filename, input);
    res.json({
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: error.message || "Execution failed" });
  }
});
router2.post("/ai/chat", async (req, res) => {
  try {
    console.log("=== IDE AI Chat Request ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    const { messages, model, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages:", messages);
      return res.status(400).json({ error: "Messages array is required" });
    }
    const lastMessage = messages[messages.length - 1];
    console.log("Last message:", lastMessage);
    const chatHistory = messages.slice(0, -1);
    console.log("Chat history length:", chatHistory.length);
    console.log("Using model:", model || "together");
    console.log("Calling chatWithAIModel...");
    const result = await chatWithAIModel({
      message: lastMessage.content,
      model: model || "together",
      // Default to together (free tier)
      chatHistory,
      projectContext: context ? { currentFile: context } : void 0
    });
    console.log("Got response from AI, length:", result.content?.length || 0);
    res.json({ response: result.content, fileChanges: result.fileChanges });
  } catch (error) {
    console.error("=== AI chat error ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: error.message || "AI request failed" });
  }
});
router2.post("/files/create", async (req, res) => {
  try {
    const { projectId, path: path3, type, content } = req.body;
    res.json({ success: true, id: Date.now().toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.put("/files/update", async (req, res) => {
  try {
    const { fileId, content } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.delete("/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.get("/projects/:id/info", async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, projectId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.get("/sandbox/status", async (req, res) => {
  try {
    res.json({
      available: true,
      message: "Sandbox is ready",
      note: "Docker availability check disabled to prevent timeouts"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.get("/models", async (req, res) => {
  try {
    const userModels = ["gemini-pro"];
    res.json({
      purchased: userModels,
      available: [
        { id: "gemini-pro", name: "Gemini Pro", provider: "Google", price: 0 },
        { id: "gpt-4", name: "GPT-4", provider: "OpenAI", price: 20 },
        { id: "claude-3", name: "Claude 3", provider: "Anthropic", price: 20 },
        { id: "grok-beta", name: "Grok Beta", provider: "xAI", price: 15 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router2.post("/models/purchase", async (req, res) => {
  try {
    const { modelId } = req.body;
    res.json({ success: true, message: "Model purchased successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var ide_default = router2;

// server/routes/llm.ts
init_storage();
import { Router as Router3 } from "express";
var router3 = Router3();
var availableModels = [
  {
    id: "together",
    name: "Together AI",
    description: "Free tier model by Gemini",
    price: 0,
    tokensPerMonth: 1e4,
    features: ["Code Generation", "Debugging", "Refactoring", "Documentation", "Code Review"],
    free: true
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google's multimodal AI model",
    price: 749,
    tokensPerMonth: 5e4,
    features: ["Code Generation", "Image Analysis", "Reasoning", "Documentation", "Testing"]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "OpenAI's powerful language model",
    price: 1499,
    tokensPerMonth: 1e5,
    features: ["Natural Language", "Code Completion", "Problem Solving", "Explanation", "Debugging"]
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's helpful AI assistant",
    price: 1299,
    tokensPerMonth: 1e5,
    features: ["Long Context", "Code Understanding", "Documentation", "Explanation", "Reasoning"]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek's advanced AI model",
    price: 1125,
    tokensPerMonth: 5e4,
    features: ["Code Generation", "Debugging", "Optimization", "Documentation", "Architecture Design"]
  }
];
router3.get("/models", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUser(userId);
    const purchasedModels = user?.purchasedModels || [];
    const usage = user?.usage || {
      totalTokens: 0,
      totalCost: 0,
      lastReset: /* @__PURE__ */ new Date(),
      together: 0,
      gemini: 0,
      chatgpt: 0,
      claude: 0,
      deepseek: 0
    };
    const modelsWithStatus = availableModels.map((model) => {
      const purchased = purchasedModels.find((pm) => pm.id === model.id);
      if (purchased) {
        const purchaseDate = new Date(purchased.purchaseDate);
        const expirationDate = new Date(purchaseDate);
        expirationDate.setMonth(expirationDate.getMonth() + purchased.months);
        const usageForModel2 = usage[model.id] || 0;
        return {
          ...model,
          purchased: true,
          purchaseDate: purchased.purchaseDate,
          expirationDate: expirationDate.toISOString(),
          tokensUsed: usageForModel2,
          tokensRemaining: model.tokensPerMonth - usageForModel2,
          expired: expirationDate < /* @__PURE__ */ new Date()
        };
      }
      const usageForModel = usage[model.id] || 0;
      return {
        ...model,
        purchased: model.free || false,
        tokensUsed: model.free ? usageForModel : 0,
        tokensRemaining: model.free ? model.tokensPerMonth - usageForModel : 0
      };
    });
    res.json({
      models: modelsWithStatus,
      usage: {
        totalTokens: usage.totalTokens,
        totalCost: usage.totalCost,
        lastReset: usage.lastReset,
        byModel: {
          together: usage.together || 0,
          gemini: usage.gemini || 0,
          chatgpt: usage.chatgpt || 0,
          claude: usage.claude || 0,
          deepseek: usage.deepseek || 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/models/purchase", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { modelId, months, paymentMethod, paymentDetails } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!modelId || !months || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const model = availableModels.find((m) => m.id === modelId);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    if (model.free) {
      return res.status(400).json({ error: "Cannot purchase free model" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const purchasedModel = {
      id: modelId,
      purchaseDate: (/* @__PURE__ */ new Date()).toISOString(),
      paymentMethod,
      paymentDetails,
      months
    };
    const existingModels = user.purchasedModels || [];
    const updatedModels = [...existingModels, purchasedModel];
    await storage2.updateUser(userId, {
      purchasedModels: updatedModels,
      usage: user.usage || {
        totalTokens: 0,
        totalCost: 0,
        lastReset: /* @__PURE__ */ new Date(),
        [modelId]: 0
      }
    });
    res.json({
      success: true,
      message: `Successfully purchased ${model.name} for ${months} month(s)`,
      model: {
        ...model,
        purchased: true,
        purchaseDate: purchasedModel.purchaseDate,
        expirationDate: new Date(new Date(purchasedModel.purchaseDate).setMonth(new Date(purchasedModel.purchaseDate).getMonth() + months)).toISOString()
      }
    });
  } catch (error) {
    console.error("Error purchasing model:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/usage/track", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { modelId, tokens, cost } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!modelId || typeof tokens !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentUsage = user.usage || {
      totalTokens: 0,
      totalCost: 0,
      lastReset: /* @__PURE__ */ new Date()
    };
    const updatedUsage = {
      ...currentUsage,
      totalTokens: (currentUsage.totalTokens || 0) + tokens,
      totalCost: (currentUsage.totalCost || 0) + (cost || 0),
      [modelId]: (currentUsage[modelId] || 0) + tokens,
      lastReset: /* @__PURE__ */ new Date()
    };
    await storage2.updateUser(userId, { usage: updatedUsage });
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking usage:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.get("/models/:modelId/check", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { modelId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const model = availableModels.find((m) => m.id === modelId);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    if (model.free) {
      return res.json({ canUse: true, reason: "free" });
    }
    const storage2 = await getStorage();
    const user = await storage2.getUser(userId);
    if (!user?.purchasedModels) {
      return res.json({ canUse: false, reason: "not_purchased" });
    }
    const purchased = user.purchasedModels.find((pm) => pm.id === modelId);
    if (!purchased) {
      return res.json({ canUse: false, reason: "not_purchased" });
    }
    const purchaseDate = new Date(purchased.purchaseDate);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setMonth(expirationDate.getMonth() + purchased.months);
    if (expirationDate < /* @__PURE__ */ new Date()) {
      return res.json({ canUse: false, reason: "expired", expirationDate: expirationDate.toISOString() });
    }
    const usage = user.usage || {};
    const tokensUsed = usage[modelId] || 0;
    if (tokensUsed >= model.tokensPerMonth) {
      return res.json({ canUse: false, reason: "quota_exceeded", tokensUsed, tokensLimit: model.tokensPerMonth });
    }
    res.json({
      canUse: true,
      tokensUsed,
      tokensRemaining: model.tokensPerMonth - tokensUsed,
      expirationDate: expirationDate.toISOString()
    });
  } catch (error) {
    console.error("Error checking model access:", error);
    res.status(500).json({ error: error.message });
  }
});
router3.post("/usage/reset", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json({ success: true, message: "Monthly usage reset endpoint - implement batch update if needed" });
  } catch (error) {
    console.error("Error resetting usage:", error);
    res.status(500).json({ error: error.message });
  }
});
var llm_default = router3;

// server/routes/research.ts
import { Router as Router4 } from "express";

// server/services/research.ts
async function analyzeProjectIdea(idea, model = "together") {
  const researchPrompt = `You are an expert software architect and technology consultant. Analyze the following project idea and provide comprehensive research:

PROJECT IDEA:
${idea}

Provide a detailed analysis in the following JSON format:
{
  "overview": "A comprehensive 2-3 sentence overview of the project",
  "keyFeatures": ["feature1", "feature2", ...] (5-8 key features),
  "techStack": ["tech1", "tech2", ...] (recommended technologies),
  "architecture": "Detailed architecture description with layers and components",
  "bestPractices": ["practice1", "practice2", ...] (5-7 best practices),
  "challenges": ["challenge1", "challenge2", ...] (3-5 potential challenges),
  "recommendations": ["rec1", "rec2", ...] (3-5 AI recommendations),
  "estimatedComplexity": "Simple" | "Medium" | "Complex",
  "estimatedTime": "estimated development time (e.g., '2-3 weeks')"
}

Be specific, practical, and focus on modern best practices. Ensure all arrays have meaningful, detailed items.`;
  try {
    const response = await chatWithAIModel({
      message: researchPrompt,
      model,
      chatHistory: [],
      projectContext: {}
    });
    let parsedResult;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      parsedResult = {
        overview: response.content.substring(0, 300),
        keyFeatures: ["Feature extraction from AI response"],
        techStack: ["React", "Node.js", "MongoDB"],
        architecture: "Standard three-tier architecture",
        bestPractices: ["Follow SOLID principles", "Write tests", "Use version control"],
        challenges: ["Scalability", "Security", "Performance"],
        recommendations: ["Start with MVP", "Iterate based on feedback"],
        estimatedComplexity: "Medium",
        estimatedTime: "4-6 weeks"
      };
    }
    const devmindxPrompt = generateDevMindXPrompt(idea, parsedResult);
    return {
      ...parsedResult,
      devmindxPrompt
    };
  } catch (error) {
    console.error("Research analysis error:", error);
    throw new Error("Failed to analyze project idea");
  }
}
function generateDevMindXPrompt(idea, analysis) {
  return `Create a ${analysis.estimatedComplexity.toLowerCase()} complexity project: ${idea}

TECHNICAL REQUIREMENTS:
- Tech Stack: ${analysis.techStack.join(", ")}
- Architecture: ${analysis.architecture}

KEY FEATURES TO IMPLEMENT:
${analysis.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

BEST PRACTICES TO FOLLOW:
${analysis.bestPractices.map((p, i) => `${i + 1}. ${p}`).join("\n")}

IMPLEMENTATION GUIDELINES:
- Follow modern development standards
- Include proper error handling
- Add comprehensive comments
- Ensure code is production-ready
- Implement responsive design
- Add security measures

Please generate a complete, working project with all necessary files, configurations, and documentation.`;
}

// server/routes/research.ts
var router4 = Router4();
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const { verifyToken: verifyToken2 } = (init_auth(), __toCommonJS(auth_exports));
    const decoded = verifyToken2(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
router4.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return res.status(400).json({
        message: "Project idea is required"
      });
    }
    if (idea.length > 2e3) {
      return res.status(400).json({
        message: "Project idea is too long (max 2000 characters)"
      });
    }
    const model = req.body.model || "together";
    console.log(`Analyzing project idea for user ${req.user.id}...`);
    const result = await analyzeProjectIdea(idea, model);
    res.json(result);
  } catch (error) {
    console.error("Research analysis error:", error);
    res.status(500).json({
      message: "Failed to analyze project idea",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/history", authenticateToken, async (_req, res) => {
  try {
    res.json({
      message: "Research history feature coming soon",
      history: []
    });
  } catch (error) {
    console.error("Get research history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
var research_default = router4;

// server/routes.ts
function registerRoutes(app2) {
  app2.use("/api/auth", auth_default);
  app2.use("/api/ide", ide_default);
  app2.use("/api/llm", llm_default);
  app2.use("/api/research", research_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
function frontIndexPath() {
  return path2.resolve(process.cwd(), "..", "front", "index.html");
}
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    configFile: path2.resolve(process.cwd(), "vite.config.ts"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        console.error("Vite error:", msg);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await fs2.promises.readFile(frontIndexPath(), "utf-8");
      template = template.replace(
        /\.\/src\/index\.tsx/,
        `/src/index.tsx?v=${nanoid()}`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(process.cwd(), "dist/public");
  if (!fs2.existsSync(distPath)) {
    console.log("No client build found - running as backend-only server");
    app2.use("*", (_req, res) => {
      res.status(200).json({
        message: "DevMindX Backend API",
        status: "running",
        endpoints: {
          api: "/api/*",
          auth: "/api/auth/*",
          health: "/api/health"
        }
      });
    });
    return;
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/realtime/socket.ts
init_auth();
import { Server as SocketIOServer } from "socket.io";
var sessions = /* @__PURE__ */ new Map();
var userColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];
var colorIndex = 0;
function getNextColor() {
  const color = userColors[colorIndex % userColors.length];
  colorIndex++;
  return color;
}
function setupSocketIO(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
  const defaultOrigins = ["http://localhost:5173", "http://localhost:5000"];
  const origins = [.../* @__PURE__ */ new Set([...defaultOrigins, ...allowedOrigins])].filter(Boolean);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: origins,
      credentials: true,
      methods: ["GET", "POST"]
    },
    pingTimeout: 6e4,
    pingInterval: 25e3,
    transports: ["websocket", "polling"]
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      const decoded = verifyToken(token);
      socket.data.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.username} (${socket.id})`);
    socket.on("join-session", async (sessionId) => {
      try {
        let session = sessions.get(sessionId);
        if (!session) {
          session = {
            id: sessionId,
            name: `Session ${sessionId}`,
            hostId: socket.data.user.id,
            users: /* @__PURE__ */ new Map(),
            files: /* @__PURE__ */ new Map(),
            createdAt: /* @__PURE__ */ new Date(),
            lastActivity: /* @__PURE__ */ new Date()
          };
          sessions.set(sessionId, session);
        }
        const user = {
          id: socket.data.user.id,
          socketId: socket.id,
          username: socket.data.user.username,
          email: socket.data.user.email,
          color: getNextColor(),
          cursor: { line: 1, column: 1, file: "" },
          currentFile: "",
          isOnline: true,
          lastActivity: /* @__PURE__ */ new Date()
        };
        session.users.set(socket.data.user.id, user);
        socket.join(sessionId);
        socket.data.sessionId = sessionId;
        socket.emit("session-state", {
          sessionId: session.id,
          users: Array.from(session.users.values()),
          files: Object.fromEntries(session.files)
        });
        socket.to(sessionId).emit("user-joined", {
          user: {
            id: user.id,
            username: user.username,
            color: user.color,
            cursor: user.cursor
          }
        });
        console.log(`User ${user.username} joined session ${sessionId}`);
      } catch (error) {
        console.error("Error joining session:", error);
        socket.emit("error", { message: "Failed to join session" });
      }
    });
    socket.on("leave-session", () => {
      handleUserLeave(socket);
    });
    socket.on("cursor-move", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      const user = session.users.get(socket.data.user.id);
      if (user) {
        user.cursor = data;
        user.lastActivity = /* @__PURE__ */ new Date();
        socket.to(sessionId).emit("cursor-update", {
          userId: user.id,
          username: user.username,
          color: user.color,
          cursor: data
        });
      }
    });
    socket.on("code-change", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      session.files.set(data.file, data.content);
      session.lastActivity = /* @__PURE__ */ new Date();
      socket.to(sessionId).emit("code-update", {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        file: data.file,
        content: data.content,
        changes: data.changes
      });
    });
    socket.on("chat-message", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) {
        console.log("No sessionId for chat message");
        return;
      }
      const session = sessions.get(sessionId);
      if (!session) {
        console.log("Session not found:", sessionId);
        return;
      }
      const user = session.users.get(socket.data.user.id);
      if (!user) {
        console.log("User not found in session:", socket.data.user.id);
        return;
      }
      const chatMessage = {
        id: `${Date.now()}-${socket.id}`,
        userId: user.id,
        username: user.username,
        color: user.color,
        message: data.message,
        timestamp: /* @__PURE__ */ new Date()
      };
      console.log(`Broadcasting chat message from ${user.username} to session ${sessionId}`);
      io.to(sessionId).emit("chat-message", chatMessage);
      socket.emit("chat-message", chatMessage);
    });
    socket.on("file-open", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      const user = session.users.get(socket.data.user.id);
      if (user) {
        user.currentFile = data.file;
        user.lastActivity = /* @__PURE__ */ new Date();
        socket.to(sessionId).emit("user-file-change", {
          userId: user.id,
          username: user.username,
          file: data.file
        });
      }
    });
    socket.on("file-tree-update", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      console.log(`File tree update from ${socket.data.user.username}: ${data.action}`);
      socket.to(sessionId).emit("file-tree-update", {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        action: data.action,
        node: data.node,
        parentId: data.parentId
      });
    });
    socket.on("file-tree-delete", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      console.log(`File tree delete from ${socket.data.user.username}: ${data.nodeId}`);
      socket.to(sessionId).emit("file-tree-delete", {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        nodeId: data.nodeId
      });
    });
    socket.on("whiteboard-update", (data) => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      socket.to(sessionId).emit("whiteboard-update", {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        data: data.data
      });
    });
    socket.on("typing-start", () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      socket.to(sessionId).emit("user-typing", {
        userId: socket.data.user.id,
        username: socket.data.user.username
      });
    });
    socket.on("typing-stop", () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      socket.to(sessionId).emit("user-stopped-typing", {
        userId: socket.data.user.id
      });
    });
    socket.on("join-video-call", (data) => {
      const sessionId = data.sessionId;
      if (!sessionId) return;
      console.log(`${data.username} joined video call in session ${sessionId}`);
      socket.to(sessionId).emit("participant-joined-call", {
        userId: data.userId,
        username: data.username,
        color: data.color
      });
    });
    socket.on("leave-video-call", (data) => {
      const sessionId = data.sessionId;
      if (!sessionId) return;
      console.log(`User ${data.userId} left video call in session ${sessionId}`);
      socket.to(sessionId).emit("participant-left-call", {
        userId: data.userId
      });
    });
    socket.on("video-offer", (data) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;
      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit("video-offer", {
          senderId: socket.data.user.id,
          senderName: socket.data.user.username,
          offer: data.offer
        });
      }
    });
    socket.on("video-answer", (data) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;
      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit("video-answer", {
          senderId: socket.data.user.id,
          answer: data.answer
        });
      }
    });
    socket.on("ice-candidate", (data) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;
      const targetUser = session.users.get(data.targetId);
      if (targetUser) {
        io.to(targetUser.socketId).emit("ice-candidate", {
          senderId: socket.data.user.id,
          candidate: data.candidate
        });
      }
    });
    socket.on("screen-share-started", (data) => {
      socket.to(data.sessionId).emit("screen-share-started", {
        userId: socket.data.user.id,
        username: socket.data.user.username
      });
    });
    socket.on("screen-share-stopped", (data) => {
      socket.to(data.sessionId).emit("screen-share-stopped", {
        userId: socket.data.user.id
      });
    });
    socket.on("toggle-audio", (data) => {
      socket.to(data.sessionId).emit("participant-audio-toggled", {
        userId: socket.data.user.id,
        isEnabled: data.isEnabled
      });
    });
    socket.on("toggle-video", (data) => {
      socket.to(data.sessionId).emit("participant-video-toggled", {
        userId: socket.data.user.id,
        isEnabled: data.isEnabled
      });
    });
    socket.on("end-meeting", (data) => {
      const session = sessions.get(data.sessionId);
      if (!session) return;
      if (session.hostId === socket.data.user.id) {
        io.to(data.sessionId).emit("meeting-ended", {
          endedBy: socket.data.user.username,
          endTime: /* @__PURE__ */ new Date()
        });
        console.log(`Meeting ended in session ${data.sessionId} by host ${socket.data.user.username}`);
      }
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user?.username} (${socket.id})`);
      handleUserLeave(socket);
    });
  });
  setInterval(() => {
    const now = /* @__PURE__ */ new Date();
    for (const [sessionId, session] of sessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      if (inactiveTime > 60 * 60 * 1e3) {
        sessions.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }, 5 * 60 * 1e3);
  return io;
}
function handleUserLeave(socket) {
  const sessionId = socket.data.sessionId;
  if (!sessionId) return;
  const session = sessions.get(sessionId);
  if (!session) return;
  const user = session.users.get(socket.data.user.id);
  if (user) {
    session.users.delete(socket.data.user.id);
    socket.leave(sessionId);
    socket.to(sessionId).emit("user-left", {
      userId: user.id,
      username: user.username
    });
    console.log(`User ${user.username} left session ${sessionId}`);
    if (session.users.size === 0) {
      sessions.delete(sessionId);
      console.log(`Session ${sessionId} deleted (no users)`);
    }
  }
}

// server/index.ts
init_db();

// server/models/chatHistory.ts
var chatHistorySchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "messages"],
      properties: {
        userId: {
          bsonType: ["string", "int"],
          description: "User ID is required"
        },
        messages: {
          bsonType: "array",
          description: "Array of chat messages",
          items: {
            bsonType: "object",
            required: ["id", "role", "content", "createdAt"],
            properties: {
              id: {
                bsonType: "string",
                description: "Unique ID for the message"
              },
              role: {
                enum: ["user", "assistant"],
                description: "Role must be either user or assistant"
              },
              content: {
                bsonType: "string",
                description: "Message content"
              },
              createdAt: {
                bsonType: "date",
                description: "Timestamp when the message was created"
              }
            }
          }
        },
        createdAt: {
          bsonType: "date",
          description: "Timestamp when the chat history was created"
        },
        updatedAt: {
          bsonType: "date",
          description: "Timestamp when the chat history was last updated"
        }
      }
    }
  }
};
async function ensureChatHistoryCollection(db2) {
  const collections = await db2.listCollections({ name: "chatHistory" }).toArray();
  if (collections.length === 0) {
    await db2.createCollection("chatHistory", chatHistorySchema);
    await db2.collection("chatHistory").createIndex({ userId: 1 }, { unique: true });
    console.log("Chat history collection created with validation schema");
  } else {
    console.log("Chat history collection already exists");
  }
}

// server/index.ts
registerPassportStrategies();
var app = express2();
var isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  app.set("trust proxy", 1);
}
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "https://devmindx.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5000"
  ];
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (isProduction) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }
  next();
});
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use(passport3.initialize());
if (isProduction) {
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const httpServer = createServer2(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
  const io = setupSocketIO(httpServer);
  console.log("Socket.IO collaboration server initialized");
  connectToMongoDB().then(async (db2) => {
    if (db2) {
      await ensureChatHistoryCollection(db2);
      console.log("\u2705 MongoDB collections initialized");
    }
  }).catch((err) => {
    console.error("\u26A0\uFE0F  MongoDB connection failed, but server is still running:", err.message);
    console.error("Some features requiring MongoDB will not be available.");
  });
  const devApiOnly = process.env.DEV_API_ONLY === "1" || process.env.DEV_API_ONLY === "true";
  if (app.get("env") === "development") {
    if (!devApiOnly) {
      await setupVite(app, httpServer);
    }
  } else {
    serveStatic(app);
  }
})();
