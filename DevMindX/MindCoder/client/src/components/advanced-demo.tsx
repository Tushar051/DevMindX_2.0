import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Code, FolderOpen, Brain, Network, Database,
  FileCode, MessageSquare, CheckCircle, Zap, Terminal,
  Loader2, Play, Pause
} from 'lucide-react';

// Typing Animation Hook
const useTypingEffect = (text: string, speed: number = 30, startDelay: number = 0) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    
    const startTimer = setTimeout(() => {
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
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
};

// Progress Bar Component
const ProgressBar = ({ progress, label, color = 'from-purple-500 to-pink-500' }: { progress: number; label: string; color?: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-purple-400 font-mono">{progress}%</span>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`h-full bg-gradient-to-r ${color}`}
      />
    </div>
  </div>
);

// AI Generator Demo
const AIGeneratorDemo = () => {
  const [stage, setStage] = React.useState(0);
  const userInput = "Create a todo app with React and TypeScript";
  const { displayText: typedInput, isComplete: inputComplete } = useTypingEffect(userInput, 40);

  React.useEffect(() => {
    if (inputComplete && stage === 0) {
      setTimeout(() => setStage(1), 500);
    }
  }, [inputComplete, stage]);

  return (
    <div className="space-y-4">
      {/* User Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/70 rounded-lg p-4 border border-purple-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="text-gray-400 text-xs font-semibold">USER INPUT</span>
        </div>
        <p className="text-white font-mono text-sm">
          {typedInput}
          {!inputComplete && <span className="animate-pulse">|</span>}
        </p>
      </motion.div>

      {/* AI Processing */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/70 rounded-lg p-4 border border-blue-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-gray-400 text-xs font-semibold">AI GENERATING</span>
            </div>
            <div className="space-y-2">
              <ProgressBar progress={100} label="Analyzing requirements" color="from-blue-500 to-cyan-500" />
              <ProgressBar progress={85} label="Generating components" color="from-purple-500 to-pink-500" />
              <ProgressBar progress={70} label="Creating files" color="from-green-500 to-emerald-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Files */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/70 rounded-lg p-4 border border-green-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">GENERATED SUCCESSFULLY</span>
            </div>
            <div className="space-y-1.5">
              {['App.tsx', 'TodoList.tsx', 'TodoItem.tsx', 'types.ts', 'styles.css'].map((file, i) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <FileCode className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300 font-mono">{file}</span>
                  <span className="text-green-400 ml-auto">✓</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Architecture Generator Demo
const ArchitectureDemo = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 10));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const diagrams = [
    { name: 'System Architecture', icon: Network, color: 'text-blue-400', progress: Math.min(progress, 100) },
    { name: 'Class Diagram', icon: Code, color: 'text-purple-400', progress: Math.min(Math.max(progress - 20, 0), 100) },
    { name: 'ER Diagram', icon: Database, color: 'text-green-400', progress: Math.min(Math.max(progress - 40, 0), 100) },
    { name: 'REST API Blueprint', icon: FileCode, color: 'text-cyan-400', progress: Math.min(Math.max(progress - 60, 0), 100) },
  ];

  return (
    <div className="space-y-3">
      {diagrams.map((diagram, i) => (
        <motion.div
          key={diagram.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="bg-gray-900/70 rounded-lg p-3 border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <diagram.icon className={`w-4 h-4 ${diagram.color}`} />
              <span className="text-white text-sm font-medium">{diagram.name}</span>
            </div>
            {diagram.progress === 100 && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <ProgressBar 
            progress={diagram.progress} 
            label={diagram.progress === 100 ? 'Complete' : 'Generating...'} 
            color="from-blue-500 to-cyan-500"
          />
        </motion.div>
      ))}
    </div>
  );
};

// Learning Mode Demo
const LearningModeDemo = () => {
  const codeLines = [
    { line: 1, code: 'const express = require("express");', explanation: 'Imports the Express.js framework for building web applications' },
    { line: 2, code: 'const app = express();', explanation: 'Creates an Express application instance' },
    { line: 3, code: 'app.listen(3000);', explanation: 'Starts the server on port 3000' },
  ];

  return (
    <div className="space-y-3">
      {codeLines.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-gray-900/70 rounded-lg p-3 border border-orange-500/30"
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-orange-400 font-mono text-xs font-bold">L{item.line}</span>
            <code className="text-cyan-400 text-xs font-mono flex-1">{item.code}</code>
          </div>
          <p className="text-gray-400 text-xs pl-6 leading-relaxed">{item.explanation}</p>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-2 mt-4"
      >
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-green-400 text-xs font-semibold">Quiz: 9/10</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <MessageSquare className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-purple-400 text-xs font-semibold">12 Viva Qs</p>
        </div>
      </motion.div>
    </div>
  );
};

// Code Editor Demo
const CodeEditorDemo = () => {
  const code = `function calculateTotal(items) {\n  return items.reduce((sum, item) => {\n    return sum + item.price;\n  }, 0);\n}`;
  const { displayText, isComplete } = useTypingEffect(code, 20, 300);

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-950 rounded-lg p-4 border border-indigo-500/30"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-500 text-xs ml-2 font-mono">calculator.js</span>
        </div>
        <pre className="text-cyan-400 text-xs font-mono leading-relaxed">
          {displayText}
          {!isComplete && <span className="animate-pulse">|</span>}
        </pre>
      </motion.div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 text-xs font-semibold mb-1">AI Suggestion</p>
                <p className="text-gray-300 text-xs">Add error handling for empty arrays</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Projects Demo
const ProjectsDemo = () => {
  const projects = [
    { name: 'Todo App', status: 'live', color: 'green' },
    { name: 'E-commerce', status: 'building', color: 'yellow' },
    { name: 'Blog Platform', status: 'live', color: 'green' },
  ];

  return (
    <div className="space-y-2">
      {projects.map((project, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="bg-gray-900/70 rounded-lg p-3 border border-green-500/30 flex items-center justify-between group hover:border-green-400/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-white text-sm font-medium">{project.name}</p>
              <p className="text-gray-400 text-xs">Last updated 2h ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${project.color === 'green' ? 'bg-green-400' : 'bg-yellow-400'} ${project.color === 'yellow' ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-medium ${project.color === 'green' ? 'text-green-400' : 'text-yellow-400'}`}>
              {project.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main Advanced Demo Component
export const AdvancedInteractiveDemo = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);

  const steps = [
    {
      title: 'AI Project Generator',
      description: 'Watch AI create a complete app from your description',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      demo: <AIGeneratorDemo />
    },
    {
      title: 'Architecture Generator',
      description: 'Generate professional system diagrams automatically',
      icon: Network,
      color: 'from-blue-500 to-cyan-500',
      demo: <ArchitectureDemo />
    },
    {
      title: 'Learning Mode',
      description: 'Understand code with line-by-line explanations',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      demo: <LearningModeDemo />
    },
    {
      title: 'Code Editor',
      description: 'Professional IDE with AI-powered assistance',
      icon: Code,
      color: 'from-indigo-500 to-purple-500',
      demo: <CodeEditorDemo />
    },
    {
      title: 'My Projects',
      description: 'Manage and deploy your projects instantly',
      icon: FolderOpen,
      color: 'from-green-500 to-emerald-500',
      demo: <ProjectsDemo />
    }
  ];

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${currentStep.color} rounded-lg flex items-center justify-center shadow-lg`}>
              <StepIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{currentStep.title}</h3>
              <p className="text-gray-400 text-sm">{currentStep.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-purple-500/50 hover:bg-purple-500/10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6 min-h-[400px] flex items-center justify-center bg-gradient-to-b from-transparent to-black/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            {currentStep.demo}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Indicators */}
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
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
              aria-label={`Go to ${step.title}`}
            />
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs">
          {activeStep + 1} of {steps.length} • {isPlaying ? 'Auto-playing' : 'Paused'}
        </p>
      </div>
    </div>
  );
};
