import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, Code, FolderOpen, Zap, Brain, Rocket,
  ArrowRight, CheckCircle, Play, Cpu, Network, 
  Layers, Terminal, GitBranch, Box, LogOut,
  Search, Blocks, GraduationCap, ShoppingCart
} from 'lucide-react';

export default function HomeAIProfessional() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();

  const features = [
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: 'AI Project Generator',
      description: 'Transform ideas into production-ready applications using advanced AI',
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      action: () => navigate('/generator'),
      buttonText: 'Generate Project',
      features: ['Natural Language Processing', 'Real-time Preview', 'Multi-framework Support', 'Production Ready']
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: 'Cursor-Like IDE',
      description: 'Production-grade IDE with Monaco Editor, Docker sandbox, and AI assistance',
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      action: () => navigate('/cursor-ide'),
      buttonText: 'Open IDE',
      features: ['Monaco Editor', 'Docker Sandbox', 'AI Assistant', 'Multi-Language Support']
    },
    {
      icon: <FolderOpen className="w-10 h-10" />,
      title: 'Project Management',
      description: 'Centralized workspace for all your AI-generated projects',
      gradient: 'from-green-500 via-emerald-600 to-teal-500',
      action: () => navigate('/projects'),
      buttonText: 'View Projects',
      features: ['Quick Access', 'Live Preview', 'Version Control', 'Team Sharing']
    },
    {
      icon: <Search className="w-10 h-10" />,
      title: 'Research Engine',
      description: 'AI-powered research assistant for comprehensive information gathering',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      action: () => navigate('/research'),
      buttonText: 'Start Research',
      features: ['Web Search', 'AI Analysis', 'Source Citations', 'Export Reports']
    },
    {
      icon: <Blocks className="w-10 h-10" />,
      title: 'Architecture Generator',
      description: 'Design system architectures with AI-powered recommendations',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      action: () => navigate('/architecture'),
      buttonText: 'Design Architecture',
      features: ['Visual Diagrams', 'Best Practices', 'Technology Stack', 'Scalability Analysis']
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: 'Learning Mode',
      description: 'Interactive tutorials and AI-guided learning experiences',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      action: () => navigate('/learning-mode'),
      buttonText: 'Start Learning',
      features: ['Step-by-step Guides', 'Interactive Exercises', 'AI Tutor', 'Progress Tracking']
    }
  ];

  const capabilities = [
    { icon: <Cpu className="w-6 h-6" />, text: 'AI-Powered Code Generation' },
    { icon: <Network className="w-6 h-6" />, text: 'Real-time Collaboration' },
    { icon: <Layers className="w-6 h-6" />, text: 'Multi-framework Support' },
    { icon: <Terminal className="w-6 h-6" />, text: 'Integrated Development Tools' },
    { icon: <GitBranch className="w-6 h-6" />, text: 'Version Control Integration' },
    { icon: <Box className="w-6 h-6" />, text: 'Instant Deployment' }
  ];

  const stats = [
    { value: '10K+', label: 'Projects Generated' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<30s', label: 'Avg. Generation Time' },
    { value: '50+', label: 'Frameworks Supported' }
  ];

  // LLM Models matching your account page exactly
  const llmPricing = [
    {
      id: 'together',
      name: 'Together AI',
      model: 'Free tier routed to Gemini',
      icon: '🆓',
      price: 0,
      tokensPerMonth: 10000,
      features: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation', 'Code Review'],
      gradient: 'from-gray-600 to-gray-800',
      recommended: false,
      status: 'Active'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      model: "Google's multimodal AI model",
      icon: '💎',
      price: 749,
      tokensPerMonth: 50000,
      features: ['Code Generation', 'Image Analysis', 'Reasoning', 'Documentation', 'Testing'],
      gradient: 'from-blue-500 to-cyan-500',
      recommended: true,
      status: 'Active'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      model: "OpenAI's powerful language model",
      icon: '🤖',
      price: 1499,
      tokensPerMonth: 100000,
      features: ['Natural Language', 'Code Completion', 'Problem Solving', 'Explanation', 'Debugging'],
      gradient: 'from-green-500 to-emerald-500',
      recommended: false,
      status: 'Not Purchased'
    },
    {
      id: 'claude',
      name: 'Claude',
      model: "Anthropic's helpful AI assistant",
      icon: '🧠',
      price: 1299,
      tokensPerMonth: 100000,
      features: ['Long Context', 'Code Understanding', 'Documentation', 'Explanation', 'Reasoning'],
      gradient: 'from-purple-500 to-pink-500',
      recommended: false,
      status: 'Not Purchased'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      model: "DeepSeek's advanced AI model",
      icon: '🔍',
      price: 1125,
      tokensPerMonth: 50000,
      features: ['Code Generation', 'Debugging', 'Optimization', 'Documentation', 'Architecture Design'],
      gradient: 'from-indigo-500 to-purple-500',
      recommended: false,
      status: 'Not Purchased'
    }
  ];

  const handlePurchase = (modelId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase AI models',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }
    
    // Navigate to account page with model pre-selected
    navigate(`/account?model=${modelId}`);
  };

  return (
    <div className="min-h-screen ai-gradient-bg">
      {/* Professional Header */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                <div className="absolute inset-0 blur-xl bg-purple-500 opacity-50 -z-10" />
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">DevMindX</span>
              <span className="badge-ai text-xs hidden sm:inline-flex">AI-Powered</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 hidden lg:block">
                    Welcome, <span className="text-purple-400 font-semibold">{user?.username || 'User'}</span>
                  </span>
                  <Button 
                    onClick={() => navigate('/cursor-ide')} 
                    variant="outline"
                    size="sm"
                    className="border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 hidden lg:flex"
                  >
                    <Code className="w-4 h-4 lg:mr-2" />
                    <span className="hidden xl:inline">IDE</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/generator')} 
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 hidden md:flex"
                  >
                    <Sparkles className="w-4 h-4 md:mr-2" />
                    <span className="hidden lg:inline">Generator</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/projects')} 
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 hidden xl:flex"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Projects
                  </Button>
                  <Button 
                    onClick={() => navigate('/account')} 
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">Account</span>
                    <span className="sm:hidden">⚙️</span>
                  </Button>
                  <Button 
                    onClick={logout} 
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 sm:px-4"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/login')} 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:text-purple-400 hover:bg-white/5 px-2 sm:px-4"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')} 
                    size="sm"
                    className="btn-ai-primary px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden spotlight">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Immersive DevMindX Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateX: -30 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-4 sm:mb-8 relative"
              style={{ perspective: "1000px" }}
            >
              <div className="relative inline-block">
                {/* Glow layers - reduced on mobile for performance */}
                <div className="absolute inset-0 blur-2xl sm:blur-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-20 sm:opacity-30 animate-pulse" />
                <div className="absolute inset-0 blur-xl sm:blur-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-15 sm:opacity-20 hidden sm:block" />
                
                {/* Main brand name */}
                <motion.h1 
                  className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 25%, #06B6D4 50%, #8B5CF6 75%, #3B82F6 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 80px rgba(139, 92, 246, 0.5)',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  DevMindX
                </motion.h1>
                
                {/* Particle effects - fewer on mobile */}
                {[...Array(typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : 20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full hidden sm:block"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 glass-card rounded-full mb-4 sm:mb-8 hover-lift"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mr-2 animate-pulse" />
              <span className="text-purple-300 font-medium text-sm sm:text-base">Next-Gen AI Development</span>
            </motion.div>
            
            <motion.h2 
              className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Build <span className="gradient-text neon-text">Anything</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>with AI Intelligence
            </motion.h2>
            
            <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Transform your ideas into production-ready applications in seconds.
              <br className="hidden sm:block" />
              <span className="text-purple-400 font-semibold"> No coding expertise required.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16 px-4">
              <Button 
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/generator' : '/signup')}
                className="btn-ai-primary px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold w-full sm:w-auto touch-target"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Building Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/projects')}
                className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto touch-target"
              >
                View Examples
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-card p-4 sm:p-6 rounded-xl hover-lift"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements - hidden on mobile for performance */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-3xl float-animation hidden sm:block" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl float-animation hidden sm:block" style={{ animationDelay: '2s' }} />
      </section>

      {/* Capabilities Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Powered by <span className="gradient-text">Advanced AI</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Cutting-edge technology that understands your vision
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-3 sm:p-6 rounded-lg sm:rounded-xl hover-lift flex items-center space-x-2 sm:space-x-4"
              >
                <div className="feature-icon-container p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <div className="text-purple-400 scale-75 sm:scale-100">
                    {capability.icon}
                  </div>
                </div>
                <span className="text-white font-medium text-xs sm:text-sm md:text-base leading-tight">
                  {capability.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Choose Your <span className="gradient-text">Workflow</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300">
              Powerful tools, one seamless platform
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-ai-feature group cursor-pointer p-4 sm:p-6"
                onClick={feature.action}
              >
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform pulse-glow`}>
                  <div className="scale-75 sm:scale-100">{feature.icon}</div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {feature.features.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-xs sm:text-sm">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {feature.features.length > 3 && (
                    <li className="text-gray-400 text-xs sm:text-sm ml-5 sm:ml-7">
                      +{feature.features.length - 3} more features
                    </li>
                  )}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-semibold group-hover:scale-105 transition-transform text-sm sm:text-base py-2 sm:py-3 touch-target`}
                >
                  {feature.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple <span className="gradient-text">Three-Step</span> Process
            </h2>
            <p className="text-xl text-gray-300">
              From concept to deployment in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Brain className="w-12 h-12" />, title: 'Describe Your Vision', desc: 'Tell our AI what you want to build in natural language' },
              { icon: <Zap className="w-12 h-12" />, title: 'AI Generates Code', desc: 'Watch as AI creates your complete application with live preview' },
              { icon: <Rocket className="w-12 h-12" />, title: 'Deploy Instantly', desc: 'Customize in the IDE and deploy to production with one click' }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto pulse-glow">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.desc}
                </p>

                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LLM Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Powered by <span className="gradient-text">Leading AI Models</span>
            </h2>
            <p className="text-xl text-gray-300">
              Choose from the best AI models in the industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 px-2 sm:px-0">
            {llmPricing.map((llm, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 relative cursor-pointer group transition-all duration-300 ${
                  llm.recommended ? 'border-2 border-purple-500 shadow-xl sm:shadow-2xl shadow-purple-500/30' : 'border border-gray-700/50'
                } hover:border-purple-500/50 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-purple-500/20`}
              >
                {/* Status Badge */}
                <div className="absolute -top-3 right-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    llm.status === 'Active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {llm.status}
                  </span>
                </div>

                {llm.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-ai text-xs px-4 py-1">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 mt-2">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {llm.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors duration-300">
                    {llm.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight group-hover:text-gray-300 transition-colors duration-300">
                    {llm.model}
                  </p>
                </div>

                <div className={`bg-gradient-to-r ${llm.gradient} p-4 rounded-xl mb-4 transform group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="text-center relative z-10">
                    <div className="text-3xl font-bold text-white mb-1">
                      {llm.price === 0 ? 'Free' : `₹${llm.price}`}
                    </div>
                    <div className="text-white/80 text-xs">
                      {llm.price === 0 ? 'Forever' : 'per month'}
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Monthly Quota</div>
                  <div className="text-lg font-semibold text-purple-400">
                    {llm.tokensPerMonth.toLocaleString()} tokens
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {llm.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-xs group/item hover:text-white transition-colors duration-200">
                      <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                      <span className="group-hover/item:translate-x-1 transition-transform duration-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchase(llm.id)}
                  className={`w-full text-sm font-semibold transform group-hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                    llm.status === 'Active'
                      ? `bg-gradient-to-r ${llm.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                      : llm.status === 'Not Purchased'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50 hover:shadow-xl'
                      : `bg-gradient-to-r ${llm.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                  }`}
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center">
                    {llm.status === 'Active' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                        Renew Subscription
                      </>
                    ) : llm.price === 0 ? (
                      <>
                        <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                        Start Free
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        Purchase
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm mb-4">
              All plans include access to the full DevMindX platform with unlimited projects
            </p>
            <Button
              onClick={() => navigate('/account')}
              variant="outline"
              className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
            >
              View All Plans & Features
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card animated-border rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Build the <span className="gradient-text">Future</span>?
              </h2>
              <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of developers leveraging AI to build faster, smarter, and better
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? '/generator' : '/signup')}
                  className="btn-ai-primary px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg font-semibold touch-target"
                >
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Start Building Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/projects')}
                  className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg touch-target"
                >
                  Explore Examples
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/30 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Code className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <span className="text-xl sm:text-2xl font-bold gradient-text">DevMindX</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-400 text-sm sm:text-base">
              <a href="#" className="hover:text-purple-400 transition-colors">About</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-purple-400 transition-colors">API</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
              <a href="#" className="hover:text-purple-400 transition-colors hidden sm:inline">Privacy</a>
              <a href="#" className="hover:text-purple-400 transition-colors hidden sm:inline">Terms</a>
            </div>
          </div>
          <div className="section-divider mb-6 sm:mb-8" />
          <div className="text-center text-gray-400 text-xs sm:text-sm">
            © 2025 DevMindX. Powered by Advanced AI Technology.
          </div>
        </div>
      </footer>
    </div>
  );
}
