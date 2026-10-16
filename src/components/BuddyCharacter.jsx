import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHARACTER_STATES } from '../utils/characterStates';

export function BuddyCharacter({
  state = CHARACTER_STATES.IDLE,
  isSpeaking = false,
  onCharacterClick,
  outfit = { hat: 'none', glasses: 'none', accessory: 'none', aura: 'cyan' },
}) {
  const rootRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const antennaOrbRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftPupilRef = useRef();
  const rightPupilRef = useRef();
  const mouthRef = useRef();
  const mouthAnimRef = useRef({ open: 0.25, width: 1.0 });
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const coreRef = useRef();
  const thrusterRef = useRef();
  const haloRef = useRef();

  // Internal blink timer
  const blinkStateRef = useRef({ isBlinking: false, timer: 0 });

  // Hover state for cursor
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  // Materials with curated palette and dynamic aura customization
  const materials = useMemo(() => {
    let auraColor = '#00f2fe';
    let auraEmissive = '#00c3ff';
    if (outfit.aura === 'violet') {
      auraColor = '#e100ff';
      auraEmissive = '#7f00ff';
    } else if (outfit.aura === 'gold') {
      auraColor = '#ffb703';
      auraEmissive = '#fb8500';
    } else if (outfit.aura === 'emerald') {
      auraColor = '#00f59b';
      auraEmissive = '#00d27f';
    }

    return {
      pearlWhite: new THREE.MeshStandardMaterial({
        color: '#f0f4fc',
        roughness: 0.25,
        metalness: 0.15,
      }),
      darkVisor: new THREE.MeshStandardMaterial({
        color: '#070b19',
        roughness: 0.1,
        metalness: 0.9,
      }),
      cyanGlow: new THREE.MeshStandardMaterial({
        color: auraColor,
        emissive: auraEmissive,
        emissiveIntensity: 1.2,
        roughness: 0.3,
      }),
      violetGlow: new THREE.MeshStandardMaterial({
        color: '#7f00ff',
        emissive: '#e100ff',
        emissiveIntensity: 1.0,
        roughness: 0.3,
      }),
      amberGlow: new THREE.MeshStandardMaterial({
        color: '#ff8800',
        emissive: '#ff5500',
        emissiveIntensity: 1.1,
        roughness: 0.3,
      }),
      chromeMetal: new THREE.MeshStandardMaterial({
        color: '#2a3b5c',
        roughness: 0.3,
        metalness: 0.8,
      }),
      goldenAccent: new THREE.MeshStandardMaterial({
        color: '#ffb703',
        emissive: '#fb8500',
        emissiveIntensity: 0.6,
        roughness: 0.4,
      }),
      goldCrown: new THREE.MeshStandardMaterial({
        color: '#ffd700',
        metalness: 0.85,
        roughness: 0.2,
      }),
      partyCone: new THREE.MeshStandardMaterial({
        color: '#ff007f',
        roughness: 0.4,
      }),
      shadesMat: new THREE.MeshStandardMaterial({
        color: '#111520',
        metalness: 0.9,
        roughness: 0.1,
      }),
    };
  }, [outfit.aura]);

  useFrame((stateContext, delta) => {
    const t = stateContext.clock.getElapsedTime();
    const clampedDelta = Math.min(delta, 0.1);

    // 1. Natural Blinking logic
    blinkStateRef.current.timer += clampedDelta;
    if (blinkStateRef.current.timer > 3.5 + Math.sin(t * 0.7) * 1.5) {
      blinkStateRef.current.isBlinking = true;
      if (blinkStateRef.current.timer > 3.7 + Math.sin(t * 0.7) * 1.5) {
        blinkStateRef.current.isBlinking = false;
        blinkStateRef.current.timer = 0;
      }
    }
    const blinkScaleY = blinkStateRef.current.isBlinking ? 0.08 : 1.0;

    // 2. Base Hover Bobbing & Breathing
    let hoverFreq = 2.0;
    let hoverAmp = 0.08;
    let breathFreq = 1.5;
    let breathAmp = 0.02;

    if (state === CHARACTER_STATES.RELAXING) {
      hoverFreq = 0.8;
      hoverAmp = 0.04;
      breathFreq = 0.6; // Deep soothing breath
      breathAmp = 0.06;
    } else if (state === CHARACTER_STATES.EXCITED || state === CHARACTER_STATES.CELEBRATING) {
      hoverFreq = 4.5;
      hoverAmp = 0.14;
    } else if (state === CHARACTER_STATES.LAUGHING) {
      hoverFreq = 6.0;
      hoverAmp = 0.06;
    }

    const hoverY = Math.sin(t * hoverFreq) * hoverAmp;
    const breathScale = 1.0 + Math.sin(t * breathFreq) * breathAmp;

    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, hoverY, 0.1);
      bodyRef.current.scale.set(breathScale, breathScale, breathScale);
    }

    // 3. Head Tilt and Rotations based on character state
    // 3. Head Tilt and Rotations based on character state + User Cursor Tracking
    const pointer = stateContext.pointer || { x: 0, y: 0 };
    let lookAtX = -pointer.y * 0.14;
    let lookAtY = pointer.x * 0.22;
    if (state === CHARACTER_STATES.THINKING || state === CHARACTER_STATES.ANNOYED || state === CHARACTER_STATES.RELAXING) {
      lookAtX = 0;
      lookAtY = 0;
    }

    let targetHeadRotX = lookAtX;
    let targetHeadRotY = lookAtY + Math.sin(t * 0.5) * 0.06; // subtle looking around
    let targetHeadRotZ = 0;

    switch (state) {
      case CHARACTER_STATES.CURIOUS:
        targetHeadRotZ = 0.25;
        targetHeadRotX = lookAtX + 0.12;
        break;
      case CHARACTER_STATES.PLAYFUL:
        targetHeadRotZ = 0.22;
        targetHeadRotX = lookAtX + 0.08;
        targetHeadRotY = lookAtY - 0.08;
        break;
      case CHARACTER_STATES.THINKING:
        targetHeadRotZ = -0.2;
        targetHeadRotX = -0.18; // looks up
        targetHeadRotY = 0.2;
        break;
      case CHARACTER_STATES.SURPRISED:
        targetHeadRotX = -0.22;
        targetHeadRotZ = 0;
        break;
      case CHARACTER_STATES.CONFUSED:
        targetHeadRotZ = 0.32;
        targetHeadRotY = -0.15;
        break;
      case CHARACTER_STATES.ANNOYED:
        targetHeadRotY = -0.45; // turned away
        targetHeadRotZ = -0.1;
        break;
      case CHARACTER_STATES.SAD:
        targetHeadRotX = 0.28; // head down
        break;
      case CHARACTER_STATES.HAPPY:
      case CHARACTER_STATES.LAUGHING:
        targetHeadRotZ = Math.sin(t * 5.0) * 0.06;
        break;
      case CHARACTER_STATES.TALKING:
      case CHARACTER_STATES.SPEAKING:
        targetHeadRotX = lookAtX + Math.sin(t * 6.5) * 0.05;
        targetHeadRotY = lookAtY + Math.cos(t * 3.5) * 0.04;
        targetHeadRotZ = Math.sin(t * 4.0) * 0.03;
        break;
      case CHARACTER_STATES.LISTENING:
        targetHeadRotX = 0.20; // lean toward user attentively
        targetHeadRotY = lookAtY * 0.6;
        targetHeadRotZ = Math.sin(t * 2.0) * 0.04;
        break;
      case CHARACTER_STATES.ERROR:
        targetHeadRotX = 0.22;
        targetHeadRotZ = 0.16;
        targetHeadRotY = -0.12;
        break;
      case CHARACTER_STATES.GOODBYE:
        targetHeadRotZ = 0.18;
        targetHeadRotX = 0.05;
        break;
      default:
        break;
    }

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRotX, 0.1);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadRotY, 0.1);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetHeadRotZ, 0.1);
    }

    // 4. Eyes & Pupils
    let eyeScaleX = 1.0;
    let leftEyeScaleY = blinkScaleY;
    let rightEyeScaleY = blinkScaleY;
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;

    if (state === CHARACTER_STATES.SURPRISED) {
      eyeScaleX = 1.35;
      leftEyeScaleY = 1.35;
      rightEyeScaleY = 1.35;
    } else if (state === CHARACTER_STATES.HAPPY || state === CHARACTER_STATES.LAUGHING) {
      leftEyeScaleY = blinkScaleY * 0.45; // happy squint
      rightEyeScaleY = blinkScaleY * 0.45;
    } else if (state === CHARACTER_STATES.PLAYFUL) {
      leftEyeScaleY = 0.15; // playful wink!
      rightEyeScaleY = blinkScaleY;
    } else if (state === CHARACTER_STATES.THINKING) {
      pupilOffsetY = 0.04;
      pupilOffsetX = 0.04;
    } else if (state === CHARACTER_STATES.ANNOYED || state === CHARACTER_STATES.ERROR) {
      leftEyeScaleY = blinkScaleY * 0.6;
      rightEyeScaleY = blinkScaleY * 0.6;
      pupilOffsetX = -0.04;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.set(eyeScaleX, leftEyeScaleY, 1);
      rightEyeRef.current.scale.set(eyeScaleX, rightEyeScaleY, 1);
    }
    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.position.x = -0.22 + pupilOffsetX;
      leftPupilRef.current.position.y = 0.05 + pupilOffsetY;
      rightPupilRef.current.position.x = 0.22 + pupilOffsetX;
      rightPupilRef.current.position.y = 0.05 + pupilOffsetY;
    }

    // 5. Procedural smooth mouth animation
    if (mouthRef.current) {
      let targetOpen = 0.25;
      let targetWidth = 1.0;
      let targetTilt = 0;

      if (isSpeaking || state === CHARACTER_STATES.TALKING || state === CHARACTER_STATES.SPEAKING) {
        // Multi-frequency speech cadence with natural syllable variance and pauses
        const cadenceA = Math.sin(t * 11.5);
        const cadenceB = Math.sin(t * 17.0) * 0.4;
        const cadenceC = Math.sin(t * 4.5) * 0.3;
        const rhythm = Math.max(0, cadenceA + cadenceB + cadenceC);
        const pauseCheck = Math.sin(t * 3.0);
        const activeCadence = pauseCheck > -0.75 ? rhythm : 0.08;
        targetOpen = 0.22 + activeCadence * 0.95;
        targetWidth = 1.05 + Math.sin(t * 5.5) * 0.18;
      } else if (state === CHARACTER_STATES.PLAYFUL) {
        targetOpen = 0.45;
        targetWidth = 1.15;
        targetTilt = 0.15; // cheeky smirk tilt
      } else if (state === CHARACTER_STATES.HAPPY || state === CHARACTER_STATES.CELEBRATING || state === CHARACTER_STATES.LAUGHING) {
        targetOpen = 0.6;
        targetWidth = 1.2;
      } else if (state === CHARACTER_STATES.SAD || state === CHARACTER_STATES.ANNOYED || state === CHARACTER_STATES.ERROR) {
        targetOpen = 0.18;
        targetWidth = 0.85;
      } else {
        targetOpen = 0.25;
        targetWidth = 1.0;
      }

      // Smooth interpolation prevents abrupt jumps or popping
      const lerpSpeed = isSpeaking ? Math.min(clampedDelta * 22, 1) : Math.min(clampedDelta * 14, 1);
      mouthAnimRef.current.open = THREE.MathUtils.lerp(mouthAnimRef.current.open, targetOpen, lerpSpeed);
      mouthAnimRef.current.width = THREE.MathUtils.lerp(mouthAnimRef.current.width, targetWidth, lerpSpeed);

      mouthRef.current.scale.set(mouthAnimRef.current.width, mouthAnimRef.current.open, 1);
      mouthRef.current.rotation.z = Math.PI / 2 + targetTilt;
    }

    // 6. Arms and gestures
    let targetLeftArmRotZ = 0.2;
    let targetRightArmRotZ = -0.2;
    let targetLeftArmRotX = 0;
    let targetRightArmRotX = 0;

    if (state === CHARACTER_STATES.CELEBRATING || state === CHARACTER_STATES.EXCITED) {
      targetLeftArmRotZ = 2.4; // hands in air
      targetRightArmRotZ = -2.4;
      targetLeftArmRotX = Math.sin(t * 8.0) * 0.3;
      targetRightArmRotX = Math.cos(t * 8.0) * 0.3;
    } else if (state === CHARACTER_STATES.GOODBYE) {
      targetRightArmRotZ = -2.2; // waving right arm
      targetRightArmRotX = Math.sin(t * 8.0) * 0.5;
    } else if (state === CHARACTER_STATES.PLAYFUL) {
      targetRightArmRotZ = -1.6; // jaunty hand wave
      targetRightArmRotX = Math.sin(t * 6.0) * 0.25;
      targetLeftArmRotZ = 0.5;
    } else if (state === CHARACTER_STATES.ANNOYED) {
      targetLeftArmRotZ = 0.7; // crossed arms
      targetRightArmRotZ = -0.7;
      targetLeftArmRotX = 0.6;
      targetRightArmRotX = 0.6;
    } else if (state === CHARACTER_STATES.ERROR) {
      targetLeftArmRotZ = 0.55;
      targetRightArmRotZ = -0.55;
      targetLeftArmRotX = 0.4;
      targetRightArmRotX = 0.4;
    } else if (isSpeaking || state === CHARACTER_STATES.SPEAKING || state === CHARACTER_STATES.TALKING) {
      targetLeftArmRotZ = 0.4 + Math.sin(t * 4.0) * 0.18;
      targetRightArmRotZ = -0.4 - Math.cos(t * 4.0) * 0.18;
      targetLeftArmRotX = Math.sin(t * 3.0) * 0.15;
      targetRightArmRotX = Math.cos(t * 3.0) * 0.15;
    } else if (state === CHARACTER_STATES.LISTENING) {
      targetLeftArmRotZ = 0.28;
      targetRightArmRotZ = -0.28;
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, targetLeftArmRotZ, 0.12);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetLeftArmRotX, 0.12);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, targetRightArmRotZ, 0.12);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetRightArmRotX, 0.12);
    }

    // 7. Antenna Orb Glow & Color
    if (antennaOrbRef.current) {
      const isListening = state === CHARACTER_STATES.LISTENING;
      const isThinking = state === CHARACTER_STATES.THINKING;
      const pulseFreq = isListening ? 8.0 : isThinking ? 6.0 : 3.0;
      const pulseAmp = isListening ? 0.35 : isThinking ? 0.3 : 0.15;
      const pulse = 1.0 + Math.sin(t * pulseFreq) * pulseAmp;
      antennaOrbRef.current.scale.set(pulse, pulse, pulse);
    }

    // 8. Core Reactor Glow Pulse
    if (coreRef.current) {
      const corePulse = 1.0 + Math.sin(t * 3.5) * 0.15;
      coreRef.current.scale.set(corePulse, corePulse, corePulse);
    }

    // 9. Thruster Glow & Halo rotation
    if (thrusterRef.current) {
      thrusterRef.current.scale.y = 0.8 + Math.sin(t * 10.0) * 0.3;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.4;
      haloRef.current.rotation.x = 1.2 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group
      ref={rootRef}
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onCharacterClick) onCharacterClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Revolving Holographic Science Ring around Buddy */}
      <group ref={haloRef} position={[0, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[1.5, 0.015, 16, 64]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.4} />
        </mesh>
        <mesh position={[1.5, 0, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#e100ff" />
        </mesh>
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#00f2fe" />
        </mesh>
      </group>

      {/* Main Body Hierarchy */}
      <group ref={bodyRef} position={[0, 0, 0]}>
        {/* Torso / Chassis */}
        <mesh position={[0, -0.1, 0]} material={materials.pearlWhite} castShadow receiveShadow>
          <sphereGeometry args={[0.62, 32, 32]} />
        </mesh>

        {/* Torso Accent Belt */}
        <mesh position={[0, -0.22, 0]} material={materials.chromeMetal}>
          <cylinderGeometry args={[0.55, 0.52, 0.12, 32]} />
        </mesh>

        {/* Glowing Chest Arc-Reactor / Core */}
        <group position={[0, -0.05, 0.54]}>
          <mesh material={materials.chromeMetal}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          <mesh ref={coreRef} material={state === CHARACTER_STATES.RELAXING ? materials.violetGlow : materials.cyanGlow}>
            <sphereGeometry args={[0.13, 24, 24]} />
          </mesh>
        </group>

        {/* Left Arm Assembly */}
        <group ref={leftArmRef} position={[-0.68, 0.05, 0]}>
          {/* Shoulder socket */}
          <mesh material={materials.chromeMetal}>
            <sphereGeometry args={[0.13, 16, 16]} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[-0.15, -0.2, 0]} material={materials.pearlWhite}>
            <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          </mesh>
          {/* Hand Pod */}
          <mesh position={[-0.22, -0.4, 0]} material={materials.cyanGlow}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>
        </group>

        {/* Right Arm Assembly */}
        <group ref={rightArmRef} position={[0.68, 0.05, 0]}>
          {/* Shoulder socket */}
          <mesh material={materials.chromeMetal}>
            <sphereGeometry args={[0.13, 16, 16]} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0.15, -0.2, 0]} material={materials.pearlWhite}>
            <capsuleGeometry args={[0.08, 0.22, 12, 16]} />
          </mesh>
          {/* Hand Pod */}
          <mesh position={[0.22, -0.4, 0]} material={materials.cyanGlow}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>
        </group>

        {/* Thruster Base / Hover Legs */}
        <group position={[0, -0.65, 0]}>
          {/* Thruster Cone */}
          <mesh material={materials.chromeMetal}>
            <cylinderGeometry args={[0.28, 0.18, 0.25, 24]} />
          </mesh>
          {/* Glowing Propulsion Ring */}
          <mesh ref={thrusterRef} position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.16, 0.05, 0.35, 16]} />
            <meshBasicMaterial color="#00f2fe" transparent opacity={0.7} />
          </mesh>
        </group>

        {/* Head Assembly */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          {/* Neck Pivot Ring */}
          <mesh position={[0, -0.38, 0]} material={materials.chromeMetal}>
            <cylinderGeometry args={[0.2, 0.22, 0.12, 24]} />
          </mesh>

          {/* Main Rounded Helmet */}
          <mesh material={materials.pearlWhite} castShadow receiveShadow>
            <sphereGeometry args={[0.68, 32, 32]} />
          </mesh>

          {/* Ear Audio Sensors (Side Pods) */}
          <mesh position={[-0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chromeMetal}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 24]} />
          </mesh>
          <mesh position={[-0.78, 0, 0]} material={materials.cyanGlow}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
          <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.chromeMetal}>
            <cylinderGeometry args={[0.15, 0.15, 0.12, 24]} />
          </mesh>
          <mesh position={[0.78, 0, 0]} material={materials.cyanGlow}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>

          {/* Antenna */}
          <group position={[0, 0.68, 0]}>
            <mesh position={[0, 0.1, 0]} material={materials.chromeMetal}>
              <cylinderGeometry args={[0.025, 0.03, 0.22, 12]} />
            </mesh>
            <mesh
              ref={antennaOrbRef}
              position={[0, 0.25, 0]}
              material={
                state === CHARACTER_STATES.THINKING
                  ? materials.violetGlow
                  : state === CHARACTER_STATES.ERROR
                  ? materials.amberGlow
                  : materials.cyanGlow
              }
            >
              <sphereGeometry args={[0.09, 20, 20]} />
            </mesh>
          </group>

          {/* Dark Glass Visor Screen */}
          <mesh position={[0, 0.02, 0.32]} material={materials.darkVisor}>
            <sphereGeometry args={[0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>

          {/* Digital Eyes */}
          <group position={[0, 0.08, 0.68]}>
            {/* Left Eye */}
            <mesh ref={leftEyeRef} position={[-0.22, 0, 0]} material={materials.cyanGlow}>
              <capsuleGeometry args={[0.09, 0.06, 12, 16]} />
            </mesh>
            {/* Left Pupil Dark Center */}
            <mesh ref={leftPupilRef} position={[-0.22, 0, 0.05]} material={materials.darkVisor}>
              <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>

            {/* Right Eye */}
            <mesh ref={rightEyeRef} position={[0.22, 0, 0]} material={materials.cyanGlow}>
              <capsuleGeometry args={[0.09, 0.06, 12, 16]} />
            </mesh>
            {/* Right Pupil Dark Center */}
            <mesh ref={rightPupilRef} position={[0.22, 0, 0.05]} material={materials.darkVisor}>
              <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>

            {/* Expressive Mouth bar */}
            <mesh ref={mouthRef} position={[0, -0.22, 0]} material={materials.cyanGlow}>
              <capsuleGeometry args={[0.04, 0.18, 12, 16]} rotation={[0, 0, Math.PI / 2]} />
            </mesh>

            {/* --- COSMETIC GLASSES / EYEWEAR OVERLAYS --- */}
            {outfit.glasses === 'cyber_shades' && (
              <group position={[0, 0.04, 0.07]}>
                <mesh material={materials.shadesMat}>
                  <boxGeometry args={[0.62, 0.14, 0.05]} />
                </mesh>
                <mesh position={[0, 0, 0.03]} material={materials.cyanGlow}>
                  <boxGeometry args={[0.58, 0.02, 0.02]} />
                </mesh>
              </group>
            )}

            {outfit.glasses === 'neon_visor' && (
              <group position={[0, 0.04, 0.07]}>
                <mesh material={materials.cyanGlow}>
                  <boxGeometry args={[0.65, 0.16, 0.04]} />
                </mesh>
              </group>
            )}

            {outfit.glasses === 'smart_glasses' && (
              <group position={[0, 0.04, 0.07]}>
                <mesh position={[-0.22, 0, 0]} material={materials.chromeMetal}>
                  <torusGeometry args={[0.11, 0.015, 12, 24]} />
                </mesh>
                <mesh position={[0.22, 0, 0]} material={materials.chromeMetal}>
                  <torusGeometry args={[0.11, 0.015, 12, 24]} />
                </mesh>
                <mesh position={[0, 0.02, 0]} material={materials.chromeMetal}>
                  <cylinderGeometry args={[0.012, 0.012, 0.22, 12]} rotation={[0, 0, Math.PI / 2]} />
                </mesh>
              </group>
            )}
          </group>

          {/* --- COSMETIC HATS / HEADGEAR --- */}
          {outfit.hat === 'golden_crown' && (
            <group position={[0, 0.72, 0]}>
              <mesh position={[0, 0.06, 0]} material={materials.goldCrown}>
                <cylinderGeometry args={[0.34, 0.36, 0.12, 24]} />
              </mesh>
              {[-0.24, -0.12, 0, 0.12, 0.24].map((xOffset, idx) => (
                <mesh key={idx} position={[xOffset, 0.16, 0.16]} material={materials.goldCrown}>
                  <coneGeometry args={[0.045, 0.12, 12]} />
                </mesh>
              ))}
            </group>
          )}

          {outfit.hat === 'party_hat' && (
            <group position={[0, 0.74, 0]} rotation={[0.1, 0, -0.12]}>
              <mesh position={[0, 0.24, 0]} material={materials.partyCone}>
                <coneGeometry args={[0.26, 0.48, 24]} />
              </mesh>
              <mesh position={[0, 0.5, 0]} material={materials.goldenAccent}>
                <sphereGeometry args={[0.06, 16, 16]} />
              </mesh>
            </group>
          )}

          {outfit.hat === 'astro_halo' && (
            <group position={[0, 0.92, 0]} rotation={[Math.PI / 8, 0, 0]}>
              <mesh material={materials.cyanGlow}>
                <torusGeometry args={[0.42, 0.022, 16, 36]} />
              </mesh>
            </group>
          )}

          {outfit.hat === 'headphones' && (
            <group position={[0, 0.22, 0]}>
              {/* Headband arch */}
              <mesh position={[0, 0.48, 0]} rotation={[0, 0, 0]} material={materials.chromeMetal}>
                <torusGeometry args={[0.74, 0.035, 12, 32, Math.PI]} />
              </mesh>
              {/* Ear cushions */}
              <mesh position={[-0.75, 0.22, 0]} material={materials.cyanGlow}>
                <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} rotation={[0, 0, Math.PI / 2]} />
              </mesh>
              <mesh position={[0.75, 0.22, 0]} material={materials.cyanGlow}>
                <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} rotation={[0, 0, Math.PI / 2]} />
              </mesh>
            </group>
          )}

          {outfit.hat === 'scholar_cap' && (
            <group position={[0, 0.72, 0]}>
              <mesh position={[0, 0.06, 0]} material={materials.chromeMetal}>
                <boxGeometry args={[0.62, 0.03, 0.62]} />
              </mesh>
              <mesh position={[0.26, -0.05, 0.26]} material={materials.goldenAccent}>
                <cylinderGeometry args={[0.015, 0.02, 0.18, 12]} />
              </mesh>
            </group>
          )}
        </group>

        {/* --- COSMETIC BODY ACCESSORIES & EMBLEMS --- */}
        {outfit.accessory === 'lightning_core' && (
          <group position={[0, -0.05, 0.66]}>
            <mesh material={materials.goldenAccent}>
              <octahedronGeometry args={[0.07, 0]} />
            </mesh>
          </group>
        )}

        {outfit.accessory === 'science_medal' && (
          <group position={[0.22, 0.08, 0.55]}>
            <mesh material={materials.goldCrown}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
          </group>
        )}

        {outfit.accessory === 'bowtie' && (
          <group position={[0, 0.24, 0.52]}>
            <mesh position={[-0.08, 0, 0]} material={materials.partyCone}>
              <coneGeometry args={[0.06, 0.12, 12]} rotation={[0, 0, Math.PI / 2]} />
            </mesh>
            <mesh position={[0.08, 0, 0]} material={materials.partyCone}>
              <coneGeometry args={[0.06, 0.12, 12]} rotation={[0, 0, -Math.PI / 2]} />
            </mesh>
            <mesh material={materials.goldenAccent}>
              <sphereGeometry args={[0.035, 12, 12]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
