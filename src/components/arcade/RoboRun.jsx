import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameShell } from './GameShell';
import { GameResults } from './GameResults';
import { soundEffects } from '../../services/soundEffects';
import { recordGameScore, getArcadeData } from '../../services/arcadeService';
import { CHARACTER_STATES } from '../../utils/characterStates';
import { Shield, Magnet } from 'lucide-react';

export function RoboRun({ onExit, onAwardXP, setCharacterState }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('countdown'); // 'countdown' | 'playing' | 'paused' | 'over'
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(() => getArcadeData().highScores.runner || 0);
  const [countdown, setCountdown] = useState(3);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [resultData, setResultData] = useState(null);

  // Active power-up indicators
  const [activeShield, setActiveShield] = useState(false);
  const [activeMagnetTimer, setActiveMagnetTimer] = useState(0);

  // Physics & runner world ref
  const worldRef = useRef({
    player: {
      x: 90,
      y: 0, // calculated from ground
      vy: 0,
      isGrounded: true,
      isDucking: false,
      width: 36,
      height: 48,
      shield: false,
      magnetTime: 0,
    },
    groundY: 340,
    gravity: 0.62,
    jumpPower: -12.5,
    speed: 5.2,
    distanceTraveled: 0,
    score: 0,
    obstacles: [],
    collectibles: [],
    powerups: [],
    particles: [],
    spawnTimer: 0,
    starSpawnTimer: 0,
    powerupTimer: 0,
    starsCount: 0,
    width: 650,
    height: 440,
    lastTime: 0,
  });

  const hasAwardedRef = useRef(false);
  const triggerGameOverRef = useRef(() => {});

  // Jump action
  const handleJump = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = worldRef.current.player;
    if (player.isGrounded && !player.isDucking) {
      player.vy = worldRef.current.jumpPower;
      player.isGrounded = false;
      soundEffects.playJump();

      // Jump dust
      for (let i = 0; i < 5; i++) {
        worldRef.current.particles.push({
          x: player.x + (Math.random() - 0.5) * 20,
          y: worldRef.current.groundY,
          vx: -2 - Math.random() * 2,
          vy: -1 - Math.random() * 2,
          life: 1.0,
          color: '#00f2fe',
          size: 3,
        });
      }
    }
  }, [gameState]);

  // Duck / Slide action
  const handleDuckStart = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = worldRef.current.player;
    player.isDucking = true;
    player.height = 26; // lower hitbox
  }, [gameState]);

  const handleDuckEnd = useCallback(() => {
    const player = worldRef.current.player;
    player.isDucking = false;
    player.height = 48; // normal hitbox
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckStart();
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckEnd();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleJump, handleDuckStart, handleDuckEnd]);

  // Countdown timer
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

  // Restart handler
  const handleRestart = useCallback(() => {
    hasAwardedRef.current = false;
    const world = worldRef.current;
    world.player.y = 0;
    world.player.vy = 0;
    world.player.isGrounded = true;
    world.player.isDucking = false;
    world.player.height = 48;
    world.player.shield = false;
    world.player.magnetTime = 0;

    world.obstacles = [];
    world.collectibles = [];
    world.powerups = [];
    world.particles = [];
    world.speed = 5.2;
    world.distanceTraveled = 0;
    world.score = 0;
    world.spawnTimer = 0;
    world.starsCount = 0;

    setActiveShield(false);
    setActiveMagnetTimer(0);
    setScore(0);
    setDistance(0);
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
      world.groundY = rect.height - 75;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId;

    const renderLoop = (timestamp) => {
      if (gameState === 'playing') {
        const dt = Math.min((timestamp - (world.lastTime || timestamp)) / 1000, 0.05);
        world.lastTime = timestamp;

        // Advance distance & speed
        world.distanceTraveled += world.speed * 0.08;
        world.speed = 5.2 + Math.min(4.0, world.distanceTraveled * 0.005);
        setDistance(Math.floor(world.distanceTraveled));

        // Player physics
        const player = worldRef.current.player;
        if (!player.isGrounded) {
          player.vy += world.gravity;
          player.y += player.vy;
          if (player.y >= 0) {
            player.y = 0;
            player.vy = 0;
            player.isGrounded = true;
          }
        }

        // Magnet timer decay
        if (player.magnetTime > 0) {
          player.magnetTime -= dt;
          setActiveMagnetTimer(Math.ceil(player.magnetTime));
          if (player.magnetTime <= 0) {
            player.magnetTime = 0;
            setActiveMagnetTimer(0);
          }
        }

        // Spawn Obstacles (Ground Barrier or High Drone)
        world.spawnTimer += 1;
        const spawnInterval = Math.max(65, 120 - Math.floor(world.distanceTraveled * 0.08));
        if (world.spawnTimer > spawnInterval) {
          world.spawnTimer = 0;
          const isHighDrone = Math.random() > 0.55;
          if (isHighDrone) {
            // Drone at head level (player must duck!)
            world.obstacles.push({
              x: world.width + 30,
              y: world.groundY - 60,
              width: 38,
              height: 28,
              type: 'drone',
            });
          } else {
            // Ground Barrier (player must jump!)
            world.obstacles.push({
              x: world.width + 30,
              y: world.groundY - 34,
              width: 32,
              height: 34,
              type: 'barrier',
            });
          }
        }

        // Spawn Collectible Stars
        world.starSpawnTimer += 1;
        if (world.starSpawnTimer > 70) {
          world.starSpawnTimer = 0;
          const starY = world.groundY - (Math.random() > 0.4 ? 20 : 70);
          world.collectibles.push({
            x: world.width + 20,
            y: starY,
            size: 11,
            angle: 0,
          });
        }

        // Spawn Power-ups (Shield or Magnet)
        world.powerupTimer += 1;
        if (world.powerupTimer > 450) {
          world.powerupTimer = 0;
          const type = Math.random() > 0.5 ? 'shield' : 'magnet';
          world.powerups.push({
            x: world.width + 20,
            y: world.groundY - 45,
            size: 16,
            type,
          });
        }

        // Player absolute bounding box
        const playerBox = {
          x: player.x,
          y: world.groundY - player.height + player.y,
          width: player.width,
          height: player.height,
        };

        // Update Obstacles & Collision
        for (let i = world.obstacles.length - 1; i >= 0; i--) {
          const obs = world.obstacles[i];
          obs.x -= world.speed;

          // AABB Collision
          const collides =
            playerBox.x < obs.x + obs.width &&
            playerBox.x + playerBox.width > obs.x &&
            playerBox.y < obs.y + obs.height &&
            playerBox.y + playerBox.height > obs.y;

          if (collides) {
            if (player.shield) {
              // Shield absorbs the blow!
              player.shield = false;
              setActiveShield(false);
              soundEffects.playWrong();
              // Shield shatter particles
              for (let p = 0; p < 10; p++) {
                world.particles.push({
                  x: playerBox.x + 18,
                  y: playerBox.y + 18,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 1.0,
                  color: '#00f2fe',
                  size: 4,
                });
              }
              world.obstacles.splice(i, 1);
              continue;
            } else {
              triggerGameOverRef.current();
              break;
            }
          }

          if (obs.x < -50) {
            world.obstacles.splice(i, 1);
          }
        }

        // Update Collectibles
        for (let i = world.collectibles.length - 1; i >= 0; i--) {
          const star = world.collectibles[i];
          star.x -= world.speed;
          star.angle += 0.05;

          // Magnet pull effect
          if (player.magnetTime > 0) {
            const dx = playerBox.x + 18 - star.x;
            const dy = playerBox.y + 20 - star.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 180) {
              star.x += (dx / dist) * 7.5;
              star.y += (dy / dist) * 7.5;
            }
          }

          // Check pickup
          const dx = playerBox.x + 18 - star.x;
          const dy = playerBox.y + 20 - star.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 28) {
            world.starsCount += 1;
            world.score += 15;
            setScore(world.score);
            soundEffects.playCollect();

            for (let p = 0; p < 6; p++) {
              world.particles.push({
                x: star.x,
                y: star.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: '#ffb703',
                size: 3,
              });
            }
            world.collectibles.splice(i, 1);
            continue;
          }

          if (star.x < -30) {
            world.collectibles.splice(i, 1);
          }
        }

        // Update Powerups
        for (let i = world.powerups.length - 1; i >= 0; i--) {
          const pw = world.powerups[i];
          pw.x -= world.speed;

          const dx = playerBox.x + 18 - pw.x;
          const dy = playerBox.y + 20 - pw.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 32) {
            soundEffects.playPowerup();
            if (pw.type === 'shield') {
              player.shield = true;
              setActiveShield(true);
            } else if (pw.type === 'magnet') {
              player.magnetTime = 6;
              setActiveMagnetTimer(6);
            }
            world.powerups.splice(i, 1);
            continue;
          }

          if (pw.x < -30) {
            world.powerups.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = world.particles.length - 1; i >= 0; i--) {
          const p = world.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          if (p.life <= 0) {
            world.particles.splice(i, 1);
          }
        }
      }

      // --- RENDER FRAME ---
      ctx.clearRect(0, 0, world.width, world.height);

      // 1. Neon Cyber Skyline
      const bgGrad = ctx.createLinearGradient(0, 0, 0, world.height);
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.65, '#0d1838');
      bgGrad.addColorStop(1, '#1a0b2e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, world.width, world.height);

      // Distant cyber grid buildings
      ctx.fillStyle = 'rgba(20, 35, 75, 0.4)';
      const t = timestamp * 0.001;
      for (let b = 0; b < 12; b++) {
        const bx = ((b * 90) - t * 25) % (world.width + 100);
        const finalBx = bx < -60 ? bx + world.width + 100 : bx;
        ctx.fillRect(finalBx, world.groundY - 120 - (b % 4) * 20, 48, 140);
      }

      // 2. Cyber Road & Grid Lines
      const roadGrad = ctx.createLinearGradient(0, world.groundY, 0, world.height);
      roadGrad.addColorStop(0, '#0a1026');
      roadGrad.addColorStop(1, '#050714');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, world.groundY, world.width, world.height - world.groundY);

      // Glowing Ground Laser Line
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, world.groundY);
      ctx.lineTo(world.width, world.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Moving Grid Lines on ground
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
      ctx.lineWidth = 1.5;
      const gridOffset = (world.distanceTraveled * 12) % 40;
      for (let gx = -gridOffset; gx < world.width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, world.groundY);
        ctx.lineTo(gx - 30, world.height);
        ctx.stroke();
      }

      // 3. Draw Obstacles
      world.obstacles.forEach((obs) => {
        if (obs.type === 'drone') {
          // Floating Drone with red laser beam
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 12;

          // Drone body
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
          ctx.fill();

          // Laser scanning sensor downward
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height + 15);
          ctx.stroke();

          // Drone Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + 12, obs.y + 14, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ground Barrier (Spiked Cyber Hurdle)
          ctx.fillStyle = '#ff7b00';
          ctx.shadowColor = '#ff7b00';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();

          // Inner warning core
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height - 8, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      });

      // 4. Draw Collectibles
      world.collectibles.forEach((star) => {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.angle);
        ctx.fillStyle = '#ffb703';
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 12;

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

      // 5. Draw Powerups
      world.powerups.forEach((pw) => {
        ctx.save();
        ctx.translate(pw.x, pw.y);
        ctx.shadowBlur = 14;

        if (pw.type === 'shield') {
          ctx.fillStyle = '#00f2fe';
          ctx.shadowColor = '#00f2fe';
          ctx.beginPath();
          ctx.arc(0, 0, pw.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️', 0, 4);
        } else {
          ctx.fillStyle = '#e100ff';
          ctx.shadowColor = '#e100ff';
          ctx.beginPath();
          ctx.arc(0, 0, pw.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🧲', 0, 4);
        }
        ctx.restore();
      });

      // 6. Draw Particles
      world.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Draw Player BUDDY
      const player = worldRef.current.player;
      const px = player.x;
      const py = world.groundY - player.height + player.y;

      ctx.save();
      // Shield Aura around BUDDY
      if (player.shield) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(px + player.width / 2, py + player.height / 2, player.width * 0.9, player.height * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Robot Chassis
      ctx.fillStyle = '#f0f4fc';
      ctx.beginPath();
      ctx.roundRect(px, py, player.width, player.height, player.isDucking ? 6 : 12);
      ctx.fill();

      // Visor Screen
      ctx.fillStyle = '#070b19';
      const visorHeight = player.isDucking ? 10 : 16;
      ctx.fillRect(px + 6, py + 8, player.width - 12, visorHeight);

      // Cyan Glowing Eye
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px + player.width - 12, py + 8 + visorHeight / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Thruster Foot Flame
      if (!player.isGrounded) {
        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(px + 8, py + player.height);
        ctx.lineTo(px + player.width / 2, py + player.height + 12);
        ctx.lineTo(px + player.width - 8, py + player.height);
        ctx.closePath();
        ctx.fill();
      }

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
    const finalDistance = Math.floor(world.distanceTraveled);

    // Record score & compute rewards
    const record = recordGameScore('runner', finalScore, { distance: finalDistance });
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
        { label: 'Distance', value: `${finalDistance}m` },
        { label: 'Stars Collected', value: `${world.starsCount}` },
      ],
      buddyComment:
        finalDistance >= 300
          ? 'Sonic speed achieved! Your cyber thrusters are on fire! 🏃💨'
          : finalDistance >= 150
          ? 'Impressive sprint! Ducking under those laser drones was slick! 🤖'
          : 'Good run! Remember: Space/Up jumps hurdles, and Down ducks under flying drones! ⚡',
    });
  }, [gameState, onAwardXP, setCharacterState]);

  useEffect(() => {
    triggerGameOverRef.current = triggerGameOver;
  }, [triggerGameOver]);

  return (
    <GameShell
      title="Robo Run"
      icon="🏃"
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
      extraHeaderInfo={
        <div className="shell-score-pill distance-pill">
          <span className="label">Distance</span>
          <span className="value">{distance}m</span>
        </div>
      }
    >
      <div className="runner-canvas-container">
        <canvas ref={canvasRef} className="runner-canvas" />

        {/* Active Power-up Badges */}
        <div className="runner-powerup-bar">
          {activeShield && (
            <div className="powerup-active-chip shield-active">
              <Shield size={16} />
              <span>SHIELD ACTIVE</span>
            </div>
          )}
          {activeMagnetTimer > 0 && (
            <div className="powerup-active-chip magnet-active">
              <Magnet size={16} />
              <span>MAGNET: {activeMagnetTimer}s</span>
            </div>
          )}
        </div>

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="game-countdown-overlay">
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-hint">Space / Jump & Down / Duck</span>
          </div>
        )}

        {/* Bottom Touch Controls for Tablets & Kiosks */}
        {gameState === 'playing' && (
          <div className="runner-touch-controls">
            <button
              className="touch-btn btn-jump"
              onTouchStart={(e) => {
                e.preventDefault();
                handleJump();
              }}
              onClick={handleJump}
            >
              <span>JUMP ⬆️</span>
            </button>

            <button
              className="touch-btn btn-duck"
              onTouchStart={(e) => {
                e.preventDefault();
                handleDuckStart();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDuckEnd();
              }}
              onMouseDown={handleDuckStart}
              onMouseUp={handleDuckEnd}
            >
              <span>DUCK ⬇️</span>
            </button>
          </div>
        )}

        {/* Results Screen */}
        {gameState === 'over' && resultData && (
          <GameResults
            title="Robo Run"
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
