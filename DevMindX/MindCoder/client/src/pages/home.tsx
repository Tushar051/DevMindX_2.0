import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { 
  Sparkles, Code, FolderOpen, Zap, Brain, Users, 
  ArrowRight, CheckCircle, Play, Rocket 
} from 'lucide-react';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import ScrollDemoSection from '@/components/scroll-demo-section';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'AI Project Generator',
      description: 'Describe your idea and watch AI create a complete, running application in seconds',
      gradient: 'from-purple-500 to-pink-500',
      action: () => navigate('/generator'),
      buttonText: 'Generate Project',
      features: ['Natural language input', 'Live preview', 'Production-ready code', 'Multiple frameworks']
    },
    {
      icon: <Code className="w-12 h-12" />,
      title: 'Code Editor',
      description: 'Professional IDE with AI assistance, terminal, and real-time collaboration',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/ide'),
      buttonText: 'Open Editor',
      features: ['Monaco editor', 'AI chat help', 'Integrated terminal', 'File management']
    },
    {
      icon: <FolderOpen className="w-12 h-12" />,
      title: 'My Projects',
      description: 'Manage all your projects in one place with quick access and preview',
      gradient: 'from-green-500 to-emerald-500',
      action: () => navigate('/projects'),
      buttonText: 'View Projects',
      features: ['Quick access', 'Live preview', 'Easy sharing', 'Version history']
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Describe Your Idea',
      description: 'Tell AI what you want to build in plain English',
      icon: <Brain className="w-8 h-8" />
    },
    {
      number: '2',
      title: 'Watch It Generate',
      description: 'AI creates your complete project with live preview',
      icon: <Zap className="w-8 h-8" />
    },
    {
      number: '3',
      title: 'Edit & Deploy',
      description: 'Customize in the IDE and deploy instantly',
      icon: <Rocket className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Code className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">DevMindX</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300">Welcome, {user?.username || 'User'}</span>
                  <Button onClick={() => navigate('/account')} variant="outline">
                    Account
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} variant="ghost" className="text-white">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')} className="bg-purple-600 hover:bg-purple-700">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Beams */}
      <BackgroundBeamsWithCollision className="bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-medium">AI-Powered Development Platform</span>
            </div>
            
            <TypewriterEffectSmooth 
              words={[
                { text: "Build" },
                { text: "Anything" },
                { text: "with" },
                { text: "AI", className: "bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent" }
              ]}
              className="text-6xl md:text-7xl font-bold text-white mb-6"
              cursorClassName="bg-purple-500"
            />
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              From idea to running application in seconds. No coding required.
            </p>

            {!isAuthenticated && (
              <Button 
                size="lg"
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>

      {/* Feature Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Tool
            </h2>
            <p className="text-xl text-gray-300">
              Three powerful features, one simple platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all h-full group hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={feature.action}
                      className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-semibold`}
                    >
                      {feature.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300">
              From idea to application in 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {step.number}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full -z-10 animate-pulse" />
                </div>
                <div className="text-purple-400 mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Demo Section */}
      <ScrollDemoSection />

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-10 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of developers using AI to build faster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/generator' : '/signup')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Building Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/projects')}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                View Examples
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Code className="w-6 h-6 text-purple-400" />
              <span className="text-white font-semibold">DevMindX</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2025 DevMindX. Built with AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
