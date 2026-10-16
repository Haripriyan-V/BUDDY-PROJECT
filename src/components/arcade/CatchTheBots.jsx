import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell } from './GameShell';
import { GameResults } from './GameResults';
import { soundEffects } from '../../services/soundEffects';
import { recordGameScore, getArcadeData } from '../../services/arcadeService';
import { CHARACTER_STATES } from '../../utils/characterStates';
import { Zap, Clock, Sparkles } from 'lucide-react';

const GRID_SLOTS = 9; // 3x3 responsive grid

const BOT_TYPES = [
  { id: 'buddy', name: 'Buddy Bot', icon: '🤖', points: 100, isDecoy: false, duration: 1600 },
  { id: 'sparky', name: 'Sparky', icon: '⚡', points: 120, isDecoy: false, duration: 1400 },
  { id: 'astro', name: 'Astro Bot', icon: '🚀', points: 150, isDecoy: false, duration: 1300 },
  { id: 'golden', name: 'Golden Ace', icon: '👑', points: 300, isDecoy: false, duration: 1100, isRare: true },
  { id: 'glitch', name: 'Glitch Virus', icon: '💀', points: -80, isDecoy: true, duration: 1500 },
];

export function CatchTheBots({ onExit, onAwardXP, setCharacterState }) {
  const [gameState, setGameState] = useState('countdown'); // 'countdown' | 'playing' | 'paused' | 'over'
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScore, setHighScore] = useState(() => getArcadeData().highScores.bots || 0);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [resultData, setResultData] = useState(null);

  // Active targets in 9 slots: { slotIndex: botObj, timerId }
  const [activeSlots, setActiveSlots] = useState({});
  const [floatingTexts, setFloatingTexts] = useState([]); // [{ id, text, slotIndex, color }]

  const hasAwardedRef = useRef(false);
  const spawnTimerRef = useRef(null);
  const triggerGameOverRef = useRef(() => {});

  // Countdown
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

  // Round 30s game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          triggerGameOverRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Bot spawn engine
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnBot = () => {
      setActiveSlots((prev) => {
        // Pick an empty slot
        const emptyIndices = [];
        for (let i = 0; i < GRID_SLOTS; i++) {
          if (!prev[i]) emptyIndices.push(i);
        }
        if (emptyIndices.length === 0) return prev;

        const slot = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        // Pick bot type
        const roll = Math.random();
        let chosen;
        if (roll < 0.22) {
          chosen = BOT_TYPES.find((b) => b.id === 'glitch'); // Decoy
        } else if (roll < 0.35) {
          chosen = BOT_TYPES.find((b) => b.id === 'golden'); // Rare gold
        } else {
          chosen = BOT_TYPES[Math.floor(Math.random() * 3)];
        }

        // Speed ramps up as time ticks down
        const timeScale = Math.max(0.65, timeLeft / 30);
        const activeDuration = chosen.duration * timeScale;

        // Auto expire if not tapped
        const timerId = setTimeout(() => {
          setActiveSlots((current) => {
            if (!current[slot]) return current;
            const updated = { ...current };
            delete updated[slot];
            return updated;
          });
        }, activeDuration);

        return {
          ...prev,
          [slot]: { ...chosen, timerId },
        };
      });
    };

    // Spawn every 600ms - 900ms
    const interval = Math.max(480, 850 - (30 - timeLeft) * 12);
    spawnTimerRef.current = setInterval(spawnBot, interval);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameState, timeLeft]);

  // Handle slot tap
  const handleSlotClick = (slotIdx) => {
    if (gameState !== 'playing') return;
    const target = activeSlots[slotIdx];

    if (!target) return; // empty tap

    // Clear target from active
    clearTimeout(target.timerId);
    setActiveSlots((prev) => {
      const next = { ...prev };
      delete next[slotIdx];
      return next;
    });

    if (target.isDecoy) {
      // Hit a Glitch Decoy!
      soundEffects.playWrong();
      setCombo(0);
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s + target.points));

      addFloatingText(slotIdx, '-80 ⚠️ DECOY!', '#ff0055');
      if (setCharacterState) setCharacterState(CHARACTER_STATES.ANNOYED);
    } else {
      // Hit a Friendly Bot!
      soundEffects.playHit();
      const nextCombo = combo + 1;
      const comboMultiplier = nextCombo >= 5 ? 2.5 : nextCombo >= 3 ? 1.5 : 1.0;
      const ptsEarned = Math.round(target.points * comboMultiplier);

      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setHits((h) => h + 1);
      setScore((s) => s + ptsEarned);

      const label = nextCombo >= 3 ? `+${ptsEarned} (${nextCombo}x!)` : `+${ptsEarned}`;
      addFloatingText(slotIdx, label, target.isRare ? '#ffb703' : '#00f2fe');

      if (nextCombo % 4 === 0 && setCharacterState) {
        setCharacterState(CHARACTER_STATES.HAPPY);
      }
    }
  };

  const addFloatingText = (slotIndex, text, color) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, slotIndex, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 750);
  };

  // Game over trigger
  const triggerGameOver = useCallback(() => {
    if (hasAwardedRef.current) return;
    hasAwardedRef.current = true;
    setGameState('over');

    const totalTaps = hits + misses;
    const accuracy = totalTaps > 0 ? Math.round((hits / totalTaps) * 100) : 0;

    // Record score & calculate XP
    const record = recordGameScore('bots', score, { maxCombo });
    setHighScore(record.highScore);

    if (onAwardXP && record.earnedXP > 0) {
      onAwardXP(record.earnedXP);
    }

    if (setCharacterState) {
      setCharacterState(score >= 800 ? CHARACTER_STATES.CELEBRATING : CHARACTER_STATES.PLAYFUL);
    }

    setResultData({
      score,
      highScore: record.highScore,
      isNewHighScore: record.isNewHighScore,
      earnedXP: record.earnedXP,
      newAchievements: record.newAchievements,
      extraStats: [
        { label: 'Bots Caught', value: `${hits}` },
        { label: 'Max Combo', value: `${maxCombo}x 🔥` },
        { label: 'Accuracy', value: `${accuracy}%` },
      ],
      buddyComment:
        score >= 1000
          ? 'LIGHTNING REFLEXES! You wiped every bot from the grid! ⚡🤖'
          : score >= 500
          ? 'Fast tapping! Those combo multipliers really boosted your score! 🎯'
          : 'Great reflex training! Remember to avoid the red glitch skull decoys! ⚠️',
    });
  }, [hits, misses, score, maxCombo, onAwardXP, setCharacterState]);

  useEffect(() => {
    triggerGameOverRef.current = triggerGameOver;
  }, [triggerGameOver]);

  // Restart handler
  const handleRestart = () => {
    hasAwardedRef.current = false;
    setActiveSlots({});
    setFloatingTexts([]);
    setTimeLeft(30);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setCountdown(3);
    setResultData(null);
    setGameState('countdown');
    if (setCharacterState) setCharacterState(CHARACTER_STATES.EXCITED);
  };

  return (
    <GameShell
      title="Catch the Bots"
      icon="🎯"
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
        <>
          <div className={`shell-score-pill time-pill ${timeLeft <= 6 ? 'timer-urgent' : ''}`}>
            <Clock size={14} />
            <span className="label">Time</span>
            <span className="value">{timeLeft}s</span>
          </div>
          <div className="shell-score-pill combo-pill">
            <Zap size={14} className="zap-icon" />
            <span className="label">Combo</span>
            <span className="value">{combo}x</span>
          </div>
        </>
      }
    >
      <div className="catch-bots-container">
        {/* 3x3 Touch Arcade Grid */}
        <div className="catch-grid">
          {Array.from({ length: GRID_SLOTS }).map((_, slotIdx) => {
            const target = activeSlots[slotIdx];
            const floatItem = floatingTexts.find((f) => f.slotIndex === slotIdx);

            return (
              <div
                key={slotIdx}
                className={`bot-slot-cell ${target ? 'slot-occupied' : 'slot-empty'}`}
                onClick={() => handleSlotClick(slotIdx)}
              >
                {/* Holographic Pad Base */}
                <div className="pad-emitter-ring" />

                {/* Popping Bot Sprite */}
                {target && (
                  <div
                    className={`bot-target-sprite ${
                      target.isDecoy ? 'target-decoy' : target.isRare ? 'target-rare' : 'target-friendly'
                    }`}
                  >
                    <span className="bot-target-icon">{target.icon}</span>
                    <span className="bot-target-name">{target.name}</span>
                  </div>
                )}

                {/* Floating Score Splash on Hit */}
                {floatItem && (
                  <div
                    className="floating-hit-splash"
                    style={{ color: floatItem.color }}
                  >
                    {floatItem.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="game-countdown-overlay">
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-hint">Tap Friendly Bots, Avoid Decoys!</span>
          </div>
        )}

        {/* Results Screen */}
        {gameState === 'over' && resultData && (
          <GameResults
            title="Catch the Bots"
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
