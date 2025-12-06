import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Code, 
  Wand2, 
  Rocket, 
  Brain, 
  ArrowRight, 
  Play,
  Loader2,
  CheckCircle,
  Globe,
  Database,
  Smartphone,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Camera,
  Music,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  prompt: string;
  gradient: string;
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart, payments, and inventory',
    icon: <ShoppingCart className="w-6 h-6" />,
    tags: ['React', 'Node.js', 'Stripe', 'MongoDB'],
    prompt: 'Create a modern e-commerce website with product catalog, shopping cart, user authentication, payment integration with Stripe, order management, and admin dashboard. Include responsive design and mobile-friendly interface.',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization platform with charts and insights',
    icon: <BarChart3 className="w-6 h-6" />,
    tags: ['React', 'D3.js', 'Python', 'PostgreSQL'],
    prompt: 'Build a comprehensive analytics dashboard with interactive charts, real-time data visualization, user management, customizable widgets, and data export features. Include dark/light theme support.',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'social',
    name: 'Social Media App',
    description: 'Modern social platform with posts, messaging, and real-time features',
    icon: <MessageSquare className="w-6 h-6" />,
    tags: ['React', 'Socket.io', 'Node.js', 'Redis'],
    prompt: 'Create a social media application with user profiles, post creation and sharing, real-time messaging, notifications, friend system, and news feed. Include image/video upload capabilities.',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Content management system with markdown support',
    icon: <FileText className="w-6 h-6" />,
    tags: ['Next.js', 'Markdown', 'CMS', 'SEO'],
    prompt: 'Build a modern blog platform with markdown editor, SEO optimization, comment system, categories and tags, user authentication, and admin panel for content management.',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Professional portfolio with animations and contact form',
    icon: <Globe className="w-6 h-6" />,
    tags: ['React', 'Framer Motion', 'Tailwind', 'Responsive'],
    prompt: 'Create a stunning portfolio website with smooth animations, project showcase, skills section, about page, contact form, and responsive design. Include dark mode toggle.',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'task-manager',
    name: 'Task Management',
    description: 'Project management tool with kanban boards',
    icon: <Calendar className="w-6 h-6" />,
    tags: ['React', 'Drag & Drop', 'Real-time', 'Teams'],
    prompt: 'Build a task management application with kanban boards, drag-and-drop functionality, team collaboration, project timelines, and progress tracking. Include notifications and deadline management.',
    gradient: 'from-teal-500 to-green-600'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Cross-platform mobile application',
    icon: <Smartphone className="w-6 h-6" />,
    tags: ['React Native', 'Expo', 'Mobile', 'Cross-platform'],
    prompt: 'Create a cross-platform mobile application with native features, push notifications, offline support, and smooth animations. Include user authentication and data synchronization.',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'game',
    name: 'Web Game',
    description: 'Interactive browser-based game',
    icon: <Gamepad2 className="w-6 h-6" />,
    tags: ['JavaScript', 'Canvas', 'WebGL', 'Game Engine'],
    prompt: 'Build an interactive web-based game with smooth animations, score tracking, multiple levels, sound effects, and responsive controls. Include leaderboard and save game functionality.',
    gradient: 'from-violet-500 to-purple-600'
  }
];

export default function AIGenerator() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('');
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
    setProjectName(template.name.toLowerCase().replace(/\s+/g, '-'));
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

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate projects',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedFiles([]);

    try {
      // Simulate generation steps
      const steps = [
        'Analyzing your requirements...',
        'Selecting optimal tech stack...',
        'Generating project structure...',
        'Creating components and pages...',
        'Setting up routing and state management...',
        'Adding styling and animations...',
        'Configuring build tools...',
        'Finalizing project setup...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate file generation
        if (i >= 2) {
          const newFiles = [
            'package.json',
            'src/App.tsx',
            'src/components/Header.tsx',
            'src/pages/Home.tsx',
            'src/styles/globals.css',
            'README.md'
          ];
          setGeneratedFiles(prev => [...prev, ...newFiles.slice(0, i - 1)]);
        }
      }

      // Call the actual API
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
          model: 'gemini' // Use Gemini as specified
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const data = await response.json();

      toast({
        title: '🎉 Project Generated Successfully!',
        description: `${data.name} is ready with ${Object.keys(data.files || {}).length} files. Redirecting to IDE...`,
      });

      // Redirect to IDE with the new project
      setTimeout(() => {
        navigate('/ide');
      }, 2000);

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

  return (
    <section id="ai-generator" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-medium">AI-Powered Development</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Build Anything with
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {" "}Just Words
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Describe your idea in natural language and watch as our AI creates a complete, 
            production-ready application in seconds. No coding required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Wand2 className="w-6 h-6 mr-3 text-purple-400" />
                  Describe Your Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Templates */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Start Templates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {projectTemplates.slice(0, 4).map((template) => (
                      <motion.button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedTemplate?.id === template.id
                            ? 'bg-gradient-to-r ' + template.gradient + ' border-transparent text-white'
                            : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {template.icon}
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs opacity-80">{template.description}</p>
                      </motion.button>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="mt-2 text-purple-400 hover:text-purple-300"
                  >
                    {showAdvanced ? 'Show Less' : 'More Templates'}
                    <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                  </Button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3 mt-3"
                      >
                        {projectTemplates.slice(4).map((template) => (
                          <motion.button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              selectedTemplate?.id === template.id
                                ? 'bg-gradient-to-r ' + template.gradient + ' border-transparent text-white'
                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 text-gray-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {template.icon}
                              <span className="font-medium text-sm">{template.name}</span>
                            </div>
                            <p className="text-xs opacity-80">{template.description}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Or describe your custom project
                  </label>
                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="I want to build a modern todo app with drag & drop functionality, user authentication, real-time sync, and a beautiful dark theme. Include features like categories, due dates, and collaboration..."
                    className="min-h-[120px] bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {prompt.length}/2000 characters
                    </span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      <Brain className="w-3 h-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Project Name (Optional)
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="my-awesome-app"
                      className="bg-gray-700/50 border-gray-600 text-white"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Framework (Optional)
                    </label>
                    <Input
                      value={framework}
                      onChange={(e) => setFramework(e.target.value)}
                      placeholder="React, Vue, Next.js..."
                      className="bg-gray-700/50 border-gray-600 text-white"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Project...
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

          {/* Right Side - Preview/Generation Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Rocket className="w-6 h-6 mr-3 text-blue-400" />
                  {isGenerating ? 'Generating...' : 'Preview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-6">
                    {/* Generation Steps */}
                    <div className="space-y-3">
                      {[
                        'Analyzing your requirements...',
                        'Selecting optimal tech stack...',
                        'Generating project structure...',
                        'Creating components and pages...',
                        'Setting up routing and state management...',
                        'Adding styling and animations...',
                        'Configuring build tools...',
                        'Finalizing project setup...'
                      ].map((step, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            index <= generationStep
                              ? 'bg-green-900/30 border border-green-600/30'
                              : 'bg-gray-700/30 border border-gray-600/30'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {index < generationStep ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : index === generationStep ? (
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
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

                    {/* Generated Files */}
                    {generatedFiles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Generated Files</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {generatedFiles.map((file, index) => (
                            <motion.div
                              key={file}
                              className="flex items-center space-x-2 text-sm text-gray-300"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Code className="w-4 h-4 text-blue-400" />
                              <span>{file}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedTemplate ? (
                  <div className="space-y-4">
                    <div className={`p-6 rounded-lg bg-gradient-to-r ${selectedTemplate.gradient} text-white`}>
                      <div className="flex items-center space-x-3 mb-3">
                        {selectedTemplate.icon}
                        <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                      </div>
                      <p className="opacity-90 mb-4">{selectedTemplate.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center py-8">
                      <Play className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-300">
                        Click "Generate Project" to create your {selectedTemplate.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Ready to Create</h3>
                    <p className="text-gray-400 mb-6">
                      Select a template or describe your project to get started
                    </p>
                    
                    {/* Feature highlights */}
                    <div className="space-y-3 text-left">
                      {[
                        'Complete project structure',
                        'Production-ready code',
                        'Modern UI components',
                        'Responsive design',
                        'Best practices included'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              From Idea to App in Minutes
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our AI understands your requirements and generates complete applications with modern architecture, 
              clean code, and beautiful interfaces. No more starting from scratch.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: <Brain className="w-8 h-8 text-purple-400" />,
                  title: 'AI Understanding',
                  description: 'Advanced AI that comprehends complex requirements'
                },
                {
                  icon: <Code className="w-8 h-8 text-blue-400" />,
                  title: 'Production Ready',
                  description: 'Clean, maintainable code following best practices'
                },
                {
                  icon: <Zap className="w-8 h-8 text-yellow-400" />,
                  title: 'Lightning Fast',
                  description: 'Generate complete projects in under 60 seconds'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}