import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, RotateCcw, ArrowLeft, Star, Award, Sparkles } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export function GameResults({
  title,
  score = 0,
  highScore = 0,
  isNewHighScore = false,
  earnedXP = 0,
  newAchievements = [],
  extraStats = [],
  buddyComment = "Great game! You've got awesome reflexes! 🤖✨",
  onPlayAgain,
  onExit,
}) {
  useEffect(() => {
    if (isNewHighScore || newAchievements.length > 0) {
      soundEffects.playVictory();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#e100ff', '#ffb703', '#ffffff'],
        });
      } catch {}
    } else {
      soundEffects.playGameOver();
    }
  }, [isNewHighScore, newAchievements]);

  return (
    <div className="arcade-results-overlay">
      <div className="results-card-glass">
        {/* Header Badge */}
        <div className="results-header">
          {isNewHighScore ? (
            <div className="record-badge pulse">
              <Trophy size={20} className="trophy-gold" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          ) : (
            <div className="game-over-tag">
              <Sparkles size={18} />
              <span>ROUND COMPLETE</span>
            </div>
          )}
          <h2 className="game-results-title">{title}</h2>
        </div>

        {/* Score Showcase */}
        <div className="results-score-box">
          <div className="score-number-wrap">
            <span className="big-score">{score}</span>
            <span className="score-caption">Points Scored</span>
          </div>

          <div className="results-xp-award">
            <Zap size={20} className="zap-icon" />
            <span className="xp-val">+{earnedXP} XP</span>
            <span className="xp-note">Added to Session!</span>
          </div>
        </div>

        {/* Extra Stats Row (e.g. Distance, Accuracy, Streak) */}
        {extraStats && extraStats.length > 0 && (
          <div className="extra-stats-grid">
            {extraStats.map((stat, i) => (
              <div key={i} className="stat-bubble">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-val">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Unlocked Achievements Section */}
        {newAchievements && newAchievements.length > 0 && (
          <div className="unlocked-achievements-row">
            <div className="ach-badge-title">
              <Award size={16} />
              <span>ACHIEVEMENTS UNLOCKED!</span>
            </div>
            {newAchievements.map((ach) => (
              <div key={ach.id} className="achievement-pill-award">
                <span className="ach-icon">{ach.icon}</span>
                <div className="ach-text">
                  <strong>{ach.title}</strong>
                  <span>{ach.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUDDY Character Commentary */}
        <div className="results-buddy-quote">
          <div className="buddy-avatar-chip">🤖</div>
          <p>"{buddyComment}"</p>
        </div>

        {/* Action Buttons */}
        <div className="results-action-buttons">
          <button
            className="btn-results-replay"
            onClick={() => {
              soundEffects.playClick();
              if (onPlayAgain) onPlayAgain();
            }}
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>

          <button
            className="btn-results-exit"
            onClick={() => {
              soundEffects.playClick();
              if (onExit) onExit();
            }}
          >
            <ArrowLeft size={18} />
            <span>BACK TO ARCADE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
