import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Code, Loader2, Rocket, Eye, X, Monitor, Smartphone, RefreshCw, ExternalLink, FileCode, Download } from 'lucide-react';
import { Link } from 'wouter';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export default function GeneratorWhite() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async () => {
    if (!projectName.trim() || !description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both project name and description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          name: projectName,
          description,
          framework,
          withPreview: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const project = await response.json();
      
      // Convert files to array format
      const filesArray = Object.entries(project.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
        language: path.split('.').pop() || 'text'
      }));
      
      setGeneratedFiles(filesArray);
      setSelectedFile(filesArray[0] || null);

      toast({
        title: 'Success!',
        description: `Project generated with ${filesArray.length} files`,
      });
    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Create local preview from generated files
  const createLocalPreview = (files: GeneratedFile[]): string => {
    const htmlFile = files.find(f => f.path.endsWith('.html') || f.path.endsWith('index.html'));
    const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.jsx'));
    const cssFiles = files.filter(f => f.path.endsWith('.css'));

    let html = htmlFile?.content || `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName || 'Preview'}</title>
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
</body>
</html>`;
    
    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(f => f.content).join('\n');
      html = html.includes('</head>') 
        ? html.replace('</head>', `<style>${cssContent}</style></head>`)
        : `<style>${cssContent}</style>${html}`;
    }
    
    if (jsFiles.length > 0) {
      const jsContent = jsFiles.map(f => f.content).join('\n');
      html = html.includes('</body>')
        ? html.replace('</body>', `<script>${jsContent}</script></body>`)
        : `${html}<script>${jsContent}</script>`;
    }

    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  const handleLoadPreview = async () => {
    if (generatedFiles.length === 0) {
      toast({
        title: 'No Files',
        description: 'Generate a project first to preview it',
        variant: 'destructive'
      });
      return;
    }

    setIsLoadingPreview(true);
    setShowPreview(true);

    try {
      const filesObject: Record<string, string> = {};
      generatedFiles.forEach(file => {
        filesObject[file.path] = file.content;
      });

      const response = await fetch('/api/preview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          files: filesObject,
          title: projectName || 'Generated Project',
          description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.previewUrl || createLocalPreview(generatedFiles));
      } else {
        setPreviewUrl(createLocalPreview(generatedFiles));
      }
    } catch {
      setPreviewUrl(createLocalPreview(generatedFiles));
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(generatedFiles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${projectName || 'project'}.json`);
    linkElement.click();
  };

  const handleOpenInIDE = () => {
    navigate('/ide');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ide">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Project Generator</h1>
              <p className="text-sm text-gray-600">Describe your project and let AI build it</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Generate New Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-gray-900">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <Label htmlFor="framework" className="text-gray-900">Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                  <SelectItem value="vanilla">Vanilla JS</SelectItem>
                  <SelectItem value="html">HTML/CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you want to build... Be as detailed as possible for better results."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="bg-white border-gray-300"
              />
              <p className="text-sm text-gray-500">
                Example: "A todo app with drag and drop, dark mode, and local storage"
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Project...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Generate Project
                </>
              )}
            </Button>

            {/* Generated Files Section */}
            {generatedFiles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Files ({generatedFiles.length})</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleLoadPreview}
                      disabled={isLoadingPreview}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      {isLoadingPreview ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handleOpenInIDE} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Code className="h-4 w-4 mr-1" />
                      Open in IDE
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {generatedFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-lg text-left transition-all border ${
                        selectedFile?.path === file.path
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-900 truncate">{file.path}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedFile && (
                  <div className="bg-gray-900 rounded-lg p-4 max-h-[300px] overflow-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">{selectedFile.path}</span>
                    </div>
                    <pre className="text-xs text-gray-300">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examples */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setProjectName('Snake Game');
                    setDescription('A classic snake game with score tracking and game over screen');
                    setFramework('html');
                  }}>
              <h4 className="font-semibold text-gray-900 mb-2">Snake Game</h4>
              <p className="text-sm text-gray-600">Classic game with HTML5 Canvas</p>
            </Card>
            <Card className="border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setProjectName('Todo App');
                    setDescription('A todo list app with add, delete, and mark as complete features');
                    setFramework('react');
                  }}>
              <h4 className="font-semibold text-gray-900 mb-2">Todo App</h4>
              <p className="text-sm text-gray-600">Task management with React</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Live Preview</span>
              </div>
              
              {/* Device Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={refreshPreview}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {previewUrl && !previewUrl.startsWith('blob:') && (
                <Button size="sm" variant="ghost" onClick={() => window.open(previewUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={closePreview}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-100">
            {isLoadingPreview ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading preview...</p>
              </div>
            ) : previewUrl ? (
              <div className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                previewMode === 'mobile' 
                  ? 'w-[375px] h-[667px]' 
                  : 'w-full max-w-6xl h-[80vh]'
              }`}>
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Project Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            ) : (
              <div className="text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Preview Available</h3>
                <p className="text-gray-500">Unable to generate preview for this project</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
