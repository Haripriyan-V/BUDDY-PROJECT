import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell } from './GameShell';
import { GameResults } from './GameResults';
import { soundEffects } from '../../services/soundEffects';
import { recordGameScore, getArcadeData } from '../../services/arcadeService';
import { CHARACTER_STATES } from '../../utils/characterStates';
import { Clock, Check, Sparkles } from 'lucide-react';

const CARD_SYMBOLS = [
  { id: 'robot', icon: '🤖', name: 'Buddy Bot' },
  { id: 'rocket', icon: '🚀', name: 'Cosmic Rocket' },
  { id: 'atom', icon: '⚛️', name: 'Quantum Atom' },
  { id: 'dna', icon: '🧬', name: 'DNA Code' },
  { id: 'saturn', icon: '🪐', name: 'Ringed Planet' },
  { id: 'spark', icon: '💡', name: 'Brain Spark' },
  { id: 'microscope', icon: '🔬', name: 'Microscope' },
  { id: 'laser', icon: '⚡', name: 'Plasma Arc' },
  { id: 'ufo', icon: '🛸', name: 'Starship' },
  { id: 'battery', icon: '🔋', name: 'Energy Core' },
];

function generateDeck(pairCount = 6) {
  const chosen = CARD_SYMBOLS.slice(0, pairCount);
  const deck = [];
  chosen.forEach((sym) => {
    deck.push({ id: `${sym.id}_1`, symId: sym.id, icon: sym.icon, name: sym.name });
    deck.push({ id: `${sym.id}_2`, symId: sym.id, icon: sym.icon, name: sym.name });
  });
  return deck.sort(() => Math.random() - 0.5);
}

export function BrainFlip({ onExit, onAwardXP, setCharacterState }) {
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' (6 pairs) | 'medium' (8 pairs) | 'hard' (10 pairs)
  const [cards, setCards] = useState(() => generateDeck(6));
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedSymIds, setMatchedSymIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [highScore, setHighScore] = useState(() => getArcadeData().highScores.memory || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [isOver, setIsOver] = useState(false);
  const [resultData, setResultData] = useState(null);

  const hasAwardedRef = useRef(false);
  const pairCount = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 8 : 6;

  // Elapsed timer
  useEffect(() => {
    if (isOver || isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOver, isPaused]);

  // Handle card click
  const handleCardClick = (index) => {
    if (isPaused || isOver) return;
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(index)) return;

    const card = cards[index];
    if (matchedSymIds.includes(card.symId)) return;

    soundEffects.playClick();
    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards[nextFlipped[0]];
      const secondCard = cards[nextFlipped[1]];

      if (firstCard.symId === secondCard.symId) {
        // MATCH!
        setTimeout(() => {
          soundEffects.playCorrect();
          const nextMatched = [...matchedSymIds, firstCard.symId];
          setMatchedSymIds(nextMatched);
          setFlippedIndices([]);

          if (setCharacterState) setCharacterState(CHARACTER_STATES.HAPPY);

          // Check if all matched
          if (nextMatched.length === pairCount) {
            handleVictory(nextMatched.length, moves + 1);
          }
        }, 450);
      } else {
        // NO MATCH
        setTimeout(() => {
          soundEffects.playWrong();
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // Victory celebration
  const handleVictory = useCallback(
    (matchedTotal, finalMoves) => {
      if (hasAwardedRef.current) return;
      hasAwardedRef.current = true;
      setIsOver(true);

      // Score formula: Base 300 - moves*10 - seconds*2 (clamped)
      const calculatedScore = Math.max(50, 350 - finalMoves * 12 - elapsedSeconds * 2);

      const record = recordGameScore('memory', calculatedScore);
      setHighScore(record.highScore);

      if (onAwardXP && record.earnedXP > 0) {
        onAwardXP(record.earnedXP);
      }

      if (setCharacterState) setCharacterState(CHARACTER_STATES.CELEBRATING);

      setResultData({
        score: calculatedScore,
        highScore: record.highScore,
        isNewHighScore: record.isNewHighScore,
        earnedXP: record.earnedXP,
        newAchievements: record.newAchievements,
        extraStats: [
          { label: 'Total Moves', value: `${finalMoves}` },
          { label: 'Time', value: `${elapsedSeconds}s` },
          { label: 'Difficulty', value: difficulty.toUpperCase() },
        ],
        buddyComment:
          finalMoves <= pairCount + 3
            ? 'Photographic memory detected! Incredible neural reflexes! 🧠✨'
            : 'Super brain match! You solved the holographic memory matrix! 🤖',
      });
    },
    [difficulty, elapsedSeconds, pairCount, onAwardXP, setCharacterState]
  );

  // Restart handler
  const handleRestart = (newDiff = difficulty) => {
    hasAwardedRef.current = false;
    const pCount = newDiff === 'hard' ? 10 : newDiff === 'medium' ? 8 : 6;
    setDifficulty(newDiff);
    setCards(generateDeck(pCount));
    setFlippedIndices([]);
    setMatchedSymIds([]);
    setMoves(0);
    setElapsedSeconds(0);
    setIsOver(false);
    setResultData(null);
    if (setCharacterState) setCharacterState(CHARACTER_STATES.CURIOUS);
  };

  return (
    <GameShell
      title="Brain Flip"
      icon="🧠"
      score={matchedSymIds.length * 50}
      scoreLabel="Matches"
      highScore={highScore}
      isPaused={isPaused}
      isMuted={isMuted}
      onTogglePause={() => setIsPaused((p) => !p)}
      onRestart={() => handleRestart(difficulty)}
      onToggleMute={() => {
        const next = soundEffects.toggleMute();
        setIsMuted(next);
      }}
      onExit={onExit}
      extraHeaderInfo={
        <div className="shell-score-pill time-pill">
          <Clock size={14} />
          <span className="label">Time</span>
          <span className="value">{elapsedSeconds}s</span>
        </div>
      }
    >
      <div className="brain-flip-container">
        {/* Difficulty Switcher Bar */}
        <div className="flip-difficulty-bar">
          <button
            className={`diff-chip ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => handleRestart('easy')}
          >
            🌱 Easy (6 Pairs)
          </button>
          <button
            className={`diff-chip ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => handleRestart('medium')}
          >
            ⚡ Medium (8 Pairs)
          </button>
          <button
            className={`diff-chip ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => handleRestart('hard')}
          >
            🔥 Hard (10 Pairs)
          </button>

          <div className="flip-moves-badge">
            <span>Moves: {moves}</span>
          </div>
        </div>

        {/* 3D Holographic Card Matrix */}
        <div className={`flip-cards-grid grid-${difficulty}`}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedSymIds.includes(card.symId);

            return (
              <div
                key={card.id}
                className={`memory-card-wrap ${isFlipped || isMatched ? 'flipped' : ''} ${
                  isMatched ? 'matched' : ''
                }`}
                onClick={() => handleCardClick(idx)}
              >
                <div className="memory-card-inner">
                  {/* Card Back (Facedown) */}
                  <div className="card-face card-back">
                    <div className="card-back-pattern">
                      <Sparkles size={20} className="card-spark" />
                      <span className="card-logo-text">BUDDY</span>
                    </div>
                  </div>

                  {/* Card Front (Faceup) */}
                  <div className="card-face card-front">
                    <span className="card-symbol-icon">{card.icon}</span>
                    <span className="card-symbol-label">{card.name}</span>
                    {isMatched && <Check size={16} className="match-check-icon" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Screen */}
        {isOver && resultData && (
          <GameResults
            title="Brain Flip Memory Champion"
            score={resultData.score}
            highScore={resultData.highScore}
            isNewHighScore={resultData.isNewHighScore}
            earnedXP={resultData.earnedXP}
            newAchievements={resultData.newAchievements}
            extraStats={resultData.extraStats}
            buddyComment={resultData.buddyComment}
            onPlayAgain={() => handleRestart(difficulty)}
            onExit={onExit}
          />
        )}
      </div>
    </GameShell>
  );
}
