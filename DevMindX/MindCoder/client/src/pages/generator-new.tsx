import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Code, Loader2, CheckCircle, Home, 
  FileCode, Download, Play, Maximize2, Smartphone, Monitor,
  RefreshCw, ExternalLink, FolderOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export default function GeneratorNew() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showFiles, setShowFiles] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use the AI Generator',
        variant: 'destructive'
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

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

    try {
      const steps = [
        'Analyzing your requirements...',
        'Designing architecture...',
        'Generating files...',
        'Installing dependencies...',
        'Starting preview server...',
        'Ready!'
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await fetch('/api/projects/generate', {
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
          withPreview: true // Request preview URL
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
      
      // Use CodeSandbox preview URL if available, otherwise fallback to local preview
      if (data.preview && data.preview.previewUrl) {
        setPreviewUrl(data.preview.previewUrl);
        toast({
          title: '🎉 Project Generated!',
          description: `Created ${filesArray.length} files with live CodeSandbox preview`,
        });
      } else {
        // Fallback to local preview
        setPreviewUrl(createPreviewUrl(filesArray));
        toast({
          title: '🎉 Project Generated!',
          description: `Created ${filesArray.length} files with preview`,
        });
      }

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
    // Create a simple HTML preview from generated files
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    const jsFile = files.find(f => f.path.endsWith('.js') || f.path.endsWith('.jsx'));
    const cssFile = files.find(f => f.path.endsWith('.css'));

    let html = htmlFile?.content || '<html><body><div id="root"></div></body></html>';
    
    if (jsFile) {
      html = html.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }
    
    if (cssFile) {
      html = html.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }

    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
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

  const handleOpenInIDE = () => {
    // Save project and navigate to IDE
    navigate('/ide');
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-300 hover:text-white">
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold text-white">AI Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={() => navigate('/projects')} variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-2" />
                My Projects
              </Button>
              <Button onClick={() => navigate('/ide')} variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                IDE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Input */}
        <div className="w-2/5 border-r border-gray-800 bg-gray-900 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Project</h2>
              <p className="text-gray-400">Describe what you want to build and watch it come to life</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-app"
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Framework (Optional)
                </label>
                <Input
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder="React, Vue, Next.js..."
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe Your Project
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="I want to build a modern todo app with drag & drop, categories, due dates, and a beautiful dark theme..."
                  className="min-h-[200px] bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none"
                  disabled={isGenerating}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    {prompt.length}/2000 characters
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Project
                  </>
                )}
              </Button>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold text-gray-300">Progress</h3>
                {[
                  'Analyzing your requirements...',
                  'Designing architecture...',
                  'Generating files...',
                  'Installing dependencies...',
                  'Starting preview server...',
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

            {/* Generated Files */}
            {generatedFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-300">
                    Generated Files ({generatedFiles.length})
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFiles(!showFiles)}
                    className="text-gray-400"
                  >
                    {showFiles ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showFiles && (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {generatedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
                      >
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300 truncate">{file.path}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleOpenInIDE}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Open in IDE
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-gray-950 flex flex-col">
          {/* Preview Header */}
          <div className="border-b border-gray-800 bg-gray-900 p-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Live Preview</span>
              {previewUrl && (
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Running
                </Badge>
              )}
            </div>
            
            {previewUrl && (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('desktop')}
                  className={previewMode === 'desktop' ? 'bg-gray-800' : ''}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('mobile')}
                  className={previewMode === 'mobile' ? 'bg-gray-800' : ''}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshPreview}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                  previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
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
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No Preview Yet
                </h3>
                <p className="text-gray-500">
                  Generate a project to see it running live
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
