import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Code, Wand2, Rocket, Brain, ArrowRight, Play, Loader2, 
  CheckCircle, Users, Share2, Copy, X, Home, FileCode, Folder, Download
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCollab } from '@/hooks/use-collab';
import { UserPresence } from '@/components/UserPresence';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export default function GeneratorSimple() {
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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
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
    </div>
  );
}
