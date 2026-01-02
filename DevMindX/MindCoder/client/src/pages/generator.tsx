import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Code, Wand2, Rocket, Brain, ArrowRight, Play, Loader2, 
  CheckCircle, Users, Share2, Copy, X, Home, FileCode, Folder, Download,
  Eye, Monitor, Smartphone, RefreshCw, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCollab } from '@/hooks/use-collab';
import { UserPresence } from '@/components/UserPresence';

// 3D Animated Background Component
function AnimatedSphere() {
  const meshRef = useRef<any>();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
    </>
  );
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export default function Generator() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, participants, joinSession, sendMessage, endSession } = useCollab();
  
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Load project from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get('projectId');
    
    if (projectId && isAuthenticated && !loadedProjectId) {
      loadExistingProject(projectId);
    }
  }, [isAuthenticated, loadedProjectId]);

  // Load existing project by ID
  const loadExistingProject = async (projectId: string) => {
    try {
      setIsGenerating(true);
      setLoadedProjectId(projectId);

      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load project');

      const project = await response.json();
      
      // Convert files to array format
      const filesArray = Object.entries(project.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
        language: path.split('.').pop() || 'text'
      }));
      
      setProjectName(project.name);
      setFramework(project.framework || '');
      setPrompt(project.description || '');
      setGeneratedFiles(filesArray);
      setSelectedFile(filesArray[0] || null);

      toast({
        title: '✅ Project Loaded!',
        description: `${project.name} loaded with ${filesArray.length} files`,
      });

      // Auto-load preview
      setTimeout(() => {
        handleLoadPreviewForFiles(filesArray, project.name, project.description);
      }, 500);

    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load project. Please try again.',
        variant: 'destructive',
      });
      setLoadedProjectId(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to load preview for specific files
  const handleLoadPreviewForFiles = async (files: GeneratedFile[], name: string, description: string) => {
    if (files.length === 0) return;

    setIsLoadingPreview(true);
    setShowPreview(true);

    // Local preview creation helper
    const createPreviewHtml = (previewFiles: GeneratedFile[]): string => {
      const htmlFile = previewFiles.find(f => f.path.endsWith('.html') || f.path.endsWith('index.html'));
      const jsFiles = previewFiles.filter(f => f.path.endsWith('.js') || f.path.endsWith('.jsx') || f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
      const cssFiles = previewFiles.filter(f => f.path.endsWith('.css'));

      let html = htmlFile?.content || `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Preview'}</title>
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

    try {
      const filesObject: Record<string, string> = {};
      files.forEach(file => {
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
          title: name || 'Generated Project',
          description: description || ''
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        } else {
          setPreviewUrl(createPreviewHtml(files));
        }
      } else {
        setPreviewUrl(createPreviewHtml(files));
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewUrl(createPreviewHtml(files));
    } finally {
      setIsLoadingPreview(false);
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

    try {
      const steps = [
        'Analyzing requirements...',
        'Designing architecture...',
        'Generating files...',
        'Creating components...',
        'Setting up configuration...',
        'Finalizing project...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
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
          model: 'gemini'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate project');

      const data = await response.json();
      
      // Convert files object to array
      const filesArray = Object.entries(data.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
        language: path.split('.').pop() || 'text'
      }));
      
      setGeneratedFiles(filesArray);
      setSelectedFile(filesArray[0] || null);

      toast({
        title: '🎉 Project Generated!',
        description: `Created ${filesArray.length} files successfully`,
      });

      // Notify collaborators if in session
      if (sessionId) {
        sendMessage(`Project generated: ${data.name} with ${filesArray.length} files`);
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

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/collab/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      setInviteCode(data.sessionId);
      joinSession(data.sessionId);
      
      toast({
        title: 'Session Created',
        description: 'Share the invite code with collaborators',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create collaboration session',
        variant: 'destructive',
      });
    }
  };

  const handleJoinSession = () => {
    if (!joinCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter a session code',
        variant: 'destructive'
      });
      return;
    }
    joinSession(joinCode.trim());
    setShowCollabModal(false);
    toast({
      title: 'Joined Session',
      description: 'You can now collaborate in real-time',
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: 'Copied!',
      description: 'Invite code copied to clipboard',
    });
  };

  const handleDownloadProject = () => {
    // Create a simple download of all files as JSON
    const dataStr = JSON.stringify(generatedFiles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${projectName || 'project'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleOpenInIDE = () => {
    navigate('/ide');
  };

  // Create local preview from generated files
  const createLocalPreview = (files: GeneratedFile[]): string => {
    const htmlFile = files.find(f => f.path.endsWith('.html') || f.path.endsWith('index.html'));
    const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.jsx') || f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
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
    
    // Inject CSS
    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(f => f.content).join('\n');
      if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${cssContent}</style></head>`);
      } else {
        html = `<style>${cssContent}</style>${html}`;
      }
    }
    
    // Inject JS
    if (jsFiles.length > 0) {
      const jsContent = jsFiles.map(f => f.content).join('\n');
      if (html.includes('</body>')) {
        html = html.replace('</body>', `<script>${jsContent}</script></body>`);
      } else {
        html = `${html}<script>${jsContent}</script>`;
      }
    }

    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  // Load preview from generated project
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
      // Try to create CodeSandbox preview first
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
          description: prompt
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
          toast({
            title: '🎉 Preview Ready!',
            description: 'Live preview loaded successfully',
          });
        } else {
          // Fallback to local preview
          const localUrl = createLocalPreview(generatedFiles);
          setPreviewUrl(localUrl);
          toast({
            title: 'Preview Ready',
            description: 'Using local preview mode',
          });
        }
      } else {
        // Fallback to local preview
        const localUrl = createLocalPreview(generatedFiles);
        setPreviewUrl(localUrl);
        toast({
          title: 'Preview Ready',
          description: 'Using local preview mode',
        });
      }
    } catch (error) {
      console.error('Preview error:', error);
      // Fallback to local preview
      const localUrl = createLocalPreview(generatedFiles);
      setPreviewUrl(localUrl);
      toast({
        title: 'Preview Ready',
        description: 'Using local preview mode',
      });
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
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <ParticleField />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-blue-900/40 z-10" />

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/')} className="text-white">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Button>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <span className="text-xl font-bold text-white">AI Generator</span>
                  <Badge className="bg-purple-600">Beta</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {sessionId && participants.length > 0 && (
                  <UserPresence 
                    users={participants.map(p => ({
                      id: p.userId,
                      name: p.username || 'User',
                      color: p.color || '#8b5cf6'
                    }))} 
                  />
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowCollabModal(true)}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {sessionId ? 'Collaborating' : 'Collaborate'}
                </Button>
                
                <Button onClick={() => navigate('/ide')} className="bg-blue-600 hover:bg-blue-700">
                  Go to IDE
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold text-white mb-4">
              Create with
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {" "}AI Magic
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Describe your vision and watch it come to life in real-time
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Project Name
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="my-awesome-app"
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Framework (Optional)
                    </label>
                    <Input
                      value={framework}
                      onChange={(e) => setFramework(e.target.value)}
                      placeholder="React, Vue, Next.js..."
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Describe Your Project
                    </label>
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="I want to build a modern e-commerce platform with product catalog, shopping cart, user authentication, payment integration, and an admin dashboard..."
                      className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder-gray-500 resize-none"
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl h-full">
                <CardContent className="p-6">
                  {isGenerating ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white mb-4">Generating Your Project</h3>
                      {[
                        'Analyzing requirements...',
                        'Designing architecture...',
                        'Generating files...',
                        'Creating components...',
                        'Setting up configuration...',
                        'Finalizing project...'
                      ].map((step, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            index <= generationStep
                              ? 'bg-green-500/20 border border-green-500/30'
                              : 'bg-white/5 border border-white/10'
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
                            <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                          )}
                          <span className={`text-sm ${
                            index <= generationStep ? 'text-white' : 'text-gray-400'
                          }`}>
                            {step}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : generatedFiles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Generated Files</h3>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleLoadPreview}
                            disabled={isLoadingPreview}
                            className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                          >
                            {isLoadingPreview ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4 mr-1" />
                            )}
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleDownloadProject}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" onClick={handleOpenInIDE} className="bg-blue-600">
                            <Code className="w-4 h-4 mr-1" />
                            Open in IDE
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                        {generatedFiles.map((file, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setSelectedFile(file)}
                            className={`p-3 rounded-lg text-left transition-all ${
                              selectedFile?.path === file.path
                                ? 'bg-purple-600/30 border border-purple-500'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="flex items-center space-x-2">
                              <FileCode className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-white truncate">{file.path}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {selectedFile && (
                        <div className="mt-4">
                          <div className="bg-gray-900/50 rounded-lg p-4 max-h-[300px] overflow-auto">
                            <pre className="text-xs text-gray-300">
                              <code>{selectedFile.content}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
                        <Rocket className="w-10 h-10 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Ready to Create</h3>
                      <p className="text-gray-400">
                        Describe your project and let AI do the magic
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Collaboration Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCollabModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Collaborate</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCollabModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {sessionId ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Share this code with collaborators
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        value={inviteCode}
                        readOnly
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button onClick={copyInviteCode} variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Session Active</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      {participants.length} participant(s) connected
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      endSession();
                      setShowCollabModal(false);
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    End Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={handleCreateSession} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900 text-gray-400">or</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Join existing session
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Enter session code"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button onClick={handleJoinSession}>Join</Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Live Preview</span>
                  {previewUrl && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                      Running
                    </Badge>
                  )}
                </div>
                
                {/* Device Toggle */}
                <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1 ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1 ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" onClick={refreshPreview} className="text-gray-300 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {previewUrl && !previewUrl.startsWith('blob:') && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="text-gray-300 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={closePreview} className="text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              {isLoadingPreview ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Loading preview...</p>
                </div>
              ) : previewUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
                    previewMode === 'mobile' 
                      ? 'w-[375px] h-[667px]' 
                      : 'w-full max-w-6xl h-[80vh]'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Project Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </motion.div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Preview Available</h3>
                  <p className="text-gray-500">Unable to generate preview for this project</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
