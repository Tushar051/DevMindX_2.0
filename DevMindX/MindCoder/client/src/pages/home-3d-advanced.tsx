import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Stars,
  Html,
  ContactShadows,
  Sky
} from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Code2, 
  Sparkles, 
  Users, 
  Terminal, 
  BookOpen, 
  Network,
  Rocket,
  Zap,
  Play,
  ArrowRight
} from 'lucide-react';
import {
  DNAHelix,
  CodeBlocks,
  PulsingOrbs,
  AnimatedRings,
  DataNodes,
  HolographicText
} from '@/components/3d-scene';

// Loading Component
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-600 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
        <p className="text-white text-xl font-bold animate-pulse">Loading 3D Universe...</p>
      </div>
    </Html>
  );
}

// Main 3D Scene
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 15]} fov={60} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        castShadow
        color="#ffffff"
      />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#10B981" />

      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sky sunPosition={[0, 1, 0]} />
      
      {/* 3D Elements */}
      <HolographicText text="DevMindX" position={[0, 5, -5]} />
      <DNAHelix />
      <CodeBlocks />
      <PulsingOrbs />
      <AnimatedRings />
      <DataNodes />
      
      {/* Ground */}
      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.5}
        scale={50}
        blur={2}
        far={10}
      />
      
      <Environment preset="night" />
    </>
  );
}

// Feature Cards Overlay
function FeatureCards() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Code Generation',
      description: 'Generate complete projects with AI',
      color: 'from-purple-500 to-pink-500',
      link: '/generator'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Code together seamlessly',
      color: 'from-green-500 to-emerald-500',
      link: '/ide'
    },
    {
      icon: Terminal,
      title: 'Integrated Terminal',
      description: 'Run code instantly',
      color: 'from-orange-500 to-yellow-500',
      link: '/ide'
    },
    {
      icon: BookOpen,
      title: 'Learning Mode',
      description: 'Understand your code',
      color: 'from-red-500 to-pink-500',
      link: '/learning-mode'
    },
    {
      icon: Network,
      title: 'Architecture Generator',
      description: 'Visualize system design',
      color: 'from-cyan-500 to-blue-500',
      link: '/architecture'
    },
    {
      icon: Zap,
      title: 'Instant Preview',
      description: 'See changes live',
      color: 'from-yellow-500 to-orange-500',
      link: '/ide'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Link key={index} href={feature.link}>
          <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
            <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:text-blue-300">
              Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Main Component
export default function Home3DAdvanced() {
  const [showFeatures, setShowFeatures] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Code2 className="w-10 h-10 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 w-10 h-10 bg-blue-400 blur-xl opacity-50" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DevMindX
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-blue-400 hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        {!showFeatures && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
            <div className="mb-8">
              <h1 className="text-7xl md:text-9xl font-bold text-white mb-4 drop-shadow-2xl animate-fade-in">
                Build in
              </h1>
              <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
                3D Space
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto drop-shadow-lg">
              Experience the future of development with our immersive 3D platform.
              <br />
              <span className="text-blue-300">Code, collaborate, and create in a new dimension.</span>
            </p>
            <div className="flex gap-6 justify-center pointer-events-auto">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all">
                  Start Building
                  <Rocket className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-10 py-6 backdrop-blur-sm"
                onClick={() => setShowFeatures(true)}
              >
                Explore Features
                <Play className="ml-2 w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Features Section */}
        {showFeatures && (
          <div className="absolute inset-0 z-10 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-8">
              <div className="max-w-7xl w-full">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold text-white mb-4">
                    Powerful Features
                  </h2>
                  <p className="text-xl text-gray-300">
                    Everything you need to build amazing projects
                  </p>
                </div>
                <FeatureCards />
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10"
                    onClick={() => setShowFeatures(false)}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/50 backdrop-blur-xl rounded-full px-8 py-4 border border-white/20 shadow-2xl">
            <p className="text-white text-sm flex items-center gap-4">
              <span>🖱️ Drag to rotate</span>
              <span className="text-gray-400">•</span>
              <span>🔍 Scroll to zoom</span>
              <span className="text-gray-400">•</span>
              <span>✨ Auto-rotating</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-8 right-8 z-10">
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-xs text-gray-300 mt-1">Projects Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  5K+
                </div>
                <div className="text-xs text-gray-300 mt-1">Active Developers</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-xs text-gray-300 mt-1">Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-xs text-gray-300 mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-24 right-6 z-10 flex flex-col gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="bg-black/50 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-black/70 transition-colors"
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          >
            <span className="text-white text-xs">{autoRotate ? '⏸️' : '▶️'}</span>
          </button>
        </div>
      </>
    </div>
  );
}
