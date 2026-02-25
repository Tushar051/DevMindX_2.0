import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, insertProjectSchema } from "../shared/schema.js";
import { generateToken, hashPassword, authenticateUser, generateVerificationToken, verifyToken, generateOTP, getOTPExpiry } from "./services/auth.js";
import { sendVerificationEmail, sendOTPVerificationEmail } from "./services/email.js";

import { createMongoIdFilter } from './db.js';

import { generateProjectWithAI, generateCodeWithAI, chatWithAIModel, analyzeCodeWithAI, getAvailableModels } from "./services/aiService.js";
import { listGeminiModels } from './services/gemini.js';
import { registerResearchRoutes } from './routes/research.js';
import ideRoutes from './routes/ide.js';
import { AIModelId as AIModel, FileChange, Diagnostic } from '../shared/types.js'; // Import FileChange, Diagnostic
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { User } from '../shared/schema.js';
import { connectToMongoDB } from './db.js';
import { ObjectId } from 'mongodb';
import { spawn, exec } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, promises as fs, createReadStream } from 'fs'; // Import promises as fs
import path, { join, dirname } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, IStorage } from './storage.js';
import { createSession, getSession } from './realtime/collab.js';
import { CollaborationService } from './services/collaboration.js';
import { nanoid } from 'nanoid';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

// Determine __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add this interface definition near the top of the file, after the other interfaces
interface UserCreate {
  username: string;
  email: string;
  password: string | null;
  googleId?: string;
  githubId?: string;
  isVerified?: boolean;
  otp?: string;
  otpExpiry?: Date;
  verificationToken?: string;
}

// Also add the GitHubUserCreate interface since it's used in the GitHub strategy
interface GitHubUserCreate {
  username: string;
  email: string;
  password: null;
  githubId: string;
  isVerified: boolean;
}

// Terminal session management
interface TerminalSession {
  id: string;
  userId: string;
  workingDirectory: string;
  process: any;
  inputQueue: string[];
  outputBuffer: string[];
  isActive: boolean;
  createdAt: Date;
}

// Define proper types for collaboration
interface Participant {
  userId: string;
  username?: string;
  email?: string;
  joinedAt?: Date;
  isOnline?: boolean;
  lastActivity?: Date;
  color?: string;
}

interface CollaborationSessionDB {
  _id?: ObjectId;
  sessionId: string;
  createdBy: string;
  createdAt: Date;
  participants: Participant[];
  isActive?: boolean;
  sessionName?: string;
  hostUserId?: string;
  hostUsername?: string;
}

interface AuthenticatedRequest {
  user: {
    id: string;
    username?: string;
    email?: string;
  };
  params: {
    sessionId: string;
  };
}

const terminalSessions = new Map<string, TerminalSession>();

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Health check endpoint - must be first
  app.get('/api/health', async (req, res) => {
    try {
      const db = await connectToMongoDB();
      await db.command({ ping: 1 });
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: 'connected',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        mongodb: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'devmindx-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Register Research Engine routes
  registerResearchRoutes(app);
  
  // Register IDE routes
  app.use('/api', ideRoutes);
  
  // Register LLM routes
  const llmRoutes = (await import('./routes/llm.js')).default;
  app.use('/api/llm', llmRoutes);

  // Passport configuration
  passport.serializeUser((user: any, done) => {
    done(null, user.id || user._id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      const storage = await getStorage(); // Use getStorage() here since req is not directly available
      let user = await storage.getUser(id);
      if (!user && typeof id === 'string' && id.length === 24) {
        const db = await connectToMongoDB();
        const mongoUser = await db.collection<MongoUser>('users').findOne({ _id: createMongoIdFilter(id) });
        if (mongoUser) {
          user = {
            id: mongoUser._id.toString(),
            username: mongoUser.username,
            email: mongoUser.email,
            password: mongoUser.password,
            isVerified: mongoUser.isVerified,
            verificationToken: mongoUser.verificationToken,
            otp: mongoUser.otp,
            otpExpiry: mongoUser.otpExpiry,
            googleId: mongoUser.googleId,
            githubId: mongoUser.githubId,
            createdAt: mongoUser.createdAt
          };
        }
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  interface MongoUser extends User {
    _id: ObjectId;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    passReqToCallback: true
  }, async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
      const storage = await getStorage(); // Use getStorage() here since req is not directly available
      let user = await storage.getUserByGoogleId(profile.id);
      if (!user) {
        user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        if (user) {
          if (!user.googleId) {
            await storage.updateUser(user.id, { googleId: profile.id, isVerified: true });
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          }
        } else {
          user = await storage.createUser({
            username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`,
            email: profile.emails?.[0]?.value || '',
            password: null,
            googleId: profile.id,
            isVerified: true
          } as UserCreate);
        }
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
  }, async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: User | null) => void) => {
    try {
      const storage = await getStorage(); // Use getStorage() here since req is not directly available
      let user = await storage.getUserByGithubId(profile.id);
      if (!user) {
        user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        if (user) {
          if (!user.githubId) {
            await storage.updateUser(user.id, { githubId: profile.id, isVerified: true });
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          }
        } else {
          user = await storage.createUser({
            username: profile.username || `user_${profile.id}`,
            email: profile.emails?.[0]?.value || '',
            password: null,
            githubId: profile.id,
            isVerified: true
          } as UserCreate);
        }
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = insertUserSchema.parse(req.body);

      const storage = await getStorage(); // Add this line

      // Check if user already exists by username
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already taken." });
      }

      // Create new user
      const newUser = await storage.createUser({ username, email, password });

      // Generate OTP for verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await storage.updateUser(newUser.id, { otp, otpExpiry });

      // Send OTP verification email
      await sendOTPVerificationEmail(newUser.email, otp);

      res.status(201).json({
        message: 'User registered. Please check your email for verification.',
        email: newUser.email
      });
    } catch (error: any) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authenticateUser(email, password);
      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      res.status(401).json({ message: errorMessage });
    }
  });

  // Collaboration REST endpoints
  const inviteCodeToSessionId = new Map<string, string>();

  app.post('/api/collab/create', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!token) return res.status(401).json({ message: 'Missing token' });
      const { verifyToken } = await import('./services/auth.js');
      const payload: any = verifyToken(token);

      const { sessionName } = req.body || {};
      const sessionId = nanoid(10);
      createSession(sessionId, payload.id, payload.username);

      const inviteCode = nanoid(6).toUpperCase();
      inviteCodeToSessionId.set(inviteCode, sessionId);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const joinLink = `${baseUrl}/#/collab/${sessionId}`;
      res.json({ sessionId, inviteCode, joinLink, sessionName: sessionName || null });
    } catch (err: any) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  app.post('/api/collab/join', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
      if (!token) return res.status(401).json({ message: 'Missing token' });
      const { verifyToken } = await import('./services/auth.js');
      const payload: any = verifyToken(token);

      const { code, sessionId } = req.body || {};
      let resolvedSessionId: string | undefined = sessionId;
      if (!resolvedSessionId && code) {
        resolvedSessionId = inviteCodeToSessionId.get(String(code).toUpperCase());
      }
      if (!resolvedSessionId) return res.status(404).json({ message: 'Session not found' });

      const session = getSession(resolvedSessionId);
      if (!session) return res.status(404).json({ message: 'Session not found' });

      // ensure session exists and user can proceed to connect via sockets
      res.json({ sessionId: resolvedSessionId });
    } catch (err: any) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  app.get('/api/collab/session/:id', async (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const participants = Array.from(session.participants.values());
    res.json({ sessionId: session.sessionId, hostUserId: session.hostUserId, participants });
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      const storage = await getStorage(); // Add this line
      const user = await storage.verifyUser(token as string);

      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error('Verify error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const storage = await getStorage(); // Add this line
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (!user.otp || user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

      await storage.updateUser(user.id, {
        isVerified: true,
        otp: null,
        otpExpiry: null
      });

      // Update local user object to reflect changes
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;

      const token = generateToken({
        ...user,
        id: user.id.toString(),
        password: user.password || '',
        isVerified: user.isVerified || false,
      });

      res.json({
        message: "Email verified successfully.",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const storage = await getStorage(); // Add this line
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      await storage.updateUser(Number(user.id), { otp, otpExpiry });

      await sendOTPVerificationEmail(email, otp);

      res.json({
        message: "Verification code sent successfully. Please check your email.",
        email: user.email
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });

  // OAuth routes
  app.get('/api/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/?error=oauth_not_configured&provider=google`);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
  });

  app.get('/api/auth/google/callback',
    (req, res, next) => {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/?error=oauth_not_configured&provider=google`);
      }
      passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=auth_failed` })(req, res, next);
    },
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, username: user.username, email: user.email }))}`);
    }
  );

  app.get('/api/auth/github', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/?error=oauth_not_configured&provider=github`);
    }
    passport.authenticate('github', { scope: ['user:email'] })(req, res);
  });

  app.get('/api/auth/github/callback',
    (req, res, next) => {
      if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/?error=oauth_not_configured&provider=github`);
      }
      passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=auth_failed` })(req, res, next);
    },
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, username: user.username, email: user.email }))}`);
    }
  );

  // Middleware to verify JWT token
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (process.env.NODE_ENV === 'development' && !token) {
      req.user = {
        id: 1,
        email: 'dev@example.com',
        isVerified: true
      };
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  };

  // Project routes
  app.get("/api/projects", authenticateToken, async (req: any, res) => {
    try {
      const storage = await getStorage(); // Add this line
      const projects = await storage.getUserProjects(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get demo projects - for testing without API calls
  app.get("/api/projects/demo/snake-game", authenticateToken, async (req: any, res) => {
    try {
      const module = await import('./demo-projects/snake-game.js');
      const { snakeGameProject } = module;
      res.json({
        ...snakeGameProject,
        id: 'demo-snake-game',
        userId: req.user.id,
        createdAt: new Date(),
        isDemo: true
      });
    } catch (error) {
      console.error('Get demo snake game error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  app.get("/api/projects/demo/ecommerce", authenticateToken, async (req: any, res) => {
    try {
      const module = await import('./demo-projects/ecommerce-simple.js');
      const { ecommerceSimpleProject } = module;
      res.json({
        ...ecommerceSimpleProject,
        id: 'demo-ecommerce',
        userId: req.user.id,
        createdAt: new Date(),
        isDemo: true
      });
    } catch (error) {
      console.error('Get demo ecommerce error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  app.get("/api/projects/demo/social-app", authenticateToken, async (req: any, res) => {
    try {
      const module = await import('./demo-projects/social-simple.js');
      const { socialSimpleProject } = module;
      res.json({
        ...socialSimpleProject,
        id: 'demo-social-app',
        userId: req.user.id,
        createdAt: new Date(),
        isDemo: true
      });
    } catch (error) {
      console.error('Get demo social app error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  app.get("/api/projects/demo/todo-app", authenticateToken, async (req: any, res) => {
    try {
      const module = await import('./demo-projects/todo-app.js');
      const { todoAppProject } = module;
      res.json({
        ...todoAppProject,
        id: 'demo-todo-app',
        userId: req.user.id,
        createdAt: new Date(),
        isDemo: true
      });
    } catch (error) {
      console.error('Get demo todo app error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  app.get("/api/projects/demo/weather-dashboard", authenticateToken, async (req: any, res) => {
    try {
      const module = await import('./demo-projects/weather-dashboard.js');
      const { weatherDashboardProject } = module;
      res.json({
        ...weatherDashboardProject,
        id: 'demo-weather-dashboard',
        userId: req.user.id,
        createdAt: new Date(),
        isDemo: true
      });
    } catch (error) {
      console.error('Get demo weather dashboard error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  // Get all demo projects list
  app.get("/api/projects/demo", authenticateToken, async (req: any, res) => {
    try {
      const demoProjects = [
        {
          id: 'demo-snake-game',
          name: 'Classic Snake Game',
          description: 'A classic snake game built with HTML5 Canvas and JavaScript',
          framework: 'web',
          isDemo: true
        },
        {
          id: 'demo-ecommerce',
          name: 'Modern E-commerce Store',
          description: 'A modern, responsive e-commerce store with product catalog',
          framework: 'web',
          isDemo: true
        },
        {
          id: 'demo-social-app',
          name: 'SocialHub - Social Media Platform',
          description: 'A modern social media platform with posts and user profiles',
          framework: 'web',
          isDemo: true
        },
        {
          id: 'demo-todo-app',
          name: 'TaskMaster - Todo Application',
          description: 'A full-featured task management app with categories and priorities',
          framework: 'web',
          isDemo: true
        },
        {
          id: 'demo-weather-dashboard',
          name: 'WeatherNow - Weather Dashboard',
          description: 'An interactive weather dashboard with forecasts and animations',
          framework: 'web',
          isDemo: true
        }
      ];
      res.json(demoProjects);
    } catch (error) {
      console.error('Get demo projects list error:', error);
      res.status(500).json({ message: 'Failed to get demo projects' });
    }
  });

  // Chat history routes
  app.get("/api/chat/history", authenticateToken, async (req: any, res: any) => {
    try {
      const db = await connectToMongoDB();
      const history = await db.collection("chatHistory").findOne({ userId: req.user.id });
      res.json({ messages: history?.messages || [] });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/chat/history", authenticateToken, async (req: any, res: any) => {
    try {
      const db = await connectToMongoDB();
      await db.collection("chatHistory").updateOne(
        { userId: req.user.id },
        { $set: { messages: [], updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/projects", authenticateToken, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const storage = await getStorage(); // Add this line
      const project = await storage.createProject({
        ...projectData,
        userId: req.user.id
      });
      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid project data';
      res.status(400).json({ message: errorMessage });
    }
  });

  // Fixed collaboration routes
  app.get("/api/collaboration/sessions/:sessionId", authenticateToken, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const db = await connectToMongoDB(); // Use direct MongoDB connection

      const session = await db.collection<CollaborationSessionDB>("collaborationSessions")
        .findOne({ _id: new ObjectId(sessionId) });

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Check if user is participant
      if (!session.participants.some((p: Participant) => p.userId === req.user.id)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/collaboration/sessions/:sessionId/messages", authenticateToken, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const db = await connectToMongoDB(); // Use direct MongoDB connection

      // Verify session exists and user is participant first
      const session = await db.collection<CollaborationSessionDB>("collaborationSessions")
        .findOne({ _id: new ObjectId(sessionId) });

      if (!session || !session.participants.some((p: Participant) => p.userId === req.user.id)) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get messages only if authorized
      const messages = await db.collection("collaborationMessages")
        .find({ sessionId: new ObjectId(sessionId) })
        .sort({ timestamp: 1 })
        .toArray();

      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Additional collaboration endpoints
  app.post("/api/collaboration/sessions", authenticateToken, async (req: any, res) => {
    try {
      const { sessionName, maxParticipants = 10 } = req.body;
      const db = await connectToMongoDB();

      const sessionId = new ObjectId();
      const session: CollaborationSessionDB = {
        _id: sessionId,
        sessionId: sessionId.toString(),
        createdBy: req.user.id,
        createdAt: new Date(),
        participants: [{
          userId: req.user.id,
          username: req.user.username,
          email: req.user.email,
          joinedAt: new Date(),
          isOnline: true,
          lastActivity: new Date()
        }],
        isActive: true,
        sessionName,
        hostUserId: req.user.id,
        hostUsername: req.user.username
      };

      await db.collection("collaborationSessions").insertOne(session);
      res.status(201).json(session);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/collaboration/sessions/:sessionId/join", authenticateToken, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const db = await connectToMongoDB();

      const session = await db.collection<CollaborationSessionDB>("collaborationSessions")
        .findOne({ _id: new ObjectId(sessionId) });

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!session.isActive) {
        return res.status(400).json({ message: "Session is not active" });
      }

      // Check if user is already a participant
      const isParticipant = session.participants.some((p: Participant) => p.userId === req.user.id);

      if (!isParticipant) {
        // Add user as participant
        const newParticipant: Participant = {
          userId: req.user.id,
          username: req.user.username,
          email: req.user.email,
          joinedAt: new Date(),
          isOnline: true,
          lastActivity: new Date()
        };

        await db.collection("collaborationSessions").updateOne(
          { _id: new ObjectId(sessionId) },
          { $push: { "participants": newParticipant } } as any
        );
      } else {
        // Update existing participant status
        await db.collection("collaborationSessions").updateOne(
          {
            _id: new ObjectId(sessionId),
            "participants.userId": req.user.id
          },
          {
            $set: {
              "participants.$.isOnline": true,
              "participants.$.lastActivity": new Date()
            }
          }
        );
      }

      // Return updated session
      const updatedSession = await db.collection<CollaborationSessionDB>("collaborationSessions")
        .findOne({ _id: new ObjectId(sessionId) });

      res.json(updatedSession);
    } catch (error) {
      console.error('Join session error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/collaboration/sessions/:sessionId/leave", authenticateToken, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const db = await connectToMongoDB();

      await db.collection("collaborationSessions").updateOne(
        {
          _id: new ObjectId(sessionId),
          "participants.userId": req.user.id
        },
        {
          $set: {
            "participants.$.isOnline": false,
            "participants.$.lastActivity": new Date()
          }
        }
      );

      res.json({ message: "Left session successfully" });
    } catch (error) {
      console.error('Leave session error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/collaboration/sessions/:sessionId", authenticateToken, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;

      // Add this check
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const db = await connectToMongoDB();

      const session = await db.collection<CollaborationSessionDB>("collaborationSessions")
        .findOne({ _id: new ObjectId(sessionId) });

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Only the creator can delete the session
      if (session.createdBy !== req.user.id) {
        return res.status(403).json({ message: "Only the session creator can delete it" });
      }

      // Mark session as inactive instead of deleting
      await db.collection("collaborationSessions").updateOne(
        { _id: new ObjectId(sessionId) },
        { $set: { isActive: false } }
      );

      res.json({ message: "Session ended successfully" });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Project generation with enhanced file structure
  app.post("/api/projects/generate", authenticateToken, async (req: any, res) => {
    try {
      const { name, framework, description, model = 'gemini', withPreview = true, useDemo = false } = req.body;
      const userId = req.user.id;
      const normalizedUserId = typeof userId === 'string' ? userId : String(userId);

      const storage = await getStorage();

      let generatedProject;
      
      // Check if demo project is requested (for testing without API calls)
      if (useDemo || description?.toLowerCase().includes('demo snake') || description?.toLowerCase().includes('snake game demo')) {
        console.log('Using hardcoded demo Snake Game project');
        try {
          const module = await import('./demo-projects/snake-game.js');
          generatedProject = module.snakeGameProject;
        } catch (importError) {
          console.error('Error importing snake game demo:', importError);
          return res.status(500).json({ 
            message: 'Failed to load demo project',
            error: String(importError)
          });
        }
      } else if (description?.toLowerCase().includes('demo ecommerce') || description?.toLowerCase().includes('demo e-commerce') || description?.toLowerCase().includes('demo shop')) {
        console.log('Using hardcoded demo E-commerce Store project (HTML+CSS only for preview)');
        try {
          const module = await import('./demo-projects/ecommerce-simple.js');
          generatedProject = module.ecommerceSimpleProject;
        } catch (importError) {
          console.error('Error importing ecommerce demo:', importError);
          return res.status(500).json({ 
            message: 'Failed to load demo project',
            error: String(importError)
          });
        }
      } else if (description?.toLowerCase().includes('demo social') || description?.toLowerCase().includes('social media demo') || description?.toLowerCase().includes('demo socialhub')) {
        console.log('Using hardcoded demo Social Media App project (HTML+CSS only for preview)');
        try {
          const module = await import('./demo-projects/social-simple.js');
          generatedProject = module.socialSimpleProject;
        } catch (importError) {
          console.error('Error importing social app demo:', importError);
          return res.status(500).json({ 
            message: 'Failed to load demo project',
            error: String(importError)
          });
        }
      } else if (description?.toLowerCase().includes('demo todo') || description?.toLowerCase().includes('todo app demo') || description?.toLowerCase().includes('demo taskmaster')) {
        console.log('Using hardcoded demo Todo App project');
        try {
          const module = await import('./demo-projects/todo-app.js');
          generatedProject = module.todoAppProject;
        } catch (importError) {
          console.error('Error importing todo app demo:', importError);
          return res.status(500).json({ 
            message: 'Failed to load demo project',
            error: String(importError)
          });
        }
      } else if (description?.toLowerCase().includes('demo weather') || description?.toLowerCase().includes('weather dashboard demo') || description?.toLowerCase().includes('demo weathernow')) {
        console.log('Using hardcoded demo Weather Dashboard project');
        try {
          const module = await import('./demo-projects/weather-dashboard.js');
          generatedProject = module.weatherDashboardProject;
        } catch (importError) {
          console.error('Error importing weather dashboard demo:', importError);
          return res.status(500).json({ 
            message: 'Failed to load demo project',
            error: String(importError)
          });
        }
      } else {
        try {
          generatedProject = await generateProjectWithAI({
            prompt: description,
            model,
            framework,
            name
          });
        } catch (aiError: any) {
          console.error('AI generation failed:', aiError);
          
          // Check if it's a rate limit error - use fallback demo project
          const errorMessage = aiError?.message || String(aiError);
          if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            console.log('API quota exceeded - using fallback demo project');
            
            // Select a demo project based on keywords in the description
            const desc = description?.toLowerCase() || '';
            let fallbackModule;
            let fallbackName = 'Snake Game';
            
            if (desc.includes('todo') || desc.includes('task')) {
              fallbackModule = await import('./demo-projects/todo-app.js');
              generatedProject = fallbackModule.todoAppProject;
              fallbackName = 'Todo App';
            } else if (desc.includes('weather') || desc.includes('dashboard')) {
              fallbackModule = await import('./demo-projects/weather-dashboard.js');
              generatedProject = fallbackModule.weatherDashboardProject;
              fallbackName = 'Weather Dashboard';
            } else if (desc.includes('shop') || desc.includes('store') || desc.includes('ecommerce') || desc.includes('e-commerce')) {
              fallbackModule = await import('./demo-projects/ecommerce-simple.js');
              generatedProject = fallbackModule.ecommerceSimpleProject;
              fallbackName = 'E-commerce Store';
            } else if (desc.includes('social') || desc.includes('feed') || desc.includes('post')) {
              fallbackModule = await import('./demo-projects/social-simple.js');
              generatedProject = fallbackModule.socialSimpleProject;
              fallbackName = 'Social Media App';
            } else {
              // Default to snake game
              fallbackModule = await import('./demo-projects/snake-game.js');
              generatedProject = fallbackModule.snakeGameProject;
              fallbackName = 'Snake Game';
            }
            
            console.log(`Using fallback demo project: ${fallbackName}`);
          } else {
            // Return error with helpful message for other errors
            return res.status(503).json({ 
              message: 'AI service is temporarily unavailable. Please try again in a moment.',
              error: errorMessage,
              suggestion: 'Try using a demo project by typing "demo snake", "demo todo", "demo weather", "demo ecommerce", or "demo social"'
            });
          }
        }
      }

      // Validate that we got files
      if (!generatedProject || !generatedProject.files || Object.keys(generatedProject.files).length === 0) {
        return res.status(500).json({ 
          message: 'Failed to generate project files',
          suggestion: 'Please try again with a more specific description.'
        });
      }

      // Create the project in the database
      const project = await storage.createProject({
        name: generatedProject.name || name,
        framework: generatedProject.framework || framework,
        description: generatedProject.description || description,
        userId: userId,
        files: generatedProject.files || {}
      });

      // Also store each file individually in the file storage system
      const files = generatedProject.files || {};
      for (const [filePath, fileContent] of Object.entries(files)) {
        const normalizedPath = `/workspace/${filePath.replace(/^\/+/, '')}`;
        const isFolder = !fileContent;

        try {
          await storage.createFile({
            userId,
            path: normalizedPath,
            content: fileContent as string || '',
            type: isFolder ? 'folder' : 'file'
          });
        } catch (fileError) {
          console.error(`Error creating file ${normalizedPath}:`, fileError);
        }
      }

      // Create CodeSandbox preview if requested and we have files
      let previewData = null;
      if (withPreview && generatedProject.files && Object.keys(generatedProject.files).length > 0) {
        try {
          console.log('Creating CodeSandbox preview...');
          const codeSandboxService = (await import('./services/codesandbox.js')).default;
          const detectedTemplate = codeSandboxService.detectTemplate(generatedProject.files);
          console.log('Detected template:', detectedTemplate);
          
          previewData = await codeSandboxService.createSandbox({
            files: generatedProject.files,
            template: detectedTemplate as any,
            title: generatedProject.name || name,
            description: generatedProject.description || description
          });
          console.log('CodeSandbox preview created:', previewData);
        } catch (previewError) {
          console.error('Error creating CodeSandbox preview:', previewError);
          console.log('Falling back to local preview');
          // Fallback: indicate that local preview should be used
          previewData = {
            sandboxId: null,
            previewUrl: null,
            editorUrl: null,
            useLocalPreview: true
          };
        }
      }

      res.json({
        ...project,
        files: generatedProject.files || {},
        preview: previewData
      });
    } catch (error) {
      console.error('Generate project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // CodeSandbox Preview Routes
  app.post("/api/preview/create", authenticateToken, async (req: any, res) => {
    try {
      const { files, template, title, description } = req.body;

      if (!files || typeof files !== 'object') {
        return res.status(400).json({ message: 'Files object is required' });
      }

      const codeSandboxService = (await import('./services/codesandbox.js')).default;
      const detectedTemplate = template || codeSandboxService.detectTemplate(files);
      
      const result = await codeSandboxService.createSandbox({
        files,
        template: detectedTemplate,
        title,
        description
      });

      res.json(result);
    } catch (error) {
      console.error('Create preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create preview';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/preview/:sandboxId", authenticateToken, async (req: any, res) => {
    try {
      const { sandboxId } = req.params;
      const { files } = req.body;

      if (!files || typeof files !== 'object') {
        return res.status(400).json({ message: 'Files object is required' });
      }

      const codeSandboxService = (await import('./services/codesandbox.js')).default;
      await codeSandboxService.updateSandbox(sandboxId, files);

      res.json({ message: 'Sandbox updated successfully' });
    } catch (error) {
      console.error('Update preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preview';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.delete("/api/preview/:sandboxId", authenticateToken, async (req: any, res) => {
    try {
      const { sandboxId } = req.params;

      const codeSandboxService = (await import('./services/codesandbox.js')).default;
      await codeSandboxService.deleteSandbox(sandboxId);

      res.json({ message: 'Sandbox deleted successfully' });
    } catch (error) {
      console.error('Delete preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete preview';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/preview/:sandboxId", authenticateToken, async (req: any, res) => {
    try {
      const { sandboxId } = req.params;

      const codeSandboxService = (await import('./services/codesandbox.js')).default;
      const sandbox = await codeSandboxService.getSandbox(sandboxId);

      res.json(sandbox);
    } catch (error) {
      console.error('Get preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get preview';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const storage = await getStorage(); // Add this line
      const project = await storage.getProject(req.params.id);
      const normalizedUserId = typeof req.user.id === 'string' ? req.user.id : String(req.user.id);
      if (!project || String(project.userId) !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get project files for AI analysis (Research Engine, Architecture Generator, Learning Mode)
  app.get("/api/projects/:id/files", authenticateToken, async (req: any, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.user.id;
      const normalizedUserId = typeof userId === 'string' ? userId : String(userId);

      const storage = await getStorage();

      // Get the project
      const project = await storage.getProject(projectId);
      const projectOwnerId = project?.userId ? String(project.userId) : undefined;

      if (!project || projectOwnerId !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get project files and format them for AI analysis
      const files = project.files || {};
      const formattedFiles = [];

      // Helper to detect language from file extension
      const getLanguage = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const langMap: Record<string, string> = {
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'html': 'html',
          'css': 'css',
          'json': 'json',
          'md': 'markdown',
          'sql': 'sql',
          'sh': 'bash',
          'yml': 'yaml',
          'yaml': 'yaml'
        };
        return langMap[ext] || 'text';
      };

      for (const [filePath, fileContent] of Object.entries(files)) {
        if (fileContent && typeof fileContent === 'string') {
          formattedFiles.push({
            name: filePath.split('/').pop() || filePath,
            path: filePath,
            content: fileContent,
            language: getLanguage(filePath)
          });
        }
      }

      res.json({
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework
        },
        files: formattedFiles,
        totalFiles: formattedFiles.length
      });
    } catch (error) {
      console.error('Get project files error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Load a project's files into the IDE workspace
  app.get("/api/projects/:id/load", authenticateToken, async (req: any, res) => {
    try {
      const projectId = req.params.id; // Project ID is now a string
      const userId = req.user.id;
      const normalizedUserId = typeof userId === 'string' ? userId : String(userId);

      const storage = await getStorage(); // Add this line

      // Get the project
      const project = await storage.getProject(projectId);
      const projectOwnerId = project?.userId ? String(project.userId) : undefined;

      if (!project || projectOwnerId !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Clear existing workspace files
      const existingFiles = await storage.getUserFiles(normalizedUserId, '/workspace');
      for (const file of existingFiles) {
        try {
          await storage.deleteFile(file.path);
        } catch (error) {
          console.error(`Error deleting file ${file.path}:`, error);
        }
      }

      // Load project files into workspace
      const files = project.files || {};
      const createdFiles = [];

      for (const [filePath, fileContent] of Object.entries(files)) {
        // Create a normalized path for the file system
        const normalizedPath = `/workspace/${filePath.replace(/^\/+/, '')}`;

        // Determine if it's a file or folder
        const isFolder = !fileContent;

        try {
          const file = await storage.createFile({
            userId: normalizedUserId,
            path: normalizedPath,
            content: fileContent as string || '',
            type: isFolder ? 'folder' : 'file'
          });
          createdFiles.push(file);
        } catch (fileError) {
          console.error(`Error creating file ${normalizedPath}:`, fileError);
        }
      }

      res.json({
        message: "Project loaded successfully",
        project,
        files: createdFiles
      });
    } catch (error) {
      console.error('Load project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const storage = await getStorage(); // Add this line
      const projectId = req.params.id;
      const normalizedUserId = typeof req.user.id === 'string' ? req.user.id : String(req.user.id);
      const project = await storage.getProject(projectId);
      if (!project || String(project.userId) !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error('Update project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const storage = await getStorage(); // Add this line
      const projectId = req.params.id;
      const normalizedUserId = typeof req.user.id === 'string' ? req.user.id : String(req.user.id);
      const project = await storage.getProject(projectId);
      if (!project || String(project.userId) !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }

      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error('Delete project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Export project as ZIP file
  app.get("/api/projects/:id/export", authenticateToken, async (req: any, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.user.id;
      const normalizedUserId = typeof userId === 'string' ? userId : String(userId);

      const storage = await getStorage();

      // Get the project
      const project = await storage.getProject(projectId);
      if (!project || String(project.userId) !== normalizedUserId) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get all project files
      const projectFiles = await storage.getUserFiles(normalizedUserId, '/workspace');

      if (projectFiles.length === 0) {
        return res.status(404).json({ message: "No files found in project" });
      }

      // Create a temporary directory for the project
      const tempDir = join(tmpdir(), `export-${projectId}-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      try {
        // Write all files to the temporary directory
        for (const file of projectFiles) {
          if (file.type === 'file' && file.content) {
            // Remove /workspace prefix and create clean file structure
            const relativePath = file.path.replace(/^\/workspace\/?/, '');
            const filePath = relativePath ? join(tempDir, relativePath) : join(tempDir, file.name || 'unnamed');
            const fileDir = dirname(filePath);

            // Ensure directory exists
            if (!existsSync(fileDir)) {
              await fs.mkdir(fileDir, { recursive: true });
            }

            // Write file content
            await fs.writeFile(filePath, file.content, 'utf8');
          }
        }

        // Create README.md with project info
        const readmePath = join(tempDir, 'README.md');
        const readmeContent = `# ${project.name}

${project.description}

**Framework:** ${project.framework || 'Not specified'}
**Created:** ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
**Exported:** ${new Date().toLocaleDateString()}

---
*Exported from DevMindX - AI-Powered Development Environment*
`;
        await fs.writeFile(readmePath, readmeContent, 'utf8');

        // Create TAR.GZ file (more universally supported)
        const sanitizedName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
        const archivePath = join(tmpdir(), `${sanitizedName}-${Date.now()}.tar.gz`);

        // Use system tar command to create archive
        await new Promise<void>((resolve, reject) => {
          const tarCommand = `tar -czf "${archivePath}" -C "${tempDir}" .`;

          exec(tarCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('Archive creation error:', error);
              // Fallback: create a simple text file with project info
              const fallbackContent = `Project: ${project.name}\nDescription: ${project.description}\nFiles: ${projectFiles.length}\n\nNote: Archive creation failed. Please contact support.`;
              res.setHeader('Content-Type', 'text/plain');
              res.setHeader('Content-Disposition', `attachment; filename="${sanitizedName}_info.txt"`);
              res.send(fallbackContent);
              resolve();
            } else {
              resolve();
            }
          });
        });

        // Check if archive was created successfully
        if (existsSync(archivePath)) {
          // Set response headers for file download
          res.setHeader('Content-Type', 'application/gzip');
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedName}.tar.gz"`);

          // Stream the archive file to response
          const archiveStream = createReadStream(archivePath);
          archiveStream.pipe(res);

          // Clean up files after streaming
          archiveStream.on('end', async () => {
            try {
              await fs.unlink(archivePath);
            } catch (cleanupError) {
              console.error('Error cleaning up archive file:', cleanupError);
            }
          });
        }

        // Clean up temporary directory after a delay
        setTimeout(async () => {
          try {
            await fs.rmdir(tempDir, { recursive: true });
          } catch (cleanupError) {
            console.error('Error cleaning up temp directory:', cleanupError);
          }
        }, 5000);

      } catch (error) {
        // Clean up on error
        try {
          await fs.rmdir(tempDir, { recursive: true });
        } catch (cleanupError) {
          console.error('Error cleaning up temp directory after error:', cleanupError);
        }
        throw error;
      }

    } catch (error) {
      console.error('Export project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // AI Model routes
  app.get("/api/ai/models", authenticateToken, async (req: any, res) => {
    try {
      const models = await getAvailableModels(req.user.id);
      res.json(models);
    } catch (error) {
      console.error('Get models error:', error);
      res.status(500).json({ message: 'Failed to fetch models' });
    }
  });

  // Gemini diagnostics: list models accessible with current API key
  app.get('/api/ai/gemini/models', authenticateToken, async (req: any, res) => {
    try {
      const result = await listGeminiModels();
      res.status(result.ok ? 200 : (result.status || 500)).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Purchase AI model endpoint
  app.post("/api/ai/purchase", authenticateToken, async (req: any, res) => {
    try {
      const { modelId, paymentMethod, paymentDetails, months } = req.body;

      if (!modelId) {
        return res.status(400).json({ message: 'Model ID is required' });
      }

      // Get MongoDB connection
      // Note: This still uses `connectToMongoDB` directly for purchasedModels update, not `req.storage` as `req.storage` does not have direct access to MongoDB client to update nested object
      const db = await connectToMongoDB();

      // Update user's purchased models in MongoDB
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      const userId = createMongoIdFilter(req.user.id);

      const result = await db.collection('users').updateOne(
        { _id: userId },
        {
          $addToSet: {
            purchasedModels: {
              id: modelId,
              paymentMethod,
              paymentDetails,
              months,
              purchaseDate: new Date().toISOString()
            }
          }
        },
        { upsert: true }
      );

      if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        // Check if the user already has this model and it's still active
        const user = await db.collection('users').findOne({ _id: userId });
        const existingPurchase = user?.purchasedModels?.find((p: any) => p.id === modelId);

        if (existingPurchase) {
          const purchaseDate = new Date(existingPurchase.purchaseDate);
          const oneMonthLater = new Date(purchaseDate.setMonth(purchaseDate.getMonth() + 1));

          if (new Date() < oneMonthLater) {
            return res.status(400).json({ message: `You already have an active subscription for ${modelId}. It expires on ${oneMonthLater.toLocaleDateString()}.` });
          }
        }
        return res.status(400).json({ message: 'Model already purchased or user not found' });
      }

      // Return updated list of available models
      const models = await getAvailableModels(req.user.id);
      res.json({ message: 'Model purchased successfully', models });
    } catch (error) {
      console.error('Purchase model error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Get user's purchased models
  app.get("/api/ai/purchased", authenticateToken, async (req: any, res) => {
    try {
      // Get MongoDB connection
      const db = await connectToMongoDB();

      // Get user's purchased models
      const user = await db.collection('users').findOne({ _id: createMongoIdFilter(req.user.id) });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ purchasedModels: user.purchasedModels || [] });
    } catch (error) {
      console.error('Get purchased models error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Token usage helper
  const addTokenUsage = async (userId: string, modelId: string, tokens: number) => {
    try {
      const db = await connectToMongoDB();
      if (!db) {
        throw new Error('MongoDB connection unavailable for token usage update');
      }
      // Don't use upsert to avoid creating invalid users
      await db.collection('users').updateOne(
        { _id: createMongoIdFilter(userId) },
        { $inc: { [`usage.${modelId}`]: tokens } }
      );
    } catch (error) {
      console.error('Error updating token usage:', error);
      // Silently fail - token tracking is not critical
    }
  };

  // Get token usage endpoint
  app.get('/api/ai/usage', authenticateToken, async (req: any, res) => {
    try {
      const db = await connectToMongoDB();
      const user = await db.collection('users').findOne({ _id: createMongoIdFilter(req.user.id) });
      res.json({ usage: user?.usage || {} });
    } catch (error) {
      console.error('Get usage error:', error);
      res.status(500).json({ message: 'Failed to fetch usage' });
    }
  });

  // LLM Query endpoint
  app.post("/api/llm/query", authenticateToken, async (req: any, res) => {
    try {
      const { model = 'gemini', prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      const result = await chatWithAIModel({
        message: prompt,
        model: model as AIModel,
        chatHistory: []
      });

      // Estimate token usage (~4 characters per token)
      const tokensUsed = Math.ceil((prompt.length + (result.content?.length || 0)) / 4);
      await addTokenUsage(req.user.id, model, tokensUsed);

      res.json(result);
    } catch (error) {
      console.error('LLM query error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/generate-code", authenticateToken, async (req: any, res) => {
    try {
      const { instruction, model = 'gemini', context, language } = req.body;

      if (!instruction) {
        return res.status(400).json({ message: 'Instruction is required' });
      }

      const result = await generateCodeWithAI({
        instruction,
        model,
        context,
        language
      });

      res.json(result);
    } catch (error) {
      console.error('Generate code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/chat", authenticateToken, async (req: any, res) => {
    try {
      const { message, model = 'gemini', chatHistory, projectContext } = req.body;
      const userId = req.user.id;

      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      let enhancedPrompt = message;

      if (projectContext) {
        const { currentFile, currentFileContent, fileTree } = projectContext;

        if (currentFile && currentFileContent) {
          enhancedPrompt = `Current file: ${currentFile}\n\nFile content:\n\`\`\`\n${currentFileContent}\n\`\`\`\n\nUser question: ${message}`;
        }

        if (fileTree && fileTree.length > 0) {
          const fileStructure = fileTree.map((file: any) =>
            `${file.type === 'folder' ? '📁' : '📄'} ${file.path}`
          ).join('\n');
          enhancedPrompt = `Project structure:\n${fileStructure}\n\n${enhancedPrompt}`;
        }
      }

      const result = await chatWithAIModel({
        message: enhancedPrompt,
        model,
        chatHistory,
        projectContext,
        image: req.body.image // Pass image data to AI service
      });

      // Estimate token usage
      const tokensUsed = Math.ceil((message.length + (result.content?.length || 0)) / 4);
      await addTokenUsage(userId, model, tokensUsed);

      // Save chat message to history
      const db = await connectToMongoDB();

      // Create user message object
      const userMessage = {
        id: new ObjectId().toString(),
        role: 'user',
        content: message,
        createdAt: new Date()
      };

      // Create assistant message object
      const assistantMessage = {
        id: new ObjectId().toString(),
        role: 'assistant',
        content: result.content,
        createdAt: new Date()
      };

      // Update chat history in MongoDB using upsert with proper typing
      await db.collection('chatHistory').updateOne(
        { userId },
        {
          $push: {
            'messages': {
              $each: [userMessage, assistantMessage],
              $slice: -100 // Keep only the last 100 messages
            }
          } as any,
          $setOnInsert: { createdAt: new Date() },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      res.json(result);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/analyze-code", authenticateToken, async (req: any, res) => {
    try {
      const { code, task, model = 'gemini' } = req.body;

      if (!code || !task) {
        return res.status(400).json({ message: 'Code and task are required' });
      }

      const result = await analyzeCodeWithAI(code, task, model);
      res.json(result);
    } catch (error) {
      console.error('Analyze code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Architecture Generator API - Generate system architecture diagrams
  app.post("/api/architecture/generate", authenticateToken, async (req: any, res) => {
    try {
      const { description, model = 'gemini', useDemo = false } = req.body;

      if (!description) {
        return res.status(400).json({ message: 'Project description is required' });
      }

      // Check if demo architecture is requested
      if (useDemo || description?.toLowerCase().includes('snake game') || description?.toLowerCase().includes('demo snake')) {
        console.log('Using hardcoded demo Snake Game architecture');
        const { snakeGameArchitecture } = await import('./demo-projects/snake-game.js');
        
        const architectureData = {
          systemArchitecture: `graph TD
    A[User Interface Layer] --> B[Game Logic Layer]
    B --> C[Storage Layer]
    A --> D[HTML5 Canvas]
    A --> E[Control Buttons]
    B --> F[Snake Movement]
    B --> G[Collision Detection]
    B --> H[Food Generation]
    B --> I[Score Management]
    C --> J[LocalStorage API]
    
    style A fill:#667eea,color:#fff
    style B fill:#764ba2,color:#fff
    style C fill:#f093fb,color:#fff`,
          
          classDiagram: `classDiagram
    class Game {
        -canvas: HTMLCanvasElement
        -ctx: CanvasRenderingContext2D
        -snake: Array
        -food: Object
        -score: number
        -highScore: number
        -gameLoop: number
        -isPaused: boolean
        +startGame()
        +pauseGame()
        +resetGame()
        +endGame()
        +drawGame()
        +moveSnake()
        +generateFood()
    }
    
    class Snake {
        -segments: Array
        -direction: Object
        +move()
        +grow()
        +checkCollision()
    }
    
    class Food {
        -position: Object
        +generate()
        +isEaten()
    }
    
    class ScoreManager {
        -currentScore: number
        -highScore: number
        +updateScore()
        +saveHighScore()
        +loadHighScore()
    }
    
    Game --> Snake
    Game --> Food
    Game --> ScoreManager`,
          
          erDiagram: `erDiagram
    GAME ||--|| SNAKE : controls
    GAME ||--|| FOOD : generates
    GAME ||--|| SCORE : tracks
    GAME ||--o{ GAME_STATE : has
    
    GAME {
        string canvasId
        number gridSize
        number tileCount
        number gameSpeed
        boolean isActive
    }
    
    SNAKE {
        array segments
        number dx
        number dy
        number length
    }
    
    FOOD {
        number x
        number y
        string color
    }
    
    SCORE {
        number current
        number high
        datetime lastUpdated
    }
    
    GAME_STATE {
        string status
        datetime timestamp
    }`,
          
          sequenceDiagram: `sequenceDiagram
    participant User
    participant UI
    participant GameLogic
    participant Canvas
    participant Storage
    
    User->>UI: Click Start Game
    UI->>GameLogic: Initialize Game
    GameLogic->>Canvas: Clear Canvas
    GameLogic->>GameLogic: Generate Food
    GameLogic->>Canvas: Draw Snake & Food
    
    loop Game Loop
        User->>UI: Press Arrow Key
        UI->>GameLogic: Update Direction
        GameLogic->>GameLogic: Move Snake
        GameLogic->>GameLogic: Check Collisions
        
        alt Food Eaten
            GameLogic->>GameLogic: Grow Snake
            GameLogic->>GameLogic: Update Score
            GameLogic->>GameLogic: Generate New Food
            GameLogic->>Storage: Save High Score
        else Wall/Self Collision
            GameLogic->>UI: Show Game Over
            GameLogic->>Storage: Save High Score
        end
        
        GameLogic->>Canvas: Redraw Game
    end
    
    User->>UI: Click Reset
    UI->>GameLogic: Reset Game State
    GameLogic->>Storage: Load High Score`,
          
          restApiBlueprint: `# Snake Game - Technical Documentation

## Game Configuration

### Constants
\`\`\`javascript
GRID_SIZE = 20        // Size of each grid cell in pixels
TILE_COUNT = 20       // Number of tiles in each direction
GAME_SPEED = 100      // Game update interval in milliseconds
\`\`\`

## Core Functions

### Game Initialization
\`\`\`javascript
function initGame() {
  // Initialize canvas context
  // Set up initial snake position
  // Generate first food
  // Load high score from localStorage
}
\`\`\`

### Game Loop
\`\`\`javascript
function gameUpdate() {
  if (!isPaused) {
    moveSnake()      // Update snake position
    drawGame()       // Render to canvas
  }
}
\`\`\`

### Movement System
\`\`\`javascript
function moveSnake() {
  // Calculate new head position
  // Check wall collision
  // Check self collision
  // Check food collision
  // Update snake segments
}
\`\`\`

### Collision Detection
\`\`\`javascript
// Wall Collision
if (head.x < 0 || head.x >= TILE_COUNT || 
    head.y < 0 || head.y >= TILE_COUNT)

// Self Collision
snake.some(segment => 
  segment.x === head.x && segment.y === head.y)

// Food Collision
if (head.x === food.x && head.y === food.y)
\`\`\`

## Event Handlers

### Keyboard Controls
- **Arrow Up**: Move snake up (if not moving down)
- **Arrow Down**: Move snake down (if not moving up)
- **Arrow Left**: Move snake left (if not moving right)
- **Arrow Right**: Move snake right (if not moving left)
- **Space**: Pause/Resume game

### Button Controls
- **Start Game**: Initialize and start game loop
- **Pause**: Toggle game pause state
- **Reset**: Reset game to initial state

## Data Persistence

### LocalStorage Schema
\`\`\`javascript
{
  "snakeHighScore": number  // Highest score achieved
}
\`\`\`

## Rendering Pipeline

1. Clear canvas with black background
2. Draw snake segments (head in lighter green)
3. Draw food in red
4. Update score display in DOM

## Game States

- **Initial**: Game not started, showing initial state
- **Running**: Game loop active, snake moving
- **Paused**: Game loop active but updates suspended
- **GameOver**: Collision detected, showing game over screen`,
          
          dataFlowDiagram: `graph LR
    A[User Input] --> B{Input Type}
    B -->|Arrow Keys| C[Direction Change]
    B -->|Start Button| D[Game Initialization]
    B -->|Pause Button| E[Toggle Pause State]
    B -->|Reset Button| F[Reset Game]
    
    C --> G[Game Logic]
    D --> G
    E --> G
    F --> G
    
    G --> H{Check Collisions}
    H -->|Food| I[Increase Score]
    H -->|Wall/Self| J[Game Over]
    H -->|None| K[Continue]
    
    I --> L[Update Snake]
    K --> L
    
    L --> M[Render Canvas]
    M --> N[Display to User]
    
    I --> O[LocalStorage]
    J --> O
    O --> P[Persist High Score]
    
    style A fill:#667eea,color:#fff
    style G fill:#764ba2,color:#fff
    style M fill:#f093fb,color:#fff
    style O fill:#4ade80,color:#fff`,
          
          description: `Classic Snake Game Architecture

This is a client-side game built with vanilla JavaScript and HTML5 Canvas. The architecture follows a simple but effective pattern:

**Key Components:**
1. **UI Layer**: HTML5 Canvas for rendering, buttons for controls
2. **Game Logic**: Core mechanics including movement, collision detection, and scoring
3. **Storage**: LocalStorage for persisting high scores

**Design Patterns:**
- **Game Loop Pattern**: Continuous update-render cycle using setInterval
- **State Management**: Simple boolean flags for game state (running, paused, game over)
- **Event-Driven**: Keyboard and button events trigger game actions

**Technical Highlights:**
- Pure JavaScript (no frameworks)
- Canvas 2D rendering
- Grid-based coordinate system
- Collision detection algorithms
- LocalStorage persistence

**Performance Considerations:**
- Fixed game speed (100ms per frame)
- Efficient canvas clearing and redrawing
- Minimal DOM manipulation
- No memory leaks (proper cleanup on reset)

This architecture is perfect for learning game development fundamentals and can be easily extended with features like difficulty levels, power-ups, or multiplayer support.`
        };
        
        return res.json(architectureData);
      }

      const prompt = `Generate comprehensive architecture documentation for the following project:

PROJECT DESCRIPTION:
${description}

Please provide a detailed response in the following JSON format with Mermaid diagram syntax:
{
  "systemArchitecture": "graph TD\\n    A[Client] --> B[Load Balancer]\\n    B --> C[Web Server]\\n    C --> D[Application Server]\\n    D --> E[Database]\\n    D --> F[Cache]\\n    D --> G[Message Queue]",
  "classDiagram": "classDiagram\\n    class User {\\n        +int id\\n        +string name\\n        +string email\\n        +login()\\n        +logout()\\n    }\\n    class Product {\\n        +int id\\n        +string name\\n        +float price\\n        +getDetails()\\n    }\\n    User --> Product : purchases",
  "erDiagram": "erDiagram\\n    USER ||--o{ ORDER : places\\n    ORDER ||--|{ ORDER_ITEM : contains\\n    PRODUCT ||--o{ ORDER_ITEM : includes\\n    USER {\\n        int id\\n        string name\\n        string email\\n    }\\n    ORDER {\\n        int id\\n        date orderDate\\n        float total\\n    }",
  "sequenceDiagram": "sequenceDiagram\\n    participant User\\n    participant Frontend\\n    participant Backend\\n    participant Database\\n    User->>Frontend: Login Request\\n    Frontend->>Backend: POST /api/login\\n    Backend->>Database: Verify Credentials\\n    Database-->>Backend: User Data\\n    Backend-->>Frontend: JWT Token\\n    Frontend-->>User: Login Success",
  "restApiBlueprint": "# REST API Documentation\\n\\n## Authentication\\n### POST /api/auth/login\\n- Request: { email, password }\\n- Response: { token, user }\\n\\n### POST /api/auth/register\\n- Request: { name, email, password }\\n- Response: { token, user }\\n\\n## Users\\n### GET /api/users/:id\\n- Response: { id, name, email }\\n\\n### PUT /api/users/:id\\n- Request: { name, email }\\n- Response: { user }",
  "dataFlowDiagram": "graph LR\\n    A[User Input] --> B[Validation Layer]\\n    B --> C[Business Logic]\\n    C --> D[Data Access Layer]\\n    D --> E[Database]\\n    E --> D\\n    D --> C\\n    C --> F[Response Formatter]\\n    F --> G[User Output]",
  "description": "This architecture follows a modern microservices pattern with clear separation of concerns. The system uses a load balancer for high availability, implements caching for performance, and uses message queues for asynchronous processing."
}

Generate complete, production-ready architecture diagrams using Mermaid syntax. Include:
1. System Architecture - Overall system components and their relationships
2. Class Diagram - Main classes with properties and methods
3. ER Diagram - Database entities and relationships
4. Sequence Diagram - Key user flows and interactions
5. REST API Blueprint - Complete API documentation with endpoints
6. Data Flow Diagram - How data moves through the system

Return ONLY valid JSON, no additional text.`;

      const result = await chatWithAIModel({
        message: prompt,
        model: model as AIModel,
        chatHistory: []
      });

      // Parse the AI response
      let architectureData;
      try {
        const jsonMatch = result.content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          architectureData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a fallback structure
        architectureData = {
          systemArchitecture: `graph TD
    A[Client Application] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Business Logic Service]
    D --> E[Database]
    D --> F[Cache Layer]`,
          classDiagram: `classDiagram
    class Application {
        +initialize()
        +run()
    }
    class Service {
        +process()
        +validate()
    }
    Application --> Service`,
          erDiagram: `erDiagram
    USER ||--o{ SESSION : has
    USER {
        int id
        string name
        string email
    }
    SESSION {
        int id
        datetime created
    }`,
          sequenceDiagram: `sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System-->>User: Response`,
          restApiBlueprint: `# REST API Documentation

## Endpoints
### GET /api/status
- Description: Check system status
- Response: { status: "ok" }

### POST /api/data
- Description: Submit data
- Request: { data: "value" }
- Response: { success: true }`,
          dataFlowDiagram: `graph LR
    A[Input] --> B[Process]
    B --> C[Output]`,
          description: result.content || 'Architecture generated based on your description. Please review and customize as needed.'
        };
      }

      res.json(architectureData);
    } catch (error) {
      console.error('Architecture generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Learning Mode API - Analyze code and generate educational content
  app.post("/api/learning/analyze", authenticateToken, async (req: any, res) => {
    try {
      const { code, model = 'gemini', useDemo = false, fileName = '' } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Code is required' });
      }

      // Check if demo learning content is requested (for Snake Game)
      if (useDemo || fileName?.toLowerCase().includes('game.js') || code.includes('Snake Game Logic')) {
        console.log('Using hardcoded demo Snake Game learning content');
        
        const learningData = {
          explanations: [{
            file: 'game.js',
            lines: [
              {
                lineNumber: 1,
                code: "const canvas = document.getElementById('gameCanvas');",
                explanation: "Gets a reference to the HTML canvas element where the game will be rendered. The canvas provides a 2D drawing surface."
              },
              {
                lineNumber: 2,
                code: "const ctx = canvas.getContext('2d');",
                explanation: "Obtains the 2D rendering context for the canvas. This context provides methods for drawing shapes, text, and images."
              },
              {
                lineNumber: 8,
                code: "const GRID_SIZE = 20;",
                explanation: "Defines the size of each grid cell in pixels. The game uses a grid-based coordinate system where each cell is 20x20 pixels."
              },
              {
                lineNumber: 9,
                code: "const TILE_COUNT = canvas.width / GRID_SIZE;",
                explanation: "Calculates how many tiles fit across the canvas. With a 400px canvas and 20px tiles, this gives us a 20x20 grid."
              },
              {
                lineNumber: 10,
                code: "const GAME_SPEED = 100;",
                explanation: "Sets the game update interval in milliseconds. The game updates every 100ms, making the snake move 10 times per second."
              },
              {
                lineNumber: 13,
                code: "let snake = [{ x: 10, y: 10 }];",
                explanation: "Initializes the snake as an array with one segment at position (10, 10). Each segment is an object with x and y coordinates."
              },
              {
                lineNumber: 14,
                code: "let food = { x: 15, y: 15 };",
                explanation: "Creates the food object at position (15, 15). The snake grows when it eats food."
              },
              {
                lineNumber: 15,
                code: "let dx = 0;",
                explanation: "Direction vector for horizontal movement. 0 = no movement, -1 = left, 1 = right."
              },
              {
                lineNumber: 16,
                code: "let dy = 0;",
                explanation: "Direction vector for vertical movement. 0 = no movement, -1 = up, 1 = down."
              },
              {
                lineNumber: 17,
                code: "let score = 0;",
                explanation: "Tracks the current game score. Increases by 10 points each time the snake eats food."
              },
              {
                lineNumber: 18,
                code: "let highScore = localStorage.getItem('snakeHighScore') || 0;",
                explanation: "Retrieves the high score from browser's localStorage. If no high score exists, defaults to 0. This persists across browser sessions."
              },
              {
                lineNumber: 25,
                code: "function drawGame() {",
                explanation: "Main rendering function that draws the entire game state to the canvas."
              },
              {
                lineNumber: 27,
                code: "ctx.fillStyle = '#000';",
                explanation: "Sets the fill color to black for the canvas background."
              },
              {
                lineNumber: 28,
                code: "ctx.fillRect(0, 0, canvas.width, canvas.height);",
                explanation: "Draws a black rectangle covering the entire canvas, effectively clearing it for the next frame."
              },
              {
                lineNumber: 31,
                code: "snake.forEach((segment, index) => {",
                explanation: "Iterates through each segment of the snake to draw it. The index helps differentiate the head from the body."
              },
              {
                lineNumber: 32,
                code: "ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';",
                explanation: "Sets different colors for the snake's head (lighter green) and body (darker green) for visual distinction."
              },
              {
                lineNumber: 33,
                code: "ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);",
                explanation: "Draws each snake segment as a rectangle. Multiplies grid coordinates by GRID_SIZE to get pixel coordinates. Subtracts 2 pixels to create a small gap between segments."
              },
              {
                lineNumber: 39,
                code: "ctx.fillStyle = '#ef4444';",
                explanation: "Sets the fill color to red for the food."
              },
              {
                lineNumber: 40,
                code: "ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);",
                explanation: "Draws the food as a red rectangle at its grid position."
              },
              {
                lineNumber: 44,
                code: "function moveSnake() {",
                explanation: "Handles snake movement logic, including collision detection and food consumption."
              },
              {
                lineNumber: 45,
                code: "if (dx === 0 && dy === 0) return;",
                explanation: "Prevents movement if no direction is set (game hasn't started yet)."
              },
              {
                lineNumber: 47,
                code: "const head = { x: snake[0].x + dx, y: snake[0].y + dy };",
                explanation: "Calculates the new head position by adding the direction vectors to the current head position."
              },
              {
                lineNumber: 50,
                code: "if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {",
                explanation: "Checks if the snake hit any of the four walls. If so, the game ends."
              },
              {
                lineNumber: 56,
                code: "if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {",
                explanation: "Checks if the new head position collides with any part of the snake's body. Uses Array.some() for efficient checking."
              },
              {
                lineNumber: 61,
                code: "snake.unshift(head);",
                explanation: "Adds the new head position to the beginning of the snake array. This makes the snake move forward."
              },
              {
                lineNumber: 64,
                code: "if (head.x === food.x && head.y === food.y) {",
                explanation: "Checks if the snake's head is at the same position as the food."
              },
              {
                lineNumber: 65,
                code: "score += 10;",
                explanation: "Increases the score by 10 points when food is eaten."
              },
              {
                lineNumber: 66,
                code: "scoreElement.textContent = score;",
                explanation: "Updates the score display in the HTML DOM."
              },
              {
                lineNumber: 67,
                code: "generateFood();",
                explanation: "Generates a new food item at a random location."
              },
              {
                lineNumber: 70,
                code: "if (score > highScore) {",
                explanation: "Checks if the current score exceeds the high score."
              },
              {
                lineNumber: 71,
                code: "highScore = score;",
                explanation: "Updates the high score variable."
              },
              {
                lineNumber: 72,
                code: "highScoreElement.textContent = highScore;",
                explanation: "Updates the high score display in the UI."
              },
              {
                lineNumber: 73,
                code: "localStorage.setItem('snakeHighScore', highScore);",
                explanation: "Saves the new high score to localStorage so it persists across browser sessions."
              },
              {
                lineNumber: 76,
                code: "snake.pop();",
                explanation: "Removes the last segment of the snake if no food was eaten. This creates the movement effect - adding a head and removing the tail."
              },
              {
                lineNumber: 81,
                code: "function generateFood() {",
                explanation: "Generates a new food item at a random position on the grid."
              },
              {
                lineNumber: 82,
                code: "food = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };",
                explanation: "Creates a random position within the grid bounds. Math.random() generates 0-1, multiplied by TILE_COUNT and floored to get integer coordinates."
              },
              {
                lineNumber: 86,
                code: "if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {",
                explanation: "Checks if the food spawned on the snake's body. If so, recursively calls generateFood() to find a new position."
              },
              {
                lineNumber: 92,
                code: "function gameUpdate() {",
                explanation: "Main game loop function called every GAME_SPEED milliseconds."
              },
              {
                lineNumber: 93,
                code: "if (!isPaused) {",
                explanation: "Only updates the game if it's not paused."
              },
              {
                lineNumber: 94,
                code: "moveSnake();",
                explanation: "Updates the snake's position and handles game logic."
              },
              {
                lineNumber: 95,
                code: "drawGame();",
                explanation: "Renders the updated game state to the canvas."
              },
              {
                lineNumber: 100,
                code: "function startGame() {",
                explanation: "Initializes and starts the game loop."
              },
              {
                lineNumber: 102,
                code: "gameLoop = setInterval(gameUpdate, GAME_SPEED);",
                explanation: "Creates a timer that calls gameUpdate() every GAME_SPEED milliseconds. Returns an ID that can be used to stop the interval."
              },
              {
                lineNumber: 125,
                code: "document.addEventListener('keydown', (e) => {",
                explanation: "Listens for keyboard events to control the snake."
              },
              {
                lineNumber: 129,
                code: "case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; }",
                explanation: "Changes direction to up, but only if not currently moving vertically (prevents 180-degree turns that would cause instant collision)."
              }
            ]
          }],
          flowDiagram: {
            nodes: [
              { id: '1', label: 'Game Start', type: 'start' },
              { id: '2', label: 'Initialize Canvas & Variables', type: 'process' },
              { id: '3', label: 'Load High Score', type: 'process' },
              { id: '4', label: 'Draw Initial State', type: 'process' },
              { id: '5', label: 'Wait for Start Button', type: 'decision' },
              { id: '6', label: 'Start Game Loop', type: 'process' },
              { id: '7', label: 'Game Paused?', type: 'decision' },
              { id: '8', label: 'Get User Input', type: 'process' },
              { id: '9', label: 'Update Direction', type: 'process' },
              { id: '10', label: 'Move Snake', type: 'process' },
              { id: '11', label: 'Check Wall Collision', type: 'decision' },
              { id: '12', label: 'Check Self Collision', type: 'decision' },
              { id: '13', label: 'Check Food Collision', type: 'decision' },
              { id: '14', label: 'Grow Snake & Update Score', type: 'process' },
              { id: '15', label: 'Generate New Food', type: 'process' },
              { id: '16', label: 'Remove Tail Segment', type: 'process' },
              { id: '17', label: 'Update High Score?', type: 'decision' },
              { id: '18', label: 'Save to LocalStorage', type: 'process' },
              { id: '19', label: 'Draw Game State', type: 'process' },
              { id: '20', label: 'Game Over', type: 'end' },
              { id: '21', label: 'Continue Loop', type: 'process' }
            ],
            connections: [
              { from: '1', to: '2', label: 'Initialize' },
              { from: '2', to: '3' },
              { from: '3', to: '4' },
              { from: '4', to: '5' },
              { from: '5', to: '6', label: 'Start Clicked' },
              { from: '6', to: '7' },
              { from: '7', to: '8', label: 'Not Paused' },
              { from: '7', to: '7', label: 'Paused' },
              { from: '8', to: '9' },
              { from: '9', to: '10' },
              { from: '10', to: '11' },
              { from: '11', to: '20', label: 'Collision' },
              { from: '11', to: '12', label: 'No Collision' },
              { from: '12', to: '20', label: 'Collision' },
              { from: '12', to: '13', label: 'No Collision' },
              { from: '13', to: '14', label: 'Food Eaten' },
              { from: '13', to: '16', label: 'No Food' },
              { from: '14', to: '15' },
              { from: '15', to: '17' },
              { from: '16', to: '19' },
              { from: '17', to: '18', label: 'New High Score' },
              { from: '17', to: '19', label: 'No' },
              { from: '18', to: '19' },
              { from: '19', to: '21' },
              { from: '21', to: '7', label: 'Next Frame' }
            ]
          },
          summary: `# Snake Game - Comprehensive Analysis

## Overview
This is a classic Snake game implementation using HTML5 Canvas and vanilla JavaScript. The game demonstrates fundamental game development concepts including game loops, collision detection, state management, and user input handling.

## Architecture & Design

### Core Components
1. **Canvas Rendering System**: Uses HTML5 Canvas 2D context for graphics
2. **Game Loop**: setInterval-based update cycle running at 10 FPS
3. **State Management**: Simple variables tracking game state
4. **Input System**: Keyboard event listeners for controls
5. **Persistence Layer**: LocalStorage for high score

### Key Design Patterns
- **Game Loop Pattern**: Continuous update-render cycle
- **Grid-Based Movement**: Discrete tile-based positioning
- **Array-Based Snake**: Head at index 0, tail at end
- **Event-Driven Input**: Asynchronous keyboard handling

## Technical Implementation

### Data Structures
- **Snake**: Array of coordinate objects [{x, y}, ...]
- **Food**: Single coordinate object {x, y}
- **Direction**: Two integers (dx, dy) representing velocity

### Algorithms
1. **Movement**: Add new head, conditionally remove tail
2. **Collision Detection**: Boundary checking and array searching
3. **Food Generation**: Random positioning with validation
4. **Score Tracking**: Simple increment with localStorage persistence

### Performance Considerations
- Fixed 100ms update interval (10 FPS)
- Efficient canvas clearing and redrawing
- Minimal DOM manipulation
- O(n) collision detection where n = snake length

## Learning Outcomes

### Beginner Concepts
- Canvas API basics
- Event handling
- Array manipulation
- Conditional logic
- LocalStorage usage

### Intermediate Concepts
- Game loop implementation
- Collision detection algorithms
- State management
- Coordinate systems
- Frame-based animation

### Advanced Concepts
- Performance optimization
- User experience design
- Error prevention (invalid moves)
- Data persistence
- Modular code organization

## Potential Enhancements
1. Add difficulty levels (speed variations)
2. Implement power-ups and obstacles
3. Add sound effects and music
4. Create mobile touch controls
5. Implement online leaderboard
6. Add different game modes
7. Improve graphics with sprites
8. Add particle effects
9. Implement AI opponent
10. Create level progression system

## Best Practices Demonstrated
- Clear variable naming
- Separation of concerns (draw, update, input)
- Consistent code style
- Efficient rendering
- User feedback (score display, game over screen)
- Graceful state transitions

This implementation serves as an excellent foundation for learning game development and can be extended with numerous features while maintaining clean, understandable code.`,
          quiz: [
            {
              question: "What is the purpose of the GRID_SIZE constant?",
              options: [
                "It defines the size of each grid cell in pixels",
                "It sets the total number of grid cells",
                "It determines the snake's speed",
                "It controls the canvas size"
              ],
              correctAnswer: 0
            },
            {
              question: "How does the snake move in the game?",
              options: [
                "By changing all segment positions simultaneously",
                "By adding a new head and removing the tail",
                "By shifting each segment to the next position",
                "By redrawing the entire snake at a new location"
              ],
              correctAnswer: 1
            },
            {
              question: "What happens when the snake eats food?",
              options: [
                "The game speed increases",
                "The snake changes color",
                "The score increases and the snake grows",
                "A new level starts"
              ],
              correctAnswer: 2
            },
            {
              question: "Why does the code check 'if (dy === 0)' before allowing upward movement?",
              options: [
                "To prevent the game from starting too early",
                "To check if the snake is paused",
                "To prevent 180-degree turns that would cause instant collision",
                "To validate the keyboard input"
              ],
              correctAnswer: 2
            },
            {
              question: "What is the purpose of localStorage in this game?",
              options: [
                "To save the entire game state",
                "To store user preferences",
                "To persist the high score across sessions",
                "To cache game assets"
              ],
              correctAnswer: 2
            },
            {
              question: "How is collision detection implemented for walls?",
              options: [
                "By checking if coordinates are outside the grid bounds",
                "By using a separate collision map",
                "By detecting canvas edge events",
                "By measuring pixel distances"
              ],
              correctAnswer: 0
            },
            {
              question: "What does 'snake.unshift(head)' do?",
              options: [
                "Removes the snake's head",
                "Adds a new head to the beginning of the array",
                "Shifts all segments forward",
                "Reverses the snake's direction"
              ],
              correctAnswer: 1
            },
            {
              question: "Why is 'GRID_SIZE - 2' used when drawing rectangles?",
              options: [
                "To make the snake smaller",
                "To create visual gaps between segments",
                "To improve performance",
                "To prevent canvas overflow"
              ],
              correctAnswer: 1
            },
            {
              question: "What triggers the game loop to run continuously?",
              options: [
                "requestAnimationFrame",
                "setTimeout",
                "setInterval",
                "A while loop"
              ],
              correctAnswer: 2
            },
            {
              question: "How does the game prevent food from spawning on the snake?",
              options: [
                "By using a collision map",
                "By recursively calling generateFood() if collision detected",
                "By checking all possible positions first",
                "By using a random seed"
              ],
              correctAnswer: 1
            }
          ],
          vivaQuestions: [
            "Explain the overall architecture of the Snake game and how the components interact.",
            "How does the game loop work and why is setInterval used instead of requestAnimationFrame?",
            "Describe the collision detection algorithm used in this game. What is its time complexity?",
            "How is the snake's movement implemented? Why is this approach efficient?",
            "Explain how the direction change system prevents invalid 180-degree turns.",
            "What role does localStorage play in this application? What are its limitations?",
            "How would you implement multiple difficulty levels in this game?",
            "Describe the rendering pipeline. How often is the canvas redrawn?",
            "What happens in memory when the snake grows? Is there any memory leak concern?",
            "How would you add sound effects to this game? What Web API would you use?",
            "Explain the coordinate system used in the game. Why use a grid instead of pixel coordinates?",
            "How would you implement a pause feature that doesn't break the game state?",
            "What improvements could be made to make this game mobile-friendly?",
            "How would you add power-ups that give temporary abilities?",
            "Explain how you would implement an AI opponent for this game.",
            "What security considerations should be taken when using localStorage?",
            "How would you optimize this game for better performance on low-end devices?",
            "Describe how you would implement a multiplayer version of this game.",
            "What testing strategies would you use to ensure game logic correctness?",
            "How would you refactor this code to use object-oriented programming principles?"
          ]
        };
        
        return res.json(learningData);
      }

      const prompt = `Analyze the following code and provide comprehensive learning materials:

CODE:
${code}

Please provide a detailed response in the following JSON format:
{
  "explanations": [
    {
      "file": "filename.ext",
      "lines": [
        {
          "lineNumber": 1,
          "code": "actual code line",
          "explanation": "detailed explanation of what this line does"
        }
      ]
    }
  ],
  "flowDiagram": {
    "nodes": [
      { "id": "1", "label": "Start", "type": "start" },
      { "id": "2", "label": "Process", "type": "process" },
      { "id": "3", "label": "Decision", "type": "decision" },
      { "id": "4", "label": "End", "type": "end" }
    ],
    "connections": [
      { "from": "1", "to": "2", "label": "optional label" }
    ]
  },
  "summary": "A comprehensive summary of the entire project, explaining its purpose, architecture, and key features",
  "quiz": [
    {
      "question": "What does this code do?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ],
  "vivaQuestions": [
    "Explain the main purpose of this application",
    "How does the data flow through the system?",
    "What design patterns are used here?"
  ]
}

Make sure to:
1. Explain EVERY line of code in detail
2. Create a clear flow diagram showing the architecture
3. Write a comprehensive summary
4. Generate 5-10 quiz questions with 4 options each
5. Create 10-15 viva/interview questions

Return ONLY valid JSON, no additional text.`;

      const result = await chatWithAIModel({
        message: prompt,
        model: model as AIModel,
        chatHistory: []
      });

      // Parse the AI response
      let learningData;
      try {
        // Extract JSON from the response
        const jsonMatch = result.content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          learningData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a fallback structure
        learningData = {
          explanations: [{
            file: 'code.txt',
            lines: [
              {
                lineNumber: 1,
                code: code.split('\n')[0] || 'Code',
                explanation: 'This is the beginning of your code. The AI had trouble analyzing it in detail.'
              }
            ]
          }],
          flowDiagram: {
            nodes: [
              { id: '1', label: 'Start', type: 'start' },
              { id: '2', label: 'Process Code', type: 'process' },
              { id: '3', label: 'End', type: 'end' }
            ],
            connections: [
              { from: '1', to: '2' },
              { from: '2', to: '3' }
            ]
          },
          summary: result.content || 'Unable to generate detailed analysis. Please try with a smaller code snippet.',
          quiz: [
            {
              question: 'What is the main purpose of this code?',
              options: ['Data processing', 'User interface', 'API integration', 'Database management'],
              correctAnswer: 0
            }
          ],
          vivaQuestions: [
            'Explain the overall structure of this code',
            'What are the key components?',
            'How would you improve this code?'
          ]
        };
      }

      res.json(learningData);
    } catch (error) {
      console.error('Learning mode analyze error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // IDE-specific routes with better error handling
  app.post("/api/ide/files", authenticateToken, async (req: any, res) => {
    try {
      const { action, filePath, content, newPath, type } = req.body;
      const userId = req.user.id;

      const storage = await getStorage(); // Add this line

      if (!action || !filePath) {
        return res.status(400).json({ message: 'Action and filePath are required' });
      }

      switch (action) {
        case 'create':
          const fileType = type || 'file';
          const newFile = await storage.createFile({
            userId,
            path: filePath,
            content: content || '',
            type: fileType as 'file' | 'folder'
          });
          res.json({ message: "File created successfully", path: filePath, file: newFile });
          break;

        case 'update':
          const updatedFile = await storage.updateFile(filePath, { content });
          res.json({ message: "File updated successfully", path: filePath, file: updatedFile });
          break;

        case 'delete':
          await storage.deleteFile(filePath);
          res.json({ message: "File deleted successfully" });
          break;

        case 'rename':
          if (!newPath) {
            return res.status(400).json({ message: 'newPath is required for rename action' });
          }
          const renamedFile = await storage.renameFile(filePath, newPath);
          res.json({ message: "File renamed successfully", oldPath: filePath, newPath, file: renamedFile });
          break;

        default:
          res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error('File operation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ide/apply-file-changes", authenticateToken, async (req: any, res) => {
    try {
      const { fileChanges }: { fileChanges: FileChange[] } = req.body;
      const userId = req.user.id;
      const storage = await getStorage();

      if (!fileChanges || !Array.isArray(fileChanges)) {
        return res.status(400).json({ message: 'fileChanges array is required' });
      }

      const results = [];
      for (const change of fileChanges) {
        try {
          const normalizedPath = change.filePath.startsWith('/workspace') ? change.filePath : `/workspace/${change.filePath.replace(/^\/+/, '')}`;
          switch (change.action) {
            case 'create':
              const newFile = await storage.createFile({
                userId,
                path: normalizedPath,
                content: change.newContent || '',
                type: normalizedPath.endsWith('/') ? 'folder' : 'file' // Simple check for folder
              });
              results.push({ filePath: change.filePath, status: 'created', file: newFile });
              break;
            case 'update':
              const updatedFile = await storage.updateFile(normalizedPath, { content: change.newContent });
              results.push({ filePath: change.filePath, status: 'updated', file: updatedFile });
              break;
            case 'delete':
              await storage.deleteFile(normalizedPath);
              results.push({ filePath: change.filePath, status: 'deleted' });
              break;
            default:
              results.push({ filePath: change.filePath, status: 'skipped', message: 'Invalid action' });
          }
        } catch (error) {
          console.error(`Error applying file change for ${change.filePath}:`, error);
          results.push({
            filePath: change.filePath,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      res.json({ message: "File changes applied", results });
    } catch (error) {
      console.error('Apply file changes error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/ide/files", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const path = req.query.path || '/';

      const storage = await getStorage(); // Add this line

      // Get files from storage
      const files = await storage.getUserFiles(userId, path as string);

      // If no files found, return an empty list (no auto-created defaults)
      if (files.length === 0) {
        return res.json([]);
      }

      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // New endpoint for fetching diagnostics
  app.post("/api/ide/diagnostics", authenticateToken, async (req: any, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
      }

      const storage = await getStorage();
      // Use getUserFiles to fetch the file by path, since getFileByPath does not exist
      const files = await storage.getUserFiles(req.user.id, filePath);
      const file = Array.isArray(files) ? files.find(f => f.path === filePath) : null;

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Initialize ESLint
      const eslint = new ESLint({
        overrideConfigFile: path.resolve(__dirname, './.eslintrc.cjs'),
        cwd: process.cwd(),
      });

      const results = await eslint.lintText(file.content, { filePath });

      const formattedDiagnostics: Diagnostic[] = results.flatMap((result: any) =>
        result.messages.map((message: any) => ({
          filePath: filePath,
          lineNumber: message.line,
          columnNumber: message.column,
          message: message.message,
          severity: (
            message.severity === 2 ? 'error' : message.severity === 1 ? 'warning' : 'info'
          ) as 'error' | 'warning' | 'info',
        }))
      );

      res.json({ diagnostics: formattedDiagnostics });
    } catch (error) {
      console.error('Get diagnostics error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Enhanced terminal execution that works with real files and supports interactive input
  app.post("/api/ide/terminal", authenticateToken, async (req: any, res) => {
    try {
      const { command, workingDirectory, sessionId, input } = req.body;
      const userId = req.user.id;

      // Handle interactive input for existing session
      if (sessionId && input !== undefined) {
        const session = terminalSessions.get(sessionId);
        if (session && session.isActive && session.process) {
          session.process.stdin.write(input + '\n');
          return res.json({ success: true, message: 'Input sent to process' });
        }
      }

      // Create workspace directory for this user
      const userWorkspace = join(tmpdir(), `devmindx-workspace-${userId}`);
      const workspaceDir = join(userWorkspace, 'workspace');

      // Create new session or use existing one
      let session: TerminalSession;
      if (sessionId && terminalSessions.has(sessionId)) {
        session = terminalSessions.get(sessionId)!;
        // Update working directory to workspace subdirectory where files are
        session.workingDirectory = workspaceDir;
        // Kill existing process if it's still running
        if (session.process && session.isActive) {
          session.process.kill();
        }
      } else {
        const newSessionId = uuidv4();
        session = {
          id: newSessionId,
          userId,
          workingDirectory: workspaceDir, // Set to workspace subdirectory
          process: null,
          inputQueue: [],
          outputBuffer: [],
          isActive: false,
          createdAt: new Date()
        };
        terminalSessions.set(newSessionId, session);
      }

      // Ensure working directory exists
      if (!existsSync(session.workingDirectory)) {
        mkdirSync(session.workingDirectory, { recursive: true });
      }

      // Sync files from database to filesystem for execution
      try {
        const storage = await getStorage();
        const userFiles = await storage.getUserFiles(userId, '/workspace');

        // Clear existing files and recreate structure
        if (existsSync(session.workingDirectory)) {
          await fs.rmdir(session.workingDirectory, { recursive: true });
        }
        await fs.mkdir(session.workingDirectory, { recursive: true });

        console.log(`Syncing ${userFiles.length} files to ${session.workingDirectory}`);

        // Write all user files to filesystem
        for (const file of userFiles) {
          if (file.type === 'file' && file.content) {
            // Remove /workspace prefix and create file in working directory
            const relativePath = file.path.replace(/^\/workspace\/?/, '');
            const filePath = relativePath ? join(session.workingDirectory, relativePath) : join(session.workingDirectory, file.name || 'unnamed');
            const fileDir = dirname(filePath);

            // Ensure directory exists
            if (!existsSync(fileDir)) {
              await fs.mkdir(fileDir, { recursive: true });
            }

            // Write file content
            await fs.writeFile(filePath, file.content, 'utf8');
            console.log(`Synced file: ${filePath}`);
          }
        }
      } catch (syncError) {
        console.error('Error syncing files to workspace:', syncError);
        // Continue execution even if sync fails
      }

      let result = '';
      let error = '';

      // Handle special commands
      if (command === 'clear') {
        session.outputBuffer = [];
        return res.json({
          output: '',
          exitCode: 0,
          sessionId: session.id,
          workingDirectory: session.workingDirectory
        });
      }

      // Handle ls/dir commands
      if (command === 'ls' || command === 'dir') {
        try {
          const files = await fs.readdir(session.workingDirectory);
          const fileList = await Promise.all(files.map(async (file) => {
            const filePath = join(session.workingDirectory, file);
            const stats = await fs.stat(filePath);
            const isDir = stats.isDirectory();
            return `${isDir ? '📁' : '📄'} ${file}`;
          }));

          const output = fileList.length > 0 ? fileList.join('\n') : 'Empty directory';
          console.log(`Directory listing for ${session.workingDirectory}: ${output}`);

          return res.json({
            output,
            exitCode: 0,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        } catch (error) {
          console.error('Error listing directory:', error);
          return res.json({
            error: 'Failed to list directory contents',
            exitCode: 1,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        }
      }

      // Handle pwd command
      if (command === 'pwd') {
        const userWorkspaceRoot = join(tmpdir(), `devmindx-workspace-${userId}`, 'workspace');
        const relativePath = path.relative(userWorkspaceRoot, session.workingDirectory) || '.';
        return res.json({
          output: `/workspace${relativePath !== '.' ? '/' + relativePath : ''}`,
          exitCode: 0,
          sessionId: session.id,
          workingDirectory: session.workingDirectory
        });
      }

      // Handle debug command to show detailed info
      if (command === 'debug') {
        try {
          const files = await fs.readdir(session.workingDirectory);
          const fileDetails = await Promise.all(files.map(async (file) => {
            const filePath = join(session.workingDirectory, file);
            const stats = await fs.stat(filePath);
            return `${stats.isDirectory() ? 'DIR' : 'FILE'}: ${file} (${stats.size} bytes)`;
          }));

          const debugInfo = [
            `Working Directory: ${session.workingDirectory}`,
            `User ID: ${userId}`,
            `Session ID: ${session.id}`,
            `Files in directory:`,
            ...fileDetails,
            `Total files: ${files.length}`
          ].join('\n');

          return res.json({
            output: debugInfo,
            exitCode: 0,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        } catch (error) {
          return res.json({
            error: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            exitCode: 1,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        }
      }

      if (command.startsWith('cd ')) {
        const newPath = command.substring(3).trim();
        let targetPath: string;

        if (newPath === '~') {
          targetPath = session.workingDirectory;
        } else if (newPath === '..') {
          targetPath = dirname(session.workingDirectory);
        } else if (path.isAbsolute(newPath)) {
          // Don't allow absolute paths outside workspace for security
          targetPath = join(session.workingDirectory, 'workspace');
        } else {
          targetPath = join(session.workingDirectory, newPath);
        }

        if (existsSync(targetPath) && statSync(targetPath).isDirectory()) {
          session.workingDirectory = targetPath;
          const userWorkspaceRoot = join(tmpdir(), `devmindx-workspace-${userId}`, 'workspace');
          const relativePath = path.relative(userWorkspaceRoot, targetPath) || '.';
          return res.json({
            output: `Changed directory to /workspace${relativePath !== '.' ? '/' + relativePath : ''}`,
            exitCode: 0,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        } else {
          return res.json({
            error: `Directory not found: ${newPath}`,
            exitCode: 1,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        }
      }

      // Handle file execution commands with compilation support
      let actualCommand = command;
      let needsCompilation = false;
      let compilationCommand = '';

      if (command.startsWith('node ') || command.startsWith('python ') || command.startsWith('npm ') || command.startsWith('yarn ') || command.startsWith('pip ')) {
        // These commands should work as-is in the workspace
        actualCommand = command;
      } else if (command.endsWith('.js')) {
        actualCommand = `node ${command}`;
      } else if (command.endsWith('.py')) {
        actualCommand = `python ${command}`;
      } else if (command.endsWith('.ts')) {
        actualCommand = `npx ts-node ${command}`;
      } else if (command.endsWith('.cpp') || command.endsWith('.cc') || command.endsWith('.cxx')) {
        // C++ compilation and execution
        const fileName = command;
        const outputName = fileName.replace(/\.(cpp|cc|cxx)$/, '');
        compilationCommand = `g++ -o ${outputName} ${fileName}`;
        actualCommand = `./${outputName}`;
        needsCompilation = true;
      } else if (command.endsWith('.c')) {
        // C compilation and execution
        const fileName = command;
        const outputName = fileName.replace(/\.c$/, '');
        compilationCommand = `gcc -o ${outputName} ${fileName}`;
        actualCommand = `./${outputName}`;
        needsCompilation = true;
      } else if (command.endsWith('.java')) {
        // Java compilation and execution
        const fileName = command;
        const className = fileName.replace(/\.java$/, '');
        compilationCommand = `javac ${fileName}`;
        actualCommand = `java ${className}`;
        needsCompilation = true;
      } else if (command.endsWith('.go')) {
        // Go compilation and execution
        actualCommand = `go run ${command}`;
      } else if (command.endsWith('.rs')) {
        // Rust compilation and execution
        const fileName = command;
        const outputName = fileName.replace(/\.rs$/, '');
        compilationCommand = `rustc ${fileName} -o ${outputName}`;
        actualCommand = `./${outputName}`;
        needsCompilation = true;
      }

      // Handle compilation if needed
      if (needsCompilation && compilationCommand) {
        try {
          console.log(`Compiling with command: ${compilationCommand} in directory: ${session.workingDirectory}`);

          // Check if source file exists
          const sourceFile = command;
          const sourceFilePath = join(session.workingDirectory, sourceFile);
          if (!existsSync(sourceFilePath)) {
            return res.json({
              error: `Source file not found: ${sourceFile}. Make sure the file is saved and try running 'ls' to see available files.`,
              exitCode: 1,
              sessionId: session.id,
              workingDirectory: session.workingDirectory
            });
          }

          // First compile the code
          const compileProcess = spawn(compilationCommand, {
            cwd: session.workingDirectory,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let compileOutput = '';
          let compileError = '';

          compileProcess.stdout.on('data', (data) => {
            compileOutput += data.toString();
          });

          compileProcess.stderr.on('data', (data) => {
            compileError += data.toString();
          });

          await new Promise<void>((resolve, reject) => {
            compileProcess.on('close', (code) => {
              console.log(`Compilation finished with code: ${code}`);
              if (code !== 0) {
                reject(new Error(`Compilation failed: ${compileError || 'Unknown compilation error'}`));
              } else {
                resolve();
              }
            });

            compileProcess.on('error', (err) => {
              console.error('Compilation process error:', err);
              reject(err);
            });
          });

          // If compilation successful, continue with execution
          if (compileOutput) {
            session.outputBuffer.push(`Compilation successful: ${compileOutput}`);
            console.log('Compilation successful');
          }

        } catch (compileErr) {
          console.error('Compilation error:', compileErr);
          return res.json({
            error: compileErr instanceof Error ? compileErr.message : 'Compilation failed',
            exitCode: 1,
            sessionId: session.id,
            workingDirectory: session.workingDirectory
          });
        }
      }

      // Execute command with proper environment
      console.log(`Executing command: ${actualCommand} in directory: ${session.workingDirectory}`);

      const childProcess = spawn(actualCommand, {
        cwd: session.workingDirectory,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PATH: process.env.PATH,
          NODE_PATH: join(session.workingDirectory, 'node_modules'),
          PYTHONUNBUFFERED: '1', // For Python real-time output
          FORCE_COLOR: '0' // Disable colors for cleaner output
        }
      });

      session.process = childProcess;
      session.isActive = true;

      let isInteractive = false;
      let outputTimeout: NodeJS.Timeout;

      // Handle real-time output
      childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        result += output;
        session.outputBuffer.push(output);

        // Check if program is waiting for input
        const lowerOutput = output.toLowerCase();
        if (lowerOutput.includes('enter') ||
          lowerOutput.includes('input') ||
          lowerOutput.includes('name') ||
          lowerOutput.includes('number') ||
          lowerOutput.includes('choice') ||
          lowerOutput.includes('?') ||
          lowerOutput.includes(':') && !lowerOutput.includes('error')) {
          isInteractive = true;

          // Clear any existing timeout
          if (outputTimeout) {
            clearTimeout(outputTimeout);
          }
        }
      });

      childProcess.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        error += errorOutput;
        session.outputBuffer.push(errorOutput);
      });

      // Handle process completion with timeout for interactive programs
      const processPromise = new Promise<void>((resolve, reject) => {
        childProcess.on('close', (code) => {
          session.isActive = false;
          if (outputTimeout) {
            clearTimeout(outputTimeout);
          }

          if (code !== 0 && error && !isInteractive) {
            reject(new Error(error || `Command failed with code ${code}`));
          } else {
            resolve();
          }
        });

        childProcess.on('error', (err) => {
          session.isActive = false;
          if (outputTimeout) {
            clearTimeout(outputTimeout);
          }
          reject(err);
        });

        // Set timeout for interactive detection
        outputTimeout = setTimeout(() => {
          if (session.isActive && (result || error)) {
            // If process is still running and has output, it might be waiting for input
            isInteractive = true;
            resolve();
          }
        }, 2000); // Wait 2 seconds for output
      });

      await processPromise;

      // If interactive, return partial results and keep session active
      if (isInteractive && session.isActive) {
        return res.json({
          output: result,
          error: error || undefined,
          exitCode: 0,
          sessionId: session.id,
          workingDirectory: session.workingDirectory,
          isInteractive: true,
          message: 'Program is waiting for input. Use the input field below to provide input.'
        });
      }

      res.json({
        output: result,
        error: error || undefined,
        exitCode: 0,
        sessionId: session.id,
        workingDirectory: session.workingDirectory
      });

    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Command execution failed',
        output: err instanceof Error ? err.message : ''
      });
    }
  });

  // Endpoint to send input to an active terminal session
  app.post("/api/ide/terminal/input", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId, input } = req.body;
      const userId = req.user.id;

      const session = terminalSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (!session.isActive || !session.process) {
        return res.status(400).json({ error: 'Session is not active' });
      }

      session.process.stdin.write(input + '\n');
      res.json({ success: true, message: 'Input sent to process' });

    } catch (err) {
      res.status(500).json({ error: 'Failed to send input' });
    }
  });

  // Endpoint to get session status and output
  app.get("/api/ide/terminal/session/:sessionId", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = terminalSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        sessionId: session.id,
        workingDirectory: session.workingDirectory,
        isActive: session.isActive,
        outputBuffer: session.outputBuffer,
        createdAt: session.createdAt
      });

    } catch (err) {
      res.status(500).json({ error: 'Failed to get session status' });
    }
  });

  // Endpoint to kill a terminal session
  app.delete("/api/ide/terminal/session/:sessionId", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = terminalSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.process && session.isActive) {
        session.process.kill();
      }

      terminalSessions.delete(sessionId);
      res.json({ success: true, message: 'Session terminated' });

    } catch (err) {
      res.status(500).json({ error: 'Failed to terminate session' });
    }
  });

  // Cleanup old sessions periodically
  setInterval(() => {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of terminalSessions.entries()) {
      if (now.getTime() - session.createdAt.getTime() > maxAge) {
        if (session.process && session.isActive) {
          session.process.kill();
        }
        terminalSessions.delete(sessionId);
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  // Real code execution endpoint with enhanced support
  app.post("/api/ide/run", authenticateToken, async (req, res) => {
    const { filePath, content, language } = req.body;

    if (!content || !language) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const tempDir = join(tmpdir(), `devmindx-${uuidv4()}`);
    const fileName = filePath.split('/').pop() || `code.${language}`;
    const tempFilePath = join(tempDir, fileName);

    try {
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      writeFileSync(tempFilePath, content);

      if (language === 'javascript' && content.includes('require(')) {
        writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
          name: "temp-project",
          version: "1.0.0",
          main: fileName,
          scripts: {
            start: "node " + fileName
          }
        }));
      }

      let command: string;
      let args: string[] = [];

      switch (language) {
        case 'javascript':
          command = 'node';
          args = [tempFilePath];
          break;
        case 'typescript':
          await new Promise<void>((resolve, reject) => {
            exec('npm install -g ts-node typescript', (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          command = 'ts-node';
          args = [tempFilePath];
          break;
        case 'python':
          command = 'python';
          args = [tempFilePath];
          break;
        case 'java':
          // Extract the public class name from the content
          const publicClassMatch = content.match(/public\s+class\s+(\w+)/);
          const actualClassName = publicClassMatch ? publicClassMatch[1] : fileName.replace('.java', '');
          
          // Create a file with the correct name matching the public class
          const correctFileName = `${actualClassName}.java`;
          const correctFilePath = join(tempDir, correctFileName);
          
          // Write the file with the correct name
          writeFileSync(correctFilePath, content);
          
          // Compile the Java file
          await new Promise<void>((resolve, reject) => {
            exec(`javac ${correctFilePath}`, { cwd: tempDir }, (error, stdout, stderr) => {
              if (error) {
                reject(new Error(stderr || error.message));
              } else {
                resolve();
              }
            });
          });
          
          command = 'java';
          args = ['-cp', tempDir, actualClassName];
          break;
        case 'cpp':
          const outputFile = join(tempDir, 'a.out');
          await new Promise<void>((resolve, reject) => {
            exec(`g++ ${tempFilePath} -o ${outputFile}`, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          command = outputFile;
          break;
        case 'html':
          return res.json({
            output: 'HTML file saved. Open in browser to view.',
            filePath: tempFilePath
          });
        default:
          return res.status(400).json({ error: `Unsupported language: ${language}` });
      }

      const process = spawn(command, args, {
        cwd: tempDir
      });

      let output = '';
      let errorOutput = '';

      if (req.body.stdin) {
        process.stdin.write(req.body.stdin + '\n');
        process.stdin.end();
      }

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      const exitCode = await new Promise<number>((resolve) => {
        process.on('close', (code) => {
          resolve(code || 0);
        });
      });

      try {
        unlinkSync(tempFilePath);
        if (language === 'cpp' && existsSync(join(tempDir, 'a.out'))) {
          unlinkSync(join(tempDir, 'a.out'));
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }

      if (exitCode !== 0) {
        return res.json({
          error: errorOutput || `Process exited with code ${exitCode}`,
          output: output
        });
      }

      return res.json({ output });
    } catch (error) {
      console.error('Code execution error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        output: error instanceof Error ? error.message : ''
      });
    }
  });

  app.post("/api/ide/upload", authenticateToken, async (req: any, res) => {
    try {
      res.json({ message: "Files uploaded successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Export current workspace
  app.get("/api/ide/export-workspace", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const storage = await getStorage();

      // Get all workspace files
      const workspaceFiles = await storage.getUserFiles(userId, '/workspace');

      if (workspaceFiles.length === 0) {
        return res.status(404).json({ message: "No files found in workspace" });
      }

      // Create a temporary directory for the workspace
      const tempDir = join(tmpdir(), `workspace-export-${userId}-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      try {
        // Write all files to the temporary directory
        for (const file of workspaceFiles) {
          if (file.type === 'file' && file.content) {
            // Remove /workspace prefix and create clean file structure
            const relativePath = file.path.replace(/^\/workspace\/?/, '');
            const filePath = relativePath ? join(tempDir, relativePath) : join(tempDir, file.name || 'unnamed');
            const fileDir = dirname(filePath);

            // Ensure directory exists
            if (!existsSync(fileDir)) {
              await fs.mkdir(fileDir, { recursive: true });
            }

            // Write file content
            await fs.writeFile(filePath, file.content, 'utf8');
          }
        }

        // Create README.md with workspace info
        const readmePath = join(tempDir, 'README.md');
        const readmeContent = `# DevMindX Workspace Export

**Exported:** ${new Date().toLocaleDateString()}
**Files:** ${workspaceFiles.filter(f => f.type === 'file').length}
**User:** ${userId}

This workspace was exported from DevMindX - AI-Powered Development Environment.

## Getting Started

1. Extract this archive to your desired location
2. Open the files in your preferred code editor
3. Install any dependencies if needed (check for package.json, requirements.txt, etc.)
4. Start coding!

---
*Generated by DevMindX*
`;
        await fs.writeFile(readmePath, readmeContent, 'utf8');

        // Create TAR.GZ file
        const archivePath = join(tmpdir(), `workspace-${Date.now()}.tar.gz`);

        // Use system tar command to create archive
        await new Promise<void>((resolve, reject) => {
          const tarCommand = `tar -czf "${archivePath}" -C "${tempDir}" .`;

          exec(tarCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('Archive creation error:', error);
              // Fallback: create a simple text file with workspace info
              const fallbackContent = `Workspace Export\nFiles: ${workspaceFiles.length}\nExported: ${new Date().toISOString()}\n\nNote: Archive creation failed. Please contact support.`;
              res.setHeader('Content-Type', 'text/plain');
              res.setHeader('Content-Disposition', `attachment; filename="workspace_info.txt"`);
              res.send(fallbackContent);
              resolve();
            } else {
              resolve();
            }
          });
        });

        // Check if archive was created successfully
        if (existsSync(archivePath)) {
          // Set response headers for file download
          res.setHeader('Content-Type', 'application/gzip');
          res.setHeader('Content-Disposition', `attachment; filename="workspace-${new Date().toISOString().split('T')[0]}.tar.gz"`);

          // Stream the archive file to response
          const archiveStream = createReadStream(archivePath);
          archiveStream.pipe(res);

          // Clean up files after streaming
          archiveStream.on('end', async () => {
            try {
              await fs.unlink(archivePath);
            } catch (cleanupError) {
              console.error('Error cleaning up archive file:', cleanupError);
            }
          });
        }

        // Clean up temporary directory after a delay
        setTimeout(async () => {
          try {
            await fs.rmdir(tempDir, { recursive: true });
          } catch (cleanupError) {
            console.error('Error cleaning up temp directory:', cleanupError);
          }
        }, 5000);

      } catch (error) {
        // Clean up on error
        try {
          await fs.rmdir(tempDir, { recursive: true });
        } catch (cleanupError) {
          console.error('Error cleaning up temp directory after error:', cleanupError);
        }
        throw error;
      }

    } catch (error) {
      console.error('Export workspace error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/mongo-test', async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const collections = await db.listCollections().toArray();
      res.json({ success: true, collections });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  // Collaboration API endpoints
  app.post("/api/collaboration/create-session", authenticateToken, async (req: any, res) => {
    try {
      const { projectId, sessionName, settings } = req.body;
      const userId = req.user.id;
      const username = req.user.username;

      // Create collaboration invite with matching session ID
      const inviteCode = uuidv4().substring(0, 8).toUpperCase();
      const sessionId = inviteCode; // Use invite code as session ID for easy lookup

      // Create the actual session in the collaboration server
      const session = {
        id: sessionId,
        projectId: projectId || 'default-project',
        hostUserId: userId,
        hostUsername: username,
        sessionName: sessionName || 'Collaboration Session',
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        maxParticipants: 10,
        participants: [{
          userId,
          username,
          email: req.user.email || '',
          joinedAt: new Date(),
          isOnline: true,
          lastActivity: new Date(),
          color: '#FF6B6B'
        }],
        settings: {
          allowFileEditing: true,
          allowChat: true,
          allowUserKick: true,
          requireApproval: false,
          autoSave: true,
          ...settings
        }
      };

      // TODO: Store the session in the collaboration server
      // collaborationServer.createSession(session);

      const invite = {
        id: uuidv4(),
        sessionId: sessionId,
        inviteCode,
        hostUserId: userId,
        hostUsername: username,
        projectName: sessionName || 'Collaboration Session',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        maxUses: 10,
        currentUses: 0
      };

      res.json({
        success: true,
        invite,
        collaborationUrl: `${req.protocol}://${req.get('host')}/collaborate/${invite.inviteCode}`,
        inviteCode: invite.inviteCode,
        sessionId: invite.sessionId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create collaboration session'
      });
    }
  });

  app.get("/api/collaboration/session/:sessionId", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = getSession(sessionId);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }

      // Convert Map to array for frontend compatibility
      const sessionResponse = {
        ...session,
        participants: Array.from(session.participants.values())
      };
      res.json({ success: true, session: sessionResponse });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session'
      });
    }
  });

  app.post("/api/collaboration/join-session", authenticateToken, async (req: any, res) => {
    try {
      const { inviteCode } = req.body;
      const userId = req.user.id;
      const username = req.user.username;
      const email = req.user.email;

      // Find session by invite code (session ID matches invite code)
      const session = getSession(inviteCode);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Invalid invite code' });
      }

      // Session exists in memory, so it's active

      // Check if user is already a participant
      const existingParticipant = session.participants.get(userId);
      if (existingParticipant) {
        // Update existing participant
        session.participants.set(userId, {
          ...existingParticipant,
          username,
          color: existingParticipant.color || '#' + Math.floor(Math.random() * 16777215).toString(16)
        });
      } else {
        // Add new participant
        const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color
        const participant = {
          userId,
          username,
          color: userColor
        };
        session.participants.set(userId, participant);
      }

      // Convert Map to array for frontend compatibility
      const sessionResponse = {
        ...session,
        participants: Array.from(session.participants.values())
      };
      res.json({ success: true, session: sessionResponse });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join session'
      });
    }
  });

  app.delete("/api/collaboration/end-session/:sessionId", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }

      if (session.hostUserId !== userId) {
        return res.status(403).json({ success: false, error: 'Only the host can end the session' });
      }

      // TODO: Implement endSession functionality
      const success = true; // collaborationServer.endSession(sessionId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to end session'
      });
    }
  });

  app.get("/api/collaboration/active-sessions", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const activeSessions: any[] = []; // TODO: Implement getActiveSessions

      // Filter sessions where user is host or participant
      const userSessions = activeSessions.filter((session: any) =>
        session.hostUserId === userId ||
        session.participants.some((p: any) => p.userId === userId)
      );

      res.json({ success: true, sessions: userSessions });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active sessions'
      });
    }
  });

  // Handle collaboration invite links
  app.get("/collaborate/:inviteCode", async (req: any, res) => {
    try {
      const { inviteCode } = req.params;

      // Redirect to the main page with the invite code and logout parameter
      res.redirect(`/?invite=${inviteCode}&logout=true`);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'Invalid collaboration link'
      });
    }
  });

  // Get session info by invite code (for joining)
  app.get("/api/collaboration/invite/:inviteCode", async (req: any, res) => {
    try {
      const { inviteCode } = req.params;

      // Find session by invite code
      const activeSessions: any[] = []; // TODO: Implement getActiveSessions
      const session = activeSessions.find((s: any) => s.id === inviteCode);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Invalid invite code or session not found'
        });
      }

      res.json({
        success: true,
        session: {
          id: session.id,
          sessionName: session.sessionName,
          hostUsername: session.hostUsername,
          participants: session.participants.length,
          maxParticipants: session.maxParticipants
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session info'
      });
    }
  });

  return server;
}