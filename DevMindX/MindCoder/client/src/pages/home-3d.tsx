import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Text3D, 
  Float, 
  MeshDistortMaterial,
  Sphere,
  Box,
  Environment,
  Stars,
  Html,
  useGLTF,
  Center
} from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import * as THREE from 'three';
import { 
  Code2, 
  Sparkles, 
  Users, 
  Terminal, 
  BookOpen, 
  Network,
  Rocket,
  Zap
} from 'lucide-react';

// Animated 3D Logo
function AnimatedLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <MeshDistortMaterial
          color="#3B82F6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

// Floating Feature Cards in 3D
function FeatureCard({ position, icon: Icon, title, description, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshStandardMaterial
          color={hovered ? color : '#ffffff'}
          roughness={0.3}
          metalness={0.5}
        />
        <Html
          transform
          occlude
          position={[0, 0, 0.2]}
          style={{
            width: '180px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <h3 className="font-bold text-sm mb-1 text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </Html>
      </mesh>
    </Float>
  );
}

// Particle System
function Particles() {
  const count = 1000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3B82F6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Animated Grid Floor
function GridFloor() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
        0.5 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial
        color="#1e293b"
        wireframe
        emissive="#3B82F6"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Main 3D Scene
function Scene() {
  const features = [
    {
      position: [-6, 0, -2],
      icon: Sparkles,
      title: 'AI Generation',
      description: 'Generate code with AI',
      color: '#8B5CF6'
    },
    {
      position: [-3, 1, -1],
      icon: Users,
      title: 'Collaboration',
      description: 'Code together in real-time',
      color: '#10B981'
    },
    {
      position: [0, -0.5, 0],
      icon: Terminal,
      title: 'Terminal',
      description: 'Run code instantly',
      color: '#F59E0B'
    },
    {
      position: [3, 1, -1],
      icon: BookOpen,
      title: 'Learning',
      description: 'Understand your code',
      color: '#EF4444'
    },
    {
      position: [6, 0, -2],
      icon: Network,
      title: 'Architecture',
      description: 'Visualize systems',
      color: '#06B6D4'
    }
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={60} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <AnimatedLogo />
      
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
      
      <Particles />
      <GridFloor />
      
      <Environment preset="night" />
    </>
  );
}

// Loading Component
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-semibold">Loading 3D Experience...</p>
      </div>
    </Html>
  );
}

// Main Component
export default function Home3D() {
  const [showUI, setShowUI] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
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
      {showUI && (
        <>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="w-10 h-10 text-blue-400" />
                <span className="text-3xl font-bold text-white">DevMindX</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
              Build in
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                3D Space
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of development with our immersive 3D platform
            </p>
            <div className="flex gap-4 justify-center pointer-events-auto">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8">
                  Start Building
                  <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/ide">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8">
                  Explore IDE
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <p className="text-white text-sm">
                🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click features to explore
              </p>
            </div>
          </div>

          {/* Feature Stats */}
          <div className="absolute bottom-8 right-8 z-10">
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">10K+</div>
                  <div className="text-xs text-gray-300">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">5K+</div>
                  <div className="text-xs text-gray-300">Developers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle UI Button */}
          <button
            onClick={() => setShowUI(!showUI)}
            className="absolute top-6 right-6 z-20 bg-black/50 backdrop-blur-md rounded-full p-3 border border-white/20 hover:bg-black/70 transition-colors"
          >
            <span className="text-white text-sm">Toggle UI</span>
          </button>
        </>
      )}
    </div>
  );
}
