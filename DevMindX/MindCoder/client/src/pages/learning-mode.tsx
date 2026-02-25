import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  BookOpen, Code, Download, FileText, Brain, Lightbulb,
  ArrowLeft, CheckCircle, Loader2, Sparkles, GitBranch,
  MessageSquare, Award, Play, ChevronRight, Eye, Zap,
  Upload, FolderOpen
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/config/api';
import ProjectSelector from '@/components/ProjectSelector';

interface ExplanationSection {
  file: string;
  lines: Array<{
    lineNumber: number;
    code: string;
    explanation: string;
  }>;
}

interface FlowDiagram {
  nodes: Array<{
    id: string;
    label: string;
    type: 'start' | 'process' | 'decision' | 'end';
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

interface LearningData {
  explanations: ExplanationSection[];
  flowDiagram: FlowDiagram;
  summary: string;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  vivaQuestions: string[];
}

export default function LearningMode() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [activeTab, setActiveTab] = useState<'explanations' | 'flow' | 'summary' | 'quiz' | 'viva'>('explanations');
  const [selectedFile, setSelectedFile] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [loadedProject, setLoadedProject] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGenerate = async () => {
    if (!projectInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please paste your project code or description',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(apiUrl('/api/learning/analyze'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ code: projectInput })
      });

      if (!response.ok) throw new Error('Failed to generate learning content');

      const data = await response.json();
      setLearningData(data);
      setActiveTab('explanations');
      toast({
        title: 'Success!',
        description: 'Learning content generated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate learning content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = () => {
    if (!learningData) return;

    const content = `
# Learning Mode - Complete Analysis

## Line-by-Line Explanations
${learningData.explanations.map(section => `
### ${section.file}
${section.lines.map(line => `
**Line ${line.lineNumber}:** \`${line.code}\`
${line.explanation}
`).join('\n')}
`).join('\n')}

## Flow Diagram
${JSON.stringify(learningData.flowDiagram, null, 2)}

## Summary
${learningData.summary}

## Quiz Questions
${learningData.quiz.map((q, i) => `
${i + 1}. ${q.question}
${q.options.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}
   Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}
`).join('\n')}

## Viva Questions
${learningData.vivaQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-mode-analysis.md';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Learning content saved successfully'
    });
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
    const correct = quizAnswers.filter((ans, i) => ans === learningData?.quiz[i].correctAnswer).length;
    toast({
      title: 'Quiz Complete!',
      description: `You got ${correct} out of ${learningData?.quiz.length} correct`
    });
  };

  const handleProjectSelect = (projectData: { 
    project: { id: string; name: string; description: string }; 
    files: any[];
    fullContent: string;
  }) => {
    setLoadedProject({ name: projectData.project.name, id: projectData.project.id });
    // Set the project input to include all project code for learning
    setProjectInput(projectData.fullContent);
    toast({
      title: 'Project Loaded!',
      description: `${projectData.project.name} is ready for learning analysis`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Architecture Background */}
      <div className="fixed inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Animated nodes */}
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 100 + '%'}
              cy={Math.random() * 100 + '%'}
              r="4"
              fill="rgba(139, 92, 246, 0.6)"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </svg>
      </div>

      {/* Mouse Spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 bg-white/30 backdrop-blur-xl sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/')}
                  className="text-white hover:text-purple-400"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <div className="flex items-center space-x-2">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">Learning Mode</span>
                </div>
              </div>
              {learningData && (
                <Button
                  onClick={handleDownloadAll}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!learningData ? (
            // Input Section
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
                      Explain Your Project
                    </div>
                    {loadedProject && (
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                        <FolderOpen className="w-4 h-4 mr-1" />
                        {loadedProject.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-300 text-lg mt-2">
                    Paste your project code or load a generated project to get comprehensive learning materials
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    placeholder="Paste your project code here or load an existing project to learn from it...

The AI will analyze your code and generate:
• Line-by-line explanations
• Flow diagrams
• Project summary
• Quiz questions
• Viva preparation questions"
                    className="min-h-[300px] bg-white/50 border-purple-500/30 text-white font-mono"
                  />
                  <div className="flex gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Explain Project
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowProjectSelector(true)}
                      variant="outline"
                      className="border-purple-500/50 text-white hover:bg-purple-500/10"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Load from Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Preview */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                {[
                  { icon: Code, title: 'Line-by-Line', desc: 'Detailed code explanations', color: 'from-blue-500 to-cyan-500' },
                  { icon: GitBranch, title: 'Flow Diagram', desc: 'Visual architecture', color: 'from-green-500 to-emerald-500' },
                  { icon: FileText, title: 'Summary', desc: 'Quick overview', color: 'from-yellow-500 to-orange-500' },
                  { icon: Award, title: 'Quiz & Viva', desc: 'Test your knowledge', color: 'from-purple-500 to-pink-500' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            // Results Section
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'explanations', label: 'Line-by-Line', icon: Code },
                  { id: 'flow', label: 'Flow Diagram', icon: GitBranch },
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'quiz', label: 'Quiz', icon: Lightbulb },
                  { id: 'viva', label: 'Viva Questions', icon: MessageSquare }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'explanations' && (
                  <motion.div
                    key="explanations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* File Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {learningData.explanations.map((section, i) => (
                        <Button
                          key={i}
                          onClick={() => setSelectedFile(i)}
                          variant={selectedFile === i ? 'default' : 'outline'}
                          className={selectedFile === i ? 'bg-purple-600' : 'border-gray-700'}
                        >
                          {section.file}
                        </Button>
                      ))}
                    </div>

                    {/* Code Explanations */}
                    <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">
                          {learningData.explanations[selectedFile].file}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {learningData.explanations[selectedFile].lines.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <span className="text-purple-400 font-mono text-sm">
                                Line {line.lineNumber}
                              </span>
                              <code className="flex-1 text-cyan-400 font-mono text-sm">
                                {line.code}
                              </code>
                            </div>
                            <p className="text-gray-300 text-sm pl-16">
                              {line.explanation}
                            </p>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'flow' && (
                  <motion.div
                    key="flow"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <GitBranch className="w-6 h-6 mr-2 text-purple-400" />
                          Project Flow Diagram
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white/50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                          <div className="space-y-4 w-full max-w-2xl">
                            {learningData.flowDiagram.nodes.map((node, i) => (
                              <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-4 rounded-lg border-2 ${
                                  node.type === 'start' ? 'bg-green-500/20 border-green-500' :
                                  node.type === 'end' ? 'bg-red-500/20 border-red-500' :
                                  node.type === 'decision' ? 'bg-yellow-500/20 border-yellow-500' :
                                  'bg-blue-500/20 border-blue-500'
                                }`}
                              >
                                <p className="text-white text-center font-semibold">{node.label}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'summary' && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <FileText className="w-6 h-6 mr-2 text-purple-400" />
                          Project Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                            {learningData.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'quiz' && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {learningData.quiz.map((q, i) => (
                      <Card key={i} className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">
                            Question {i + 1}: {q.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {q.options.map((option, j) => (
                            <motion.button
                              key={j}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[i] = j;
                                setQuizAnswers(newAnswers);
                              }}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                quizAnswers[i] === j
                                  ? 'bg-purple-600/30 border-purple-500'
                                  : 'bg-white/50 border-gray-700 hover:border-gray-600'
                              } ${
                                showQuizResults && j === q.correctAnswer
                                  ? 'border-green-500 bg-green-500/20'
                                  : showQuizResults && quizAnswers[i] === j && j !== q.correctAnswer
                                  ? 'border-red-500 bg-red-500/20'
                                  : ''
                              }`}
                            >
                              <span className="text-white">{String.fromCharCode(65 + j)}. {option}</span>
                              {showQuizResults && j === q.correctAnswer && (
                                <CheckCircle className="inline-block ml-2 w-5 h-5 text-green-400" />
                              )}
                            </motion.button>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      onClick={checkQuizAnswers}
                      disabled={quizAnswers.length !== learningData.quiz.length}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6"
                    >
                      <Award className="w-5 h-5 mr-2" />
                      Check Answers
                    </Button>
                  </motion.div>
                )}

                {activeTab === 'viva' && (
                  <motion.div
                    key="viva"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <MessageSquare className="w-6 h-6 mr-2 text-purple-400" />
                          Viva Questions
                        </CardTitle>
                        <p className="text-gray-400 mt-2">
                          Practice these questions to prepare for your viva or interview
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {learningData.vivaQuestions.map((question, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-purple-400 font-bold text-lg">
                                {i + 1}.
                              </span>
                              <p className="text-gray-300 text-lg flex-1">{question}</p>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
        onProjectSelect={handleProjectSelect}
        title="Load Project for Learning"
        description="Select a generated project to learn from with AI explanations"
      />
    </div>
  );
}
