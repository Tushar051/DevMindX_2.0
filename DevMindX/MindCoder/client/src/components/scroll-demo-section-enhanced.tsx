import React, { useRef } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { Brain, Code, Rocket, Sparkles, Zap, Layers, Terminal, Play } from "lucide-react";

export default function ScrollDemoSectionEnhanced() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring animation for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.0001
  });

  // Demo projects that showcase platform capabilities
  const demos = [
    {
      title: "E-Commerce Platform",
      description: "Full-featured online store with cart, checkout, and admin panel",
      icon: <Sparkles className="w-8 h-8" />,
      gradient: "from-purple-500 via-pink-500 to-red-500",
      features: ["Product Management", "Payment Integration", "Order Tracking", "Admin Dashboard"],
      image: "🛍️",
      tech: ["React", "Node.js", "Stripe", "MongoDB"]
    },
    {
      title: "Social Media App",
      description: "Connect with friends, share posts, and engage with content",
      icon: <Code className="w-8 h-8" />,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      features: ["Real-time Chat", "Post Feed", "User Profiles", "Notifications"],
      image: "💬",
      tech: ["React", "Socket.io", "Express", "PostgreSQL"]
    },
    {
      title: "Project Management",
      description: "Organize tasks, track progress, and collaborate with teams",
      icon: <Layers className="w-8 h-8" />,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      features: ["Kanban Boards", "Time Tracking", "Team Collaboration", "Reports"],
      image: "📊",
      tech: ["Vue.js", "Firebase", "Tailwind", "Chart.js"]
    },
    {
      title: "AI Chat Assistant",
      description: "Intelligent chatbot with natural language understanding",
      icon: <Brain className="w-8 h-8" />,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      features: ["NLP Processing", "Context Awareness", "Multi-language", "Voice Input"],
      image: "🤖",
      tech: ["Python", "OpenAI", "FastAPI", "Redis"]
    },
    {
      title: "Analytics Dashboard",
      description: "Real-time data visualization and business intelligence",
      icon: <Terminal className="w-8 h-8" />,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      features: ["Live Charts", "Custom Reports", "Data Export", "Alerts"],
      image: "📈",
      tech: ["Angular", "D3.js", "GraphQL", "InfluxDB"]
    }
  ];

  // Create individual transforms for each demo with smooth fade in/out
  const demo1Opacity = useTransform(smoothProgress, [0, 0.1, 0.18, 0.2], [0, 1, 1, 0]);
  const demo1Y = useTransform(smoothProgress, [0, 0.1, 0.18, 0.2], [50, 0, 0, -50]);
  const demo1Scale = useTransform(smoothProgress, [0, 0.1, 0.18, 0.2], [0.9, 1, 1, 0.9]);

  const demo2Opacity = useTransform(smoothProgress, [0.18, 0.28, 0.38, 0.4], [0, 1, 1, 0]);
  const demo2Y = useTransform(smoothProgress, [0.18, 0.28, 0.38, 0.4], [50, 0, 0, -50]);
  const demo2Scale = useTransform(smoothProgress, [0.18, 0.28, 0.38, 0.4], [0.9, 1, 1, 0.9]);

  const demo3Opacity = useTransform(smoothProgress, [0.38, 0.48, 0.58, 0.6], [0, 1, 1, 0]);
  const demo3Y = useTransform(smoothProgress, [0.38, 0.48, 0.58, 0.6], [50, 0, 0, -50]);
  const demo3Scale = useTransform(smoothProgress, [0.38, 0.48, 0.58, 0.6], [0.9, 1, 1, 0.9]);

  const demo4Opacity = useTransform(smoothProgress, [0.58, 0.68, 0.78, 0.8], [0, 1, 1, 0]);
  const demo4Y = useTransform(smoothProgress, [0.58, 0.68, 0.78, 0.8], [50, 0, 0, -50]);
  const demo4Scale = useTransform(smoothProgress, [0.58, 0.68, 0.78, 0.8], [0.9, 1, 1, 0.9]);

  const demo5Opacity = useTransform(smoothProgress, [0.78, 0.88, 0.98, 1], [0, 1, 1, 0]);
  const demo5Y = useTransform(smoothProgress, [0.78, 0.88, 0.98, 1], [50, 0, 0, -50]);
  const demo5Scale = useTransform(smoothProgress, [0.78, 0.88, 0.98, 1], [0.9, 1, 1, 0.9]);

  const demoTransforms = [
    { opacity: demo1Opacity, y: demo1Y, scale: demo1Scale },
    { opacity: demo2Opacity, y: demo2Y, scale: demo2Scale },
    { opacity: demo3Opacity, y: demo3Y, scale: demo3Scale },
    { opacity: demo4Opacity, y: demo4Y, scale: demo4Scale },
    { opacity: demo5Opacity, y: demo5Y, scale: demo5Scale }
  ];

  // Background parallax effect
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -300]);
  const backgroundOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
      style={{ height: "600vh" }}
    >
      {/* Animated background */}
      <motion.div 
        className="sticky top-0 h-screen w-full"
        style={{ y: backgroundY, opacity: backgroundOpacity }}
      >
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </motion.div>

      {/* Section title */}
      <div className="sticky top-20 z-10 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">See It In Action</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Scroll to explore real projects built with DevMindX
          </p>
        </motion.div>
      </div>

      {/* Demo cards */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 pointer-events-none">
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          {demos.map((demo, index) => (
            <motion.div
              key={index}
              style={{
                opacity: demoTransforms[index].opacity,
                y: demoTransforms[index].y,
                scale: demoTransforms[index].scale,
              }}
              className="absolute w-full flex items-center justify-center"
            >
              <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-4xl border-2 border-purple-500/20 pointer-events-auto"
                style={{
                  boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 100px rgba(139, 92, 246, 0.1)'
                }}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left side - Info */}
                  <div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${demo.gradient} mb-6 pulse-glow`}>
                      {demo.icon}
                    </div>
                    
                    <h3 className="text-4xl font-bold text-white mb-4">
                      {demo.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {demo.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {demo.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {demo.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <motion.button 
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center bg-gradient-to-r ${demo.gradient} text-white transition-all hover:scale-105 hover:shadow-2xl`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Try This Demo
                    </motion.button>
                  </div>

                  {/* Right side - Visual */}
                  <div className="relative">
                    <div className={`aspect-square rounded-2xl bg-gradient-to-br ${demo.gradient} p-1`}>
                      <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
                        <div className="text-9xl">{demo.image}</div>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${demo.gradient} rounded-full blur-2xl opacity-50`} />
                    <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br ${demo.gradient} rounded-full blur-3xl opacity-30`} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="glass-card px-6 py-3 rounded-full flex items-center space-x-4">
          <span className="text-sm text-gray-300">Scroll Progress</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
              style={{ scaleX: smoothProgress, transformOrigin: "left" }}
            />
          </div>
          <motion.span 
            className="text-sm font-semibold text-purple-400"
            style={{ 
              opacity: useTransform(smoothProgress, [0, 1], [0.5, 1])
            }}
          >
            {demos[Math.min(Math.floor(scrollYProgress.get() * demos.length), demos.length - 1)]?.title.split(' ')[0]}
          </motion.span>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0]) }}
      >
        <div className="badge-ai px-4 py-2">
          <span className="text-sm">Scroll to explore ↓</span>
        </div>
      </motion.div>
    </div>
  );
}
