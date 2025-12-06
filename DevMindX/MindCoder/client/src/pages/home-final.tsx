import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { 
  Sparkles, Code, FolderOpen, Zap, Brain, Users, 
  ArrowRight, CheckCircle, Play, Rocket, Terminal, 
  FileCode, Database, Network, Layers, MessageSquare
} from 'lucide-react';
import {
  GradientOrbs,
  GlowCard,
  AnimatedTextGradient,
  FloatingIcon,
  StaggerChildren,
  MagneticButton,
  RevealOnScroll,
  PulseRing,
  FloatingParticles
} from '@/components/animated-elements';
import { AdvancedInteractiveDemo } from '@/components/advanced-demo';
import { ExpandingFeatureCards } from '@/components/expanding-feature-cards';
import { TextHoverEffect } from '@/components/ui/text-hover-effect';

// Typing Animation Hook
const useTypingEffect = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Progress Bar Component
const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-purple-400">{progress}%</span>
    </div>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
      />
    </div>
  </div>
);

// Interactive Demo Component
const InteractiveDemo = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const steps = [
    {
      title: 'AI Project Generator',
      description: 'Describe your idea in plain English',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      demo: (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 rounded-lg p-4 border border-purple-500/30"
          >
            <p className="text-gray-400 text-sm mb-2">User Input:</p>
            <p className="text-white">"Create a todo app with React"</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/50 rounded-lg p-4 border border-green-500/30"
          >
            <p className="text-gray-400 text-sm mb-2">AI Generated:</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-400 text-sm">Complete React app with 15 files</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Architecture Generator',
      description: 'Auto-generate system diagrams',
      icon: Network,
      color: 'from-blue-500 to-cyan-500',
      demo: (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">System Architecture</p>
              <p className="text-gray-400 text-xs">Generated in 15s</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">ER Diagram</p>
              <p className="text-gray-400 text-xs">Database schema ready</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FileCode className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">REST API Blueprint</p>
              <p className="text-gray-400 text-xs">Complete documentation</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Learning Mode',
      description: 'Understand every line of code',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      demo: (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 rounded-lg p-3 border border-orange-500/30"
          >
            <div className="flex items-start gap-2">
              <span className="text-orange-400 font-mono text-xs">Line 1:</span>
              <div className="flex-1">
                <code className="text-cyan-400 text-xs">const app = express();</code>
                <p className="text-gray-400 text-xs mt-1">Creates an Express application instance...</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/50 rounded-lg p-3 border border-green-500/30"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-white text-xs">Quiz: 8/10 correct</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/50 rounded-lg p-3 border border-purple-500/30"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <p className="text-white text-xs">15 Viva questions ready</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Code Editor',
      description: 'Professional IDE with AI assistance',
      icon: Code,
      color: 'from-indigo-500 to-purple-500',
      demo: (
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/50 rounded-lg p-3 border border-indigo-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-xs ml-2">index.js</span>
            </div>
            <code className="text-cyan-400 text-xs block">function hello() {'{'}
              <br />&nbsp;&nbsp;return "Hello World";
              <br />{'}'}</code>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <p className="text-gray-300 text-xs">AI: "Add error handling?"</p>
          </motion.div>
        </div>
      )
    },
    {
      title: 'My Projects',
      description: 'Manage and deploy instantly',
      icon: FolderOpen,
      color: 'from-green-500 to-emerald-500',
      demo: (
        <div className="space-y-2">
          {['Todo App', 'E-commerce Site', 'Blog Platform'].map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-white/50 rounded-lg p-3 border border-green-500/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-green-400" />
                <p className="text-white text-xs">{project}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-400 text-xs">Live</span>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-white/30 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${currentStep.color} rounded-lg flex items-center justify-center`}>
              <StepIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{currentStep.title}</h3>
              <p className="text-gray-400 text-sm">{currentStep.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-purple-500/50"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-8 min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            {currentStep.demo}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Indicators */}
      <div className="border-t border-gray-800 bg-white/30 backdrop-blur-xl p-4">
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveStep(index);
                setIsPlaying(false);
              }}
              className={`h-2 rounded-full transition-all ${
                index === activeStep
                  ? 'w-8 bg-gradient-to-r ' + step.color
                  : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs mt-3">
          {activeStep + 1} of {steps.length} • Auto-playing every 4 seconds
        </p>
      </div>
    </div>
  );
};

export default function HomeFinal() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: 'Research Engine',
      description: 'AI-powered research that analyzes your idea and generates the perfect project prompt',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      action: () => navigate('/research'),
      buttonText: 'Start Research',
      features: ['Deep idea analysis', 'Tech stack recommendations', 'Best practices', 'Ready-to-use prompts'],
      delay: 0.1
    },
    {
      icon: <Layers className="w-10 h-10" />,
      title: 'Architecture Generator',
      description: 'Auto-generate system blueprints, class diagrams, ER diagrams, and API documentation',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      action: () => navigate('/architecture'),
      buttonText: 'Generate Architecture',
      features: ['System architecture', 'Class & ER diagrams', 'Sequence diagrams', 'REST API blueprints'],
      delay: 0.2
    },
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: 'Learning Mode',
      description: 'Understand every line of code with AI-powered explanations, flow diagrams, and quizzes',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      action: () => navigate('/learning-mode'),
      buttonText: 'Start Learning',
      features: ['Line-by-line explanations', 'Flow diagrams', 'Quiz & Viva questions', 'Download materials'],
      delay: 0.3
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: 'Project Generator',
      description: 'Describe your idea and watch AI create a complete, running application in seconds',
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      action: () => navigate('/generator'),
      buttonText: 'Generate Project',
      features: ['Natural language input', 'Live preview', 'Production-ready code', 'Multiple frameworks'],
      delay: 0.4
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: 'Code Editor',
      description: 'Professional IDE with AI assistance, terminal, and real-time collaboration',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      action: () => navigate('/ide'),
      buttonText: 'Open Editor',
      features: ['Monaco editor', 'AI chat help', 'Integrated terminal', 'File management'],
      delay: 0.5
    },
    {
      icon: <FolderOpen className="w-10 h-10" />,
      title: 'My Projects',
      description: 'Manage all your projects in one place with quick access and preview',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      action: () => navigate('/projects'),
      buttonText: 'View Projects',
      features: ['Quick access', 'Live preview', 'Easy sharing', 'Version history'],
      delay: 0.6
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Describe Your Idea',
      description: 'Tell AI what you want to build in plain English',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '2',
      title: 'Watch It Generate',
      description: 'AI creates your complete project with live preview',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '3',
      title: 'Edit & Deploy',
      description: 'Customize in the IDE and deploy instantly',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20" />
      

      
      {/* Animated Orbs */}
      <GradientOrbs />
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Animated Grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="border-b border-gray-800 bg-white/30 backdrop-blur-xl sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <FloatingIcon>
                  <Code className="w-8 h-8 text-purple-400" />
                </FloatingIcon>
                <span className="text-2xl font-bold text-white">DevMindX</span>
              </motion.div>
              
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-300 hidden sm:block"
                    >
                      Welcome, <span className="text-purple-400">{user?.username || 'User'}</span>
                    </motion.span>
                    <MagneticButton>
                      <Button onClick={() => navigate('/account')} variant="outline" className="border-purple-500/50">
                        Account
                      </Button>
                    </MagneticButton>
                    <MagneticButton>
                      <Button 
                        onClick={() => {
                          localStorage.removeItem('devmindx_token');
                          window.location.href = '/';
                        }} 
                        variant="outline" 
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Logout
                      </Button>
                    </MagneticButton>
                  </>
                ) : (
                  <>
                    <MagneticButton>
                      <Button onClick={() => navigate('/login')} variant="ghost" className="text-white">
                        Login
                      </Button>
                    </MagneticButton>
                    <MagneticButton>
                      <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Sign Up
                      </Button>
                    </MagneticButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            {/* Dark background container for text hover effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12 md:p-16 mb-12 shadow-2xl shadow-purple-500/10"
            >
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm"
                >
                  <FloatingIcon delay={0.5}>
                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                  </FloatingIcon>
                  <span className="text-purple-300 font-medium">AI-Powered Development Platform</span>
                </motion.div>
                
                {/* Main Heading with Text Hover Effect */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="h-[200px] md:h-[250px] flex items-center justify-center">
                    <TextHoverEffect text="DevMindX" />
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-3xl md:text-4xl font-bold text-white mt-4"
                  >
                    Build Anything <AnimatedTextGradient>with AI</AnimatedTextGradient>
                  </motion.p>
                </motion.div>
              
                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl md:text-3xl text-gray-300 mb-0 max-w-4xl mx-auto"
                >
                  From idea to running application in{' '}
                  <span className="text-purple-400 font-semibold">seconds</span>.
                  <br />
                  No coding required.
                </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                    <MagneticButton>
                      <Button 
                        size="lg"
                        onClick={() => navigate('/signup')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-10 py-7 text-xl shadow-2xl shadow-purple-500/50 relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center">
                          Get Started Free
                          <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </Button>
                    </MagneticButton>
                    
                    <MagneticButton>
                      <Button 
                        size="lg"
                        variant="outline"
                        onClick={() => navigate('/generator')}
                        className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-7 text-xl"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Watch Demo
                      </Button>
                    </MagneticButton>
              </motion.div>
            )}
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <motion.h2
                  className="text-5xl font-bold text-white mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  Choose Your <AnimatedTextGradient>Tool</AnimatedTextGradient>
                </motion.h2>
                <p className="text-2xl text-gray-300 mb-4">
                  Six powerful features with expanding cards
                </p>
                <p className="text-gray-400 mb-2">
                  Click any card to expand • Use arrows to navigate
                </p>
                <p className="text-purple-400 text-sm">
                  ✨ Follow the numbers 1-6 for the complete development workflow
                </p>
              </div>
            </RevealOnScroll>

            {/* Expanding Feature Cards */}
            <ExpandingFeatureCards />
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/50 via-indigo-900/10 to-gray-900">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white mb-4">
                  See It In <AnimatedTextGradient>Action</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  Watch how DevMindX transforms ideas into reality
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <AdvancedInteractiveDemo />
            </RevealOnScroll>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {[
                { icon: <Zap className="w-6 h-6" />, text: 'Generate in 30s', color: 'from-yellow-500 to-orange-500' },
                { icon: <Code className="w-6 h-6" />, text: 'Production Ready', color: 'from-blue-500 to-cyan-500' },
                { icon: <Rocket className="w-6 h-6" />, text: 'Deploy Instantly', color: 'from-green-500 to-emerald-500' },
                { icon: <Users className="w-6 h-6" />, text: 'Team Collaboration', color: 'from-purple-500 to-pink-500' }
              ].map((item, i) => (
                <RevealOnScroll key={i}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mx-auto mb-3 text-white`}>
                      {item.icon}
                    </div>
                    <p className="text-white font-semibold">{item.text}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-pink-900/10 to-gray-900">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Loved by <AnimatedTextGradient>Developers</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  See what our users are saying
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Chen',
                  role: 'Full Stack Developer',
                  avatar: '👩‍💻',
                  text: 'DevMindX cut my development time by 70%. I can now focus on what matters - building great features!',
                  rating: 5
                },
                {
                  name: 'Marcus Johnson',
                  role: 'Startup Founder',
                  avatar: '👨‍💼',
                  text: 'Built our MVP in 2 days instead of 2 months. This tool is a game-changer for startups!',
                  rating: 5
                },
                {
                  name: 'Priya Patel',
                  role: 'Product Manager',
                  avatar: '👩‍🔬',
                  text: 'Finally, a tool that understands what I want to build. No more miscommunication with developers!',
                  rating: 5
                }
              ].map((testimonial, i) => (
                <RevealOnScroll key={i}>
                  <GlowCard delay={i * 0.1}>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, j) => (
                          <motion.span
                            key={j}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 + j * 0.1 }}
                            className="text-yellow-400 text-xl"
                          >
                            ★
                          </motion.span>
                        ))}
                      </div>
                      <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.text}"</p>
                      <div className="flex items-center">
                        <div className="text-4xl mr-4">{testimonial.avatar}</div>
                        <div>
                          <div className="text-white font-semibold">{testimonial.name}</div>
                          <div className="text-gray-400 text-sm">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases with Interactive Computer */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Build <AnimatedTextGradient>Anything</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  Click a card to see the AI prompt
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Use Case Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    icon: '🛒', 
                    title: 'E-commerce', 
                    desc: 'Online stores with payments',
                    prompt: 'Create a modern e-commerce website with product catalog, shopping cart, user authentication, payment integration with Stripe, order management, inventory tracking, and an admin dashboard. Include responsive design, product search, filters, reviews, and wishlist functionality.'
                  },
                  { 
                    icon: '📊', 
                    title: 'Dashboards', 
                    desc: 'Analytics & data viz',
                    prompt: 'Build a comprehensive analytics dashboard with interactive charts using Chart.js or D3.js, real-time data visualization, customizable widgets, user management, data export features (CSV/PDF), dark/light theme toggle, and responsive design. Include KPI cards, line charts, bar charts, and pie charts.'
                  },
                  { 
                    icon: '💬', 
                    title: 'Social Apps', 
                    desc: 'Chat & communities',
                    prompt: 'Create a social media application with user profiles, post creation and sharing, real-time messaging using Socket.io, notifications, friend/follow system, news feed with infinite scroll, image/video upload, comments, likes, and hashtags. Include user authentication and privacy settings.'
                  },
                  { 
                    icon: '📱', 
                    title: 'Mobile Apps', 
                    desc: 'iOS & Android',
                    prompt: 'Build a cross-platform mobile application using React Native with native features, push notifications, offline support, smooth animations, user authentication, data synchronization, camera integration, geolocation, and app store ready configuration for both iOS and Android.'
                  },
                  { 
                    icon: '🎮', 
                    title: 'Games', 
                    desc: 'Interactive experiences',
                    prompt: 'Create an interactive web-based game with HTML5 Canvas or WebGL, smooth animations at 60fps, score tracking, multiple levels with increasing difficulty, sound effects, background music, leaderboard system, save game functionality, responsive controls, and mobile touch support.'
                  },
                  { 
                    icon: '📝', 
                    title: 'Blogs', 
                    desc: 'Content platforms',
                    prompt: 'Build a modern blog platform with markdown editor, rich text formatting, SEO optimization, comment system with moderation, categories and tags, user authentication, admin panel for content management, search functionality, RSS feed, social sharing, and responsive design.'
                  },
                  { 
                    icon: '🏥', 
                    title: 'Healthcare', 
                    desc: 'Medical systems',
                    prompt: 'Create a healthcare management system with patient records, appointment scheduling, doctor profiles, prescription management, medical history tracking, secure authentication, HIPAA compliance features, telemedicine video calls, billing system, and patient portal with responsive design.'
                  },
                  { 
                    icon: '🎓', 
                    title: 'Education', 
                    desc: 'Learning platforms',
                    prompt: 'Build an e-learning platform with course management, video lessons, quizzes and assessments, progress tracking, certificates, student dashboard, instructor tools, discussion forums, assignment submission, grading system, and interactive learning materials with responsive design.'
                  }
                ].map((useCase, i) => (
                  <RevealOnScroll key={i}>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const computer = document.getElementById('computer-screen');
                        const promptText = document.getElementById('prompt-text');
                        if (computer && promptText) {
                          computer.classList.add('active');
                          promptText.textContent = useCase.prompt;
                          // Scroll to computer
                          computer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 rounded-xl p-6 text-center cursor-pointer transition-all"
                    >
                      <div className="text-5xl mb-3">{useCase.icon}</div>
                      <h3 className="text-white font-bold text-lg mb-2">{useCase.title}</h3>
                      <p className="text-gray-400 text-sm">{useCase.desc}</p>
                    </motion.div>
                  </RevealOnScroll>
                ))}
              </div>

              {/* 3D Computer Mockup */}
              <RevealOnScroll>
                <div id="computer-screen" className="sticky top-24">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    {/* Computer Frame */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border-4 border-gray-700 shadow-2xl">
                      {/* Screen */}
                      <div className="bg-gray-950 rounded-lg p-6 min-h-[400px] relative overflow-hidden">
                        {/* Terminal Header */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-gray-400 text-sm ml-4">AI Prompt Generator</span>
                        </div>

                        {/* Prompt Display */}
                        <div className="space-y-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-green-400 font-mono">$</span>
                            <span className="text-gray-400 font-mono text-sm">devmindx generate</span>
                          </div>
                          
                          <div className="bg-white/50 rounded-lg p-4 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-purple-400 text-sm font-semibold">Generated Prompt:</span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const promptText = document.getElementById('prompt-text')?.textContent;
                                  if (promptText) {
                                    navigator.clipboard.writeText(promptText);
                                    const btn = document.getElementById('copy-btn');
                                    if (btn) {
                                      btn.textContent = '✓ Copied!';
                                      setTimeout(() => {
                                        btn.textContent = '📋 Copy';
                                      }, 2000);
                                    }
                                  }
                                }}
                                id="copy-btn"
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                              >
                                📋 Copy
                              </motion.button>
                            </div>
                            <p id="prompt-text" className="text-gray-300 text-sm leading-relaxed font-mono">
                              Click any card on the left to see a pre-written AI prompt that you can copy and use to generate that type of project! 
                              <br /><br />
                              Each prompt is carefully crafted to include all the essential features and best practices for that project type.
                              <br /><br />
                              <span className="text-purple-400">👈 Try clicking a card now!</span>
                            </p>
                          </div>

                          {/* Blinking Cursor */}
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-mono">$</span>
                            <motion.span
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-4 bg-green-400 inline-block"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Computer Base */}
                      <div className="mt-2 h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl"></div>
                    </div>

                    {/* Stand */}
                    <div className="flex justify-center mt-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-48 h-3 bg-gray-800 rounded-b-xl"></div>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl -z-10"></div>
                  </motion.div>

                  {/* Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-gray-400 text-sm">
                      💡 <span className="text-purple-400 font-semibold">Pro Tip:</span> Copy the prompt and paste it into the AI Generator to create your project instantly!
                    </p>
                    <MagneticButton className="mt-4">
                      <Button
                        onClick={() => navigate('/generator')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Go to AI Generator
                      </Button>
                    </MagneticButton>
                  </motion.div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4">
                  How It <AnimatedTextGradient>Works</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  From idea to application in 3 simple steps
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <RevealOnScroll key={index}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="text-center relative"
                  >
                    {/* Connecting line */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                    )}
                    
                    <div className="relative mb-8">
                      <PulseRing size="lg" />
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-2xl relative z-10`}
                      >
                        {step.number}
                      </motion.div>
                    </div>
                    <FloatingIcon delay={index * 0.2}>
                      <div className="text-purple-400 mb-4 flex justify-center">
                        {step.icon}
                      </div>
                    </FloatingIcon>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-lg">
                      {step.description}
                    </p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <RevealOnScroll>
              <GlowCard>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-16 text-center backdrop-blur-sm relative overflow-hidden">
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                  />
                  
                  <div className="relative z-10">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-5xl font-bold text-white mb-6"
                    >
                      Ready to Build Something <AnimatedTextGradient>Amazing</AnimatedTextGradient>?
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl text-gray-300 mb-10"
                    >
                      Join thousands of developers using AI to build faster
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                      <MagneticButton>
                        <Button 
                          size="lg"
                          onClick={() => navigate(isAuthenticated ? '/generator' : '/signup')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-12 py-8 text-xl shadow-2xl shadow-purple-500/50"
                        >
                          <Play className="w-6 h-6 mr-2" />
                          Start Building Now
                        </Button>
                      </MagneticButton>
                      <MagneticButton>
                        <Button 
                          size="lg"
                          variant="outline"
                          onClick={() => navigate('/projects')}
                          className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-8 text-xl"
                        >
                          View Examples
                        </Button>
                      </MagneticButton>
                    </motion.div>
                  </div>
                </div>
              </GlowCard>
            </RevealOnScroll>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/20">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Powered by <AnimatedTextGradient>Modern Tech</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  Built with the latest and greatest technologies
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[
                { name: 'React', icon: '⚛️' },
                { name: 'TypeScript', icon: '📘' },
                { name: 'Node.js', icon: '🟢' },
                { name: 'Python', icon: '🐍' },
                { name: 'MongoDB', icon: '🍃' },
                { name: 'PostgreSQL', icon: '🐘' },
                { name: 'Docker', icon: '🐳' },
                { name: 'AWS', icon: '☁️' },
                { name: 'Next.js', icon: '▲' },
                { name: 'Vue.js', icon: '💚' },
                { name: 'Angular', icon: '🅰️' },
                { name: 'TailwindCSS', icon: '🎨' }
              ].map((tech, i) => (
                <RevealOnScroll key={i}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
                  >
                    <div className="text-4xl mb-2">{tech.icon}</div>
                    <div className="text-white text-sm font-semibold">{tech.name}</div>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Frequently Asked <AnimatedTextGradient>Questions</AnimatedTextGradient>
                </h2>
                <p className="text-2xl text-gray-300">
                  Everything you need to know
                </p>
              </div>
            </RevealOnScroll>

            <div className="space-y-4">
              {[
                {
                  q: 'How does AI project generation work?',
                  a: 'Simply describe what you want to build in plain English. Our AI analyzes your requirements and generates a complete, production-ready application with all necessary files, dependencies, and configurations.'
                },
                {
                  q: 'Do I need coding experience?',
                  a: 'No! DevMindX is designed for everyone. Describe your idea in natural language, and our AI handles the technical implementation. However, developers can also use it to speed up their workflow.'
                },
                {
                  q: 'What frameworks are supported?',
                  a: 'We support React, Vue, Angular, Next.js, Node.js, Python, and many more. You can specify your preferred framework or let the AI choose the best one for your project.'
                },
                {
                  q: 'Can I edit the generated code?',
                  a: 'Absolutely! All generated code is fully editable in our professional IDE. You have complete control and can customize everything to your needs.'
                },
                {
                  q: 'Is there a free plan?',
                  a: 'Yes! We offer a generous free tier that includes AI project generation, code editing, and basic features. Premium plans unlock advanced AI models and additional features.'
                }
              ].map((faq, i) => (
                <RevealOnScroll key={i}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                  >
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center">
                      <span className="text-purple-400 mr-3">Q:</span>
                      {faq.q}
                    </h3>
                    <p className="text-gray-300 pl-8">{faq.a}</p>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: '10,000+', label: 'Projects Generated', icon: <Rocket className="w-8 h-8" /> },
                { value: '5,000+', label: 'Active Developers', icon: <Users className="w-8 h-8" /> },
                { value: '1M+', label: 'Lines of Code', icon: <Code className="w-8 h-8" /> },
                { value: '99.9%', label: 'Uptime', icon: <Zap className="w-8 h-8" /> }
              ].map((stat, i) => (
                <RevealOnScroll key={i}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                      {stat.icon}
                    </div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-lg">{stat.label}</div>
                  </motion.div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <RevealOnScroll>
              <GlowCard>
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Stay Updated
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Get the latest features, tips, and updates delivered to your inbox
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <MagneticButton>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4">
                        Subscribe
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </GlowCard>
            </RevealOnScroll>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-white/30 backdrop-blur-xl py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 mb-6 md:mb-0"
              >
                <Code className="w-6 h-6 text-purple-400" />
                <span className="text-white font-semibold text-lg">DevMindX</span>
              </motion.div>
              <div className="flex space-x-8 text-gray-400">
                {['About', 'Docs', 'Support', 'Privacy'].map((link) => (
                  <motion.a
                    key={link}
                    href="#"
                    whileHover={{ scale: 1.1, color: '#fff' }}
                    className="hover:text-white transition-colors"
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm mt-8">
              © 2025 DevMindX. Built with <AnimatedTextGradient>AI</AnimatedTextGradient>.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
