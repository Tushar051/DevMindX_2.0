import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Code, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Globe,
  ShoppingCart,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const demoProjects = [
  {
    id: 'todo',
    name: 'Todo App',
    description: 'A modern task management app with drag & drop',
    prompt: 'Create a todo app with drag and drop functionality, categories, due dates, and a beautiful dark theme',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    features: ['Drag & Drop', 'Categories', 'Due Dates', 'Dark Theme', 'Local Storage'],
    icon: <CheckCircle className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-600',
    preview: '/api/placeholder/400/300'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart and payments',
    prompt: 'Build an e-commerce website with product catalog, shopping cart, user authentication, and Stripe payments',
    tech: ['Next.js', 'Node.js', 'MongoDB', 'Stripe'],
    features: ['Product Catalog', 'Shopping Cart', 'User Auth', 'Payments', 'Admin Panel'],
    icon: <ShoppingCart className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-600',
    preview: '/api/placeholder/400/300'
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization platform with interactive charts',
    prompt: 'Create an analytics dashboard with interactive charts, real-time data, and customizable widgets',
    tech: ['React', 'D3.js', 'Python', 'PostgreSQL'],
    features: ['Interactive Charts', 'Real-time Data', 'Custom Widgets', 'Export Data'],
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-600',
    preview: '/api/placeholder/400/300'
  },
  {
    id: 'social',
    name: 'Social Media App',
    description: 'Modern social platform with real-time messaging',
    prompt: 'Build a social media app with user profiles, posts, real-time messaging, and notifications',
    tech: ['React', 'Socket.io', 'Node.js', 'Redis'],
    features: ['User Profiles', 'Posts & Feed', 'Real-time Chat', 'Notifications'],
    icon: <MessageSquare className="w-6 h-6" />,
    gradient: 'from-orange-500 to-red-600',
    preview: '/api/placeholder/400/300'
  }
];

export default function AIDemoShowcase() {
  const [selectedProject, setSelectedProject] = useState(demoProjects[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      // Scroll to AI Generator section
      const aiGeneratorSection = document.getElementById('ai-generator');
      if (aiGeneratorSection) {
        aiGeneratorSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2000);
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900/50 to-blue-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-medium">Live Demo</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            See AI Generation in
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Action
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Watch how our AI transforms simple descriptions into complete, production-ready applications
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Selection */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Choose a Project</h3>
            <div className="space-y-3">
              {demoProjects.map((project) => (
                <motion.button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedProject.id === project.id
                      ? `bg-gradient-to-r ${project.gradient} border-transparent text-white`
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {project.icon}
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <p className="text-sm opacity-80">{project.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-white">
                        {selectedProject.icon}
                        <span className="ml-3">{selectedProject.name}</span>
                      </CardTitle>
                      <Badge className={`bg-gradient-to-r ${selectedProject.gradient} text-white border-transparent`}>
                        Demo Ready
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Prompt */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">AI Prompt</h4>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 font-mono text-sm">
                          "{selectedProject.prompt}"
                        </p>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Generated Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech.map((tech) => (
                          <Badge key={tech} variant="outline" className="border-gray-600 text-gray-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProject.features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Generated Preview</h4>
                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-center h-48 text-gray-400">
                          <div className="text-center">
                            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">Interactive preview would appear here</p>
                            <p className="text-xs mt-2 opacity-70">Complete with working components and styling</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`w-full bg-gradient-to-r ${selectedProject.gradient} hover:opacity-90 text-white font-semibold py-3 text-lg rounded-lg transition-all transform hover:scale-[1.02] disabled:transform-none`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Generating {selectedProject.name}...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Generate This Project
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
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
              Ready to Build Your Own?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              These are just examples. Describe any project you can imagine and watch our AI bring it to life.
            </p>
            
            <Button
              onClick={() => {
                const aiGeneratorSection = document.getElementById('ai-generator');
                if (aiGeneratorSection) {
                  aiGeneratorSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg rounded-lg transition-all transform hover:scale-105"
            >
              Start Building Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}