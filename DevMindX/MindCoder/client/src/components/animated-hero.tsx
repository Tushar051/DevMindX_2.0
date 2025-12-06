import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code, Zap, Brain, Rocket, Wand2 } from 'lucide-react';

const codeExamples = [
  {
    prompt: "Create a modern todo app with drag & drop",
    tech: "React + TypeScript",
    icon: <Code className="w-4 h-4" />
  },
  {
    prompt: "Build an e-commerce store with payments",
    tech: "Next.js + Stripe",
    icon: <Zap className="w-4 h-4" />
  },
  {
    prompt: "Design a social media dashboard",
    tech: "Vue.js + Socket.io",
    icon: <Brain className="w-4 h-4" />
  },
  {
    prompt: "Generate a portfolio website",
    tech: "React + Framer Motion",
    icon: <Rocket className="w-4 h-4" />
  }
];

export default function AnimatedHero() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentExample((prev) => (prev + 1) % codeExamples.length);
        setIsTyping(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-medium">AI-Powered Development</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Build Anything with{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Just Words
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Simply describe what you want to build and watch our AI create complete, 
              production-ready applications in seconds. No coding experience required.
            </motion.p>

            {/* Feature highlights */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { icon: <Brain className="w-5 h-5" />, text: "AI-Powered" },
                { icon: <Zap className="w-5 h-5" />, text: "Lightning Fast" },
                { icon: <Code className="w-5 h-5" />, text: "Production Ready" },
                { icon: <Wand2 className="w-5 h-5" />, text: "No Code Needed" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-300">
                  <div className="text-purple-400">{feature.icon}</div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Interactive demo */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
              {/* Mock terminal header */}
              <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm font-mono">AI Generator</span>
              </div>

              {/* Animated typing demo */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <span className="text-purple-400">You:</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentExample}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-mono text-sm"
                    >
                      {codeExamples[currentExample].prompt}
                    </motion.span>
                  </AnimatePresence>
                  {isTyping && (
                    <motion.span
                      className="w-2 h-4 bg-purple-400"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-300">
                  <span className="text-blue-400">AI:</span>
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="font-mono text-sm">
                      Creating your {codeExamples[currentExample].tech} app...
                    </span>
                  </motion.div>
                </div>

                {/* Generated files animation */}
                <motion.div
                  className="bg-gray-900/50 rounded-lg p-4 space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 1.5 }}
                >
                  {['package.json', 'src/App.tsx', 'src/components/', 'src/pages/', 'README.md'].map((file, index) => (
                    <motion.div
                      key={file}
                      className="flex items-center space-x-2 text-green-400 text-sm font-mono"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7 + index * 0.1 }}
                    >
                      <span className="text-green-500">✓</span>
                      <span>{file}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex items-center space-x-2 text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  <Rocket className="w-4 h-4" />
                  <span className="font-mono text-sm">Project ready! 🎉</span>
                </motion.div>
              </div>
            </div>

            {/* Floating elements around the demo */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center"
              animate={{
                y: [0, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Code className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}