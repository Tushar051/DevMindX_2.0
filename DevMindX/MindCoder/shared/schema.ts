import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { PurchasedModel } from "../shared/types.js";

export const users = pgTable("users", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  framework: text("framework").notNull(),
  userId: integer("user_id").references(() => users.id),
  files: jsonb("files").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  framework: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  projectId: true,
  messages: true,
});

// Explicitly define InsertChatSession to use string IDs
export interface InsertChatSession {
  projectId?: string | null;
  messages?: any[];
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string | null;
  isVerified?: boolean;
  verificationToken?: string | null;
  otp?: string | null;
  otpExpiry?: Date | null;
  googleId?: string | null;
  githubId?: string | null;
  createdAt?: Date;
  purchasedModels?: PurchasedModel[] | null;
  usage?: {
    totalTokens: number;
    totalCost: number;
    lastReset: Date;
    [key: string]: number | Date; // Allow for dynamic AI model token usage, and also for lastReset
  } | null;
  metadata?: any; // For Supabase storage - stores additional user data
}
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = { 
  id: string; 
  name: string; 
  description?: string | null; 
  framework?: string | null; 
  userId?: string; 
  files: any; 
  createdAt?: Date; 
  updatedAt?: Date; 
};
export interface ChatSession {
  id: string;
  userId: string | null;
  projectId: string | null;
  messages: any[];
  createdAt?: Date;
}
