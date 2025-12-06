import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Code, Loader2, Home, ArrowRight,
  Cpu, Layers, Terminal, CheckCircle, Play, Download
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function GeneratorAIPro() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [projectGenerated, setProjectGenerated] = useState(false);

  // Check for pre-selected prompt from example templates
  React.useEffect(() => {
    const selectedPrompt = sessionStorage.getItem('selectedPrompt');
    if (selectedPrompt) {
      setPrompt(selectedPrompt);
      sessionStorage.removeItem('selectedPrompt'); // Clear after using
      
      toast({
        title: 'Template Loaded!',
        description: 'Example prompt has been loaded. You can edit it or generate directly.',
      });
    }
  }, [toast]);

  const frameworks = [
    { id: 'react', name: 'React', icon: '⚛️', color: 'from-cyan-500 to-blue-500' },
    { id: 'vue', name: 'Vue.js', icon: '💚', color: 'from-green-500 to-emerald-500' },
    { id: 'angular', name: 'Angular', icon: '🅰️', color: 'from-red-500 to-pink-500' },
    { id: 'svelte', name: 'Svelte', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { id: 'next', name: 'Next.js', icon: '▲', color: 'from-gray-700 to-gray-900' },
    { id: 'vanilla', name: 'Vanilla JS', icon: '📦', color: 'from-yellow-500 to-orange-500' }
  ];

  const [selectedFramework, setSelectedFramework] = useState('react');

  const generationSteps = [
    { icon: <Cpu className="w-6 h-6" />, text: 'Analyzing requirements' },
    { icon: <Layers className="w-6 h-6" />, text: 'Generating architecture' },
    { icon: <Code className="w-6 h-6" />, text: 'Writing code' },
    { icon: <Terminal className="w-6 h-6" />, text: 'Setting up environment' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Project ready!' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe what you want to build',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate generation steps
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsGenerating(false);
    setProjectGenerated(true);
    
    toast({
      title: 'Project Generated!',
      description: 'Your project is ready to use',
    });
  };

  return (
    <div className="min-h-screen ai-gradient-bg">
      {/* Header */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Code className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold gradient-text">DevMindX</span>
            </div>
            <Button 
              onClick={() => setLocation('/')} 
              variant="ghost"
              className="text-white hover:text-purple-400"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!projectGenerated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Title Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-6 py-3 glass-card rounded-full mb-6"
              >
                <Sparkles className="w-5 h-5 text-purple-400 mr-2 animate-pulse" />
                <span className="text-purple-300 font-medium">AI Project Generator</span>
              </motion.div>
              
              <h1 className="text-5xl font-bold text-white mb-4">
                Describe Your <span className="gradient-text">Vision</span>
              </h1>
              <p className="text-xl text-gray-300">
                Our AI will transform your idea into a complete, production-ready application
              </p>
            </div>

            {/* Generation Form */}
            <div className="glass-card rounded-3xl p-8 mb-8">
              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-white font-semibold mb-3 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-purple-400" />
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-app"
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                </div>

                {/* Framework Selection */}
                <div>
                  <label className="block text-white font-semibold mb-3 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-purple-400" />
                    Choose Framework
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {frameworks.map((fw) => (
                      <motion.button
                        key={fw.id}
                        onClick={() => setSelectedFramework(fw.id)}
                        className={`glass-card p-4 rounded-xl text-center transition-all ${
                          selectedFramework === fw.id 
                            ? 'border-2 border-purple-500 bg-purple-500/20' 
                            : 'border border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{fw.icon}</div>
                        <div className="text-white font-medium">{fw.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-white font-semibold mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    Describe Your Project
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a modern e-commerce website with product listings, shopping cart, and checkout. Include user authentication and a clean, responsive design."
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[150px]"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Be specific about features, design preferences, and functionality
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full btn-ai-primary py-6 text-lg font-semibold"
                  size="lg"
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
            </div>

            {/* Generation Progress */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card rounded-3xl p-8"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    AI is Building Your Project
                  </h3>
                  
                  <div className="space-y-4">
                    {generationSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: index <= generationStep ? 1 : 0.3,
                          x: 0 
                        }}
                        className={`flex items-center space-x-4 p-4 rounded-xl ${
                          index === generationStep 
                            ? 'bg-purple-500/20 border border-purple-500/50' 
                            : index < generationStep
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-black/20 border border-gray-700'
                        }`}
                      >
                        <div className={`${
                          index === generationStep ? 'text-purple-400 animate-pulse' :
                          index < generationStep ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {step.icon}
                        </div>
                        <span className="text-white font-medium flex-1">
                          {step.text}
                        </span>
                        {index < generationStep && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {index === generationStep && (
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="glass-card rounded-3xl p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-4">
                Project Generated Successfully!
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Your <span className="text-purple-400 font-semibold">{projectName || 'project'}</span> is ready to use
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation('/ide')}
                  className="btn-ai-primary px-8 py-6 text-lg"
                  size="lg"
                >
                  <Code className="w-5 h-5 mr-2" />
                  Open in IDE
                </Button>
                <Button
                  onClick={() => setLocation('/projects')}
                  variant="outline"
                  className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 px-8 py-6 text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  View Preview
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 px-8 py-6 text-lg"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-purple-500/20">
                <Button
                  onClick={() => {
                    setProjectGenerated(false);
                    setPrompt('');
                    setProjectName('');
                  }}
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Generate Another Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Grid */}
        {!isGenerating && !projectGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast', desc: 'Generate in seconds' },
              { icon: <Code className="w-6 h-6" />, title: 'Production Ready', desc: 'Clean, optimized code' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'AI Powered', desc: 'Advanced intelligence' }
            ].map((feature, index) => (
              <div key={index} className="glass-card p-6 rounded-xl text-center hover-lift">
                <div className="feature-icon-container w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-purple-400">{feature.icon}</div>
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
