import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, insertProjectSchema } from "../shared/schema.js";
import { generateToken, hashPassword, authenticateUser, generateVerificationToken, verifyToken, generateOTP, getOTPExpiry } from "./services/auth.js";
import { sendVerificationEmail, sendOTPVerificationEmail } from "./services/email.js";

import { createMongoIdFilter } from './db.js';

import { generateProjectWithAI, generateCodeWithAI, chatWithAIModel, analyzeCodeWithAI, getAvailableModels } from "./services/aiService.js";
import { AIModelId as AIModel } from '../shared/types.js';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';
import { User } from '../shared/schema.js';
import { connectToMongoDB } from './db.js';
import { ObjectId } from 'mongodb';
import { spawn, exec } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, IStorage } from './storage.js';

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

  // Middleware to get storage instance
  // REMOVED: app.use(async (req, res, next) => {
  // REMOVED:   req.storage = await getStorage();
  // REMOVED:   next();
  // REMOVED: });

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
            await storage.updateUser(Number(user.id), { googleId: profile.id, isVerified: true });
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
            await storage.updateUser(Number(user.id), { githubId: profile.id, isVerified: true });
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

      // Generate a verification token (e.g., UUID or a random string)
      const verificationToken = uuidv4();
      await storage.updateUser(newUser.id, { verificationToken });

      // Send verification email
      await sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({ message: 'User registered. Please check your email for verification.' });
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
      
      await storage.updateUser(Number(user.id), {
        isVerified: true,
        otp: null,
        otpExpiry: null
      });
      
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

  // Project generation with enhanced file structure
  app.post("/api/projects/generate", authenticateToken, async (req: any, res) => {
    try {
      const { name, framework, description, model = 'together' } = req.body;
      const userId = req.user.id;
      
      const storage = await getStorage(); // Add this line

      const generatedProject = await generateProjectWithAI({
        prompt: description,
        model,
        framework,
        name
      });
      
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
        // Create a normalized path for the file system
        const normalizedPath = `/workspace/${filePath.replace(/^\/+/, '')}`;
        
        // Determine if it's a file or folder
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
          // Continue with other files even if one fails
        }
      }

      res.json({
        ...project,
        files: generatedProject.files || {}
      });
    } catch (error) {
      console.error('Generate project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const storage = await getStorage(); // Add this line
      const project = await storage.getProject(req.params.id);
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Get project error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Load a project's files into the IDE workspace
  app.get("/api/projects/:id/load", authenticateToken, async (req: any, res) => {
    try {
      const projectId = req.params.id; // Project ID is now a string
      const userId = req.user.id;
      
      const storage = await getStorage(); // Add this line

      // Get the project
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Clear existing workspace files
      const existingFiles = await storage.getUserFiles(userId, '/workspace');
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
            userId,
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
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.id) {
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
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.id) {
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
      await db.collection('users').updateOne(
        { _id: createMongoIdFilter(userId) },
        { $inc: { [`usage.${modelId}`]: tokens } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating token usage:', error);
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
      const { model = 'together', prompt } = req.body;
      
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
      const { instruction, model = 'together', context, language } = req.body;
      
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
      const { message, model = 'together', chatHistory, projectContext } = req.body;
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
        projectContext
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
      const { code, task, model = 'together' } = req.body;
      
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

  // Chat routes with better error handling

// Get user's chat history
app.get("/api/chat/history", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const db = await connectToMongoDB(); // Keep direct DB connection for chat history
    
    // Get chat history from MongoDB
    const chatHistory = await db.collection('chatHistory').findOne({ userId });
    
    if (chatHistory) {
      res.json({ messages: chatHistory.messages || [] });
    } else {
      res.json({ messages: [] });
    }
  } catch (error: any) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: error.message || 'Failed to get chat history' });
  }
});

// Clear user's chat history
app.delete("/api/chat/history", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const db = await connectToMongoDB(); // Keep direct DB connection for chat history
    
    // Delete chat history from MongoDB
    await db.collection('chatHistory').deleteOne({ userId });
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error: any) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: error.message || 'Failed to clear chat history' });
  }
});

// Get project-specific chat session
app.get("/api/chat/:projectId", authenticateToken, async (req: any, res) => {
  try {
    const storage = await getStorage(); // Add this line
    const chatSession = await storage.getProjectChatSession(parseInt(req.params.projectId));
    res.json(chatSession || { messages: [] });
  } catch (error: any) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: error.message || 'Failed to get chat session' });
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

  app.get("/api/ide/files", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const path = req.query.path || '/';
      
      const storage = await getStorage(); // Add this line

      // Get files from storage
      const files = await storage.getUserFiles(userId, path as string);
      
      // If no files found and this is the root path, return default files
      if (files.length === 0 && (path === '/' || path === '/workspace')) {
        // Create default workspace structure if it doesn't exist
        const defaultFiles = [
          { name: 'src', type: 'folder', path: '/workspace/src' },
          { name: 'index.html', type: 'file', path: '/workspace/src/index.html', content: '<html>\n  <head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="styles.css">\n  </head>\n  <body>\n    <h1>Welcome to DevMindX</h1>\n    <p>Start coding your project here!</p>\n    <script src="script.js"></script>\n  </body>\n</html>' },
          { name: 'styles.css', type: 'file', path: '/workspace/src/styles.css', content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}\n' },
          { name: 'script.js', type: 'file', path: '/workspace/src/script.js', content: 'console.log("Hello from DevMindX!");' },
          { name: 'package.json', type: 'file', path: '/workspace/package.json', content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A project created with DevMindX",\n  "main": "index.js",\n  "scripts": {\n    "test": "echo \"Error: no test specified\" && exit 1"\n  },\n  "keywords": [],\n  "author": "",\n  "license": "ISC"\n}' },
          { name: 'README.md', type: 'file', path: '/workspace/README.md', content: '# My Project\n\nThis is a project created with DevMindX.\n\n## Getting Started\n\n1. Edit the files in the `src` folder\n2. Run your project\n3. Enjoy coding!' }
        ];
        
        // Create the default files in storage
        for (const file of defaultFiles) {
          await storage.createFile({
            userId,
            path: file.path,
            content: file.content || '',
            type: file.type as 'file' | 'folder'
          });
        }
        
        // Return the created files
        return res.json(defaultFiles);
      }
      
      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Enhanced terminal execution that works with real files
  app.post("/api/ide/terminal", authenticateToken, async (req: any, res) => {
    try {
      const { command, workingDirectory } = req.body;
      
      const tempDir = join(tmpdir(), `devmindx-${uuidv4()}`);
      mkdirSync(tempDir, { recursive: true });
      
      let result = '';
      let error = '';
      
      if (command.startsWith('npm install') || command.startsWith('npm i')) {
        const process = spawn('npm', ['install'], { 
          cwd: tempDir,
          shell: true 
        });
        
        await new Promise<void>((resolve, reject) => {
          process.stdout.on('data', (data) => {
            result += data.toString();
          });
          
          process.stderr.on('data', (data) => {
            error += data.toString();
          });
          
          process.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(error || `npm install failed with code ${code}`));
            } else {
              resolve();
            }
          });
        });
      } else {
        const process = spawn(command, {
          cwd: tempDir,
          shell: true
        });
        
        await new Promise<void>((resolve, reject) => {
          process.stdout.on('data', (data) => {
            result += data.toString();
          });
          
          process.stderr.on('data', (data) => {
            error += data.toString();
          });
          
          process.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(error || `Command failed with code ${code}`));
            } else {
              resolve();
            }
          });
        });
      }
      
      res.json({ output: result, exitCode: 0 });
    } catch (err) {
      res.status(500).json({ 
        error: err instanceof Error ? err.message : 'Command execution failed',
        output: err instanceof Error ? err.message : ''
      });
    }
  });

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
          const className = fileName.replace('.java', '');
          await new Promise<void>((resolve, reject) => {
            exec(`javac ${tempFilePath}`, { cwd: tempDir }, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          command = 'java';
          args = ['-cp', tempDir, className];
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

  app.get('/mongo-test', async (req, res) => {
    try {
      const db = await connectToMongoDB();
      const collections = await db.listCollections().toArray();
      res.json({ success: true, collections });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}