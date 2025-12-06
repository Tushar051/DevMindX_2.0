import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { 
  Sparkles, Code, FolderOpen, Zap, Brain, Users, 
  ArrowRight, CheckCircle, Play, Rocket, Terminal, Wand2
} from 'lucide-react';
import Background3D from '@/components/3d-background';
import {
  GradientOrbs,
  GlowCard,
  AnimatedTextGradient,
  FloatingIcon,
  StaggerChildren,
  MagneticButton,
  RevealOnScroll,
  PulseRing
} from '@/components/animated-elements';

export default function HomeEnhanced() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'AI Project Generator',
      description: 'Describe your idea and watch AI create a complete, running application in seconds',
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      action: () => navigate('/generator'),
      buttonText: 'Generate Project',
      features: ['Natural language input', 'Live preview', 'Production-ready code', 'Multiple frameworks'],
      delay: 0.2
    },
    {
      icon: <Code className="w-12 h-12" />,
      title: 'Code Editor',
      description: 'Professional IDE with AI assistance, terminal, and real-time collaboration',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      action: () => navigate('/ide'),
      buttonText: 'Open Editor',
      features: ['Monaco editor', 'AI chat help', 'Integrated terminal', 'File management'],
      delay: 0.4
    },
    {
      icon: <FolderOpen className="w-12 h-12" />,
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
      {/* 3D Background */}
      <Suspense fallback={<div className="fixed inset-0 bg-gray-900" />}>
        <Background3D />
      </Suspense>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900 z-10" />
      
      {/* Animated Orbs */}
      <GradientOrbs />

      {/* Content */}
      <div className="relative z-20">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-50"
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
                      className="text-gray-300"
                    >
                      Welcome, <span className="text-purple-400">{user?.username || 'User'}</span>
                    </motion.span>
                    <MagneticButton>
                      <Button onClick={() => navigate('/account')} variant="outline" className="border-purple-500/50">
                        Account
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
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
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
              
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight"
              >
                Build Anything
                <br />
                <AnimatedTextGradient>
                  with AI
                </AnimatedTextGradient>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto"
              >
                From idea to running application in{' '}
                <span className="text-purple-400 font-semibold">seconds</span>.
                <br />
                No coding required.
              </motion.p>

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
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap gap-8 justify-center mt-16"
              >
                {[
                  { label: 'Projects Generated', value: '10K+' },
                  { label: 'Active Users', value: '5K+' },
                  { label: 'Lines of Code', value: '1M+' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center mb-16">
                <motion.h2
                  className="text-5xl font-bold text-white mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  Choose Your <AnimatedTextGradient>Tool</AnimatedTextGradient>
                </motion.h2>
                <p className="text-2xl text-gray-300">
                  Three powerful features, one simple platform
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <GlowCard key={index} delay={feature.delay}>
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all h-full backdrop-blur-sm relative overflow-hidden group">
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    <CardHeader>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                        className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white shadow-2xl relative`}
                      >
                        <PulseRing size="lg" />
                        <div className="relative z-10">
                          {feature.icon}
                        </div>
                      </motion.div>
                      <CardTitle className="text-3xl text-white mb-3">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StaggerChildren className="space-y-3 mb-8">
                        {feature.features.map((item, i) => (
                          <div key={i} className="flex items-center text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </StaggerChildren>
                      <MagneticButton className="w-full">
                        <Button 
                          onClick={feature.action}
                          className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg relative overflow-hidden group`}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {feature.buttonText}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </MagneticButton>
                    </CardContent>
                  </Card>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-sm">
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

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/30 backdrop-blur-xl py-12">
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
