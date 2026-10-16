import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { BuddyCharacter } from './BuddyCharacter';
import { CHARACTER_STATES } from '../utils/characterStates';

// Holographic futuristic expo stage
function HologramStage() {
  const ringRef = useRef();
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group position={[0, -1.05, 0]}>
      {/* Base dark reflective disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial
          color="#060919"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Rotating concentric neon ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.6, 1.66, 48]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.6} />
      </mesh>

      {/* Inner glowing cyber circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.9, 0.94, 36]} />
        <meshBasicMaterial color="#7f00ff" transparent opacity={0.5} />
      </mesh>

      {/* Center soft emitter glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Floating science energy particles
function FloatingMotes({ count = 40 }) {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 5;
      const y = Math.random() * 3.5 - 1.2;
      const z = (Math.random() - 0.5) * 4;
      const speed = 0.2 + Math.random() * 0.4;
      const scale = 0.02 + Math.random() * 0.03;
      const color = Math.random() > 0.4 ? '#00f2fe' : '#e100ff';
      temp.push({ x, y, z, speed, scale, color, initialY: y });
    }
    return temp;
  }, [count]);

  const groupRef = useRef();

  useFrame((stateContext) => {
    const t = stateContext.clock.getElapsedTime();
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const mesh = children[i];
      const p = particles[i];
      mesh.position.y = p.initialY + Math.sin(t * p.speed + i) * 0.35;
      mesh.position.x = p.x + Math.sin(t * 0.3 + i) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.scale, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('WebGL Rendering issue caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="webgl-fallback-container">
          <div className="webgl-fallback-card">
            <div className="fallback-robot-icon">🤖</div>
            <h3>BUDDY 3D Stage Standby</h3>
            <p>Your browser is running in 2D compatibility mode. All voice, mini-games, and AI features are 100% active!</p>
            <button className="secondary-button" onClick={() => this.setState({ hasError: false })}>
              Retry 3D Stage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function BuddyScene({
  characterState = CHARACTER_STATES.IDLE,
  isSpeaking = false,
  onCharacterClick,
  outfit = { hat: 'none', glasses: 'none', accessory: 'none', aura: 'cyan' },
}) {
  return (
    <WebGLErrorBoundary>
      <div className="buddy-canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [0, 0.3, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          {/* Ambient & Atmosphere */}
          <ambientLight intensity={1.1} color="#3d4e74" />
          <directionalLight
            position={[3, 5, 4]}
            intensity={2.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          {/* Cyber Rim & Fill Lights */}
          <pointLight position={[-3.5, 0.5, -1.5]} intensity={3.5} color="#00f2fe" distance={8} />
          <pointLight position={[3.5, 2.0, -1.5]} intensity={3.0} color="#b5179e" distance={8} />
          <pointLight position={[0, -0.9, 0.5]} intensity={2.0} color="#00f2fe" distance={3} />

          <Suspense fallback={null}>
            {/* Hologram Base Stage */}
            <HologramStage />

            {/* Science Particles */}
            <FloatingMotes count={35} />

            {/* Float container for natural organic micro-hover */}
            <Float
              speed={1.5}
              rotationIntensity={0.12}
              floatIntensity={0.2}
              floatingRange={[-0.05, 0.05]}
            >
              <BuddyCharacter
                state={characterState}
                isSpeaking={isSpeaking}
                onCharacterClick={onCharacterClick}
                outfit={outfit}
              />
            </Float>
          </Suspense>

          {/* Restrained OrbitControls for friendly subtle rotation */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.7}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            dampingFactor={0.05}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
