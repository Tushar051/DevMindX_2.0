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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { cn } from '@/lib/utils';

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
  isCode?: boolean;
  language?: string;
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
  const [showGenerateProjectModal, setShowGenerateProjectModal] = useState(false);
  const [projectPrompt, setProjectPrompt] = useState('');
  const [projectFramework, setProjectFramework] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);

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
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type,
      path: `${parentPath}/${name}`,
      content: type === 'file' ? '' : '',
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
      const tokenToSend = localStorage.getItem('devmindx_token');
      console.log('Attempting to send AI chat request with token:', tokenToSend);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          message,
          model: 'together',
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
      
      // Process the response to detect code blocks
      const processContent = (content: string) => {
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
          // Add text before code block
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: content.substring(lastIndex, match.index)
            });
          }
          
          // Add code block
          parts.push({
            type: 'code',
            language: match[1] || 'plaintext',
            content: match[2]
          });
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text after last code block
        if (lastIndex < content.length) {
          parts.push({
            type: 'text',
            content: content.substring(lastIndex)
          });
        }
        
        return parts;
      };

      const processedParts = processContent(data.content || 'I apologize, but I couldn\'t process your request.');
      
      // Create separate messages for each part
      const assistantMessages = processedParts.map((part, index) => ({
        id: `${Date.now() + index}`,
        role: 'assistant' as const,
        content: part.type === 'code' ? part.content : part.content,
        timestamp: new Date(),
        isCode: part.type === 'code',
        language: part.type === 'code' ? part.language : undefined
      }));

      setChatMessages(prev => [...prev, ...assistantMessages]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error('Client-side error in sendChatMessage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, chatMessages, fileTree]);

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
    return nodes.map(node => (
      <div key={node.id} style={{ paddingLeft: level * 20 }}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 ${
            selectedFile?.id === node.id ? 'bg-blue-600' : 
            node.type === 'folder' && selectedFolder === node.path ? 'bg-green-600' : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
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
      
      // Clear existing files
      setFileTree([]);
      setOpenFiles([]);
      setSelectedFile(null);
      setActiveTab('');

      // Create files from the response
      const files = data.files || {};
      const newFileTree: FileNode[] = [];

      // Process files and create directory structure
      Object.entries(files).forEach(([path, content]) => {
        // Normalize path to use forward slashes and remove any leading/trailing slashes
        const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        const parts = normalizedPath.split('/');
        const fileName = parts.pop() || '';
        const dirPath = parts.join('/');

        // Create directories if needed
        let currentPath = '';
        let currentTree = newFileTree;

        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          // Check if directory exists
          let dir = currentTree.find(node => 
            node.type === 'folder' && node.name === part
          );

          if (!dir) {
            // Create directory
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

        // Create file
        const newFile: FileNode = {
          id: Date.now().toString() + Math.random().toString(),
          name: fileName,
          type: 'file',
          path: `/workspace/${path}`,
          content: content as string,
        };

        if (dirPath) {
          // Add to directory
          const dir = findFolderByPath(`/workspace/${dirPath}`, newFileTree);
          if (dir && dir.children) {
            dir.children.push(newFile);
          }
        } else {
          // Add to root
          newFileTree.push(newFile);
        }
      });

      setFileTree(newFileTree);

      // Open the first file if available
      const firstFile = findFirstFile(newFileTree);
      if (firstFile) {
        openFile(firstFile);
      }

      toast({
        title: "Project Generated",
        description: `${data.name} has been successfully generated.`,
      });

      // Close the modal
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

  // Helper function to find the first file in the tree
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

  // Helper function to find a folder by path
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

  const executeProject = useCallback(async () => {
  if (!selectedFile || !selectedFile.content) {
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
        'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
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

    const terminalOutputLines = data.output.map((line: string, index: number) => ({
      id: index.toString(),
      type: 'output' as const,
      content: line,
      timestamp: new Date()
    }));

    setTerminalOutput(terminalOutputLines);

    toast({
      title: data.exitCode === 0
        ? "Project executed successfully"
        : "Project executed with errors",
      description: data.exitCode === 0
        ? `${selectedFile.name} ran without errors.`
        : "Check the terminal for error details.",
      variant: data.exitCode === 0 ? undefined : "destructive",
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setTerminalOutput(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'error' as const,
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      }
    ]);

    toast({
      title: "Error executing project",
      description: `Failed to execute project. Error: ${errorMessage}`,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
}, [selectedFile, toast, setIsLoading, setTerminalOutput]);


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
              onClick={() => setShowGenerateProjectModal(true)}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Project
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAIChat(!showAIChat)}
              className={showAIChat ? "bg-blue-600 hover:bg-blue-700" : ""}
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
          <div className="flex-1 flex h-full">
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
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI Assistant</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setChatMessages([])}
                        className="text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
  <div 
    ref={chatRef}
    className="h-full max-h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4"
  >
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.isCode ? (
                          <div className="w-full">
                            <div className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                              <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                                <span className="text-xs text-gray-400">{message.language || 'code'}</span>
                                <CopyToClipboard text={message.content}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </CopyToClipboard>
                              </div>
                              <pre className="p-3 overflow-x-auto">
                                <code className={`language-${message.language || 'plaintext'}`}>
                                  {message.content}
                                </code>
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "max-w-xs px-3 py-2 rounded-lg",
                              message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-200'
                            )}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                code({node, inline = false, className, children, ...props}: {
                                  node?: any;
                                  inline?: boolean;
                                  className?: string;
                                  children?: React.ReactNode;
                                }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline ? (
                                    <div className="relative">
                                      <CopyToClipboard text={String(children).replace(/\n$/, '')}>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </CopyToClipboard>
                                      <pre className={className}>
                                        <code {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex-shrink-0">
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
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => sendChatMessage(chatInput)} 
                      size="sm"
                      disabled={isLoading}
                    >
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

      {/* Generate Project Modal */}
      {showGenerateProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-w-[90vw]">
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
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
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
                    className="flex-1"
                    disabled={isGeneratingProject}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}