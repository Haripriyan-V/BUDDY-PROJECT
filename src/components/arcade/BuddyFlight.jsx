import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameShell } from './GameShell';
import { GameResults } from './GameResults';
import { soundEffects } from '../../services/soundEffects';
import { recordGameScore, getArcadeData } from '../../services/arcadeService';
import { CHARACTER_STATES } from '../../utils/characterStates';

export function BuddyFlight({ onExit, onAwardXP, setCharacterState }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('countdown'); // 'countdown' | 'playing' | 'paused' | 'over'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => getArcadeData().highScores.flight || 0);
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [resultData, setResultData] = useState(null);

  // Internal physics & world state refs
  const worldRef = useRef({
    bird: {
      x: 100,
      y: 220,
      vy: 0,
      radius: 20,
      rotation: 0,
    },
    gravity: 0.38,
    jumpImpulse: -7.2,
    pipes: [],
    stars: [],
    particles: [],
    starsCollected: 0,
    score: 0,
    scrollSpeed: 2.8,
    pipeTimer: 0,
    starTimer: 0,
    frameId: null,
    lastTime: 0,
    width: 600,
    height: 480,
  });

  const hasAwardedRef = useRef(false);
  const triggerGameOverRef = useRef(() => {});

  // Trigger flap action
  const handleFlap = useCallback(() => {
    if (gameState !== 'playing') return;
    const world = worldRef.current;
    world.bird.vy = world.jumpImpulse;
    soundEffects.playJump();

    // Spawn thruster burst particles
    for (let i = 0; i < 6; i++) {
      world.particles.push({
        x: world.bird.x - 14,
        y: world.bird.y + 10 + (Math.random() - 0.5) * 8,
        vx: -2 - Math.random() * 2,
        vy: 1 + (Math.random() - 0.5) * 2,
        life: 1.0,
        color: Math.random() > 0.5 ? '#00f2fe' : '#ffb703',
        size: 3 + Math.random() * 3,
      });
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlap]);

  // Countdown timer on start
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 750);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setGameState('playing');
        if (setCharacterState) setCharacterState(CHARACTER_STATES.EXCITED);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown, setCharacterState]);

  // Elapsed game time counter
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Restart handler
  const handleRestart = useCallback(() => {
    hasAwardedRef.current = false;
    const world = worldRef.current;
    world.bird.y = 220;
    world.bird.vy = 0;
    world.bird.rotation = 0;
    world.pipes = [];
    world.stars = [];
    world.particles = [];
    world.starsCollected = 0;
    world.score = 0;
    world.scrollSpeed = 2.8;
    world.pipeTimer = 0;
    world.starTimer = 0;

    setScore(0);
    setElapsedSeconds(0);
    setCountdown(3);
    setResultData(null);
    setGameState('countdown');
    if (setCharacterState) setCharacterState(CHARACTER_STATES.PLAYFUL);
  }, [setCharacterState]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const world = worldRef.current;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      world.width = rect.width;
      world.height = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId;

    const renderLoop = (timestamp) => {
      if (gameState === 'playing') {
        world.lastTime = timestamp;

        // 1. Update Physics
        world.bird.vy += world.gravity;
        world.bird.y += world.bird.vy;
        world.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, world.bird.vy * 0.06));

        // Speed ramp with score
        world.scrollSpeed = 2.8 + Math.min(1.8, world.score * 0.08);

        // 2. Generate Obstacle Pipes
        world.pipeTimer += 1;
        if (world.pipeTimer > 105) {
          world.pipeTimer = 0;
          const gapSize = Math.max(125, 155 - world.score * 1.5);
          const minTop = 60;
          const maxTop = world.height - gapSize - 80;
          const topHeight = minTop + Math.random() * (maxTop - minTop);

          world.pipes.push({
            x: world.width + 20,
            topHeight,
            gapSize,
            width: 58,
            passed: false,
          });
        }

        // 3. Generate Collectible Stars
        world.starTimer += 1;
        if (world.starTimer > 140) {
          world.starTimer = 0;
          world.stars.push({
            x: world.width + 30,
            y: 80 + Math.random() * (world.height - 160),
            size: 14,
            angle: 0,
            collected: false,
          });
        }

        // 4. Update Pipes & Collision
        for (let i = world.pipes.length - 1; i >= 0; i--) {
          const pipe = world.pipes[i];
          pipe.x -= world.scrollSpeed;

          // Check score trigger
          if (!pipe.passed && pipe.x + pipe.width < world.bird.x) {
            pipe.passed = true;
            world.score += 1;
            setScore(world.score);
            soundEffects.playCollect();

            // Periodic BUDDY cheer
            if (world.score % 5 === 0 && setCharacterState) {
              setCharacterState(CHARACTER_STATES.HAPPY);
            }
          }

          // Collision detection (Bird circle vs Rectangles)
          const bird = world.bird;
          const inPipeX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipe.width;
          const hitTop = bird.y - bird.radius < pipe.topHeight;
          const hitBottom = bird.y + bird.radius > pipe.topHeight + pipe.gapSize;

          if (inPipeX && (hitTop || hitBottom)) {
            triggerGameOverRef.current();
            break;
          }

          if (pipe.x + pipe.width < -40) {
            world.pipes.splice(i, 1);
          }
        }

        // 5. Update Collectible Stars
        for (let i = world.stars.length - 1; i >= 0; i--) {
          const star = world.stars[i];
          star.x -= world.scrollSpeed;
          star.angle += 0.05;

          // Distance to bird
          const dx = star.x - world.bird.x;
          const dy = star.y - world.bird.y;
          const dist = Math.hypot(dx, dy);

          if (!star.collected && dist < world.bird.radius + star.size) {
            star.collected = true;
            world.starsCollected += 1;
            world.score += 5; // Star gives bonus 5 pts!
            setScore(world.score);
            soundEffects.playPowerup();

            // Star burst particles
            for (let p = 0; p < 8; p++) {
              world.particles.push({
                x: star.x,
                y: star.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color: '#ffb703',
                size: 3 + Math.random() * 3,
              });
            }
            world.stars.splice(i, 1);
            continue;
          }

          if (star.x < -30) {
            world.stars.splice(i, 1);
          }
        }

        // 6. Update Particles
        for (let i = world.particles.length - 1; i >= 0; i--) {
          const p = world.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.035;
          if (p.life <= 0) {
            world.particles.splice(i, 1);
          }
        }

        // Ceiling / Floor Collision
        if (world.bird.y - world.bird.radius < 0) {
          world.bird.y = world.bird.radius;
          world.bird.vy = 0;
        }
        if (world.bird.y + world.bird.radius > world.height - 10) {
          triggerGameOverRef.current();
        }
      }

      // --- DRAW FRAME ---
      ctx.clearRect(0, 0, world.width, world.height);

      // 1. Cosmic Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, world.height);
      bgGrad.addColorStop(0, '#060919');
      bgGrad.addColorStop(0.6, '#0b1633');
      bgGrad.addColorStop(1, '#111b3d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, world.width, world.height);

      // Star grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const t = timestamp * 0.001;
      for (let s = 0; s < 30; s++) {
        const sx = ((s * 47) - t * 15) % world.width;
        const finalSx = sx < 0 ? sx + world.width : sx;
        const sy = (s * 31) % (world.height - 40);
        ctx.fillRect(finalSx, sy, (s % 3) + 1, (s % 3) + 1);
      }

      // 2. Draw Pipes (Pulsing Neon Laser Gates)
      world.pipes.forEach((pipe) => {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        topGrad.addColorStop(0, '#102347');
        topGrad.addColorStop(0.5, '#1e3c75');
        topGrad.addColorStop(1, '#0e1c38');
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

        // Top Pipe Neon Cap
        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 12;
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 12, pipe.width + 6, 12);

        // Bottom Pipe
        const bottomY = pipe.topHeight + pipe.gapSize;
        const bottomHeight = world.height - bottomY;
        ctx.shadowBlur = 0;
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, bottomY, pipe.width, bottomHeight);

        // Bottom Pipe Neon Cap
        ctx.fillStyle = '#e100ff';
        ctx.shadowColor = '#e100ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(pipe.x - 3, bottomY, pipe.width + 6, 12);
        ctx.shadowBlur = 0;

        // Laser emitter line in gap
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pipe.x + pipe.width / 2, pipe.topHeight);
        ctx.lineTo(pipe.x + pipe.width / 2, bottomY);
        ctx.stroke();
      });

      // 3. Draw Collectible Stars
      world.stars.forEach((star) => {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.angle);
        ctx.fillStyle = '#ffb703';
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 14;

        // 5-point star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * star.size,
            -Math.sin(((18 + i * 72) * Math.PI) / 180) * star.size
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * (star.size * 0.45),
            -Math.sin(((54 + i * 72) * Math.PI) / 180) * (star.size * 0.45)
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 4. Draw Particles
      world.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Playable BUDDY Character
      const bird = world.bird;
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      // Jet Thruster Flame
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const flameLen = 14 + Math.sin(t * 20) * 4;
      ctx.moveTo(-16, -4);
      ctx.lineTo(-16 - flameLen, 0);
      ctx.lineTo(-16, 4);
      ctx.closePath();
      ctx.fill();

      // Rounded Head / Body
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f0f4fc';
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fill();

      // Visor Screen
      ctx.fillStyle = '#070b19';
      ctx.beginPath();
      ctx.ellipse(4, -1, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(4, -2, 3.5, 0, Math.PI * 2);
      ctx.arc(10, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#2a3b5c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -bird.radius);
      ctx.lineTo(0, -bird.radius - 8);
      ctx.stroke();

      // Antenna Glowing Orb
      ctx.fillStyle = '#e100ff';
      ctx.shadowColor = '#e100ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -bird.radius - 10, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, setCharacterState]);

  // Trigger game over handler
  const triggerGameOver = useCallback(() => {
    if (gameState === 'over' || hasAwardedRef.current) return;
    hasAwardedRef.current = true;
    setGameState('over');
    soundEffects.playWrong();

    if (setCharacterState) setCharacterState(CHARACTER_STATES.CONFUSED);

    const world = worldRef.current;
    const finalScore = world.score;

    // Record score & compute rewards
    const record = recordGameScore('flight', finalScore);
    setHighScore(record.highScore);

    if (onAwardXP && record.earnedXP > 0) {
      onAwardXP(record.earnedXP);
    }

    setResultData({
      score: finalScore,
      highScore: record.highScore,
      isNewHighScore: record.isNewHighScore,
      earnedXP: record.earnedXP,
      newAchievements: record.newAchievements,
      extraStats: [
        { label: 'Air Time', value: `${elapsedSeconds}s` },
        { label: 'Bonus Stars', value: `${world.starsCollected}` },
      ],
      buddyComment:
        finalScore >= 15
          ? 'Legendary piloting! The whole science expo is cheering for you! 🌟🚀'
          : finalScore >= 6
          ? 'Nice reflexes! With a little more practice, you will shatter the record! 🪶'
          : 'Nice try! Tap to flap right before the laser gates to glide smoothly through! 🤖',
    });
  }, [gameState, elapsedSeconds, onAwardXP, setCharacterState]);

  useEffect(() => {
    triggerGameOverRef.current = triggerGameOver;
  }, [triggerGameOver]);

  return (
    <GameShell
      title="BUDDY Flight"
      icon="🪶"
      score={score}
      highScore={highScore}
      isPaused={gameState === 'paused'}
      isMuted={isMuted}
      onTogglePause={() => {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }}
      onRestart={handleRestart}
      onToggleMute={() => {
        const next = soundEffects.toggleMute();
        setIsMuted(next);
      }}
      onExit={onExit}
    >
      <div
        className="flight-canvas-container"
        onClick={handleFlap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleFlap();
        }}
      >
        <canvas ref={canvasRef} className="flight-canvas" />

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="game-countdown-overlay">
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-hint">Space / Tap to Fly!</span>
          </div>
        )}

        {/* Bottom On-screen Flap Control for Mobile & Touchscreens */}
        {gameState === 'playing' && (
          <button
            className="flight-touch-flap-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleFlap();
            }}
          >
            <span>TAP TO FLAP 🚀</span>
          </button>
        )}

        {/* Results Screen */}
        {gameState === 'over' && resultData && (
          <GameResults
            title="BUDDY Flight"
            score={resultData.score}
            highScore={resultData.highScore}
            isNewHighScore={resultData.isNewHighScore}
            earnedXP={resultData.earnedXP}
            newAchievements={resultData.newAchievements}
            extraStats={resultData.extraStats}
            buddyComment={resultData.buddyComment}
            onPlayAgain={handleRestart}
            onExit={onExit}
          />
        )}
      </div>
    </GameShell>
  );
}
