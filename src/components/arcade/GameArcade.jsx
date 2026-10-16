import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trophy,
  Palette,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Gamepad2,
  Award,
} from 'lucide-react';
import { GameCard } from './GameCard';
import { BuddyFlight } from './BuddyFlight';
import { RoboRun } from './RoboRun';
import { QuizBlast } from './QuizBlast';
import { BrainFlip } from './BrainFlip';
import { CatchTheBots } from './CatchTheBots';
import { BuddyPetStudio } from './BuddyPetStudio';
import { ArcadeStatsModal } from './ArcadeStatsModal';

import { soundEffects } from '../../services/soundEffects';
import { getArcadeData, getArcadeLevel } from '../../services/arcadeService';
import { CHARACTER_STATES } from '../../utils/characterStates';

export function GameArcade({
  initialGameId = null,
  onExit,
  onAwardXP,
  setCharacterState,
  onOutfitChange,
}) {
  const [activeGame, setActiveGame] = useState(initialGameId);
  const [arcadeData, setArcadeData] = useState(() => getArcadeData());
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());

  // Refresh arcade data when returning to hub
  const refreshData = () => {
    setArcadeData(getArcadeData());
  };

  useEffect(() => {
    refreshData();
    if (!activeGame && setCharacterState) {
      setCharacterState(CHARACTER_STATES.HAPPY);
    }
  }, [activeGame, setCharacterState]);

  const levelInfo = getArcadeLevel(arcadeData.stats.totalArcadeXP || 0);

  // If a specific game is currently active, render that game
  if (activeGame === 'flight') {
    return (
      <BuddyFlight
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onAwardXP={onAwardXP}
        setCharacterState={setCharacterState}
      />
    );
  }

  if (activeGame === 'runner') {
    return (
      <RoboRun
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onAwardXP={onAwardXP}
        setCharacterState={setCharacterState}
      />
    );
  }

  if (activeGame === 'quiz') {
    return (
      <QuizBlast
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onAwardXP={onAwardXP}
        setCharacterState={setCharacterState}
      />
    );
  }

  if (activeGame === 'memory') {
    return (
      <BrainFlip
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onAwardXP={onAwardXP}
        setCharacterState={setCharacterState}
      />
    );
  }

  if (activeGame === 'bots') {
    return (
      <CatchTheBots
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onAwardXP={onAwardXP}
        setCharacterState={setCharacterState}
      />
    );
  }

  if (activeGame === 'studio') {
    return (
      <BuddyPetStudio
        onExit={() => {
          setActiveGame(null);
          refreshData();
        }}
        onOutfitChange={onOutfitChange}
        setCharacterState={setCharacterState}
      />
    );
  }

  // --- ARCADE HUB LAUNCHER SCREEN ---
  return (
    <div className="buddy-arcade-hub">
      {/* Top Arcade Navigation */}
      <header className="arcade-hub-top-nav">
        <button
          className="hub-nav-btn btn-back-chat"
          onClick={() => {
            soundEffects.playClick();
            if (onExit) onExit();
          }}
          title="Return to BUDDY AI Chat"
        >
          <ArrowLeft size={18} />
          <span>Back to BUDDY</span>
        </button>

        <div className="hub-center-branding">
          <div className="hub-badge-title">
            <Gamepad2 size={20} className="controller-icon" />
            <h1>BUDDY ARCADE</h1>
          </div>
          <span className="hub-tagline">Play. Learn. Laugh. Level Up!</span>
        </div>

        <div className="hub-right-actions">
          <button
            className="hub-nav-btn btn-pet-studio"
            onClick={() => {
              soundEffects.playClick();
              setActiveGame('studio');
            }}
            title="Customize BUDDY Outfit"
          >
            <Palette size={18} />
            <span>Pet Studio</span>
          </button>

          <button
            className="hub-nav-btn btn-stats-achievements"
            onClick={() => {
              soundEffects.playClick();
              setIsStatsOpen(true);
            }}
            title="View Medals & Records"
          >
            <Trophy size={18} className="trophy-gold" />
            <span>Medals</span>
          </button>

          <button
            className="hub-icon-btn"
            onClick={() => {
              const next = soundEffects.toggleMute();
              setIsMuted(next);
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="arcade-hero-strip">
        <div className="hero-welcome-text">
          <div className="hero-robot-avatar">🤖✨</div>
          <div>
            <h2>"Welcome to my arcade playground!"</h2>
            <p>
              Earn XP, test your science reflexes, beat personal bests, and unlock 3D cosmetics!
            </p>
          </div>
        </div>

        <div className="hero-status-pill">
          <div className="hero-stat-col">
            <span className="stat-num">{levelInfo.title}</span>
            <span className="stat-sub">Level {levelInfo.level}</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-col">
            <span className="stat-num">{arcadeData.stats.totalArcadeXP || 0} XP</span>
            <span className="stat-sub">Arcade Points</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-col">
            <span className="stat-num">
              {(arcadeData.unlockedAchievements || []).length}/8
            </span>
            <span className="stat-sub">Badges Earned</span>
          </div>
        </div>
      </section>

      {/* 6 Games Grid */}
      <main className="arcade-games-grid-container">
        <div className="games-deck-grid">
          {/* 1. BUDDY Flight (Featured) */}
          <GameCard
            id="flight"
            title="BUDDY Flight"
            icon="🪶"
            category="Sky Flapper"
            difficulty="⭐ Beginner"
            desc="Pilot BUDDY through pulsing cyber laser gates! Tap to flap, dodge obstacles, and collect star sparks."
            highScore={arcadeData.highScores.flight || 0}
            isFeatured={true}
            onPlay={() => setActiveGame('flight')}
          />

          {/* 2. Robo Run */}
          <GameCard
            id="runner"
            title="Robo Run"
            icon="🏃"
            category="Endless Dash"
            difficulty="⭐⭐ Action"
            desc="Sprint along neon cyber highways! Jump over barriers, duck under laser drones, and grab power-up shields."
            highScore={arcadeData.highScores.runner || 0}
            onPlay={() => setActiveGame('runner')}
          />

          {/* 3. Quiz Blast */}
          <GameCard
            id="quiz"
            title="Quiz Blast"
            icon="🚀"
            category="Rocket STEM Trivia"
            difficulty="⭐⭐ Science"
            desc="Power your rocket to orbit by answering rapid AI, Space, and Computing questions! Features BUDDY science notes."
            highScore={arcadeData.highScores.quiz || 0}
            scoreUnit="/5 Orbit"
            onPlay={() => setActiveGame('quiz')}
          />

          {/* 4. Brain Flip */}
          <GameCard
            id="memory"
            title="Brain Flip"
            icon="🧠"
            category="Holo Memory"
            difficulty="⭐ Focus"
            desc="Flip and match glowing science cards against the clock! Choose Easy, Medium, or Hard memory matrices."
            highScore={arcadeData.highScores.memory || 0}
            onPlay={() => setActiveGame('memory')}
          />

          {/* 5. Catch the Bots */}
          <GameCard
            id="bots"
            title="Catch the Bots"
            icon="🎯"
            category="Reflex Arcade"
            difficulty="⭐⭐ Speed"
            desc="Tap friendly robot targets at high speed! Stack multi-hit combos, but beware of red glitch decoys!"
            highScore={arcadeData.highScores.bots || 0}
            onPlay={() => setActiveGame('bots')}
          />

          {/* 6. BUDDY Pet Studio */}
          <GameCard
            id="studio"
            title="BUDDY Pet Studio"
            icon="🎨"
            category="3D Wardrobe"
            difficulty="✨ Creative"
            desc="Customize BUDDY with crowns, cyber shades, and glowing auras! Live 3D character preview."
            highScore={(arcadeData.unlockedCosmetics || []).length}
            scoreUnit="Items Unlocked"
            onPlay={() => setActiveGame('studio')}
          />
        </div>
      </main>

      {/* Achievements & Stats Modal */}
      {isStatsOpen && (
        <ArcadeStatsModal onClose={() => setIsStatsOpen(false)} />
      )}
    </div>
  );
}
