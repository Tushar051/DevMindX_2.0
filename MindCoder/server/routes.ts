import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema } from "@shared/schema";
import { generateToken, hashPassword, authenticateUser, generateVerificationToken, verifyToken, generateOTP, getOTPExpiry } from "./services/auth";
import { sendVerificationEmail, sendOTPVerificationEmail } from "./services/email";
import { generateProject, generateCode, chatWithAI } from "./services/openai";
import { generateProjectWithAI, generateCodeWithAI, chatWithAIModel, analyzeCodeWithAI, getAvailableModels } from "./services/aiService";
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { connectToMongoDB } from './db';
import { ObjectId } from 'mongodb';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'devmindx-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.serializeUser((user: any, done) => {
    // Use user.id if available, otherwise fallback to user._id
    done(null, user.id || user._id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      // Try to find by numeric id, then by MongoDB _id
      let user = await storage.getUser(id);
      if (!user && typeof id === 'string' && id.length === 24) {
        // Try to find by MongoDB _id if needed
        const db = await connectToMongoDB();
        const mongoUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
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
  interface GoogleProfile {
    id: string;
    displayName?: string;
    emails?: { value: string }[];
  }

  interface UserCreate {
    username: string;
    email: string;
    password: null | string;
    googleId?: string;
    githubId?: string;
    isVerified?: boolean;
    otp?: string;
    otpExpiry?: Date;
    verificationToken?: string;
  }

  interface User {
      id: string | number;
      googleId?: string | null;
      githubId?: string | null;
      email: string;
      isVerified: boolean | null;
  }

    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      passReqToCallback: false
    }, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: User | null) => void) => {
      try {
        let user = await storage.getUserByGoogleId(profile.id);
        if (!user) {
          // Try to find by email
          user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          if (user) {
            // Only link Google ID if not already set
            if (!user.googleId) {
              await storage.updateUser(user.id, { googleId: profile.id, isVerified: true });
              user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
            }
          } else {
            // Create new user if not found
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
        return done(error, null);
      }
    }));

  // GitHub OAuth Strategy
  interface GitHubProfile {
    id: string;
    username?: string;
    emails?: { value: string }[];
  }

  interface GitHubUserCreate {
    username: string;
    email: string;
    password: null;
    githubId: string;
    isVerified: boolean;
  }

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
  }, async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (error: any, user?: User | null) => void) => {
    try {
      let user = await storage.getUserByGithubId(profile.id);
      if (!user) {
        // Try to find by email
        user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        if (user) {
          // Only link GitHub ID if not already set
          if (!user.githubId) {
            await storage.updateUser(user.id, { githubId: profile.id, isVerified: true });
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          }
        } else {
          // Create new user if not found
          user = await storage.createUser({
            username: profile.username || `user_${profile.id}`,
            email: profile.emails?.[0]?.value || '',
            password: null,
            githubId: profile.id,
            isVerified: true
          } as GitHubUserCreate);
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
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpiry
      });

      await sendOTPVerificationEmail(email, otp);
      
      res.status(201).json({
        message: "User created successfully. Please check your email for the verification code.",
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ message: errorMessage });
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
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      res.status(401).json({ message: errorMessage });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      const user = await storage.verifyUser(token as string);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
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
      
      // Verify the user
      await storage.updateUser(user.id, {
        isVerified: true,
        otp: null,
        otpExpiry: null
      });
      
      // Generate token for auto-login
      const token = generateToken(user);
      
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
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      
      // Update user with new OTP
      await storage.updateUser(user.id, { otp, otpExpiry });
      
      // Send new OTP email
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
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, username: user.username, email: user.email }))}`);
    }
  );

  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
  
  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, username: user.username, email: user.email }))}`);
    }
  );

  // Middleware to verify JWT token
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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
      const projects = await storage.getUserProjects(req.user.id);
      res.json(projects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/projects", authenticateToken, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        userId: req.user.id
      });
      res.status(201).json(project);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid project data';
      res.status(400).json({ message: errorMessage });
    }
  });

  app.post("/api/projects/generate", authenticateToken, async (req: any, res) => {
    try {
      const { name, framework, description, model = 'gemini' } = req.body;
      const generatedProject = await generateProjectWithAI({
        prompt: description,
        model,
        framework,
        name
      });
      
      const project = await storage.createProject({
        name: generatedProject.name || name,
        framework: generatedProject.framework || framework,
        description: generatedProject.description || description,
        userId: req.user.id,
        files: generatedProject.files || {}
      });

      res.json(project);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateProject(parseInt(req.params.id), req.body);
      res.json(updatedProject);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ message: "Project not found" });
      }

      await storage.deleteProject(parseInt(req.params.id));
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // AI Model routes
  app.get("/api/ai/models", authenticateToken, async (req: any, res) => {
    try {
      const models = getAvailableModels();
      res.json(models);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/generate-code", authenticateToken, async (req: any, res) => {
    try {
      const { instruction, model = 'gemini', context, language } = req.body;
      const result = await generateCodeWithAI({
        instruction,
        model,
        context,
        language
      });
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/chat", authenticateToken, async (req: any, res) => {
    try {
      const { message, model = 'gemini', chatHistory, projectContext } = req.body;
      const result = await chatWithAIModel({
        message,
        model,
        chatHistory,
        projectContext
      });
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/analyze-code", authenticateToken, async (req: any, res) => {
    try {
      const { code, task, model = 'gemini' } = req.body;
      const result = await analyzeCodeWithAI(code, task, model);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // AI routes
  app.post("/api/ai/generate-code", authenticateToken, async (req: any, res) => {
    try {
      const { prompt, context } = req.body;
      const code = await generateCode(prompt, context);
      res.json({ code });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/ai/chat", authenticateToken, async (req: any, res) => {
    try {
      const { message, projectId, conversationHistory } = req.body;
      
      let chatSession = null;
      if (projectId) {
        chatSession = await storage.getProjectChatSession(projectId);
        if (!chatSession) {
          chatSession = await storage.createChatSession({
            userId: req.user.id,
            projectId,
            messages: []
          });
        }
      }

      const response = await chatWithAI(message, conversationHistory);
      
      if (chatSession) {
        const updatedMessages = [
          ...(chatSession.messages as any[]),
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: response, timestamp: new Date() }
        ];
        
        await storage.updateChatSession(chatSession.id, { messages: updatedMessages });
      }

      res.json({ response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/chat/:projectId", authenticateToken, async (req: any, res) => {
    try {
      const chatSession = await storage.getProjectChatSession(parseInt(req.params.projectId));
      res.json(chatSession || { messages: [] });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/mongo-test', async (req, res) => {
    try {
      const db = await connectToMongoDB();
      // List collections as a test
      const collections = await db.listCollections().toArray();
      res.json({ success: true, collections });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
