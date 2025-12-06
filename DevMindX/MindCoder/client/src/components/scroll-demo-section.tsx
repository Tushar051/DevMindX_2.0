import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";
import { Brain, Code, Rocket, Sparkles } from "lucide-react";

export default function ScrollDemoSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  // Feature slides that change based on scroll progress
  const features = [
    {
      title: "Architecture Generator",
      description: "Generate professional system diagrams automatically",
      icon: <Brain className="w-12 h-12" />,
      color: "from-purple-500 to-pink-500",
      range: [0, 0.25]
    },
    {
      title: "AI Code Generation",
      description: "Transform natural language into production-ready code",
      icon: <Code className="w-12 h-12" />,
      color: "from-blue-500 to-cyan-500",
      range: [0.25, 0.5]
    },
    {
      title: "Real-time Collaboration",
      description: "Work together with AI assistants in real-time",
      icon: <Sparkles className="w-12 h-12" />,
      color: "from-green-500 to-emerald-500",
      range: [0.5, 0.75]
    },
    {
      title: "Instant Deployment",
      description: "Deploy your applications with a single click",
      icon: <Rocket className="w-12 h-12" />,
      color: "from-orange-500 to-red-500",
      range: [0.75, 1]
    }
  ];

  // Create transforms for each feature outside of the map
  const feature1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.25], [0, 1, 1, 0]);
  const feature1Scale = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.25], [0.8, 1, 1, 0.8]);
  
  const feature2Opacity = useTransform(scrollYProgress, [0.25, 0.35, 0.4, 0.5], [0, 1, 1, 0]);
  const feature2Scale = useTransform(scrollYProgress, [0.25, 0.35, 0.4, 0.5], [0.8, 1, 1, 0.8]);
  
  const feature3Opacity = useTransform(scrollYProgress, [0.5, 0.6, 0.65, 0.75], [0, 1, 1, 0]);
  const feature3Scale = useTransform(scrollYProgress, [0.5, 0.6, 0.65, 0.75], [0.8, 1, 1, 0.8]);
  
  const feature4Opacity = useTransform(scrollYProgress, [0.75, 0.85, 0.9, 1], [0, 1, 1, 0]);
  const feature4Scale = useTransform(scrollYProgress, [0.75, 0.85, 0.9, 1], [0.8, 1, 1, 0.8]);

  const featureTransforms = [
    { opacity: feature1Opacity, scale: feature1Scale },
    { opacity: feature2Opacity, scale: feature2Scale },
    { opacity: feature3Opacity, scale: feature3Scale },
    { opacity: feature4Opacity, scale: feature4Scale }
  ];

  return (
    <div
      className="h-[300vh] bg-gradient-to-b from-gray-900 via-black to-gray-900 w-full relative overflow-clip"
      ref={ref}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
        title="See It In Action"
        description="Scroll down to watch how DevMindX transforms ideas into reality"
      />
      
      {/* Feature cards that appear based on scroll */}
      <div className="sticky top-[50vh] z-50 flex justify-center items-center pointer-events-none px-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            style={{ 
              opacity: featureTransforms[index].opacity, 
              scale: featureTransforms[index].scale 
            }}
            className="absolute bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-2 border-gray-600 rounded-3xl p-10 max-w-lg w-full shadow-2xl"
          >
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-white shadow-2xl transform hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-300 text-xl leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="sticky top-[90vh] z-40 flex justify-center pointer-events-none">
        <motion.div 
          className="bg-purple-600/20 border border-purple-500/50 rounded-full px-6 py-3 backdrop-blur-sm"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-purple-300 text-sm font-medium">Scroll to explore features ↓</p>
        </motion.div>
      </div>
    </div>
  );
}
