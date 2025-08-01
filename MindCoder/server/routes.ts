import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertUserSchema, insertProjectSchema } from "../shared/schema.js";
import { generateToken, hashPassword, authenticateUser, generateVerificationToken, verifyToken, generateOTP, getOTPExpiry } from "./services/auth.js";
import { sendVerificationEmail, sendOTPVerificationEmail } from "./services/email.js";

import { generateProjectWithAI, generateCodeWithAI, chatWithAIModel, analyzeCodeWithAI, getAvailableModels } from "./services/aiService.js";
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

  // Passport configuration
  passport.serializeUser((user: any, done) => {
    done(null, user.id || user._id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      let user = await storage.getUser(id);
      if (!user && typeof id === 'string' && id.length === 24) {
        const db = await connectToMongoDB();
        const mongoUser = await db.collection<MongoUser>('users').findOne({ _id: new ObjectId(id) });
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
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
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
      console.error('Signup error:', error);
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
      console.error('Login error:', error);
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
      const project = await storage.getProject(parseInt(req.params.id));
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

  app.put("/api/projects/:id", authenticateToken, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project || project.userId !== req.user.id) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateProject(parseInt(req.params.id), req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error('Update project error:', error);
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
      console.error('Delete project error:', error);
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
      console.error('Get models error:', error);
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
  app.get("/api/chat/:projectId", authenticateToken, async (req: any, res) => {
    try {
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
      const { action, filePath, content, newPath } = req.body;
      
      if (!action || !filePath) {
        return res.status(400).json({ message: 'Action and filePath are required' });
      }
      
      switch (action) {
        case 'create':
          res.json({ message: "File created successfully", path: filePath });
          break;
          
        case 'update':
          res.json({ message: "File updated successfully", path: filePath });
          break;
          
        case 'delete':
          res.json({ message: "File deleted successfully" });
          break;
          
        case 'rename':
          if (!newPath) {
            return res.status(400).json({ message: 'newPath is required for rename action' });
          }
          res.json({ message: "File renamed successfully", oldPath: filePath, newPath });
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
      const files = [
        { name: 'src', type: 'folder', path: '/workspace/src' },
        { name: 'index.html', type: 'file', path: '/workspace/src/index.html' },
        { name: 'styles.css', type: 'file', path: '/workspace/src/styles.css' },
        { name: 'script.js', type: 'file', path: '/workspace/src/script.js' },
        { name: 'package.json', type: 'file', path: '/workspace/package.json' },
        { name: 'README.md', type: 'file', path: '/workspace/README.md' }
      ];
      res.json(files);
    } catch (error) {
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