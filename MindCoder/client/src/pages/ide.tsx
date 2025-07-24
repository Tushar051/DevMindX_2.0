import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FileExplorer } from "@/components/ide/file-explorer";
import { CodeEditor } from "@/components/ide/code-editor";
import { AIChat } from "@/components/ide/ai-chat";
import { Terminal } from "@/components/ide/terminal";
import { ProjectModal } from "@/components/ide/project-modal";
import { NewProjectModal } from "@/components/ide/new-project-modal";
import { AIModelSelector } from "@/components/ide/ai-model-selector";
import { projectsApi, aiApi } from "@/lib/api";
import { User, Settings, Sparkles, Play } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface EditorTab {
  path: string;
  name: string;
  content: string;
  modified: boolean;
}

export default function IDE() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const userProjects = await projectsApi.getAll();
      setProjects(userProjects);
      if (userProjects.length > 0 && !currentProject) {
        setCurrentProject(userProjects[0]);
      }
    } catch (error: any) {
      toast({
        title: "Failed to load projects",
        description: error.message || "Could not load your projects.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (path: string) => {
    if (!currentProject) return;

    const existingTab = openTabs.find(tab => tab.path === path);
    if (existingTab) {
      setActiveTab(path);
      return;
    }

    const fileContent = currentProject.files?.[path] || '';
    const fileName = path.split('/').pop() || path;

    const newTab: EditorTab = {
      path,
      name: fileName,
      content: fileContent,
      modified: false
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTab(path);
  };

  const handleTabClose = (path: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.path !== path));
    if (activeTab === path) {
      const remainingTabs = openTabs.filter(tab => tab.path !== path);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[0].path : null);
    }
  };

  const handleContentChange = (path: string, content: string) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.path === path 
        ? { ...tab, content, modified: tab.content !== content }
        : tab
    ));

    // Auto-save after a delay (in a real app, you'd debounce this)
    setTimeout(() => {
      if (currentProject) {
        const updatedFiles = { ...currentProject.files, [path]: content };
        projectsApi.update(currentProject.id, { files: updatedFiles }).catch(console.error);
      }
    }, 1000);
  };

  const handleFileCreate = (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    
    if (currentProject) {
      const updatedFiles = { ...currentProject.files, [fullPath]: '' };
      setCurrentProject({ ...currentProject, files: updatedFiles });
      handleFileSelect(fullPath);
    }
  };

  const handleFolderCreate = (parentPath: string) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    
    if (currentProject) {
      const updatedFiles = { ...currentProject.files, [`${fullPath}/.gitkeep`]: '' };
      setCurrentProject({ ...currentProject, files: updatedFiles });
    }
  };

  const handleCreateFile = (path: string, content: string) => {
    if (currentProject) {
      const updatedFiles = { ...currentProject.files, [path]: content };
      setCurrentProject({ ...currentProject, files: updatedFiles });
      projectsApi.update(currentProject.id, { files: updatedFiles }).catch(console.error);
      handleFileSelect(path);
      
      toast({
        title: "File Created",
        description: `${path} has been created successfully.`,
      });
    }
  };

  const handleInsertCode = (code: string) => {
    if (activeTab && currentProject) {
      const updatedContent = code;
      handleContentChange(activeTab, updatedContent);
      
      toast({
        title: "Code Inserted",
        description: "Code has been inserted into the active file.",
      });
    } else {
      toast({
        title: "No Active File",
        description: "Please open a file first to insert code.",
        variant: "destructive",
      });
    }
  };

  const handleRunCode = async () => {
    if (!activeTab || !currentProject) {
      toast({
        title: "No Active File",
        description: "Please open a file to run.",
        variant: "destructive",
      });
      return;
    }

    const fileContent = currentProject.files[activeTab];
    const fileExt = activeTab.split('.').pop()?.toLowerCase();
    
    setIsRunningCode(true);
    setRunOutput("");
    
    try {
      // For HTML files, we can preview them
      if (fileExt === 'html') {
        // Create a data URL to open in a new window
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fileContent)}`;
        window.open(dataUrl, '_blank');
        setRunOutput("HTML file opened in a new window for preview.");
      }
      // For JavaScript files, we can execute them in a sandboxed environment
      else if (fileExt === 'js') {
        try {
          // Create a sandboxed iframe to run the code
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          
          // Create a console.log override to capture output
          let output = "";
            interface IConsole {
            log: (...args: any[]) => void;
            }

            interface IWindow extends Window {
            console: IConsole;
            }
            (iframe.contentWindow as unknown as IWindow).console.log = (...args: any[]) => {
            output += args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ') + '\n';
            };
          
          // Execute the code
          const script = iframe.contentWindow!.document.createElement('script');
          script.textContent = fileContent;
          iframe.contentWindow!.document.body.appendChild(script);
          
          // Clean up
          document.body.removeChild(iframe);
          
          setRunOutput(output || "Code executed successfully (no console output).");
        } catch (error: any) {
          setRunOutput(`Error: ${error.message}`);
        }
      }
      // For other file types, we can use AI to interpret or explain them
      else {
        const response = await aiApi.chat(`Please analyze and explain this ${fileExt} code:\n\n${fileContent}`);
        setRunOutput(`AI Analysis: ${response.response}`);
      }
    } catch (error: any) {
      setRunOutput(`Error running code: ${error.message}`);
      toast({
        title: "Run Failed",
        description: error.message || "Failed to run the code.",
        variant: "destructive",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleProjectCreated = (project: any) => {
    setProjects(prev => [project, ...prev]);
    setCurrentProject(project);
    setOpenTabs([]);
    setActiveTab(null);
    
    // Open the main file if it exists
    const mainFiles = ['src/App.js', 'src/App.tsx', 'index.js', 'app.js', 'main.py'];
    for (const mainFile of mainFiles) {
      if (project.files[mainFile]) {
        handleFileSelect(mainFile);
        break;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devmindx_token');
    localStorage.removeItem('devmindx_user');
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col ide-bg ide-text-primary">
      {/* Title Bar */}
      <div className="ide-panel border-b ide-border h-8 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm ide-text-secondary">DevMindX</span>
          <Button
            size="sm"
            variant="ghost"
            className="ide-text-secondary hover:text-white transition-colors"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <AIModelSelector 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel}
            className="text-xs"
          />
          <Button
            size="sm"
            variant="ghost"
            className="ide-text-secondary hover:text-white transition-colors"
            onClick={() => setShowProjectModal(true)}
          >
            <User className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ide-text-secondary hover:text-white transition-colors"
            onClick={handleLogout}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="ide-sidebar border-b ide-border h-9 flex items-center px-4">
        <div className="flex space-x-6 text-sm">
          <button className="ide-text-secondary hover:text-white transition-colors">File</button>
          <button className="ide-text-secondary hover:text-white transition-colors">Edit</button>
          <button className="ide-text-secondary hover:text-white transition-colors">View</button>
          <button
            className="ide-text-secondary hover:text-white transition-colors"
            onClick={() => setShowProjectModal(true)}
          >
            New Project
          </button>
          <button
            className={`${activeTab ? 'text-green-400 hover:text-green-300' : 'ide-text-secondary hover:text-white'} transition-colors flex items-center`}
            onClick={handleRunCode}
            disabled={!activeTab || isRunningCode}
          >
            <Play className="w-3 h-3 mr-1" />
            Run
          </button>
          <button className="ide-text-secondary hover:text-white transition-colors">Terminal</button>
          <button className="ide-text-secondary hover:text-white transition-colors">Help</button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <FileExplorer
          projectName={currentProject?.name || 'No Project'}
          files={currentProject?.files || {}}
          activeFile={activeTab}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFolderCreate={handleFolderCreate}
        />

        {/* Main Editor Area */}
        <CodeEditor
          tabs={openTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onTabClose={handleTabClose}
          onContentChange={handleContentChange}
        />

        {/* Right Sidebar - AI Chat */}
        <AIChat
          projectId={currentProject?.id}
          onCreateFile={handleCreateFile}
          onInsertCode={handleInsertCode}
        />
      </div>

      {/* Bottom Panel - Terminal */}
      <Terminal
        projectPath={currentProject?.name}
        initialOutput={runOutput}
        isRunning={isRunningCode}
      />

      {/* Project Generation Modal */}
      <ProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
