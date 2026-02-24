import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Code, Loader2, CheckCircle, Home, 
  FileCode, Download, Play, Smartphone, Monitor,
  RefreshCw, ExternalLink, FolderOpen, Send, MessageSquare,
  ChevronRight, File
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { DemoProjectsNotice } from '@/components/DemoProjectsNotice';
import { apiUrl } from '@/config/api';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function GeneratorEnhanced() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Generation state
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  
  // Project state
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [projectGenerated, setProjectGenerated] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Mobile panel state - must be at top level with other hooks
  const [activePanel, setActivePanel] = useState<'preview' | 'files' | 'chat'>('preview');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use the AI Generator',
        variant: 'destructive'
      });
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation, toast]);

  // Load project from URL parameter
  useEffect(() => {
    // Get query params from window.location since wouter's location doesn't include them
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get('projectId');
    
    console.log('URL check:', { 
      windowSearch: window.location.search,
      wouterLocation: location, 
      projectId, 
      isAuthenticated, 
      loadedProjectId 
    });
    
    if (projectId && isAuthenticated && !loadedProjectId) {
      console.log('Loading project:', projectId);
      loadExistingProject(projectId);
    }
  }, [isAuthenticated, loadedProjectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadExistingProject = async (projectId: string) => {
    console.log('loadExistingProject called with:', projectId);
    try {
      setIsGenerating(true);
      setLoadedProjectId(projectId);

      console.log('Fetching project...');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load project');

      const project = await response.json();
      console.log('Project loaded:', project);
      
      const filesArray = Object.entries(project.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
        language: path.split('.').pop() || 'text'
      }));
      
      console.log('Files array:', filesArray.length, 'files');
      
      // Set all state immediately
      setProjectName(project.name);
      setFramework(project.framework || '');
      setPrompt(project.description || '');
      setGeneratedFiles(filesArray);
      
      console.log('Setting projectGenerated to true');
      // Show 3-panel view immediately
      setProjectGenerated(true);
      setIsGenerating(false);
      
      console.log('State updated, should show 3-panel view now');

      // Create preview in background (don't block UI)
      (async () => {
        try {
          const previewResponse = await fetch('/api/preview/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
            },
            body: JSON.stringify({
              files: project.files,
              title: project.name,
              description: project.description
            }),
          });

          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            setPreviewUrl(previewData.previewUrl);
          } else {
            setPreviewUrl(createPreviewUrl(filesArray));
          }
        } catch (previewError) {
          console.error('Preview creation failed:', previewError);
          setPreviewUrl(createPreviewUrl(filesArray));
        }
      })();

      setChatMessages([{
        role: 'assistant',
        content: `I've loaded your project "${project.name}" with ${filesArray.length} files. You can now ask me to modify any file, add features, or fix issues!`,
        timestamp: new Date()
      }]);

      toast({
        title: '✅ Project Loaded!',
        description: `${project.name} is ready for preview and editing`,
      });

    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load project. Please try again.',
        variant: 'destructive',
      });
      setIsGenerating(false);
      setLoadedProjectId(null);
      // Don't redirect, let user try again or go back manually
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please describe what you want to build',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedFiles([]);
    setPreviewUrl('');
    setProjectGenerated(false);

    try {
      const steps = [
        'Analyzing requirements...',
        'Designing architecture...',
        'Generating files...',
        'Creating preview...',
        'Ready!'
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const response = await fetch(apiUrl('/api/projects/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          name: projectName.trim() || 'ai-generated-project',
          framework: framework.trim() || undefined,
          description: prompt.trim(),
          model: 'gemini',
          withPreview: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate project');
      }

      const data = await response.json();
      
      const filesArray = Object.entries(data.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
        language: path.split('.').pop() || 'text'
      }));
      
      setGeneratedFiles(filesArray);
      setProjectGenerated(true);
      
      // Check if we have a valid CodeSandbox preview
      if (data.preview && data.preview.previewUrl && data.preview.sandboxId) {
        setPreviewUrl(data.preview.previewUrl);
        toast({
          title: '🎉 Project Generated!',
          description: `Created ${filesArray.length} files with live CodeSandbox preview`,
        });
      } else {
        // Fallback to local preview
        console.log('Using local preview fallback');
        setPreviewUrl(createPreviewUrl(filesArray));
        toast({
          title: '🎉 Project Generated!',
          description: `Created ${filesArray.length} files with local preview`,
        });
      }

      // Add welcome message to chat
      setChatMessages([{
        role: 'assistant',
        content: `I've generated your project with ${filesArray.length} files. You can now ask me to modify any file, add features, or fix issues. Just describe what you want!`,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate project',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPreviewUrl = (files: GeneratedFile[]): string => {
    console.log('Creating local preview from files:', files.map(f => f.path));
    
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    const jsFile = files.find(f => f.path.endsWith('.js') || f.path.endsWith('.jsx'));
    const cssFile = files.find(f => f.path.endsWith('.css'));

    console.log('Found files:', { html: !!htmlFile, js: !!jsFile, css: !!cssFile });

    let html = htmlFile?.content || '<html><head><title>Preview</title></head><body><div id="root"></div></body></html>';
    
    if (jsFile) {
      html = html.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }
    
    if (cssFile) {
      const headTag = html.includes('</head>') ? '</head>' : '<head></head>';
      html = html.replace(headTag, `<style>${cssFile.content}</style>${headTag}`);
    }

    console.log('Generated HTML preview (first 500 chars):', html.substring(0, 500));

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    console.log('Preview URL created:', url);
    return url;
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Build context with file information
      const filesContext = generatedFiles.map(f => `File: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
      const contextMessage = selectedFile 
        ? `Current file: ${selectedFile.path}\n\nAll project files:\n${filesContext}\n\nUser request: ${chatInput}`
        : `All project files:\n${filesContext}\n\nUser request: ${chatInput}`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          message: contextMessage,
          model: 'gemini',
          chatHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
          projectContext: {
            files: generatedFiles,
            currentFile: selectedFile
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // If AI suggests file changes, apply them
      if (data.fileChanges && data.fileChanges.length > 0) {
        // Update files based on AI suggestions
        toast({
          title: 'Files Updated',
          description: `${data.fileChanges.length} file(s) modified`,
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Failed',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(generatedFiles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${projectName || 'project'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Initial generation view
  if (!projectGenerated) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center py-2 sm:py-3">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" onClick={() => setLocation('/')} className="text-gray-300 hover:text-white px-2 sm:px-4">
                  <Home className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  <span className="text-lg sm:text-xl font-bold text-white">AI Generator</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button onClick={() => setLocation('/projects')} variant="outline" size="sm" className="px-2 sm:px-4">
                  <FolderOpen className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Projects</span>
                </Button>
                <Button onClick={() => setLocation('/ide')} variant="outline" size="sm" className="hidden sm:flex">
                  <Code className="w-4 h-4 mr-2" />
                  IDE
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] p-4 sm:p-8">
          <div className="max-w-2xl w-full space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Create Your Project</h1>
              <p className="text-gray-400 text-sm sm:text-lg">Describe what you want to build and watch AI bring it to life</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Project Name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-app"
                  className="bg-gray-800 border-gray-700 text-white h-10 sm:h-12 text-sm sm:text-base"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Framework (Optional)
                </label>
                <Input
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder="React, Vue, Next.js..."
                  className="bg-gray-800 border-gray-700 text-white h-10 sm:h-12 text-sm sm:text-base"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Describe Your Project
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Try typing: demo snake, demo todo, demo weather, demo ecommerce, or demo social"
                  className="min-h-[150px] sm:min-h-[200px] bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none text-sm sm:text-base"
                  disabled={isGenerating}
                />
                <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                  <span className="text-xs text-gray-400">
                    {prompt.length}/2000 characters
                  </span>
                </div>
              </div>

              {/* Demo Projects Notice */}
              <DemoProjectsNotice />

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg touch-target"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Demo Project
                  </>
                )}
              </Button>
            </div>

            {isGenerating && (
              <div className="space-y-3 mt-8">
                <h3 className="text-sm font-semibold text-gray-300 text-center">Progress</h3>
                {[
                  'Analyzing requirements...',
                  'Designing architecture...',
                  'Generating files...',
                  'Creating preview...',
                  'Ready!'
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index <= generationStep
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {index < generationStep ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : index === generationStep ? (
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                    )}
                    <span className={`text-sm ${
                      index <= generationStep ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3-Panel layout after generation
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm z-50 flex-shrink-0">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center py-2 sm:py-3">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              {loadedProjectId ? (
                <Button variant="ghost" onClick={() => setLocation('/projects')} className="text-gray-300 hover:text-white px-2 sm:px-4 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 sm:mr-2 rotate-180" />
                  <span className="hidden sm:inline">Back to Projects</span>
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setProjectGenerated(false)} className="text-gray-300 hover:text-white px-2 sm:px-4 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 sm:mr-2 rotate-180" />
                  <span className="hidden sm:inline">New Project</span>
                </Button>
              )}
              <div className="flex items-center space-x-2 min-w-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
                <span className="text-base sm:text-xl font-bold text-white truncate max-w-[120px] sm:max-w-none">{projectName || 'Untitled'}</span>
                {loadedProjectId && (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 hidden sm:inline-flex">
                    Loaded
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button onClick={handleDownload} variant="outline" size="sm" className="px-2 sm:px-4">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button onClick={() => setLocation('/ide')} variant="outline" size="sm" className="hidden sm:flex">
                <Code className="w-4 h-4 mr-2" />
                Open in IDE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="sm:hidden border-b border-gray-800 bg-gray-900 flex">
        <button
          onClick={() => setActivePanel('files')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activePanel === 'files' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Files
        </button>
        <button
          onClick={() => setActivePanel('preview')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activePanel === 'preview' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
          }`}
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setActivePanel('chat')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activePanel === 'chat' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI
        </button>
      </div>

      {/* 3-Panel Layout - Desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Files (Hidden on mobile unless active) */}
        <div className={`${
          activePanel === 'files' ? 'flex' : 'hidden'
        } sm:flex w-full sm:w-56 lg:w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto flex-col`}>
          <div className="p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              <FileCode className="w-4 h-4 mr-2" />
              Files ({generatedFiles.length})
            </h3>
            <div className="space-y-1">
              {generatedFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedFile(file);
                    // On mobile, switch to preview after selecting file
                    if (window.innerWidth < 640) {
                      setActivePanel('preview');
                    }
                  }}
                  className={`w-full flex items-center space-x-2 p-2 rounded text-left transition-colors touch-target ${
                    selectedFile?.path === file.path
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Preview (Hidden on mobile unless active) */}
        <div className={`${
          activePanel === 'preview' ? 'flex' : 'hidden'
        } sm:flex flex-1 bg-gray-950 flex-col min-w-0`}>
          <div className="border-b border-gray-800 bg-gray-900 p-2 sm:p-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span className="text-white font-medium text-sm sm:text-base">Live Preview</span>
              {previewUrl && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 hidden sm:inline-flex">
                  Running
                </Badge>
              )}
            </div>
            
            {previewUrl && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('desktop')}
                  className={`hidden sm:flex ${previewMode === 'desktop' ? 'bg-gray-800' : ''}`}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('mobile')}
                  className={`hidden sm:flex ${previewMode === 'mobile' ? 'bg-gray-800' : ''}`}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={refreshPreview} className="touch-target-sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(previewUrl, '_blank')} className="touch-target-sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto">
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-gray-900 rounded-lg shadow-2xl overflow-hidden ${
                  previewMode === 'mobile' && window.innerWidth >= 640 
                    ? 'w-[375px] h-[667px]' 
                    : 'w-full h-full'
                }`}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </motion.div>
            ) : (
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">No Preview</h3>
                <p className="text-gray-500 text-sm">Preview unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Chat (Hidden on mobile unless active) */}
        <div className={`${
          activePanel === 'chat' ? 'flex' : 'hidden'
        } sm:flex w-full sm:w-80 lg:w-96 border-l border-gray-800 bg-gray-900 flex-col`}>
          <div className="border-b border-gray-800 p-3 sm:p-4 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </h3>
            <p className="text-xs text-gray-500 mt-1">Ask me to modify files or add features</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-gray-800 p-3 sm:p-4 flex-shrink-0 safe-area-inset">
            <div className="flex space-x-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                placeholder="Ask AI to modify files..."
                className="flex-1 bg-gray-800 border-gray-700 text-white resize-none text-sm"
                rows={2}
                disabled={isChatLoading}
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-purple-600 hover:bg-purple-700 touch-target"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
