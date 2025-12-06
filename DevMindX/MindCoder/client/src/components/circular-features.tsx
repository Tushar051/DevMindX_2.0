import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Layers,
  MessageSquare,
  Sparkles,
  Code,
  FolderOpen,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  route: string;
  angle: number;
  number: number;
}

export function CircularFeatures() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'research',
      icon: <Brain className="w-8 h-8" />,
      title: 'Research Engine',
      description: 'AI-powered research and analysis',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      route: '/research',
      angle: 0,
      number: 1
    },
    {
      id: 'architecture',
      icon: <Layers className="w-8 h-8" />,
      title: 'Architecture',
      description: 'Generate system blueprints',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      route: '/architecture',
      angle: 60,
      number: 2
    },
    {
      id: 'learning',
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Learning Mode',
      description: 'Understand code deeply',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      route: '/learning-mode',
      angle: 120,
      number: 3
    },
    {
      id: 'generator',
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Project Generator',
      description: 'Create projects instantly',
      gradient: 'from-purple-500 via-purple-600 to-pink-500',
      route: '/generator',
      angle: 180,
      number: 4
    },
    {
      id: 'ide',
      icon: <Code className="w-8 h-8" />,
      title: 'Code Editor',
      description: 'Professional IDE',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      route: '/ide',
      angle: 240,
      number: 5
    },
    {
      id: 'projects',
      icon: <FolderOpen className="w-8 h-8" />,
      title: 'My Projects',
      description: 'Manage your work',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      route: '/projects',
      angle: 300,
      number: 6
    }
  ];

  const radius = 280; // Distance from center
  const centerSize = 180; // Size of center circle

  const getPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature.id);
    setTimeout(() => {
      navigate(feature.route);
    }, 300);
  };

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {features.map((feature) => {
          const pos = getPosition(feature.angle);
          return (
            <motion.div
              key={`glow-${feature.id}`}
              className={`absolute w-64 h-64 rounded-full blur-3xl bg-gradient-to-r ${feature.gradient} opacity-0`}
              style={{
                left: `calc(50% + ${pos.x}px - 128px)`,
                top: `calc(50% + ${pos.y}px - 128px)`,
              }}
              animate={{
                opacity: hoveredFeature === feature.id ? 0.3 : 0,
                scale: hoveredFeature === feature.id ? 1.2 : 1,
              }}
              transition={{ duration: 0.5 }}
            />
          );
        })}
      </div>

      {/* Center Circle */}
      <motion.div
        className="absolute z-10"
        animate={{
          scale: hoveredFeature ? 0.95 : 1,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30 
        }}
      >
        <div
          className="relative rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20 flex items-center justify-center overflow-hidden"
          style={{ width: centerSize, height: centerSize }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Center content */}
          <div className="relative z-10 text-center p-6">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-3" />
            </motion.div>
            <motion.h3 
              className="text-white font-bold text-xl mb-1"
              animate={{
                opacity: hoveredFeature ? 0.7 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              DevMindX
            </motion.h3>
            <motion.p 
              className="text-gray-400 text-sm"
              animate={{
                opacity: hoveredFeature ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {hoveredFeature ? 'Explore feature' : 'Choose a feature'}
            </motion.p>
          </div>

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2" />
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Circles */}
      {features.map((feature) => {
        const pos = getPosition(feature.angle);
        const isHovered = hoveredFeature === feature.id;
        const isSelected = selectedFeature === feature.id;

        return (
          <motion.div
            key={feature.id}
            className="absolute cursor-pointer"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isSelected ? 1.3 : isHovered ? 1.15 : 1,
              opacity: 1,
            }}
            transition={{
              scale: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
              },
              opacity: { 
                delay: feature.angle / 600,
                duration: 0.5 
              },
            }}
            whileHover={{ scale: 1.15 }}
            onHoverStart={() => setHoveredFeature(feature.id)}
            onHoverEnd={() => setHoveredFeature(null)}
            onClick={() => handleFeatureClick(feature)}
          >
            {/* Feature circle */}
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              {/* Outer glow ring */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${feature.gradient} blur-xl`}
                animate={{
                  scale: isHovered ? 1.4 : 1,
                  opacity: isHovered ? 0.7 : 0.3,
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
              />

              {/* Main circle */}
              <motion.div
                className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 flex items-center justify-center overflow-hidden shadow-2xl`}
                animate={{
                  borderColor: isHovered
                    ? ['rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(139, 92, 246, 0.8)']
                    : 'rgba(139, 92, 246, 0.3)',
                }}
                transition={{
                  borderColor: { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                }}
              >
                {/* Number badge */}
                <motion.div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg z-20 border-2 border-gray-900`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{
                    delay: feature.angle / 600 + 0.3,
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                >
                  {feature.number}
                </motion.div>

                {/* Gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                  animate={{
                    opacity: isHovered ? 0.2 : 0,
                  }}
                  transition={{ 
                    duration: 0.4,
                    ease: 'easeInOut'
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="relative z-10 text-white"
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  {feature.icon}
                </motion.div>

                {/* Pulse effect */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${feature.gradient}`}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Feature name - Always visible */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 mt-4 text-center pointer-events-none"
                initial={{ opacity: 0, y: 5 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{
                  opacity: { delay: feature.angle / 600 + 0.2 },
                  scale: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }
                }}
              >
                <h4 className={`text-white font-semibold text-sm mb-1 transition-all duration-300 flex items-center justify-center gap-2 ${
                  isHovered ? 'text-base' : ''
                }`}>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold`}>
                    {feature.number}
                  </span>
                  {feature.title}
                </h4>
              </motion.div>

              {/* Feature description - Shows on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="absolute left-1/2 -translate-x-1/2 mt-12 w-56 text-center pointer-events-none"
                  >
                    <div className="bg-gray-800/95 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 shadow-2xl">
                      <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-medium">
                        <span>Click to explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connecting line to center */}
            <motion.div
              className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
              style={{
                width: radius - 90,
                height: 2,
                transform: `rotate(${feature.angle + 180}deg)`,
              }}
              animate={{
                opacity: isHovered ? 0.4 : 0.15,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut'
              }}
            >
              <div className={`h-full bg-gradient-to-r ${feature.gradient}`} />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Orbital rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          className="absolute border border-purple-500/10 rounded-full pointer-events-none"
          style={{
            width: radius * 2 * (ring * 0.4),
            height: radius * 2 * (ring * 0.4),
          }}
          animate={{
            rotate: ring % 2 === 0 ? 360 : -360,
          }}
          transition={{
            duration: 40 + ring * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute top-0 left-1/2 w-1 h-1 bg-purple-500/30 rounded-full -translate-x-1/2"
          />
        </motion.div>
      ))}
    </div>
  );
}
