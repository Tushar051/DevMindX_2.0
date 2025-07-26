import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Folder, 
  File, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Play, 
  Terminal, 
  MessageSquare, 
  Send, 
  Settings, 
  Save,
  FolderOpen,
  FileText,
  Code,
  Package,
  Database,
  Globe,
  Zap,
  Brain,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  X,
  FolderPlus,
  FilePlus,
  LogOut,
  Minimize2,
  Maximize2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
  isExpanded?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export default function IDE() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('/workspace');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<'file' | 'folder'>('file');
  const [createDialogName, setCreateDialogName] = useState('');
  const [createDialogPath, setCreateDialogPath] = useState('/workspace');
  const [selectedFolder, setSelectedFolder] = useState<string>('/workspace');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showAIChat, setShowAIChat] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);

  // Initialize with empty workspace
  useEffect(() => {
    setFileTree([]);
    setSelectedFile(null);
    setOpenFiles([]);
    setActiveTab('');
  }, []);

  // Auto-scroll terminal and chat
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Monitor file tree changes
  useEffect(() => {
    console.log('File tree updated:', fileTree);
  }, [fileTree]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const findFileById = useCallback((id: string, nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFileById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findFileByPath = useCallback((path: string, nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFileByPath(path, node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.type === 'file') {
      const isAlreadyOpen = openFiles.find(f => f.id === file.id);
      if (!isAlreadyOpen) {
        setOpenFiles(prev => [...prev, file]);
      }
      setActiveTab(file.id);
      setSelectedFile(file);
    }
  }, [openFiles]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeTab === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveTab(remainingFiles[0].id);
        setSelectedFile(remainingFiles[0]);
      } else {
        setActiveTab('');
        setSelectedFile(null);
      }
    }
  }, [activeTab, openFiles]);

  const saveFile = useCallback(async (fileId: string, content: string) => {
    try {
      const updatedFile = findFileById(fileId, fileTree);
      if (updatedFile) {
        updatedFile.content = content;
        setFileTree([...fileTree]); // Trigger re-render
        
        // Save to backend
        try {
          await fetch('/api/ide/files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              action: 'update',
              filePath: updatedFile.path,
              content: content
            }),
          });
        } catch (error) {
          console.log('Backend save failed, but file is saved locally');
        }
        
        toast({
          title: "File saved",
          description: `${updatedFile.name} has been saved successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error saving file",
        description: "Failed to save the file. Please try again.",
        variant: "destructive",
      });
    }
  }, [fileTree, findFileById, toast]);

  const createFileOrFolder = useCallback((parentPath: string, name: string, type: 'file' | 'folder') => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type,
      path: `${parentPath}/${name}`,
      content: type === 'file' ? getBoilerplateContent(name, type) : '',
      isExpanded: type === 'folder' ? false : undefined,
    };

    // Update file tree with new file/folder
    setFileTree(prevTree => {
      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === parentPath) {
            return {
              ...node,
              children: [...(node.children || []), newFile]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateTree(node.children)
            };
          }
          return node;
        });
      };

      // If parentPath is root (/workspace), add to root level
      if (parentPath === '/workspace') {
        return [...prevTree, newFile];
      }

      return updateTree(prevTree);
    });
    
    // Save to backend
    fetch('/api/ide/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        path: newFile.path,
        content: newFile.content,
        type: newFile.type
      }),
    }).catch(error => {
      console.error('Failed to save file:', error);
    });

    // Open the file if it's a file
    if (type === 'file') {
      openFile(newFile);
    }

    toast({
      title: `${type === 'file' ? 'File' : 'Folder'} created`,
      description: `${name} has been created successfully.`,
    });
  }, [openFile, toast]);

  const deleteFile = useCallback((fileId: string) => {
    setFileTree(prevTree => {
      const removeFile = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => {
          if (node.id === fileId) {
            return false;
          }
          if (node.children) {
            node.children = removeFile(node.children);
          }
          return true;
        });
      };
      return removeFile(prevTree);
    });

    // Remove from open files and tabs
    setOpenFiles(prev => prev.filter(file => file.id !== fileId));
    setActiveTab(prev => {
      if (prev === fileId) {
        const remainingFiles = openFiles.filter(file => file.id !== fileId);
        return remainingFiles.length > 0 ? remainingFiles[0].id : '';
      }
      return prev;
    });

    toast({
      title: "File deleted",
      description: "The file has been removed from the workspace.",
    });
  }, [openFiles, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newFile: FileNode = {
            id: Date.now().toString(),
            name: file.name,
            type: 'file',
            path: `${selectedFolder}/${file.name}`,
            content,
          };
          
          setFileTree(prevTree => [...prevTree, newFile]);
          openFile(newFile);
        };
        reader.readAsText(file);
      });
    }
  }, [selectedFolder, openFile]);

  const executeTerminalCommand = useCallback(async (command: string) => {
    const output: TerminalOutput = {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date(),
    };
    
    setTerminalOutput(prev => [...prev, output]);
    
    // Simulate command execution
    setIsLoading(true);
    
    setTimeout(() => {
      let response = '';
      
      if (command.startsWith('ls') || command.startsWith('dir')) {
        response = fileTree.map(node => 
          `${node.type === 'folder' ? '📁' : '📄'} ${node.name}`
        ).join('\n');
      } else if (command.startsWith('cat ') || command.startsWith('type ')) {
        const fileName = command.split(' ')[1];
        const file = findFileByPath(`/workspace/${fileName}`, fileTree);
        response = file?.content || 'File not found';
      } else if (command.startsWith('node ') || command.startsWith('python ') || command.startsWith('npm ')) {
        response = 'Command executed successfully!';
      } else if (command === 'clear') {
        setTerminalOutput([]);
        setIsLoading(false);
        return;
      } else {
        response = `Command '${command}' executed successfully.`;
      }
      
      const resultOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: response,
        timestamp: new Date(),
      };
      
      setTerminalOutput(prev => [...prev, resultOutput]);
      setIsLoading(false);
    }, 500);
  }, [fileTree, findFileByPath]);

  const handleTerminalSubmit = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      executeTerminalCommand(terminalInput.trim());
      setTerminalInput('');
    }
  }, [terminalInput, executeTerminalCommand]);

  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      // Get current file context
      const currentFileContent = selectedFile?.content || '';
      const currentFileName = selectedFile?.name || '';
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message,
          model: 'gemini',
          chatHistory: chatMessages.slice(-5), // Last 5 messages for context
          projectContext: {
            currentFile: currentFileName,
            currentFileContent,
            fileTree: fileTree.map(node => ({ name: node.name, type: node.type, path: node.path }))
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I apologize, but I couldn\'t process your request.',
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, chatMessages, fileTree]);

  const generateProjectWithAI = useCallback(async (prompt: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: 'AI Generated Project',
          framework: 'react',
          description: prompt,
          model: 'gemini'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const data = await response.json();
      
      // Convert the generated project structure to our FileNode format
      if (data.files) {
        const newFileTree: FileNode[] = [];
        
        Object.entries(data.files).forEach(([path, content]) => {
          const pathParts = path.split('/');
          const fileName = pathParts.pop() || '';
          const folderPath = pathParts.join('/');
          
          // Create folder structure
          let currentLevel = newFileTree;
          pathParts.forEach(part => {
            let folder = currentLevel.find(node => node.name === part && node.type === 'folder');
            if (!folder) {
              folder = {
                id: Date.now().toString() + Math.random(),
                name: part,
                type: 'folder',
                path: `/workspace/${pathParts.slice(0, pathParts.indexOf(part) + 1).join('/')}`,
                children: [],
                isExpanded: true
              };
              currentLevel.push(folder);
            }
            currentLevel = folder.children || [];
          });
          
          // Add file
          const file: FileNode = {
            id: Date.now().toString() + Math.random(),
            name: fileName,
            type: 'file',
            path: `/workspace/${path}`,
            content: content as string
          };
          
          currentLevel.push(file);
        });
        
        // Update the file tree state
        setFileTree(newFileTree);
        
        // Open the first file if available
        if (newFileTree.length > 0) {
          const firstFile = newFileTree.find(node => node.type === 'file') || newFileTree[0];
          if (firstFile.type === 'file') {
            setSelectedFile(firstFile);
            setOpenFiles([firstFile]);
            setActiveTab(firstFile.id);
          }
        }
        
        toast({
          title: "Project generated successfully!",
          description: "Your AI-generated project has been created and loaded into the IDE.",
        });
      }
    } catch (error) {
      toast({
        title: "Error generating project",
        description: "Failed to generate the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const toggleFolder = useCallback((folderId: string) => {
    const updateExpanded = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateExpanded(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateExpanded(fileTree));
  }, [fileTree]);

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    console.log('Rendering file tree:', nodes, 'at level:', level);
    
    return nodes.map(node => (
      <div key={node.id} style={{ paddingLeft: level * 20 }}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 ${
            selectedFile?.id === node.id ? 'bg-blue-600' : 
            node.type === 'folder' && selectedFolder === node.path ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
              // Select folder for file creation
              setSelectedFolder(node.path);
              toggleFolder(node.id);
            } else {
              openFile(node);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
            if (node.type === 'folder') {
              setSelectedFolder(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {node.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              )}
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 text-green-400" />
          )}
          <span className="text-sm text-gray-200">{node.name}</span>
          {node.type === 'folder' && selectedFolder === node.path && (
            <Badge variant="secondary" className="ml-auto text-xs bg-green-600">
              Selected
            </Badge>
          )}
        </div>
        {node.children && node.children.length > 0 && node.isExpanded && (
          <div className="ml-4">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleCreateFileOrFolder = () => {
    if (createDialogName.trim()) {
      createFileOrFolder(createDialogPath, createDialogName.trim(), createDialogType);
      setShowCreateDialog(false);
      setCreateDialogName('');
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  };

  const getLanguageFromFileName = (fileName: string) => {
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.jsx')) return 'javascript';
    if (fileName.endsWith('.tsx')) return 'typescript';
    return 'plaintext';
  };

  const getBoilerplateContent = (fileName: string, fileType: 'file' | 'folder') => {
    if (fileType === 'folder') return '';
    
    const language = getLanguageFromFileName(fileName);
    
    switch (language) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '')}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to ${fileName.replace('.html', '')}</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home">
            <h2>Home</h2>
            <p>This is your main content area. Start building your website here!</p>
        </section>

        <section id="about">
            <h2>About</h2>
            <p>Tell your story here.</p>
        </section>

        <section id="contact">
            <h2>Contact</h2>
            <p>Add your contact information here.</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 ${fileName.replace('.html', '')}. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

      case 'css':
        return `/* ${fileName} - Main Stylesheet */

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

/* Header styles */
header {
    background-color: #333;
    color: white;
    padding: 1rem 0;
    text-align: center;
}

header h1 {
    margin-bottom: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: #555;
}

/* Main content */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
    color: #333;
    margin-bottom: 1rem;
    border-bottom: 2px solid #007bff;
    padding-bottom: 0.5rem;
}

/* Footer */
footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1rem 0;
    margin-top: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
    nav ul {
        flex-direction: column;
        gap: 1rem;
    }
    
    main {
        padding: 1rem;
    }
}`;

      case 'javascript':
        return `// ${fileName} - JavaScript File

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('${fileName} loaded successfully!');
    
    // Initialize your application here
    initializeApp();
});

// Main application initialization
function initializeApp() {
    console.log('Application initialized');
    
    // Add your business logic here
    setupEventListeners();
    loadData();
}

// Setup event listeners
function setupEventListeners() {
    // Example: Add click listeners to navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load data function
function loadData() {
    // Example: Fetch data from API
    console.log('Loading data...');
    
    // Simulate API call
    setTimeout(() => {
        console.log('Data loaded successfully');
    }, 1000);
}

// Utility functions
function showMessage(message, type = 'info') {
    console.log(\`[\${type.toUpperCase()}] \${message}\`);
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setupEventListeners,
        loadData,
        showMessage
    };
}`;

      case 'typescript':
        return `// ${fileName} - TypeScript File

interface AppConfig {
    name: string;
    version: string;
    debug: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// Application configuration
const config: AppConfig = {
    name: '${fileName.replace('.ts', '')}',
    version: '1.0.0',
    debug: true
};

// Main application class
class App {
    private users: User[] = [];
    private config: AppConfig;

    constructor(config: AppConfig) {
        this.config = config;
        this.initialize();
    }

    private initialize(): void {
        console.log(\`\${this.config.name} v\${this.config.version} initialized\`);
        this.setupEventListeners();
        this.loadData();
    }

    private setupEventListeners(): void {
        // Add your event listeners here
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded');
        });
    }

    private async loadData(): Promise<void> {
        try {
            // Simulate API call
            const response = await this.fetchUsers();
            this.users = response;
            console.log(\`Loaded \${this.users.length} users\`);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    private async fetchUsers(): Promise<User[]> {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                ]);
            }, 1000);
        });
    }

    public getUsers(): User[] {
        return this.users;
    }

    public addUser(user: User): void {
        this.users.push(user);
        console.log(\`User \${user.name} added\`);
    }
}

// Initialize application
const app = new App(config);

// Export for module usage
export default App;
export { User, AppConfig };`;

      case 'python':
        return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
${fileName} - Python Script
Description: Add your script description here
Author: Your Name
Date: $(date +%Y-%m-%d)
"""

import sys
import os
from typing import List, Dict, Any
from datetime import datetime

class App:
    """Main application class"""
    
    def __init__(self):
        self.name = "${fileName.replace('.py', '')}"
        self.version = "1.0.0"
        self.debug = True
    
    def initialize(self) -> None:
        """Initialize the application"""
        print(f"Initializing {self.name} v{self.version}")
        self.setup()
        self.run()
    
    def setup(self) -> None:
        """Setup application components"""
        print("Setting up application...")
        # Add your setup logic here
    
    def run(self) -> None:
        """Main application logic"""
        print("Running application...")
        # Add your main business logic here
        self.process_data()
    
    def process_data(self) -> None:
        """Process application data"""
        print("Processing data...")
        # Add your data processing logic here
    
    def cleanup(self) -> None:
        """Cleanup resources"""
        print("Cleaning up...")
        # Add cleanup logic here

def main():
    """Main function"""
    try:
        app = App()
        app.initialize()
    except KeyboardInterrupt:
        print("\\nApplication interrupted by user")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        if 'app' in locals():
            app.cleanup()

if __name__ == "__main__":
    main()`;

      case 'json':
        return `{
  "name": "${fileName.replace('.json', '')}",
  "version": "1.0.0",
  "description": "Add your project description here",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "webpack --mode production"
  },
  "keywords": [],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}`;

      case 'markdown':
        return `# ${fileName.replace('.md', '')}

## Description
Add your project description here.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
const app = require('./index.js');
app.start();
\`\`\`

## API Reference
### \`functionName(param)\`
Description of the function.

**Parameters:**
- \`param\` (string): Description of parameter

**Returns:**
- (string): Description of return value

## Contributing
1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
- Your Name - your.email@example.com
- Project Link: [https://github.com/yourusername/project](https://github.com/yourusername/project)`;

      default:
        return `// ${fileName} - ${language} file
// Add your code here

console.log('Hello from ${fileName}!');`;
    }
  };

  const executeProject = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to run.",
      });
      return;
    }

    setIsLoading(true);
    setTerminalOutput([]); // Clear previous terminal output

    try {
      const response = await fetch('/api/ide/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          filePath: selectedFile.path,
          content: selectedFile.content || '',
          language: getLanguageFromFileName(selectedFile.name)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run project');
      }

      const data = await response.json();
      
      // Convert the output array to terminal output format
      const terminalOutputLines = data.output.map((line: string, index: number) => ({
        id: index.toString(),
        type: 'output' as const,
        content: line,
        timestamp: new Date()
      }));

      setTerminalOutput(terminalOutputLines);
      
      if (data.exitCode === 0) {
        toast({
          title: "Project executed successfully",
          description: `${selectedFile.name} ran without errors.`,
        });
      } else {
        toast({
          title: "Project executed with errors",
          description: `Check the terminal for error details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setTerminalOutput(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error' as const,
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      }]);
      toast({
        title: "Error executing project",
        description: `Failed to execute project. Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, getLanguageFromFileName, toast]);

  // When running a file
  const handleRunFile = async () => {
    if (!selectedFile) return;
    setTerminalOutput([{ type: 'output' as const, value: 'Running...' }]);
    try {
      const response = await fetch('/api/ide/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          filePath: selectedFile.path,
          content: selectedFile.content,
          language: getLanguageFromFileName(selectedFile.name),
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank'); // Open HTML preview in new tab
      }
      setTerminalOutput(data.output.map((line: string) => ({ type: 'output' as const, value: line })));
    } catch (error) {
      setTerminalOutput([{ type: 'output' as const, value: 'Error: Failed to run project' }]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to access the IDE.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">DevMindX IDE</h1>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => executeProject()}
              className="bg-green-600 hover:bg-green-700 border-green-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Project
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAIChat(!showAIChat)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">EXPLORER</h3>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setCreateDialogType('folder');
                    setCreateDialogPath(selectedFolder);
                    setShowCreateDialog(true);
                  }}
                >
                  <FolderPlus className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setCreateDialogType('file');
                    setCreateDialogPath(selectedFolder);
                    setShowCreateDialog(true);
                  }}
                >
                  <FilePlus className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    // Test: Create a file directly in selected folder
                    createFileOrFolder(selectedFolder, 'test.js', 'file');
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Upload className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Selected folder indicator */}
            <div className="mb-2 p-2 bg-gray-700 rounded text-xs">
              <span className="text-gray-400">Selected folder:</span>
              <span className="text-blue-400 ml-1 font-mono">
                {selectedFolder === '/workspace' ? 'Root' : selectedFolder.split('/').pop()}
              </span>
            </div>
            
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button size="sm" variant="outline" className="w-full">
                <Upload className="w-3 h-3 mr-1" />
                Upload Files
              </Button>
            </label>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {fileTree.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files yet</p>
                <p className="text-xs text-gray-600 mt-1">Create files or upload to get started</p>
              </div>
            ) : (
              renderFileTree(fileTree)
            )}
          </div>
        </div>

        {/* Editor and Chat */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {openFiles.length > 0 && (
            <div className="bg-gray-800 border-b border-gray-700 flex items-center">
              {openFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center space-x-2 px-4 py-2 cursor-pointer border-r border-gray-700 ${
                    activeTab === file.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab(file.id)}
                >
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Editor and Chat Container */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1">
              {selectedFile ? (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  language={getLanguageFromFileName(selectedFile.name)}
                  value={selectedFile.content}
                  onChange={(value) => {
                    if (value !== undefined) {
                      setSelectedFile(prev => prev ? { ...prev, content: value } : null);
                      // Auto-save after 2 seconds of inactivity
                      setTimeout(() => {
                        saveFile(selectedFile.id, value);
                      }, 2000);
                    }
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No file selected</p>
                    <p className="text-sm text-gray-600 mt-2">Open a file from the explorer to start coding</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Chat */}
            {showAIChat && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI for help..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendChatMessage(chatInput);
                        }
                      }}
                    />
                    <Button onClick={() => sendChatMessage(chatInput)} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal at Bottom */}
      <div className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <h3 className="font-semibold text-sm">TERMINAL</h3>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => executeTerminalCommand('clear')}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowTerminal(!showTerminal)}
            >
              {showTerminal ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {showTerminal && (
          <div className="flex-1 p-2">
            <div ref={terminalRef} className="h-full bg-black rounded p-2 font-mono text-sm overflow-y-auto">
              {terminalOutput.map((line, index) => (
                <div key={index} className={`${
                  line.type === 'input' ? 'text-green-400' :
                  line.type === 'error' ? 'text-red-400' :
                  'text-gray-300'
                }`}>
                  {line.content}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-green-400">$</span>
              <Input
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    executeTerminalCommand(terminalInput);
                    setTerminalInput('');
                  }
                }}
                placeholder="Enter command..."
                className="flex-1 bg-black border-none text-green-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Create File/Folder Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Create {createDialogType === 'file' ? 'File' : 'Folder'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={createDialogName}
                    onChange={(e) => setCreateDialogName(e.target.value)}
                    placeholder={`Enter ${createDialogType} name`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFileOrFolder();
                      }
                    }}
                  />
                </div>
                
                {createDialogType === 'file' && (
                  <div>
                    <label className="text-sm font-medium">File Type</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.js') ? prev : prev + '.js')}
                        className="text-xs"
                      >
                        JavaScript (.js)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.html') ? prev : prev + '.html')}
                        className="text-xs"
                      >
                        HTML (.html)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.css') ? prev : prev + '.css')}
                        className="text-xs"
                      >
                        CSS (.css)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.py') ? prev : prev + '.py')}
                        className="text-xs"
                      >
                        Python (.py)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.json') ? prev : prev + '.json')}
                        className="text-xs"
                      >
                        JSON (.json)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateDialogName(prev => prev.endsWith('.md') ? prev : prev + '.md')}
                        className="text-xs"
                      >
                        Markdown (.md)
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateFileOrFolder} className="flex-1">
                    Create {createDialogType === 'file' ? 'File' : 'Folder'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.node?.type === 'folder' && (
            <>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => {
                  setSelectedFolder(contextMenu.node!.path);
                  setContextMenu(null);
                }}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Select as target folder</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => {
                  setCreateDialogType('file');
                  setCreateDialogPath(contextMenu.node!.path);
                  setShowCreateDialog(true);
                  setContextMenu(null);
                }}
              >
                <FilePlus className="w-4 h-4" />
                <span>Create file here</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2"
                onClick={() => {
                  setCreateDialogType('folder');
                  setCreateDialogPath(contextMenu.node!.path);
                  setShowCreateDialog(true);
                  setContextMenu(null);
                }}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create subfolder</span>
              </button>
            </>
          )}
          {contextMenu.node?.type === 'file' && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => {
                openFile(contextMenu.node!);
                setContextMenu(null);
              }}
            >
              <File className="w-4 h-4" />
              <span>Open file</span>
            </button>
          )}
          <div className="border-t border-gray-600 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 text-red-400"
            onClick={() => {
              if (contextMenu.node) {
                deleteFile(contextMenu.node.id);
              }
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
