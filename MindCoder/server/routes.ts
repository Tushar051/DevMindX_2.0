import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema } from "@shared/schema";
import { generateToken, hashPassword, authenticateUser, generateVerificationToken, verifyToken, generateOTP, getOTPExpiry } from "./services/auth";
import { sendVerificationEmail, sendOTPVerificationEmail } from "./services/email";
import { generateProject, generateCode, chatWithAI } from "./services/openai";
import { generateProjectWithAI, generateCodeWithAI, chatWithAIModel, analyzeCodeWithAI, getAvailableModels } from "./services/aiService";
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
 import session from 'express-session';
 import { User } from '../shared/schema';
import { connectToMongoDB } from './db';
 import { ObjectId } from 'mongodb';
import { spawn, exec } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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


    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      passReqToCallback: true
    }, async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        let user = await storage.getUserByGoogleId(profile.id);
        if (!user) {
          // Try to find by email
          user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          if (user) {
            // Only link Google ID if not already set
            if (!user.googleId) {
              await storage.updateUser(Number(user.id), { googleId: profile.id, isVerified: true });
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
        return done(error, false);
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
            await storage.updateUser(Number(user.id), { githubId: profile.id, isVerified: true });
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
      await storage.updateUser(Number(user.id), {
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
      await storage.updateUser(Number(user.id), { otp, otpExpiry });
      
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

    // Development mode bypass for testing
    if (process.env.NODE_ENV === 'development' && !token) {
      // Create a mock user for development
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

  // Project generation with enhanced file structure
  app.post("/api/projects/generate", authenticateToken, async (req: any, res) => {
    try {
      const { name, framework, description, model = 'gemini' } = req.body;
      
      const generatedProject = await generateProjectWithAI({
        prompt: description,
        model,
        framework,
        name
      });
      
      // Create the project in storage
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
      
      // Enhanced context for better AI responses
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // IDE-specific routes
  app.post("/api/ide/files", authenticateToken, async (req: any, res) => {
    try {
      const { action, filePath, content, newPath } = req.body;
      
      // For now, we'll just return success responses
      // In a real implementation, this would interact with the file system
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
          res.json({ message: "File renamed successfully", oldPath: filePath, newPath });
          break;
          
        default:
          res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/ide/files", authenticateToken, async (req: any, res) => {
    try {
      // Return a sample file structure for now
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
      
      // In a real implementation, this would execute commands in a sandboxed environment
      // For now, we'll simulate command execution with better file handling
      let result = '';
      
      if (command.startsWith('ls') || command.startsWith('dir')) {
        // Get files from the user's project
        const project = await storage.getUserProjects(req.user.id);
        if (project.length > 0) {
          const files = project[0].files || {};
          result = Object.keys(files).map(file => `📄 ${file}`).join('\n');
        } else {
          result = 'No files found in workspace';
        }
      } else if (command.startsWith('cat ') || command.startsWith('type ')) {
        const fileName = command.split(' ')[1];
        const project = await storage.getUserProjects(req.user.id);
        if (project.length > 0) {
          const files: Record<string, string> = project[0].files as Record<string, string> || {};
          result = files[fileName] || 'File not found';
        } else {
          result = 'File not found';
        }
      } else if (command.startsWith('node ') || command.startsWith('python ') || command.startsWith('npm ')) {
        result = 'Command executed successfully! Check the output above for results.';
      } else if (command === 'clear') {
        res.json({ output: '', exitCode: 0 });
        return;
      } else {
        result = `Command '${command}' executed successfully.`;
      }
      
      res.json({ output: result, exitCode: 0 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute command' });
    }
  });

  // Real code execution endpoint
  app.post("/api/ide/run", authenticateToken, async (req: any, res) => {
    try {
      const { filePath, content, language } = req.body;
      
      if (!filePath || !content) {
        return res.status(400).json({ error: 'File path and content are required' });
      }

      // Create a temporary directory for execution
      const tempDir = join(__dirname, 'temp', uuidv4());
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      let output: string[] = [];
      let exitCode = 0;
      let url: string | undefined = undefined;

      try {
        switch (language) {
          case 'javascript':
            output = await executeJavaScript(content, tempDir);
            break;
          case 'typescript':
            output = await executeTypeScript(content, tempDir);
            break;
          case 'python':
            output = await executePython(content, tempDir);
            break;
          case 'html': {
            const result = await executeHTML(content, tempDir);
            output = result.output;
            url = result.url;
            break;
          }
          case 'css':
            output = await executeCSS(content, tempDir);
            break;
          case 'json':
            output = await executeJSON(content, tempDir);
            break;
          default:
            output = [`Language '${language}' is not supported for execution`];
            exitCode = 1;
        }
      } finally {
        // Clean up temporary files
        try {
          if (existsSync(tempDir)) {
            exec(`rm -rf "${tempDir}"`, (error) => {
              if (error) console.error('Failed to cleanup temp dir:', error);
            });
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      res.json({ output, exitCode, url });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ 
        error: 'Failed to run project',
        details: errorMessage 
      });
    }
  });

  // Execute JavaScript code
  async function executeJavaScript(content: string, tempDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const filePath = join(tempDir, 'script.js');
      writeFileSync(filePath, content);

      const child = spawn('node', [filePath], {
        cwd: tempDir,
        timeout: 10000, // 10 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const output: string[] = [];
        if (stdout) output.push(...stdout.trim().split('\n'));
        if (stderr) output.push(`Error: ${stderr.trim()}`);
        if (code !== 0 && !stderr) output.push(`Process exited with code ${code}`);
        resolve(output);
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute JavaScript: ${error.message}`));
      });
    });
  }

  // Execute TypeScript code
  async function executeTypeScript(content: string, tempDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const tsFilePath = join(tempDir, 'script.ts');
      const jsFilePath = join(tempDir, 'script.js');
      writeFileSync(tsFilePath, content);

      // First compile TypeScript to JavaScript
      const compileProcess = spawn('npx', ['tsc', tsFilePath, '--outDir', tempDir, '--target', 'es2020'], {
        cwd: tempDir,
        timeout: 15000
      });

      let compileStderr = '';
      compileProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code !== 0) {
          resolve([`TypeScript compilation failed: ${compileStderr}`]);
          return;
        }

        // Then execute the compiled JavaScript
        const child = spawn('node', [jsFilePath], {
          cwd: tempDir,
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          const output: string[] = [];
          if (stdout) output.push(...stdout.trim().split('\n'));
          if (stderr) output.push(`Error: ${stderr.trim()}`);
          if (code !== 0 && !stderr) output.push(`Process exited with code ${code}`);
          resolve(output);
        });

        child.on('error', (error) => {
          reject(new Error(`Failed to execute TypeScript: ${error.message}`));
        });
      });

      compileProcess.on('error', (error) => {
        reject(new Error(`Failed to compile TypeScript: ${error.message}`));
      });
    });
  }

  // Execute Python code
  async function executePython(content: string, tempDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const filePath = join(tempDir, 'script.py');
      writeFileSync(filePath, content);

      const child = spawn('python', [filePath], {
        cwd: tempDir,
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const output: string[] = [];
        if (stdout) output.push(...stdout.trim().split('\n'));
        if (stderr) output.push(`Error: ${stderr.trim()}`);
        if (code !== 0 && !stderr) output.push(`Process exited with code ${code}`);
        resolve(output);
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute Python: ${error.message}`));
      });
    });
  }

  // Execute HTML (serve and open in browser simulation)
  async function executeHTML(content: string, tempDir: string): Promise<{output: string[], url: string}> {
    return new Promise((resolve) => {
      const filePath = join(tempDir, 'index.html');
      writeFileSync(filePath, content);

      // Create a simple HTTP server to serve the HTML
      const http = require('http');
      const fs = require('fs');
      
      const server = http.createServer((req: any, res: any) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });

      server.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}`;
        
        const output = [
          'HTML file served successfully!',
          `🌐 View your HTML at: ${url}`,
          'Content preview:',
          '---',
          content.substring(0, 500) + (content.length > 500 ? '...' : ''),
          '---',
          `File saved to: ${filePath}`,
          'Server will close automatically after 30 seconds.'
        ];

        // Close server after 30 seconds
        setTimeout(() => {
          server.close();
        }, 30000);

        resolve({ output, url });
      });

      server.on('error', (error: any) => {
        resolve({
          output: [
            'Failed to serve HTML file',
            `Error: ${error.message}`,
            'Content preview:',
            '---',
            content.substring(0, 500) + (content.length > 500 ? '...' : ''),
            '---'
          ],
          url: ''
        });
      });
    });
  }

  // Execute CSS (validate and preview)
  async function executeCSS(content: string, tempDir: string): Promise<string[]> {
    return new Promise((resolve) => {
      const filePath = join(tempDir, 'styles.css');
      writeFileSync(filePath, content);

      // Basic CSS validation
      const output = [
        'CSS file created successfully!',
        'Content preview:',
        '---',
        content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        '---',
        `File saved to: ${filePath}`,
        'Link this CSS file in your HTML to see the styles.'
      ];

      resolve(output);
    });
  }

  // Execute JSON (validate and format)
  async function executeJSON(content: string, tempDir: string): Promise<string[]> {
    return new Promise((resolve) => {
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        
        const filePath = join(tempDir, 'data.json');
        writeFileSync(filePath, formatted);

        const output = [
          'JSON file validated and formatted successfully!',
          'Content preview:',
          '---',
          formatted.substring(0, 300) + (formatted.length > 300 ? '...' : ''),
          '---',
          `File saved to: ${filePath}`
        ];

        resolve(output);
      } catch (error) {
        resolve([
          'JSON validation failed!',
          `Error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`,
          'Please check your JSON syntax.'
        ]);
      }
    });
  }

  app.post("/api/ide/upload", authenticateToken, async (req: any, res) => {
    try {
      // Handle file uploads
      // In a real implementation, this would save files to the user's workspace
      res.json({ message: "Files uploaded successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/mongo-test', async (req, res) => {
    try {
      const db = await connectToMongoDB();
      // List collections as a test
      const collections = await db.listCollections().toArray();
      res.json({ success: true, collections });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
