import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileIcon, FolderIcon, TrashIcon, PlayIcon, 
  TerminalIcon, MessageSquareIcon, CommandIcon,
  ChevronRightIcon, ChevronDownIcon, SaveIcon,
  FolderPlusIcon, FilePlusIcon, Users, UploadIcon,
  GitBranchIcon, GitCommitIcon, Lightbulb, BugIcon, PenToolIcon, HistoryIcon,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { InteractiveTerminal } from '@/components/InteractiveTerminal';
import { ResizablePanel } from '@/components/ResizablePanel';
import { InputDialog } from '@/components/InputDialog';
import { useIDECollaboration } from '@/hooks/use-ide-collaboration';
import { IDECollaborationPanel } from '@/components/IDECollaborationPanel';
import { GitPanel } from '@/components/GitPanel';
import { Whiteboard } from '@/components/Whiteboard';
import { AICodeAssistant } from '@/components/AICodeAssistant';
import { DebugPanel } from '@/components/DebugPanel';
import { EditHistory } from '@/components/EditHistory';
import { VideoCallPanel } from '@/components/VideoCallPanel';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
  path?: string;
}

interface Tab {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  locked: boolean;
  price: number;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  framework?: string;
  files: Record<string, string>;
}

export default function CursorIDE() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<Array<{role: string, content: string}>>([]);
  const [aiInput, setAiInput] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, node: FileNode | null} | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showSaveProjectDialog, setShowSaveProjectDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputFields, setInputFields] = useState<Array<{name: string, label: string, type: 'text' | 'number', placeholder?: string}>>([]);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lineAuthors, setLineAuthors] = useState<Map<number, { userId: string; username: string; color: string }>>(new Map());
  const lineDecorationsRef = useRef<string[]>([]);
  const [llmModels, setLlmModels] = useState<LLMModel[]>([
    { id: 'together', name: 'Together AI', provider: 'Together', locked: false, price: 0 },
    { id: 'gemini', name: 'Gemini', provider: 'Google', locked: true, price: 749 },
    { id: 'chatgpt', name: 'ChatGPT', provider: 'OpenAI', locked: true, price: 1499 },
    { id: 'claude', name: 'Claude', provider: 'Anthropic', locked: true, price: 1299 },
    { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', locked: true, price: 1125 },
  ]);
  const editorRef = useRef<any>(null);
  const cursorDecorationsRef = useRef<Map<string, string[]>>(new Map());

  // Initialize collaboration
  const collaboration = useIDECollaboration();

  // Connect to collaboration server on mount
  useEffect(() => {
    const token = localStorage.getItem('devmindx_token');
    if (token) {
      collaboration.connect(token);
    }
  }, []);

  // Check for session code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionCode = params.get('session');
    
    if (sessionCode && collaboration.isConnected) {
      collaboration.joinSession(sessionCode);
    }
  }, [collaboration.isConnected]);

  // Listen for remote code changes
  useEffect(() => {
    if (!collaboration.socket) return;

    const handleCodeUpdate = (data: any) => {
      console.log('Received code update from:', data.username);
      
      // Find the user who made the change
      const remoteUser = collaboration.users.find(u => u.id === data.userId);
      
      // Update the file content if it's currently open in tabs
      setOpenTabs(tabs => tabs.map(tab =>
        tab.path === data.file
          ? { ...tab, content: data.content }
          : tab
      ));

      // Update file tree content
      const updateFileContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === data.file || `/${node.path}` === data.file) {
            return { ...node, content: data.content };
          }
          if (node.children) {
            return { ...node, children: updateFileContent(node.children) };
          }
          return node;
        });
      };
      setFileTree(prev => updateFileContent(prev));

      // Track who edited which lines
      if (remoteUser && data.changes) {
        const lines = data.content.split('\n');
        lines.forEach((_line: string, index: number) => {
          setLineAuthors(prev => {
            const newMap = new Map(prev);
            newMap.set(index + 1, {
              userId: remoteUser.id,
              username: remoteUser.username,
              color: remoteUser.color
            });
            return newMap;
          });
        });
        
        // Update decorations
        setTimeout(() => updateLineDecorations(), 100);
      }

      // If the file is currently active, update the editor
      const activeTabData = openTabs.find(tab => tab.id === activeTab);
      if (activeTabData && activeTabData.path === data.file) {
        // The editor will automatically update because we updated the tab content
        // Monaco Editor will reflect the change through its value prop
      }
    };

    const handleFileTreeUpdate = (data: any) => {
      console.log('Remote file tree update:', data);
      
      // Add the new file/folder to the tree
      if (data.action === 'create-file' || data.action === 'create-folder') {
        if (data.parentId) {
          setFileTree(prev => addNodeToTree(prev, data.parentId, data.node));
        } else {
          setFileTree(prev => [...prev, data.node]);
        }
        
        toast({
          title: 'File Tree Updated',
          description: `${data.username} ${data.action === 'create-file' ? 'created file' : 'created folder'}: ${data.node.name}`
        });
      }
    };

    const handleFileTreeDelete = (data: any) => {
      console.log('Remote file tree delete:', data);
      
      setFileTree(prev => removeNodeFromTree(prev, data.nodeId));
      
      // Close tabs for deleted files
      setOpenTabs(prev => prev.filter(tab => tab.id !== data.nodeId));
      if (activeTab === data.nodeId) {
        setActiveTab(openTabs[0]?.id || null);
      }
      
      toast({
        title: 'File Deleted',
        description: `${data.username} deleted an item`
      });
    };

    collaboration.socket.on('code-update', handleCodeUpdate);
    collaboration.socket.on('file-tree-update', handleFileTreeUpdate);
    collaboration.socket.on('file-tree-delete', handleFileTreeDelete);

    const handleCursorUpdate = (data: any) => {
      if (!editorRef.current) return;
      
      const currentTabData = openTabs.find(tab => tab.id === activeTab);
      if (!currentTabData || currentTabData.path !== data.cursor.file) return;

      // Create cursor decoration
      const decorations = editorRef.current.deltaDecorations(
        cursorDecorationsRef.current.get(data.userId) || [],
        [
          {
            range: {
              startLineNumber: data.cursor.line,
              startColumn: data.cursor.column,
              endLineNumber: data.cursor.line,
              endColumn: data.cursor.column + 1
            },
            options: {
              className: 'remote-cursor',
              beforeContentClassName: 'remote-cursor-label',
              before: {
                content: data.username,
                inlineClassName: 'remote-cursor-name',
                inlineClassNameAffectsLetterSpacing: true
              },
              stickiness: 1
            }
          }
        ]
      );

      cursorDecorationsRef.current.set(data.userId, decorations);
    };

    collaboration.socket.on('cursor-update', handleCursorUpdate);

    return () => {
      if (collaboration.socket) {
        collaboration.socket.off('code-update', handleCodeUpdate);
        collaboration.socket.off('file-tree-update', handleFileTreeUpdate);
        collaboration.socket.off('file-tree-delete', handleFileTreeDelete);
        collaboration.socket.off('cursor-update', handleCursorUpdate);
      }
    };
  }, [collaboration.socket, toast, activeTab, openTabs]);

  // Load project from URL parameter or initialize empty
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');
    
    if (projectId) {
      loadProject(projectId);
    } else {
      // Initialize with empty project
      const emptyProject: FileNode[] = [
        {
          id: 'root-1',
          name: 'src',
          type: 'folder',
          path: 'src',
          children: []
        }
      ];
      setFileTree(emptyProject);
      setExpandedFolders(new Set(['root-1']));
    }
  }, [location]);

  // Fetch user's purchased LLM models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const userStr = localStorage.getItem('devmindx_user');
        if (!userStr) return;
        
        const userData = JSON.parse(userStr);
        
        const response = await fetch('/api/llm/models', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
            'x-user-id': userData.id.toString()
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Update models with purchased status
          const updatedModels = llmModels.map(model => {
            const purchasedModel = data.models.find((m: any) => m.id === model.id);
            if (purchasedModel) {
              return {
                ...model,
                locked: !purchasedModel.purchased || purchasedModel.expired
              };
            }
            return model;
          });
          setLlmModels(updatedModels);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  // Check Docker availability on mount
  useEffect(() => {
    const checkDocker = async () => {
      try {
        const response = await fetch('/api/sandbox/status');
        const data = await response.json();
        setDockerAvailable(data.available);
        
        if (!data.available) {
          setTerminalOutput([
            '⚠️  Docker is not available',
            '📋 To enable code execution:',
            '   1. Install Docker Desktop for Windows',
            '   2. Start Docker Desktop',
            '   3. Refresh this page',
            '\n💡 You can still write and save code without Docker',
            ''
          ]);
        }
      } catch (error) {
        setDockerAvailable(false);
      }
    };
    
    checkDocker();
  }, []);

  // Command Palette (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript', 'ts': 'typescript', 'jsx': 'javascript', 'tsx': 'typescript',
      'py': 'python', 'cpp': 'cpp', 'c': 'c', 'java': 'java', 'go': 'go',
      'rs': 'rust', 'php': 'php', 'html': 'html', 'css': 'css', 'json': 'json',
      'md': 'markdown', 'sh': 'shell', 'yml': 'yaml', 'yaml': 'yaml'
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const openFile = (node: FileNode, path: string = '') => {
    if (node.type === 'file') {
      const fullPath = path + '/' + node.name;
      const existingTab = openTabs.find(tab => tab.id === node.id);
      
      // Notify collaborators about file open
      if (collaboration.sessionId) {
        collaboration.notifyFileOpen(fullPath);
      }
      
      if (!existingTab) {
        const newTab: Tab = {
          id: node.id,
          name: node.name,
          content: node.content || '',
          language: node.language || getLanguageFromFilename(node.name),
          path: fullPath
        };
        setOpenTabs([...openTabs, newTab]);
        setActiveTab(node.id);
      } else {
        setActiveTab(node.id);
      }
    }
  };

  const closeTab = (tabId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
    }
  };

  const handleEditorChange = (value: string | undefined, event?: any) => {
    if (activeTab && value !== undefined) {
      const currentTab = openTabs.find(tab => tab.id === activeTab);
      
      // Update local state
      setOpenTabs(tabs => tabs.map(tab => 
        tab.id === activeTab ? { ...tab, content: value } : tab
      ));

      // Update file tree content
      const updateFileContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === activeTab) {
            return { ...node, content: value };
          }
          if (node.children) {
            return { ...node, children: updateFileContent(node.children) };
          }
          return node;
        });
      };
      setFileTree(prev => updateFileContent(prev));

      // Track current user's edits
      if (editorRef.current && event?.changes) {
        const userStr = localStorage.getItem('devmindx_user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const currentUser = collaboration.users.find(u => u.id === userData.id);
          
          if (currentUser) {
            event.changes.forEach((change: any) => {
              const startLine = change.range.startLineNumber;
              const endLine = change.range.endLineNumber;
              
              for (let line = startLine; line <= endLine; line++) {
                setLineAuthors(prev => {
                  const newMap = new Map(prev);
                  newMap.set(line, {
                    userId: currentUser.id,
                    username: currentUser.username,
                    color: currentUser.color
                  });
                  return newMap;
                });
              }
            });
            
            // Update line decorations
            updateLineDecorations();
          }
        }
      }

      // Broadcast changes to collaborators
      if (collaboration.sessionId && currentTab) {
        collaboration.sendCodeChange(currentTab.path, value, {});
      }
      
      setHasUnsavedChanges(true);
    }
  };

  // Detect if code needs input
  const detectInputNeeds = (code: string, language: string): Array<{name: string, label: string, type: 'text' | 'number', placeholder?: string}> => {
    const fields: Array<{name: string, label: string, type: 'text' | 'number', placeholder?: string}> = [];
    
    // Python: input() detection
    if (language === 'python') {
      const inputMatches = code.match(/input\s*\(\s*["']([^"']*)["']\s*\)/g);
      if (inputMatches) {
        inputMatches.forEach((match, index) => {
          const labelMatch = match.match(/["']([^"']*)["']/);
          const label = labelMatch ? labelMatch[1] : `Input ${index + 1}`;
          fields.push({
            name: `arg${index}`,
            label: label || `Input ${index + 1}`,
            type: 'text',
            placeholder: 'Enter value'
          });
        });
      }
    }
    
    // Java: Scanner detection
    if (language === 'java') {
      const scannerPatterns = [
        /scanner\.next(?:Line|Int|Double|Float|Boolean)\s*\(\s*\)/gi,
        /Scanner\s+\w+\s*=\s*new\s+Scanner/i
      ];
      
      if (scannerPatterns.some(pattern => pattern.test(code))) {
        // Count number of scanner.next* calls
        const nextCalls = code.match(/scanner\.next(?:Line|Int|Double|Float|Boolean)\s*\(\s*\)/gi) || [];
        nextCalls.forEach((call, index) => {
          const type = call.includes('Int') || call.includes('Double') || call.includes('Float') ? 'number' : 'text';
          fields.push({
            name: `arg${index}`,
            label: `Input ${index + 1}`,
            type,
            placeholder: type === 'number' ? 'Enter number' : 'Enter text'
          });
        });
      }
    }
    
    // C/C++: scanf/cin detection
    if (language === 'c' || language === 'cpp') {
      const scanfMatches = code.match(/scanf|cin\s*>>/g);
      if (scanfMatches) {
        scanfMatches.forEach((_, index) => {
          fields.push({
            name: `arg${index}`,
            label: `Input ${index + 1}`,
            type: 'text',
            placeholder: 'Enter value'
          });
        });
      }
    }
    
    // JavaScript/Node: readline detection
    if (language === 'javascript') {
      if (code.includes('readline') || code.includes('prompt')) {
        fields.push({
          name: 'arg0',
          label: 'Input',
          type: 'text',
          placeholder: 'Enter value'
        });
      }
    }
    
    return fields;
  };

  const runCode = async (inputValues?: Record<string, string>) => {
    const currentTab = openTabs.find(tab => tab.id === activeTab);
    if (!currentTab) {
      toast({
        title: 'No File Open',
        description: 'Please open a file to run code',
        variant: 'destructive'
      });
      return;
    }

    // Check if code needs input and we haven't provided it yet
    if (!inputValues) {
      const detectedFields = detectInputNeeds(currentTab.content, currentTab.language);
      if (detectedFields.length > 0) {
        setInputFields(detectedFields);
        setShowInputDialog(true);
        return; // Wait for user to provide input
      }
    }

    // Write to interactive terminal
    if ((window as any).writeToTerminal) {
      (window as any).writeToTerminal('');
      (window as any).writeToTerminal(`\x1b[36m> Running ${currentTab.name}...\x1b[0m`);
      if (inputValues) {
        (window as any).writeToTerminal(`\x1b[33m> With inputs: ${Object.values(inputValues).join(', ')}\x1b[0m`);
      }
    }
    setTerminalOutput(prev => [...prev, `\n> Running ${currentTab.name}...`]);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({
          code: currentTab.content,
          language: currentTab.language,
          filename: currentTab.name,
          input: inputValues ? Object.values(inputValues).join('\n') : undefined
        })
      });

      const data = await response.json();
      
      if (data.output) {
        setTerminalOutput(prev => [...prev, data.output]);
        // Write to interactive terminal
        if ((window as any).writeToTerminal) {
          (window as any).writeToTerminal('\x1b[32m✓ Output:\x1b[0m');
          data.output.split('\n').forEach((line: string) => {
            (window as any).writeToTerminal(line);
          });
        }
      }
      if (data.error) {
        const errorMsg = data.error;
        setTerminalOutput(prev => [...prev, `\n❌ Error: ${errorMsg}`]);
        
        // Write to interactive terminal
        if ((window as any).writeToTerminal) {
          (window as any).writeToTerminal(`\x1b[31m✗ Error: ${errorMsg}\x1b[0m`);
        }
        
        // Check if it's a Docker error
        if (errorMsg.includes('docker') || errorMsg.includes('Docker')) {
          const dockerHelp = [
            '',
            '\x1b[33m⚠️  Docker is not running!\x1b[0m',
            '\x1b[36m📋 To fix this:\x1b[0m',
            '   1. Start Docker Desktop on Windows',
            '   2. Wait for Docker to fully start',
            '   3. Try running your code again',
            '',
            '\x1b[36m💡 Alternative: Use online compilers like:\x1b[0m',
            '   - replit.com',
            '   - onlinegdb.com',
            '   - programiz.com'
          ];
          
          setTerminalOutput(prev => [...prev, ...dockerHelp]);
          
          if ((window as any).writeToTerminal) {
            dockerHelp.forEach(line => (window as any).writeToTerminal(line));
          }
          
          toast({
            title: 'Docker Not Running',
            description: 'Please start Docker Desktop to run code',
            variant: 'destructive'
          });
        }
      }
      
      // Add prompt back
      if ((window as any).writeToTerminal) {
        (window as any).writeToTerminal('');
      }
    } catch (error) {
      const errorMsg = `\n❌ Execution failed: ${error}`;
      setTerminalOutput(prev => [...prev, errorMsg]);
      
      if ((window as any).writeToTerminal) {
        (window as any).writeToTerminal(`\x1b[31m${errorMsg}\x1b[0m`);
      }
      
      toast({
        title: 'Execution Error',
        description: 'Failed to execute code',
        variant: 'destructive'
      });
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const model = llmModels.find(m => m.id === selectedModel);
    if (model?.locked) {
      toast({
        title: "Model Locked",
        description: `Upgrade to unlock ${model.name} for $${model.price}/month`,
        variant: "destructive"
      });
      return;
    }

    const userMessage = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, userMessage],
          model: selectedModel,
          context: openTabs.find(tab => tab.id === activeTab)?.content
        })
      });

      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to get response", variant: "destructive" });
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Load project from backend
  const loadProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load project');

      const project = await response.json();
      setCurrentProject(project);
      setProjectName(project.name);
      setProjectDescription(project.description || '');

      // Convert project files to file tree
      const tree = convertFilesToTree(project.files || {});
      setFileTree(tree);
      
      // Expand root folders
      const rootFolderIds = tree.filter(n => n.type === 'folder').map(n => n.id);
      setExpandedFolders(new Set(rootFolderIds));

      toast({
        title: 'Project Loaded',
        description: `${project.name} loaded successfully!`
      });
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Load Failed',
        description: 'Could not load project',
        variant: 'destructive'
      });
    }
  };

  // Convert flat files object to tree structure
  const convertFilesToTree = (files: Record<string, string>): FileNode[] => {
    const root: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    Object.entries(files).forEach(([path, content]) => {
      const parts = path.split('/');
      let currentLevel = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        if (isFile) {
          currentLevel.push({
            id: `file-${Date.now()}-${Math.random()}`,
            name: part,
            type: 'file',
            content,
            language: getLanguageFromFilename(part),
            path: currentPath
          });
        } else {
          let folder = folderMap.get(currentPath);
          if (!folder) {
            folder = {
              id: `folder-${Date.now()}-${Math.random()}`,
              name: part,
              type: 'folder',
              children: [],
              path: currentPath
            };
            folderMap.set(currentPath, folder);
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      });
    });

    return root;
  };

  // Convert tree structure to flat files object
  const convertTreeToFiles = (nodes: FileNode[], basePath: string = ''): Record<string, string> => {
    const files: Record<string, string> = {};

    const traverse = (node: FileNode, path: string) => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      
      if (node.type === 'file') {
        files[fullPath] = node.content || '';
      } else if (node.children) {
        node.children.forEach(child => traverse(child, fullPath));
      }
    };

    nodes.forEach(node => traverse(node, basePath));
    return files;
  };

  // Save project to backend
  const saveProject = async () => {
    if (!projectName.trim()) {
      setShowSaveProjectDialog(true);
      return;
    }

    try {
      const files = convertTreeToFiles(fileTree);
      const projectData: Project = {
        name: projectName,
        description: projectDescription,
        framework: 'multi-language',
        files
      };

      const url = currentProject?.id 
        ? `/api/projects/${currentProject.id}`
        : '/api/projects';
      
      const method = currentProject?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) throw new Error('Failed to save project');

      const savedProject = await response.json();
      setCurrentProject(savedProject);
      setHasUnsavedChanges(false);

      toast({
        title: 'Project Saved',
        description: `${projectName} saved successfully!`
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save project',
        variant: 'destructive'
      });
    }
  };

  // Create new file
  const createNewFile = (parentNode: FileNode | null = null) => {
    if (!newItemName.trim()) return;

    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: newItemName,
      type: 'file',
      content: '',
      language: getLanguageFromFilename(newItemName),
      path: parentNode ? `${parentNode.path}/${newItemName}` : newItemName
    };

    if (parentNode) {
      // Add to parent folder
      setFileTree(prev => addNodeToTree(prev, parentNode.id, newFile));
    } else {
      // Add to root
      setFileTree(prev => [...prev, newFile]);
    }

    // Notify collaborators
    if (collaboration.sessionId) {
      collaboration.notifyFileTreeUpdate('create-file', newFile, parentNode?.id);
    }

    setNewItemName('');
    setShowNewFileDialog(false);
    setHasUnsavedChanges(true);

    toast({
      title: 'File Created',
      description: `${newFile.name} created successfully`
    });
  };

  // Create new folder
  const createNewFolder = (parentNode: FileNode | null = null) => {
    if (!newItemName.trim()) return;

    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      name: newItemName,
      type: 'folder',
      children: [],
      path: parentNode ? `${parentNode.path}/${newItemName}` : newItemName
    };

    if (parentNode) {
      setFileTree(prev => addNodeToTree(prev, parentNode.id, newFolder));
    } else {
      setFileTree(prev => [...prev, newFolder]);
    }

    // Notify collaborators
    if (collaboration.sessionId) {
      collaboration.notifyFileTreeUpdate('create-folder', newFolder, parentNode?.id);
    }

    setNewItemName('');
    setShowNewFolderDialog(false);
    setHasUnsavedChanges(true);

    toast({
      title: 'Folder Created',
      description: `${newFolder.name} created successfully`
    });
  };

  // Add node to tree
  const addNodeToTree = (nodes: FileNode[], parentId: string, newNode: FileNode): FileNode[] => {
    return nodes.map(node => {
      if (node.id === parentId && node.type === 'folder') {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNodeToTree(node.children, parentId, newNode)
        };
      }
      return node;
    });
  };

  // Delete file or folder
  const deleteNode = (nodeId: string) => {
    setFileTree(prev => removeNodeFromTree(prev, nodeId));
    
    // Close tabs for deleted files
    setOpenTabs(prev => prev.filter(tab => tab.id !== nodeId));
    if (activeTab === nodeId) {
      setActiveTab(openTabs[0]?.id || null);
    }

    // Notify collaborators
    if (collaboration.sessionId) {
      collaboration.notifyFileTreeDelete(nodeId);
    }

    setHasUnsavedChanges(true);
    toast({
      title: 'Deleted',
      description: 'Item deleted successfully'
    });
  };

  // Remove node from tree
  const removeNodeFromTree = (nodes: FileNode[], nodeId: string): FileNode[] => {
    return nodes.filter(node => {
      if (node.id === nodeId) return false;
      if (node.children) {
        node.children = removeNodeFromTree(node.children, nodeId);
      }
      return true;
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileNode = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          content: content,
          language: getLanguageFromFilename(file.name),
          path: file.name
        };

        setFileTree(prev => [...prev, newFile]);

        // Notify collaborators
        if (collaboration.sessionId) {
          collaboration.notifyFileTreeUpdate('create-file', newFile);
        }

        toast({
          title: 'File Uploaded',
          description: `${file.name} uploaded successfully`
        });
      };

      reader.readAsText(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Update line decorations to show who edited what
  const updateLineDecorations = () => {
    if (!editorRef.current) return;

    const decorations: any[] = [];
    
    lineAuthors.forEach((author, lineNumber) => {
      decorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: 'line-edited',
          glyphMarginClassName: 'line-author-glyph',
          glyphMarginHoverMessage: { value: `Edited by ${author.username}` },
          overviewRuler: {
            color: author.color,
            position: 2
          },
          minimap: {
            color: author.color,
            position: 2
          }
        }
      });
    });

    const newDecorations = editorRef.current.deltaDecorations(
      lineDecorationsRef.current,
      decorations
    );
    lineDecorationsRef.current = newDecorations;
  };

  const renderFileTree = (nodes: FileNode[], path: string = ''): JSX.Element[] => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 cursor-pointer group"
          onClick={() => node.type === 'folder' ? toggleFolder(node.id) : openFile(node, path)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
          }}
        >
          {node.type === 'folder' && (
            expandedFolders.has(node.id) ? 
              <ChevronDownIcon className="w-4 h-4" /> : 
              <ChevronRightIcon className="w-4 h-4" />
          )}
          {node.type === 'folder' ? 
            <FolderIcon className="w-4 h-4 text-blue-400" /> : 
            <FileIcon className="w-4 h-4 text-gray-400" />
          }
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.id) && node.children && (
          <div className="ml-4">
            {renderFileTree(node.children, path + '/' + node.name)}
          </div>
        )}
      </div>
    ));
  };

  const currentTab = openTabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white">
      {/* Top Bar */}
      <div className="h-12 bg-[#2d2d2d] border-b border-gray-700 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">DevMindX IDE</h1>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-400">● Unsaved changes</span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowCommandPalette(true)}>
            <CommandIcon className="w-4 h-4 mr-2" />
            Command Palette
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          {dockerAvailable === false && (
            <span className="text-xs text-orange-400 mr-2" title="Docker is not running">
              🐳 Docker Offline
            </span>
          )}
          {dockerAvailable === true && (
            <span className="text-xs text-green-400 mr-2" title="Docker is ready">
              🐳 Docker Ready
            </span>
          )}
          {collaboration.sessionId && (
            <span className="text-xs text-purple-400 mr-2 flex items-center gap-1" title="Collaboration active">
              <Users className="w-3 h-3" />
              {collaboration.users.length} user{collaboration.users.length !== 1 ? 's' : ''}
            </span>
          )}
          <Button 
            onClick={triggerFileUpload}
            size="sm" 
            variant="outline" 
            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            title="Upload files"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button 
            onClick={() => {
              setShowGitPanel(!showGitPanel);
              if (!showGitPanel) {
                // Close other right panels when opening Git
                setShowCollaboration(false);
                setShowAiSuggestions(false);
                setShowEditHistory(false);
              }
            }}
            size="sm" 
            variant="outline" 
            className={`border-green-600 text-green-400 hover:bg-green-600/10 ${showGitPanel ? 'bg-green-600/20' : ''}`}
            title="Git control"
          >
            <GitBranchIcon className="w-4 h-4 mr-2" />
            Git
          </Button>
          <Button 
            onClick={() => setShowWhiteboard(true)}
            size="sm" 
            variant="outline" 
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
            title="Collaborative whiteboard"
          >
            <PenToolIcon className="w-4 h-4 mr-2" />
            Whiteboard
          </Button>
          <Button 
            onClick={() => setShowVideoCall(true)}
            size="sm" 
            variant="outline" 
            className={`border-red-600 text-red-400 hover:bg-red-600/10 ${showVideoCall ? 'bg-red-600/20' : ''}`}
            title="Video call & screen sharing"
            disabled={!collaboration.sessionId}
          >
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>
          <Button 
            onClick={() => {
              setShowAiSuggestions(!showAiSuggestions);
              if (!showAiSuggestions) {
                // Close other right panels when opening AI
                setShowCollaboration(false);
                setShowEditHistory(false);
                setShowGitPanel(false);
              }
            }}
            size="sm" 
            variant="outline" 
            className={`border-purple-600 text-purple-400 hover:bg-purple-600/10 ${showAiSuggestions ? 'bg-purple-600/20' : ''}`}
            title="AI code assistant"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            AI
          </Button>
          <Button 
            onClick={() => {
              setShowEditHistory(!showEditHistory);
              if (!showEditHistory) {
                // Close other right panels when opening History
                setShowCollaboration(false);
                setShowAiSuggestions(false);
                setShowGitPanel(false);
              }
            }}
            size="sm" 
            variant="outline" 
            className={`border-blue-600 text-blue-400 hover:bg-blue-600/10 ${showEditHistory ? 'bg-blue-600/20' : ''}`}
            title="Edit history"
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button 
            onClick={() => {
              setShowCollaboration(!showCollaboration);
              if (!showCollaboration) {
                // Close other right panels when opening Collaboration
                setShowAiSuggestions(false);
                setShowEditHistory(false);
                setShowGitPanel(false);
              }
            }}
            size="sm" 
            variant="outline" 
            className={`border-purple-600 text-purple-400 hover:bg-purple-600/10 ${showCollaboration ? 'bg-purple-600/20' : ''}`}
            title="Toggle collaboration panel"
          >
            <Users className="w-4 h-4 mr-2" />
            Collaborate
          </Button>
          <Button onClick={saveProject} size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10">
            <SaveIcon className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button 
            onClick={() => runCode()} 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            disabled={dockerAvailable === false}
            title={dockerAvailable === false ? 'Docker is required to run code' : 'Run code in Docker sandbox'}
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Run Code
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-64 bg-[#252526] border-r border-gray-700 flex flex-col">
          <div className="p-2 border-b border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold">
              {currentProject ? currentProject.name : 'EXPLORER'}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowNewFileDialog(true)}
                title="New File"
              >
                <FilePlusIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowNewFolderDialog(true)}
                title="New Folder"
              >
                <FolderPlusIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-blue-400"
                onClick={triggerFileUpload}
                title="Upload Files"
              >
                <UploadIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-green-400"
                onClick={saveProject}
                title="Save Project"
              >
                <SaveIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {fileTree.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <p>No files yet</p>
                <p className="mt-2">Create a file to get started</p>
              </div>
            ) : (
              renderFileTree(fileTree)
            )}
          </ScrollArea>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="h-10 bg-[#2d2d2d] border-b border-gray-700 flex items-center overflow-x-auto">
            {openTabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-4 h-full border-r border-gray-700 cursor-pointer ${
                  activeTab === tab.id ? 'bg-[#1e1e1e]' : 'hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <FileIcon className="w-4 h-4" />
                <span className="text-sm">{tab.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="hover:bg-gray-700 rounded p-0.5"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            {currentTab ? (
              <Editor
                height="100%"
                language={currentTab.language}
                value={currentTab.content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                onMount={(editor) => { 
                  editorRef.current = editor;
                  
                  // Track cursor position changes
                  editor.onDidChangeCursorPosition((e) => {
                    if (collaboration.sessionId && currentTab) {
                      collaboration.sendCursorPosition(
                        e.position.lineNumber,
                        e.position.column,
                        currentTab.path
                      );
                    }
                  });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No file open. Select a file from the explorer.</p>
              </div>
            )}
          </div>

          {/* Terminal Panel - Interactive & Resizable */}
          <ResizablePanel
            direction="vertical"
            initialSize={200}
            minSize={100}
            maxSize={600}
            storageKey="ide-terminal-height"
            className="bg-[#1e1e1e] border-t border-gray-700"
          >
            <div className="h-full flex flex-col">
              <div className="h-10 bg-[#2d2d2d] flex items-center px-4 border-b border-gray-700">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-sm font-semibold text-white border-b-2 border-blue-500 pb-1">
                    <TerminalIcon className="w-4 h-4" />
                    TERMINAL
                  </button>
                  <button 
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white pb-1"
                    onClick={() => {/* Toggle debug panel */}}
                  >
                    <BugIcon className="w-4 h-4" />
                    DEBUG
                  </button>
                </div>
                <span className="text-xs text-gray-500 ml-4">(Type commands and press Enter)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    if ((window as any).clearTerminal) {
                      (window as any).clearTerminal();
                    }
                    setTerminalOutput([]);
                  }}
                  title="Clear terminal (Ctrl+L)"
                >
                  Clear
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <InteractiveTerminal
                  onCommand={(cmd) => {
                    console.log('Terminal command:', cmd);
                    // You can add custom command handling here
                  }}
                  initialOutput={terminalOutput}
                  onClearTerminal={() => setTerminalOutput([])}
                />
              </div>
            </div>
          </ResizablePanel>
        </div>

        {/* Right Sidebar - AI Assistant - Resizable */}
        <ResizablePanel
          direction="horizontal"
          initialSize={320}
          minSize={200}
          maxSize={600}
          storageKey="ide-ai-sidebar-width"
          className="bg-[#252526] border-l border-gray-700 flex flex-col"
        >
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">AI ASSISTANT</span>
              <MessageSquareIcon className="w-4 h-4" />
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#3c3c3c] border border-gray-600 rounded px-2 py-1 text-sm"
            >
              {llmModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.locked && '🔒 '}{model.name}
                </option>
              ))}
            </select>
          </div>

          <ScrollArea className="flex-1 p-4">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                <div className="font-semibold text-xs mb-1">{msg.role.toUpperCase()}</div>
                <div className="text-sm">{msg.content}</div>
              </div>
            ))}
          </ScrollArea>

          <div className="p-4 border-t border-gray-700">
            <Input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
              placeholder="Ask AI anything..."
              className="mb-2"
            />
            <Button onClick={sendAIMessage} className="w-full">Send</Button>
          </div>
        </ResizablePanel>
      </div>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowCommandPalette(false)}>
          <div className="bg-[#2d2d2d] rounded-lg w-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Input
              autoFocus
              placeholder="Type a command..."
              className="border-0 bg-transparent text-lg p-4"
              onKeyDown={(e) => e.key === 'Escape' && setShowCommandPalette(false)}
            />
            <div className="border-t border-gray-700 p-2">
              {[
                { label: 'Create File', action: () => { setShowNewFileDialog(true); setShowCommandPalette(false); } },
                { label: 'Create Folder', action: () => { setShowNewFolderDialog(true); setShowCommandPalette(false); } },
                { label: 'Upload Files', action: () => { triggerFileUpload(); setShowCommandPalette(false); } },
                { label: 'Save Project', action: () => { saveProject(); setShowCommandPalette(false); } },
                { label: 'Run Code', action: () => { runCode(); setShowCommandPalette(false); } },
                { label: 'Toggle Git Panel', action: () => { setShowGitPanel(!showGitPanel); setShowCommandPalette(false); } },
                { label: 'Open Whiteboard', action: () => { setShowWhiteboard(true); setShowCommandPalette(false); } },
                { label: 'AI Code Assistant', action: () => { setShowAiSuggestions(!showAiSuggestions); setShowCommandPalette(false); } },
                { label: 'Toggle Collaboration', action: () => { setShowCollaboration(!showCollaboration); setShowCommandPalette(false); } },
                { label: 'Clear Terminal', action: () => { setTerminalOutput([]); setShowCommandPalette(false); } }
              ].map(cmd => (
                <div 
                  key={cmd.label} 
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded"
                  onClick={cmd.action}
                >
                  {cmd.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFileDialog(false)}>
          <div className="bg-[#2d2d2d] rounded-lg w-[400px] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <Input
              autoFocus
              placeholder="filename.ext (e.g., main.py, app.js)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFile(contextMenu?.node || null);
                if (e.key === 'Escape') setShowNewFileDialog(false);
              }}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNewFileDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createNewFile(contextMenu?.node || null)} className="bg-blue-600 hover:bg-blue-700">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFolderDialog(false)}>
          <div className="bg-[#2d2d2d] rounded-lg w-[400px] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <Input
              autoFocus
              placeholder="folder-name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFolder(contextMenu?.node || null);
                if (e.key === 'Escape') setShowNewFolderDialog(false);
              }}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNewFolderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createNewFolder(contextMenu?.node || null)} className="bg-blue-600 hover:bg-blue-700">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Project Dialog */}
      {showSaveProjectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSaveProjectDialog(false)}>
          <div className="bg-[#2d2d2d] rounded-lg w-[500px] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Save Project</h3>
            <Input
              autoFocus
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mb-3"
            />
            <Input
              placeholder="Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSaveProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => { saveProject(); setShowSaveProjectDialog(false); }} className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-[#2d2d2d] border border-gray-700 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.node?.type === 'folder' && (
            <>
              <div 
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => { setShowNewFileDialog(true); }}
              >
                <FilePlusIcon className="w-4 h-4 inline mr-2" />
                New File
              </div>
              <div 
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => { setShowNewFolderDialog(true); }}
              >
                <FolderPlusIcon className="w-4 h-4 inline mr-2" />
                New Folder
              </div>
              <div className="border-t border-gray-700 my-1" />
            </>
          )}
          <div 
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-red-400"
            onClick={() => { 
              if (contextMenu.node) deleteNode(contextMenu.node.id); 
              setContextMenu(null); 
            }}
          >
            <TrashIcon className="w-4 h-4 inline mr-2" />
            Delete
          </div>
        </div>
      )}

      {/* Input Dialog for Interactive Programs */}
      <InputDialog
        isOpen={showInputDialog}
        onClose={() => setShowInputDialog(false)}
        onSubmit={(values) => {
          setShowInputDialog(false);
          runCode(values);
        }}
        title="Program Input Required"
        description="This program needs input. Please provide the values below:"
        fields={inputFields}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Whiteboard */}
      {showWhiteboard && (
        <Whiteboard
          sessionId={collaboration.sessionId}
          socket={collaboration.socket}
          onClose={() => setShowWhiteboard(false)}
          onDrawingChange={(data) => {
            // Broadcast drawing to collaborators
            if (collaboration.socket && collaboration.sessionId) {
              collaboration.socket.emit('whiteboard-update', { data });
            }
          }}
        />
      )}

      {/* AI Code Assistant */}
      {showAiSuggestions && currentTab && (
        <AICodeAssistant
          code={currentTab.content}
          language={currentTab.language}
          onAcceptSuggestion={(suggestion) => {
            setOpenTabs(tabs => tabs.map(tab =>
              tab.id === activeTab ? { ...tab, content: suggestion } : tab
            ));
            setShowAiSuggestions(false);
          }}
          onClose={() => setShowAiSuggestions(false)}
        />
      )}

      {/* Git Panel */}
      {showGitPanel && (
        <div className="fixed right-0 top-12 bottom-0 w-80 z-40 shadow-2xl animate-slide-in">
          <GitPanel
            projectName={projectName || 'Untitled'}
            onClose={() => setShowGitPanel(false)}
          />
        </div>
      )}

      {/* Edit History Panel */}
      {showEditHistory && (
        <div className="fixed right-0 top-12 bottom-0 w-80 z-40 shadow-2xl animate-slide-in">
          <EditHistory
            lineAuthors={lineAuthors}
            users={collaboration.users}
            onClose={() => setShowEditHistory(false)}
          />
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <div className="fixed right-0 top-12 bottom-0 w-80 z-40 shadow-2xl animate-slide-in">
          <IDECollaborationPanel
            isConnected={collaboration.isConnected}
            sessionId={collaboration.sessionId}
            isHost={collaboration.isHost}
            users={collaboration.users}
            messages={collaboration.messages}
            onStartSession={() => collaboration.startSession()}
            onJoinSession={(code) => collaboration.joinSession(code)}
            onLeaveSession={() => collaboration.leaveSession()}
            onSendMessage={(msg) => collaboration.sendMessage(msg)}
          />
        </div>
      )}

      {/* Video Call Panel */}
      {showVideoCall && collaboration.sessionId && (
        <VideoCallPanel
          sessionId={collaboration.sessionId}
          currentUserId={collaboration.users.find(u => u.id)?.id || 'unknown'}
          currentUsername={collaboration.users.find(u => u.id)?.username || 'User'}
          currentUserColor={collaboration.users.find(u => u.id)?.color || '#6366f1'}
          isHost={collaboration.isHost}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
}
