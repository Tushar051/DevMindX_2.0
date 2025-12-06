import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Network, Download, ArrowLeft, Loader2, Sparkles, Box,
  Database, GitBranch, Layers, Workflow, FileCode, Zap,
  CheckCircle, Eye, Share2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface DiagramData {
  systemArchitecture: string;
  classDiagram: string;
  erDiagram: string;
  sequenceDiagram: string;
  restApiBlueprint: string;
  dataFlowDiagram: string;
  description: string;
}

export default function ArchitectureGenerator() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architectureData, setArchitectureData] = useState<DiagramData | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<'system' | 'class' | 'er' | 'sequence' | 'api' | 'dataflow' | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'class' | 'er' | 'sequence' | 'api' | 'dataflow'>('system');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    if (!selectedDiagram) {
      toast({
        title: 'Selection Required',
        description: 'Please select a diagram type first',
        variant: 'destructive'
      });
      return;
    }

    if (!projectInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please describe your project',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/architecture/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ 
          description: projectInput,
          diagramType: selectedDiagram 
        })
      });

      if (!response.ok) throw new Error('Failed to generate architecture');

      const data = await response.json();
      setArchitectureData(data);
      setActiveTab(selectedDiagram);
      toast({
        title: 'Success!',
        description: `${diagrams.find(d => d.id === selectedDiagram)?.label} generated successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate diagram',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = () => {
    if (!architectureData) return;

    const content = `# Architecture Documentation

## System Architecture
\`\`\`mermaid
${architectureData.systemArchitecture}
\`\`\`

## Class Diagram
\`\`\`mermaid
${architectureData.classDiagram}
\`\`\`

## ER Diagram
\`\`\`mermaid
${architectureData.erDiagram}
\`\`\`

## Sequence Diagram
\`\`\`mermaid
${architectureData.sequenceDiagram}
\`\`\`

## REST API Blueprint
${architectureData.restApiBlueprint}

## Data Flow Diagram
\`\`\`mermaid
${architectureData.dataFlowDiagram}
\`\`\`

## Description
${architectureData.description}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-documentation.md';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Architecture documentation saved successfully'
    });
  };

  const diagrams = [
    { id: 'system', label: 'System Architecture', icon: Network, color: 'from-blue-500 to-cyan-500' },
    { id: 'class', label: 'Class Diagram', icon: Box, color: 'from-purple-500 to-pink-500' },
    { id: 'er', label: 'ER Diagram', icon: Database, color: 'from-green-500 to-emerald-500' },
    { id: 'sequence', label: 'Sequence Diagram', icon: GitBranch, color: 'from-orange-500 to-red-500' },
    { id: 'api', label: 'REST API', icon: Workflow, color: 'from-yellow-500 to-orange-500' },
    { id: 'dataflow', label: 'Data Flow', icon: Layers, color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Architecture Background */}
      <div className="fixed inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="arch-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
              <circle cx="0" cy="0" r="2" fill="rgba(59, 130, 246, 0.5)"/>
              <circle cx="60" cy="0" r="2" fill="rgba(59, 130, 246, 0.5)"/>
              <circle cx="0" cy="60" r="2" fill="rgba(59, 130, 246, 0.5)"/>
            </pattern>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-grid)" />
          
          {/* Animated connection lines */}
          {[...Array(15)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#line-gradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
          
          {/* Animated nodes */}
          {[...Array(25)].map((_, i) => (
            <motion.g key={i}>
              <motion.circle
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="6"
                fill="rgba(59, 130, 246, 0.8)"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
              <motion.circle
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="12"
                fill="none"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="2"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.4, 0, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Mouse Spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Floating Architecture Icons */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 0.3, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            {i % 4 === 0 && <Network className="w-6 h-6 text-blue-400" />}
            {i % 4 === 1 && <Database className="w-6 h-6 text-green-400" />}
            {i % 4 === 2 && <Box className="w-6 h-6 text-purple-400" />}
            {i % 4 === 3 && <Layers className="w-6 h-6 text-orange-400" />}
          </motion.div>
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
                  className="text-white hover:text-blue-400"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <div className="flex items-center space-x-2">
                  <Network className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">Architecture Generator</span>
                </div>
              </div>
              {architectureData && (
                <Button
                  onClick={handleDownloadAll}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
          {!architectureData ? (
            // Input Section
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gray-800/50 border-blue-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl text-white flex items-center">
                    <Sparkles className="w-8 h-8 mr-3 text-blue-400" />
                    Generate Architecture Diagram
                  </CardTitle>
                  <p className="text-gray-300 text-lg mt-2">
                    Step 1: Select diagram type • Step 2: Describe your project • Step 3: Generate
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Diagram Selection */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                      Select Diagram Type
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {diagrams.map((diagram) => (
                        <motion.button
                          key={diagram.id}
                          onClick={() => setSelectedDiagram(diagram.id as any)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedDiagram === diagram.id
                              ? `border-blue-500 bg-blue-500/20`
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${diagram.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <diagram.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm">{diagram.label}</h4>
                              <p className="text-gray-400 text-xs truncate">
                                {diagram.id === 'system' && 'High-level overview'}
                                {diagram.id === 'class' && 'OOP design'}
                                {diagram.id === 'er' && 'Database schema'}
                                {diagram.id === 'sequence' && 'User flows'}
                                {diagram.id === 'api' && 'API endpoints'}
                                {diagram.id === 'dataflow' && 'Data movement'}
                              </p>
                            </div>
                            {selectedDiagram === diagram.id && (
                              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Project Description */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                      Describe Your Project
                    </h3>
                    <Textarea
                      value={projectInput}
                      onChange={(e) => setProjectInput(e.target.value)}
                      placeholder={
                        selectedDiagram === 'system' ? "Describe your system architecture (e.g., 'E-commerce platform with microservices, load balancer, API gateway, databases, and caching')" :
                        selectedDiagram === 'class' ? "Describe your classes and their relationships (e.g., 'User, Product, Order classes with authentication and payment methods')" :
                        selectedDiagram === 'er' ? "Describe your database entities (e.g., 'Users, Products, Orders, Reviews tables with relationships')" :
                        selectedDiagram === 'sequence' ? "Describe the user flow (e.g., 'User login process: enter credentials, validate, create session, redirect to dashboard')" :
                        selectedDiagram === 'api' ? "Describe your API endpoints (e.g., 'REST API for user management, products, orders, and payments')" :
                        selectedDiagram === 'dataflow' ? "Describe how data flows (e.g., 'User input → validation → processing → database → response')" :
                        "First select a diagram type above, then describe your project here..."
                      }
                      className="min-h-[200px] bg-white/50 border-blue-500/30 text-white"
                      disabled={!selectedDiagram}
                    />
                  </div>

                  {/* Step 3: Generate */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedDiagram}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating {diagrams.find(d => d.id === selectedDiagram)?.label}...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate {selectedDiagram ? diagrams.find(d => d.id === selectedDiagram)?.label : 'Diagram'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setLocation('/projects')}
                      variant="outline"
                      className="border-blue-500/50 text-white hover:bg-blue-500/10"
                    >
                      Load from Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                {diagrams.map((diagram) => (
                  <Button
                    key={diagram.id}
                    onClick={() => setActiveTab(diagram.id as any)}
                    variant={activeTab === diagram.id ? 'default' : 'outline'}
                    className={`${
                      activeTab === diagram.id
                        ? `bg-gradient-to-r ${diagram.color}`
                        : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    } whitespace-nowrap`}
                  >
                    <diagram.icon className="w-4 h-4 mr-2" />
                    {diagram.label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-gray-800/50 border-blue-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center">
                          {diagrams.find(d => d.id === activeTab)?.icon && 
                            React.createElement(diagrams.find(d => d.id === activeTab)!.icon, { 
                              className: "w-6 h-6 mr-2 text-blue-400" 
                            })
                          }
                          {diagrams.find(d => d.id === activeTab)?.label}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50"
                            onClick={() => {
                              const content = activeTab === 'api' 
                                ? architectureData.restApiBlueprint 
                                : architectureData[activeTab === 'system' ? 'systemArchitecture' : 
                                                   activeTab === 'class' ? 'classDiagram' : 
                                                   activeTab === 'er' ? 'erDiagram' : 
                                                   activeTab === 'sequence' ? 'sequenceDiagram' : 'dataFlowDiagram'];
                              navigator.clipboard.writeText(content);
                              toast({ title: 'Copied!', description: 'Diagram copied to clipboard' });
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/50 rounded-lg p-6 min-h-[500px]">
                        <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                          {activeTab === 'system' && architectureData.systemArchitecture}
                          {activeTab === 'class' && architectureData.classDiagram}
                          {activeTab === 'er' && architectureData.erDiagram}
                          {activeTab === 'sequence' && architectureData.sequenceDiagram}
                          {activeTab === 'api' && architectureData.restApiBlueprint}
                          {activeTab === 'dataflow' && architectureData.dataFlowDiagram}
                        </pre>
                      </div>
                      
                      {/* Description */}
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                          <FileCode className="w-5 h-5 mr-2 text-blue-400" />
                          About This Diagram
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {architectureData.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                  <CardContent className="p-6">
                    <CheckCircle className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-white font-semibold mb-2">All Diagrams Generated</h3>
                    <p className="text-gray-400 text-sm">6 comprehensive architecture diagrams ready</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <CardContent className="p-6">
                    <Download className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="text-white font-semibold mb-2">Download Ready</h3>
                    <p className="text-gray-400 text-sm">Export as markdown with Mermaid diagrams</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-6">
                    <Share2 className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-white font-semibold mb-2">Share & Collaborate</h3>
                    <p className="text-gray-400 text-sm">Copy diagrams to share with your team</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
