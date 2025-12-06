import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Animated DNA Helix
export function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 20;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const spheres = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4;
      const y = (i / count) * 10 - 5;
      const x = Math.cos(angle) * 2;
      const z = Math.sin(angle) * 2;
      arr.push({ position: [x, y, z], color: i % 2 === 0 ? '#3B82F6' : '#8B5CF6' });
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef} position={[8, 0, -5]}>
      {spheres.map((sphere, i) => (
        <Sphere key={i} args={[0.2, 16, 16]} position={sphere.position as [number, number, number]}>
          <meshStandardMaterial color={sphere.color} emissive={sphere.color} emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

// Rotating Code Blocks
export function CodeBlocks() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const codeSnippets = [
    'const ai = new AI()',
    'function build()',
    'class DevMindX',
    'async deploy()',
    'import { code }',
    'export default'
  ];

  return (
    <group ref={groupRef} position={[-8, 0, -5]}>
      {codeSnippets.map((code, i) => {
        const angle = (i / codeSnippets.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Float key={i} speed={2} rotationIntensity={0.5}>
            <Text
              position={[x, 0, z]}
              fontSize={0.3}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              rotation={[0, -angle, 0]}
            >
              {code}
            </Text>
          </Float>
        );
      })}
    </group>
  );
}

// Pulsing Orbs
export function PulsingOrbs() {
  const orbs = useMemo(() => [
    { position: [-4, 3, -3], color: '#3B82F6', scale: 1 },
    { position: [4, 3, -3], color: '#8B5CF6', scale: 1.2 },
    { position: [0, 4, -5], color: '#10B981', scale: 0.8 },
    { position: [-2, 2, 2], color: '#F59E0B', scale: 1.1 },
    { position: [2, 2, 2], color: '#EF4444', scale: 0.9 }
  ], []);

  return (
    <>
      {orbs.map((orb, i) => (
        <PulsingOrb key={i} {...orb} />
      ))}
    </>
  );
}

function PulsingOrb({ position, color, scale }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Animated Rings
export function AnimatedRings() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      {[1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i * 1.5, 0.05, 16, 100]} />
          <meshStandardMaterial
            color="#3B82F6"
            emissive="#3B82F6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating Data Nodes
export function DataNodes() {
  const count = 50;
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 20
        ],
        speed: Math.random() * 0.5 + 0.5
      });
    }
    return arr;
  }, []);

  return (
    <>
      {nodes.map((node, i) => (
        <DataNode key={i} position={node.position} speed={node.speed} />
      ))}
    </>
  );
}

function DataNode({ position, speed }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial
        color="#3B82F6"
        emissive="#3B82F6"
        emissiveIntensity={0.3}
        wireframe
      />
    </mesh>
  );
}

// Holographic Text
export function HolographicText({ text, position }: { text: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3}>
      <Text
        ref={meshRef}
        position={position}
        fontSize={1}
        color="#3B82F6"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </Float>
  );
}
