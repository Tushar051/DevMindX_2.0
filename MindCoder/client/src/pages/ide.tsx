import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

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
  ChevronUp,
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
  Maximize2,
  Sparkles,
  Cpu,
  Bot,
  GitBranch,
  Type,
  FileCode,
  FileJson,
  FileImage,
  FileArchive,
  History,
  Loader2,
  HelpCircle,
  CheckCircle,
  Lock
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { cn, getLanguageFromFileName } from '@/lib/utils';
import { ideApi } from '@/lib/api';

// Types
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
  isExpanded?: boolean;
  parentId?: string | null;
}

// ChatMessage interface is now imported from shared/types.ts

// Import shared types
import { AIModel, ChatMessage } from '@shared/types';

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface Boilerplate {
  [key: string]: string;
}

// Enhanced boilerplate templates with proper syntax
const BOILERPLATES: Boilerplate = {
  'javascript': `// JavaScript Boilerplate
function main() {
  console.log('Hello, World!');
  // Your code here
}

main();`,
  'typescript': `// TypeScript Boilerplate
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'John', age: 30 };
console.log(user);

function main(): void {
  // Your code here
}

main();`,
  'react': `// React Boilerplate
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Hello, React!</h1>
    </div>
  );
}

export default App;`,
  'node': `// Node.js Boilerplate
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
  'java': `// Java Boilerplate
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`,
  'python': `# Python Boilerplate
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  'html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello, HTML!</h1>
  <script src="script.js"></script>
</body>
</html>`,
  'css': `/* CSS Boilerplate */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: #333;
}`,
  'mongodb': `// MongoDB Boilerplate
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";

async function main() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
  'cpp': `// C++ Boilerplate
#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`,
  'go': `// Go Boilerplate
package main

import "fmt"

func main() {
  fmt.Println("Hello, World!")
}`
};

export default function IDE() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('together');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPath, setCurrentPath] = useState('/workspace');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<'file' | 'folder'>('file');
  const [createDialogName, setCreateDialogName] = useState('');
  const [createDialogPath, setCreateDialogPath] = useState('/workspace');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null);
  const [showAIChat, setShowAIChat] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showGenerateProjectModal, setShowGenerateProjectModal] = useState(false);
  const [projectPrompt, setProjectPrompt] = useState('');
  const [projectFramework, setProjectFramework] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const terminalResizeRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Set futuristic theme by default
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  // Fetch available AI models
  const fetchAvailableModels = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI models');
      }

      const data = await response.json();
      // The API now returns an array of full model objects
      const models = Array.isArray(data) ? data : data.models || [];
      
      // Update the models to show which ones are available based on purchase status
      const updatedModels = models.map((model: AIModel) => ({
        ...model,
        available: model.id === 'together' || model.purchased
      }));
      
      setAvailableModels(updatedModels);
      
      // Set default model if available
      if (updatedModels.length > 0) {
        // First try to find an available model
        const availableModel = updatedModels.find((model: AIModel) => model.available);
        if (availableModel) {
          setSelectedModel(availableModel.id);
        } else {
          // If no models are available, default to 'together' which should always be available
          setSelectedModel('together');
        }
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available AI models',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Initialize workspace and fetch files if available
  useEffect(() => {
    // Initialize with empty workspace
    setFileTree([]);
    setSelectedFile(null);
    setOpenFiles([]);
    setActiveTab('');
    
    // Add a test message to the chat
    const testMessage: ChatMessage = {
      id: 'test-message',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    };
    setChatMessages([testMessage]);
    
    // Fetch workspace files and AI models if authenticated
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');
      
      if (projectId) {
        // If coming from project load, wait a moment for server to process
        // Also, trigger loading of the specific project instead of just fetching all workspace files
        setTimeout(() => fetchWorkspaceFiles(projectId), 500); // Pass projectId to fetchWorkspaceFiles
      } else {
        fetchWorkspaceFiles();
      }
      
      // Fetch available AI models
      fetchAvailableModels();
    }
  }, [isAuthenticated, location.search, fetchAvailableModels]);
  
  // Function to fetch workspace files
  const fetchWorkspaceFiles = async (projectIdToLoad?: string) => {
        try {
          console.log('Fetching workspace files...');
          const urlParams = new URLSearchParams(window.location.search);
          const projectId = projectIdToLoad || urlParams.get('projectId'); // Use passed projectId or from URL
          const timestamp = new Date().getTime();
          
          // If loading a specific project, call the /api/projects/:id/load endpoint first
          if (projectId) {
            console.log(`Attempting to load project with ID: ${projectId}`);
            const loadProjectResponse = await fetch(`/api/projects/${projectId}/load`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
              },
            });
            
            if (!loadProjectResponse.ok) {
              throw new Error(`Failed to load project ${projectId}`);
            }
            await loadProjectResponse.json(); // Consume the response
            console.log(`Project ${projectId} loaded successfully on backend.`);
          }

          // Fetch current workspace files after loading the project (or if no project to load)
          const response = await ideApi.getFiles(timestamp);
          console.log('Response from ideApi.getFiles():', response);

          // Add console.log to inspect the raw response for debugging
          console.log('Raw response from ideApi.getFiles:', JSON.stringify(response, null, 2));

          if (response && Array.isArray(response)) {
            // Convert the flat file list to a tree structure
            const fileTreeData = buildFileTree(response);

            // Add console.log to inspect the built file tree data
            console.log('Built file tree data (after buildFileTree):', JSON.stringify(fileTreeData, null, 2));
            
            setFileTree(fileTreeData);
            setCurrentPath('/workspace'); // Reset current path to root after loading new project
            toast({
              title: projectId ? "Project loaded" : "Workspace loaded",
              description: projectId 
                ? `Project ${projectId} files have been loaded.` 
                : "Your workspace files have been loaded.",
            });
          } else {
            console.warn('ideApi.getFiles() did not return an array:', response);
            toast({
              title: "Warning",
              description: "No files found or unexpected response format.",
            });
          }
        } catch (error) {
          console.error('Error fetching workspace files:', error);
          toast({
            title: "Error",
            description: "Failed to load workspace files.",
            variant: "destructive",
          });
        }
      };
  
  // Function to build file tree from flat file list
  const buildFileTree = (files: any[]): FileNode[] => {
    console.log('Building file tree from files:', files);
    const tree: FileNode[] = [];
    const newMap: Record<string, FileNode> = {}; // map will store all nodes (files and folders) by their full relative path

    // First pass: create all nodes (files and folders) with their full paths
    files.forEach(file => {
      const fullPath = file.path;
      // Ensure path starts with /workspace/ and remove it for relative pathing
      const normalizedPath = fullPath.startsWith('/workspace/') ? fullPath.substring('/workspace/'.length) : fullPath;
      const parts = normalizedPath.split('/').filter(Boolean);

      let currentDirectoryPath = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = (i === parts.length - 1);
        const nodePath = currentDirectoryPath ? `${currentDirectoryPath}/${part}` : part;

        if (isLastPart && file.type === 'file') {
          // This is the actual file
          const id = String(file._id) || Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
          newMap[nodePath] = {
            id,
            name: part,
            type: 'file',
            path: normalizedPath, // Store the normalized relative path
            content: file.content || '',
            isExpanded: false
          };
        } else {
          // This is a folder (either an intermediate folder or a top-level folder)
          if (!newMap[nodePath]) {
            const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9); // Generate a new ID for the folder
            newMap[nodePath] = {
              id,
              name: part,
              type: 'folder',
              path: nodePath, // Store the normalized relative path for the folder
              children: [],
              isExpanded: false // Start collapsed
            };
          }
        }
        currentDirectoryPath = nodePath;
      }
    });

    // Second pass: build the tree structure
    Object.values(newMap).forEach(node => {
      const parts = node.path.split('/').filter(Boolean);
      if (parts.length === 1) {
        // Root level file/folder
        tree.push(node);
      } else {
        // Nested file/folder, find its parent
        const parentPath = parts.slice(0, parts.length - 1).join('/');
        if (newMap[parentPath] && newMap[parentPath].type === 'folder') {
          newMap[parentPath].children = newMap[parentPath].children || [];
          newMap[parentPath].children!.push(node);
        }
      }
    });

    // Sort the tree for consistent display (folders first, then files, alphabetically)
    const sortTree = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children) {
          sortTree(node.children);
        }
      });
    };
    sortTree(tree);

    return tree;
  };
  
  // Load chat history when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
      console.log('Authentication detected, loading chat history');
    }
  }, [isAuthenticated]);

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

  // Add keyboard shortcuts for model switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1 through Alt+5 for switching models
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        const availableModelsList = availableModels.filter(m => m.available);
        
        if (index < availableModelsList.length) {
          setSelectedModel(availableModelsList[index].id);
          toast({
            title: "Model Switched",
            description: `Switched to ${availableModelsList[index].name}`,
            duration: 2000,
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableModels, setSelectedModel, toast]);

  // Terminal resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTerminal) {
        const newHeight = window.innerHeight - e.clientY;
        setTerminalHeight(Math.max(100, Math.min(newHeight, 500)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTerminal(false);
    };

    if (isDraggingTerminal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTerminal]);

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
        setFileTree([...fileTree]);
        
        try {
          await fetch('/api/ide/files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
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
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Validate file extension for known languages
    if (type === 'file') {
      const extension = name.split('.').pop()?.toLowerCase();
      const validExtensions = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'go', 'json', 'md'];
      
      if (!extension || !validExtensions.includes(extension)) {
        toast({
          title: "Invalid File Type",
          description: "Please use a valid file extension (.js, .ts, .jsx, .tsx, .html, .css, .py, .java, .cpp, .go, .json, .md)",
          variant: "destructive",
        });
        return;
      }
    }

    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type,
      path: `${parentPath === '/' ? '' : parentPath}/${name}`,
      content: type === 'file' ? getBoilerplateContent(name) : '',
      isExpanded: type === 'folder' ? false : undefined,
      parentId: parentPath === '/workspace' ? null : findFileByPath(parentPath, fileTree)?.id || null
    };

    setFileTree(prevTree => {
      if (parentPath === '/workspace') {
        return [...prevTree, newFile];
      }

      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === parentPath) {
            return {
              ...node,
              children: [...(node.children || []), newFile],
              isExpanded: true
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

      return updateTree(prevTree);
    });
    
    fetch('/api/ide/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
      },
      body: JSON.stringify({
        path: newFile.path,
        content: newFile.content,
        type: newFile.type
      }),
    }).catch(error => {
      console.error('Failed to save file:', error);
    });

    if (type === 'file') {
      openFile(newFile);
    }

    toast({
      title: `${type === 'file' ? 'File' : 'Folder'} created`,
      description: `${name} has been created successfully.`,
    });
  }, [fileTree, findFileByPath, openFile, toast]);

  const getBoilerplateContent = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const language = getLanguageFromFileName(fileName);
    
    if (extension === 'jsx' || extension === 'tsx') {
      return BOILERPLATES['react'];
    } else if (extension === 'cpp') {
      return BOILERPLATES['cpp'];
    } else if (extension === 'go') {
      return BOILERPLATES['go'];
    } else if (BOILERPLATES[language]) {
      return BOILERPLATES[language];
    }
    return '';
  };

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
            path: `${currentPath === '/workspace' ? '' : currentPath}/${file.name}`,
            content,
          };
          
          setFileTree(prevTree => [...prevTree, newFile]);
          openFile(newFile);
        };
        reader.readAsText(file);
      });
    }
  }, [currentPath, openFile]);

  const executeTerminalCommand = useCallback(async (command: string) => {
    const output: TerminalOutput = {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date(),
    };
    
    setTerminalOutput(prev => [...prev, output]);
    setTerminalHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    setIsLoading(true);
    
    try {
      let response = '';
      
      if (command.startsWith('ls') || command.startsWith('dir')) {
        response = getCurrentFolderContents().map(node => 
          `${node.type === 'folder' ? '📁' : '📄'} ${node.name}`
        ).join('\n');
      } else if (command.startsWith('cat ') || command.startsWith('type ')) {
        const fileName = command.split(' ')[1];
        const file = findFileByPath(`${currentPath}/${fileName}`, fileTree);
        response = file?.content || 'File not found';
      } else if (command === 'clear') {
        setTerminalOutput([]);
        setIsLoading(false);
        return;
      } else if (command.startsWith('cd ')) {
        const path = command.split(' ')[1];
        if (path === '..') {
          navigateUp();
          response = `Changed directory to ${currentPath}`;
        } else {
          const newPath = `${currentPath}/${path}`.replace(/\/+/g, '/');
          const folder = findFileByPath(newPath, fileTree);
          if (folder && folder.type === 'folder') {
            navigateToFolder(newPath);
            response = `Changed directory to ${newPath}`;
          } else {
            response = `Directory not found: ${path}`;
          }
        }
      } else {
        // Send all other commands to the backend for execution
        const result = await ideApi.runTerminalCommand(command, currentPath);
        if (result.error) {
          response = `Error: ${result.error}`;
        } else {
          response = result.output || 'Command executed successfully';
        }
      }
      
      const resultOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        type: response.includes('Error:') ? 'error' : 'output',
        content: response,
        timestamp: new Date(),
      };
      
      setTerminalOutput(prev => [...prev, resultOutput]);
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        timestamp: new Date(),
      };
      setTerminalOutput(prev => [...prev, errorOutput]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
        }
      }, 0);
    }
  }, [currentPath, fileTree, findFileByPath]);

  const getCurrentFolderContents = useCallback(() => {
    if (currentPath === '/workspace') return fileTree;
    const folder = findFileByPath(currentPath, fileTree);
    return folder?.children || [];
  }, [currentPath, fileTree, findFileByPath]);

  const navigateToFolder = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const navigateUp = useCallback(() => {
    if (currentPath === '/workspace') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/workspace';
    navigateToFolder(parentPath);
  }, [currentPath, navigateToFolder]);

  const handleTerminalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      executeTerminalCommand(terminalInput.trim());
      setTerminalInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalHistory.length > 0 && historyIndex < terminalHistory.length - 1) {
        const newIndex = historyIndex === -1 ? terminalHistory.length - 1 : historyIndex;
        setTerminalInput(terminalHistory[newIndex]);
        setHistoryIndex(newIndex - 1);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < terminalHistory.length) {
          setTerminalInput(terminalHistory[newIndex]);
          setHistoryIndex(newIndex);
        } else {
          setTerminalInput('');
          setHistoryIndex(-1);
        }
      }
    }
  }, [terminalInput, executeTerminalCommand, terminalHistory, historyIndex]);

  // Load chat history from server
  const loadChatHistory = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping chat history load');
      return;
    }
    
    console.log('Loading chat history...');
    setIsLoadingHistory(true);
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log('Fetching chat history with timestamp:', timestamp);
      const response = await fetch(`/api/chat/history?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      console.log('Chat history response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      console.log('Chat history data received:', data);
      
      if (data.messages && data.messages.length > 0) {
        console.log('Processing', data.messages.length, 'messages');
        const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        
        console.log('Setting chat messages state with formatted messages:', formattedMessages);
        setChatMessages(formattedMessages);
        toast({
          title: 'Chat history loaded',
          description: `Loaded ${formattedMessages.length} messages`,
        });
      } else {
        console.log('No chat messages found in response');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated, toast]);

  // Clear chat history
  const clearChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat/history?_t=${timestamp}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }

      setChatMessages([]);
      toast({
        title: 'Chat history cleared',
        description: 'Your chat history has been cleared',
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat history',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, toast]);

  // Add this function to recommend models based on task
  const getRecommendedModel = useCallback((task: string) => {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('image') || taskLower.includes('vision')) {
      return availableModels.find(m => m.id === 'gemini' && m.available) ? 'gemini' : 'together';
    }
    
    if (taskLower.includes('debug') || taskLower.includes('fix')) {
      return availableModels.find(m => m.id === 'chatgpt' && m.available) ? 'chatgpt' : 'together';
    }
    
    if (taskLower.includes('explain') || taskLower.includes('document')) {
      return availableModels.find(m => m.id === 'claude' && m.available) ? 'claude' : 'together';
    }
    
    if (taskLower.includes('optimize') || taskLower.includes('performance')) {
      return availableModels.find(m => m.id === 'deepseek' && m.available) ? 'deepseek' : 'together';
    }
    
    // Default to the most capable available model
    const availableModelsByComplexity = availableModels
      .filter(m => m.available)
      .sort((a, b) => {
        const complexityOrder = { 'Basic': 1, 'Medium': 2, 'Complex': 3 };
        return complexityOrder[b.complexity as keyof typeof complexityOrder] - 
               complexityOrder[a.complexity as keyof typeof complexityOrder];
      });
    
    return availableModelsByComplexity.length > 0 ? availableModelsByComplexity[0].id : 'together';
  }, [availableModels]);

  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    console.log('Sending chat message:', message);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    console.log('Adding user message to chat:', userMessage);
    setChatMessages(prev => {
      console.log('Previous chat messages:', prev);
      const updated = [...prev, userMessage];
      console.log('Updated chat messages with user message:', updated);
      return updated;
    });
    setChatInput('');
    setIsLoading(true);

    try {
      const currentFileContent = selectedFile?.content || '';
      const currentFileName = selectedFile?.name || '';
      
      console.log('Sending request to /api/ai/chat');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          message,
          model: selectedModel,
          chatHistory: chatMessages.slice(-5),
          projectContext: {
            currentFile: currentFileName,
            currentFileContent,
            fileTree: fileTree.map(node => ({ name: node.name, type: node.type, path: node.path }))
          }
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      console.log('Received AI response:', data);
      
      // Process response to properly format code blocks
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || 'I apologize, but I couldn\'t process your request.',
        timestamp: new Date(),
      };

      console.log('Adding assistant message to chat:', assistantMessage);
      setChatMessages(prev => {
        console.log('Previous chat messages before adding assistant response:', prev);
        const updated = [...prev, assistantMessage];
        console.log('Updated chat messages with assistant response:', updated);
        return updated;
      });
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
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
  }, [selectedFile, chatMessages, fileTree, selectedModel]);

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

  const handleGenerateProject = async () => {
    if (!projectPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a project description.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingProject(true);

    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          name: projectName.trim() || 'Generated Project',
          framework: projectFramework.trim() || undefined,
          description: projectPrompt.trim(),
          model: 'together'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const data = await response.json();
      
      setFileTree([]);
      setOpenFiles([]);
      setSelectedFile(null);
      setActiveTab('');

      const files = data.files || {};
      const newFileTree: FileNode[] = [];

      Object.entries(files).forEach(([path, content]) => {
        const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        const parts = normalizedPath.split('/');
        const fileName = parts.pop() || '';
        const dirPath = parts.join('/');

        let currentPath = '';
        let currentTree = newFileTree;

        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          let dir = currentTree.find(node => 
            node.type === 'folder' && node.name === part
          );

          if (!dir) {
            dir = {
              id: Date.now().toString() + Math.random().toString(),
              name: part,
              type: 'folder',
              path: `/workspace/${currentPath}`,
              children: [],
              isExpanded: true,
            };
            currentTree.push(dir);
          }

          currentTree = dir.children || [];
        }

        const newFile: FileNode = {
          id: Date.now().toString() + Math.random().toString(),
          name: fileName,
          type: 'file',
          path: `/workspace/${path}`,
          content: content as string,
        };

        if (dirPath) {
          const dir = findFolderByPath(`/workspace/${dirPath}`, newFileTree);
          if (dir && dir.children) {
            dir.children.push(newFile);
          }
        } else {
          newFileTree.push(newFile);
        }
      });

      setFileTree(newFileTree);

      const firstFile = findFirstFile(newFileTree);
      if (firstFile) {
        openFile(firstFile);
      }

      // Refresh projects list after creation
      try {
        const projectsResponse = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
          },
          cache: 'no-cache'
        });
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          // You might want to store this in a global state or context
        }
      } catch (error) {
        console.error('Error refreshing projects:', error);
      }

      toast({
        title: "Project Generated",
        description: `${data.name} has been successfully generated and saved.`,
      });

      setShowGenerateProjectModal(false);
      setProjectPrompt('');
      setProjectFramework('');
      setProjectName('');
    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate project',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const findFolderByPath = (path: string, nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'folder' && node.path === path) {
        return node;
      }
      if (node.children) {
        const found = findFolderByPath(path, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const executeCode = useCallback(async () => {
    if (!selectedFile || !selectedFile.content) return;
    
    setIsExecuting(true);
    
    setTerminalOutput([{
      id: Date.now().toString(),
      type: 'input',
      content: `$ Running ${selectedFile.name}...`,
      timestamp: new Date(),
    }]);
    
    try {
      const language = getLanguageFromFileName(selectedFile.name);
      
      const result = await ideApi.executeCode(
        selectedFile.path,
        selectedFile.content,
        language
      );
      
      setTerminalOutput(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: result.error ? 'error' : 'output',
          content: result.error || result.output || 'No output',
          timestamp: new Date(),
        }
      ]);
      
      if (result.error) {
        toast({
          title: "Execution Error",
          description: "There was an error executing your code.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Execution Complete",
          description: `${selectedFile.name} executed successfully.`,
        });
      }
    } catch (error) {
      console.error('Code execution error:', error);
      
      setTerminalOutput(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'error',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          timestamp: new Date(),
        }
      ]);
      
      toast({
        title: "Execution Failed",
        description: "Failed to execute the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [selectedFile, toast]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <Type className="w-4 h-4 text-blue-400" />;
      case 'html':
        return <Globe className="w-4 h-4 text-orange-400" />;
      case 'css':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-green-400" />;
      case 'java':
        return <FileCode className="w-4 h-4 text-red-400" />;
      case 'py':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'cpp':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'go':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileImage className="w-4 h-4 text-purple-400" />;
      case 'zip':
      case 'rar':
      case 'tar':
        return <FileArchive className="w-4 h-4 text-gray-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    // Check for model purchase flag
    if (localStorage.getItem('modelPurchased') === 'true') {
      fetchAvailableModels();
      toast({
        title: 'Model Unlocked',
        description: 'Your new model is now available in the IDE!',
        variant: 'default',
      });
      localStorage.removeItem('modelPurchased');
    }
  }, [fetchAvailableModels, toast]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-96 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-400">Please log in to access the IDE.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      {/* Header */}
      <motion.div 
        className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              DevMindX AI IDE
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => executeCode()}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-transparent"
              disabled={!selectedFile || isExecuting}
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Running...' : 'Run File'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowGenerateProjectModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-transparent"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Project
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAIChat(!showAIChat)}
              className={cn(
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-transparent",
                !showAIChat && "opacity-70"
              )}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleLogout} className="border-gray-600 hover:bg-gray-700">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        {/* File Explorer */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="w-full h-full bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              {/* Breadcrumbs */}
              <div className="flex items-center mb-2">
                <button 
                  onClick={navigateUp}
                  className="mr-2 text-gray-400 hover:text-white transition-colors"
                  disabled={currentPath === '/workspace'}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="flex items-center overflow-x-auto">
                  {currentPath.split('/').filter(Boolean).map((part, index, parts) => {
                    const path = ['/workspace', ...parts.slice(0, index + 1)].join('/');
                    return (
                      <React.Fragment key={path}>
                        <span className="mx-1 text-gray-400">/</span>
                        <button
                          onClick={() => navigateToFolder(path)}
                          className="text-blue-400 hover:underline transition-colors"
                        >
                          {part}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Create/upload buttons */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setCreateDialogType('folder');
                      setCreateDialogPath(currentPath);
                      setShowCreateDialog(true);
                    }}
                  >
                    <FolderPlus className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setCreateDialogType('file');
                      setCreateDialogPath(currentPath);
                      setShowCreateDialog(true);
                    }}
                  >
                    <FilePlus className="w-3 h-3" />
                  </Button>
                </div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button size="sm" variant="outline" className="h-6 border-gray-600 hover:bg-gray-700">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                </label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {getCurrentFolderContents().length === 0 ? (
                <motion.div 
                  className="text-center text-gray-500 py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Empty folder</p>
                </motion.div>
              ) : (
                getCurrentFolderContents().map(node => (
                  <motion.div 
                    key={node.id} 
                    className="px-2 py-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                        selectedFile?.id === node.id ? 'bg-blue-600' : ''
                      }`}
                      onClick={() => {
                        if (node.type === 'folder') {
                          navigateToFolder(node.path);
                        } else {
                          openFile(node);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          node
                        });
                      }}
                    >
                      {node.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                      ) : (
                        getFileIcon(node.name)
                      )}
                      <span className="text-sm text-gray-200">{node.name}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="flex flex-col h-full">
            {/* Tabs */}
            {openFiles.length > 0 && (
              <div className="bg-gray-800 border-b border-gray-700 flex items-center">
                {openFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    className={`flex items-center space-x-2 px-4 py-2 cursor-pointer border-r border-gray-700 transition-colors ${
                      activeTab === file.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab(file.id)}
                    whileHover={{ scale: 1.02 }}
                  >
                    {getFileIcon(file.name)}
                    <span className="text-sm">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2 hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFile(file.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Editor */}
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
                      setTimeout(() => {
                        saveFile(selectedFile.id, value);
                      }, 2000);
                    }
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                  }}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('futuristic', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [
                        { token: '', foreground: 'D4D4D4', background: '1A1A1A' },
                        { token: 'keyword', foreground: '569CD6' },
                        { token: 'type', foreground: '4EC9B0' },
                        { token: 'string', foreground: 'CE9178' },
                        { token: 'number', foreground: 'B5CEA8' },
                        { token: 'comment', foreground: '6A9955' },
                      ],
                      colors: {
                        'editor.background': '#1A1A1A',
                        'editor.lineHighlightBackground': '#2A2A2A',
                        'editorCursor.foreground': '#A6E22E',
                        'editor.selectionBackground': '#3E3E3E',
                        'editor.inactiveSelectionBackground': '#3E3E3E',
                      }
                    });
                    monaco.editor.setTheme('futuristic');
                  }}
                />
              ) : (
                <motion.div 
                  className="flex items-center justify-center h-full text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No file selected</p>
                    <p className="text-sm text-gray-600 mt-2">Open a file from the explorer to start coding</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* AI Chat Panel */}
        {showAIChat && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15}>
              <div className="w-full h-full bg-gray-800 border-l border-gray-700 flex flex-col" style={{ zIndex: 10 }}>
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-500" />
                      AI Assistant
                    </h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          loadChatHistory();
                          toast({
                            title: 'Chat History',
                            description: 'Your chat history has been loaded',
                          });
                        }}
                        disabled={isLoadingHistory}
                        className="text-xs hover:bg-gray-700"
                      >
                        {isLoadingHistory ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <History className="w-3 h-3 mr-1" />
                        )}
                        Show History
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearChatHistory}
                        className="text-xs hover:bg-gray-700"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
                  <ScrollArea 
                    ref={chatRef}
                    className="h-full p-4 space-y-4"
                  >

                    {chatMessages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No messages yet</p>
                          <p className="text-sm text-gray-600 mt-2">Start a conversation with the AI assistant</p>
                        </div>
                      </div>
                    )}
                    {chatMessages.length > 0 && chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={cn(
                            "max-w-xs px-3 py-2 rounded-lg transition-all",
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                              : 'bg-gray-700 text-gray-200'
                          )}
                        >
                          {/* Simple content display for debugging */}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </ScrollArea>
                </div>
                <div className="p-4 border-t border-gray-700 flex-shrink-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="h-8 text-xs bg-gray-700 border-gray-600 focus:border-blue-500">
                        <SelectValue placeholder="Select AI Model" />
                        <div className="ml-2">
                          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-white cursor-help" 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show model comparison tooltip
                              toast({
                                title: "AI Model Information",
                                description: (
                                  <div className="text-xs space-y-1">
                                    {availableModels.find(m => m.id === selectedModel)?.features?.map(feature => (
                                      <div key={feature} className="flex items-center">
                                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="text-blue-400 p-0 h-auto" 
                                      onClick={() => navigate('/account')}
                                    >
                                      Manage subscriptions
                                    </Button>
                                  </div>
                                ),
                                duration: 5000,
                              });
                            }}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {availableModels.map((model) => (
                          <SelectItem 
                            key={model.id} 
                            value={model.id}
                            disabled={!model.available}
                            className={!model.available ? 'opacity-50' : ''}
                          >
                            <div className="flex items-center">
                              <span className="text-white">{model.name}</span>
                              {!model.available && !model.purchased && model.id !== 'together' && (
                                <Lock className="ml-2 w-4 h-4 text-gray-400" />
                              )}
                              {model.available && model.id !== 'together' && (
                                <Badge variant="outline" className="ml-2 text-xs bg-green-800 text-green-200 border-green-700">
                                  Purchased
                                </Badge>
                              )}
                              {model.available && model.id === 'together' && (
                                <Badge variant="outline" className="ml-2 text-xs bg-blue-800 text-blue-200 border-blue-700">
                                  Free
                                </Badge>
                              )}
                              {!model.available && model.purchased && (
                                <Badge variant="outline" className="ml-2 text-xs bg-yellow-800 text-yellow-200 border-yellow-700">
                                  Purchased (API Unavailable)
                                </Badge>
                              )}
                              {!model.available && !model.purchased && model.id === 'together' && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500 mt-1">
                      Quick switch: Alt+1 to Alt+{availableModels.filter(m => m.available).length}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white"
                        onClick={() => {
                          const recommendedModel = getRecommendedModel(chatInput);
                          if (recommendedModel !== selectedModel) {
                            setSelectedModel(recommendedModel);
                            toast({
                              title: "Model Recommendation",
                              description: `Switched to ${availableModels.find(m => m.id === recommendedModel)?.name} based on your task.`,
                              duration: 3000,
                            });
                          }
                        }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Best Model
                      </Button>
                    </div>
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
                        className="flex-1 bg-gray-700 border-gray-600 focus:border-blue-500"
                      />
                      <Button 
                        onClick={() => sendChatMessage(chatInput)} 
                        size="sm"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Terminal */}
      <div 
        className="bg-gray-800 border-t border-gray-700 flex flex-col relative"
        style={{ height: `${terminalHeight}px` }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-2 cursor-row-resize z-10"
          ref={terminalResizeRef}
          onMouseDown={() => setIsDraggingTerminal(true)}
        />
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <h3 className="font-semibold text-sm flex items-center">
            <Terminal className="w-4 h-4 mr-2 text-green-500" />
            Terminal
          </h3>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => executeTerminalCommand('clear')}
              className="hover:bg-gray-700 border-gray-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowTerminal(!showTerminal)}
              className="hover:bg-gray-700 border-gray-600"
            >
              {showTerminal ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {showTerminal && (
          <div className="flex-1 flex flex-col">
            <ScrollArea 
              ref={terminalRef}
              className="flex-1 p-2 font-mono text-sm"
            >
              {terminalOutput.map((line, index) => (
                <motion.div 
                  key={index} 
                  className={`${
                    line.type === 'input' ? 'text-green-400' :
                    line.type === 'error' ? 'text-red-400' :
                    'text-gray-300'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {line.content}
                </motion.div>
              ))}
              {isExecuting && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="animate-pulse">⏺</span>
                  <span>Running...</span>
                </div>
              )}
            </ScrollArea>
            <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
              <span className="text-green-400">$</span>
              <Input
                ref={terminalInputRef}
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                placeholder="Enter command..."
                className="flex-1 bg-gray-700 border-gray-600 text-green-400 font-mono"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Create File/Folder Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="w-96 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {createDialogType === 'file' ? (
                      <FilePlus className="w-5 h-5 mr-2 text-blue-500" />
                    ) : (
                      <FolderPlus className="w-5 h-5 mr-2 text-blue-500" />
                    )}
                    Create {createDialogType === 'file' ? 'File' : 'Folder'}
                  </CardTitle>
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
                        className="bg-gray-700 border-gray-600"
                        autoFocus
                      />
                    </div>
                    
                    {createDialogType === 'file' && (
                      <div>
                        <label className="text-sm font-medium">File Type</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.js') ? prev : prev + '.js')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            JavaScript
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.ts') ? prev : prev + '.ts')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            TypeScript
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.jsx') ? prev : prev + '.jsx')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            React
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.html') ? prev : prev + '.html')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            HTML
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.css') ? prev : prev + '.css')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            CSS
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.py') ? prev : prev + '.py')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            Python
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.java') ? prev : prev + '.java')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            Java
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.cpp') ? prev : prev + '.cpp')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            C++
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.go') ? prev : prev + '.go')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            Go
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.json') ? prev : prev + '.json')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            JSON
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreateDialogName(prev => prev.endsWith('.md') ? prev : prev + '.md')}
                            className="text-xs border-gray-600 hover:bg-gray-700"
                          >
                            Markdown
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleCreateFileOrFolder} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        Create {createDialogType === 'file' ? 'File' : 'Folder'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateDialog(false)}
                        className="flex-1 border-gray-600 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Project Modal */}
      <AnimatePresence>
        {showGenerateProjectModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="w-[500px] max-w-[90vw] bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-500" />
                    Generate Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Project Idea or Description</label>
                      <textarea
                        value={projectPrompt}
                        onChange={(e) => setProjectPrompt(e.target.value)}
                        placeholder="Describe your project idea in detail..."
                        className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        disabled={isGeneratingProject}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Framework (Optional)</label>
                      <select
                        value={projectFramework}
                        onChange={(e) => setProjectFramework(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        disabled={isGeneratingProject}
                      >
                        <option value="">Select a framework (optional)</option>
                        <option value="react">React</option>
                        <option value="vue">Vue</option>
                        <option value="angular">Angular</option>
                        <option value="node">Node.js</option>
                        <option value="express">Express</option>
                        <option value="next">Next.js</option>
                        <option value="django">Django</option>
                        <option value="flask">Flask</option>
                        <option value="rails">Ruby on Rails</option>
                        <option value="spring">Spring Boot</option>
                        <option value="mern">MERN Stack</option>
                        <option value="mean">MEAN Stack</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Project Name (Optional)</label>
                      <Input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                        className="bg-gray-700 border-gray-600 text-white"
                        disabled={isGeneratingProject}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        onClick={handleGenerateProject} 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isGeneratingProject || !projectPrompt.trim()}
                      >
                        {isGeneratingProject ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowGenerateProjectModal(false)}
                        className="flex-1 border-gray-600 hover:bg-gray-700"
                        disabled={isGeneratingProject}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu && (
        <motion.div 
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {contextMenu.node?.type === 'folder' && (
            <>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                onClick={() => {
                  navigateToFolder(contextMenu.node!.path);
                  setContextMenu(null);
                }}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open in Explorer</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 transition-colors"
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
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 transition-colors"
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
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 transition-colors"
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
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center space-x-2 text-red-400 transition-colors"
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
        </motion.div>
      )}
    </div>
  );
}