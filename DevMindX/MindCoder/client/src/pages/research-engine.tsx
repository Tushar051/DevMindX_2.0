import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Brain,
  Sparkles,
  FileText,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Copy,
  Check,
  Download,
  ArrowRight,
  Loader2,
  BookOpen,
  Code,
  Layers,
  Database,
  Globe,
  Shield,
  Rocket,
  ChevronRight,
  Star,
  Info,
  FolderOpen,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/config/api';
import ProjectSelector from '@/components/ProjectSelector';

interface ResearchSection {
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

interface ResearchResult {
  overview: string;
  keyFeatures: string[];
  techStack: string[];
  architecture: string;
  bestPractices: string[];
  challenges: string[];
  recommendations: string[];
  devmindxPrompt: string;
  estimatedComplexity: 'Simple' | 'Medium' | 'Complex';
  estimatedTime: string;
}

export default function ResearchEngine() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [idea, setIdea] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [loadedProject, setLoadedProject] = useState<{ name: string; id: string } | null>(null);

  const researchPhases = [
    { name: 'Analyzing Idea', icon: <Search className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Gathering Information', icon: <BookOpen className="w-5 h-5" />, color: 'from-cyan-500 to-teal-500' },
    { name: 'Evaluating Technologies', icon: <Code className="w-5 h-5" />, color: 'from-teal-500 to-green-500' },
    { name: 'Designing Architecture', icon: <Layers className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'Generating Insights', icon: <Lightbulb className="w-5 h-5" />, color: 'from-emerald-500 to-lime-500' },
    { name: 'Creating Prompt', icon: <Sparkles className="w-5 h-5" />, color: 'from-lime-500 to-yellow-500' }
  ];

  useEffect(() => {
    if (isResearching && currentPhase < researchPhases.length) {
      const timer = setTimeout(() => {
        setCurrentPhase(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isResearching, currentPhase]);

  useEffect(() => {
    if (researchResult && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [researchResult]);

  const handleResearch = async () => {
    if (!idea.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your project idea',
        variant: 'destructive'
      });
      return;
    }

    setIsResearching(true);
    setCurrentPhase(0);
    setResearchResult(null);

    try {
      const response = await fetch(apiUrl('/api/research/analyze'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ idea })
      });

      if (!response.ok) throw new Error('Research failed');

      const data = await response.json();
      
      // Simulate final phase completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResearchResult(data);
      setIsResearching(false);
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: 'Research Failed',
        description: 'Failed to analyze your idea. Please try again.',
        variant: 'destructive'
      });
      setIsResearching(false);
    }
  };

  const handleCopyPrompt = () => {
    if (researchResult?.devmindxPrompt) {
      navigator.clipboard.writeText(researchResult.devmindxPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'DevMindX prompt copied to clipboard'
      });
    }
  };

  const handleGenerateProject = () => {
    if (researchResult?.devmindxPrompt) {
      navigate('/generator', { state: { prompt: researchResult.devmindxPrompt } });
    }
  };

  const handleProjectSelect = (projectData: { 
    project: { id: string; name: string; description: string }; 
    files: any[];
    fullContent: string;
  }) => {
    setLoadedProject({ name: projectData.project.name, id: projectData.project.id });
    // Set the idea to include project info and code for research
    const projectSummary = `Project: ${projectData.project.name}
Description: ${projectData.project.description}

=== PROJECT CODE ===
${projectData.fullContent}`;
    setIdea(projectSummary);
    toast({
      title: 'Project Loaded!',
      description: `${projectData.project.name} is ready for research analysis`,
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Complex': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            AI Research Engine
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your ideas into actionable development plans with AI-powered research and analysis
          </p>
        </motion.div>

        {/* Research Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  What's Your Project Idea?
                </div>
                {loadedProject && (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    {loadedProject.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your project idea in detail... 

Examples:
• A social media platform for developers with code sharing and collaboration features
• An e-commerce marketplace with AI-powered product recommendations
• A project management tool with real-time collaboration and analytics
• A fitness tracking app with personalized workout plans and nutrition guidance

Or load an existing project from 'View Projects' to research it!"
                className="w-full h-48 p-4 bg-white/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isResearching}
              />
              
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowProjectSelector(true)}
                    variant="outline"
                    className="border-purple-500/50 hover:bg-purple-500/10 text-purple-300"
                    disabled={isResearching}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Load from Projects
                  </Button>
                  <span className="text-sm text-gray-400">
                    {idea.length}/2000 characters
                  </span>
                </div>
                <Button
                  onClick={handleResearch}
                  disabled={isResearching || !idea.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Start Research
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Research Progress */}
        <AnimatePresence>
          {isResearching && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {researchPhases.map((phase, index) => (
                      <motion.div
                        key={phase.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${phase.color} ${
                          currentPhase > index ? 'opacity-100' : 'opacity-30'
                        } transition-opacity duration-500`}>
                          {phase.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-semibold ${
                              currentPhase > index ? 'text-white' : 'text-gray-500'
                            }`}>
                              {phase.name}
                            </span>
                            {currentPhase > index && (
                              <Check className="w-5 h-5 text-green-400" />
                            )}
                            {currentPhase === index && (
                              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                            )}
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${phase.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: currentPhase > index ? '100%' : currentPhase === index ? '50%' : '0%' }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Research Results */}
        <AnimatePresence>
          {researchResult && (
            <motion.div
              ref={scrollRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Overview */}
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-400" />
                    Research Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{researchResult.overview}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge className={`${getComplexityColor(researchResult.estimatedComplexity)} border`}>
                      {researchResult.estimatedComplexity} Complexity
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/50">
                      ⏱️ {researchResult.estimatedTime}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Features */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {researchResult.keyFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 p-3 bg-white/50 rounded-lg border border-gray-700"
                      >
                        <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-6 h-6 text-green-400" />
                    Recommended Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {researchResult.techStack.map((tech, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/50 px-4 py-2">
                          {tech}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Architecture */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-cyan-400" />
                    Architecture Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{researchResult.architecture}</p>
                </CardContent>
              </Card>

              {/* Best Practices & Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-400" />
                      Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchResult.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="w-6 h-6 text-orange-400" />
                      Potential Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchResult.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Target className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {researchResult.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg"
                      >
                        <p className="text-gray-300">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DevMindX Prompt */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    DevMindX Generation Prompt
                    <Badge className="ml-auto bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                      Ready to Use
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-lg border border-purple-500/30">
                    <ScrollArea className="h-48">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                        {researchResult.devmindxPrompt}
                      </pre>
                    </ScrollArea>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCopyPrompt}
                      variant="outline"
                      className="flex-1 border-purple-500/50 hover:bg-purple-500/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 mr-2 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGenerateProject}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Generate Project
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isResearching && !researchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <div className="max-w-2xl mx-auto">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8"
              >
                <Brain className="w-24 h-24 text-purple-400 mx-auto opacity-50" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                Ready to Research Your Idea?
              </h3>
              <p className="text-gray-400 mb-8">
                Our AI will analyze your project idea, research best practices, recommend technologies,
                and generate a perfect prompt for project creation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  { icon: <Search />, title: 'Deep Analysis', desc: 'AI analyzes your idea thoroughly' },
                  { icon: <Lightbulb />, title: 'Smart Insights', desc: 'Get recommendations & best practices' },
                  { icon: <Rocket />, title: 'Ready Prompt', desc: 'Generate project instantly' }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="text-purple-400 mb-2">{item.icon}</div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
        onProjectSelect={handleProjectSelect}
        title="Load Project for Research"
        description="Select a generated project to analyze and research"
      />
    </div>
  );
}
