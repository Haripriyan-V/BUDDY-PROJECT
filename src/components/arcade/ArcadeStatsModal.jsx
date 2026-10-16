import React from 'react';
import { X, Trophy, Award, Zap, Check, Lock, Sparkles } from 'lucide-react';
import {
  ARCADE_ACHIEVEMENTS,
  getArcadeData,
  getArcadeLevel,
} from '../../services/arcadeService';
import { soundEffects } from '../../services/soundEffects';

export function ArcadeStatsModal({ onClose }) {
  const data = getArcadeData();
  const levelInfo = getArcadeLevel(data.stats.totalArcadeXP || 0);
  const unlocked = data.unlockedAchievements || [];

  return (
    <div className="arcade-modal-backdrop" onClick={onClose}>
      <div
        className="arcade-modal-card glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-row">
          <div className="modal-title-cluster">
            <Trophy size={24} className="trophy-gold" />
            <div>
              <h3>Arcade Profile & Achievements</h3>
              <p>Your science-expo gameplay records and discovery medals</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Level & XP Overview Row */}
        <div className="stats-level-banner">
          <div className="level-badge">
            <span className="lvl-num">LVL {levelInfo.level}</span>
            <span className="lvl-title">{levelInfo.title}</span>
          </div>
          <div className="level-xp-progress">
            <div className="xp-label-row">
              <span>Total Arcade XP: <strong>{data.stats.totalArcadeXP || 0} XP</strong></span>
              <span>Next Level: {levelInfo.nextXP} XP</span>
            </div>
            <div className="xp-progress-bar">
              <div
                className="xp-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(((data.stats.totalArcadeXP || 0) / levelInfo.nextXP) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* High Scores Summary */}
        <div className="modal-section-title">
          <Sparkles size={16} />
          <span>PERSONAL BEST RECORDS</span>
        </div>
        <div className="high-scores-grid">
          <div className="score-stat-box">
            <span className="game-icon">🪶</span>
            <span className="game-name">BUDDY Flight</span>
            <span className="game-best">{data.highScores.flight || 0} pts</span>
          </div>
          <div className="score-stat-box">
            <span className="game-icon">🏃</span>
            <span className="game-name">Robo Run</span>
            <span className="game-best">{data.highScores.runner || 0} pts</span>
          </div>
          <div className="score-stat-box">
            <span className="game-icon">🚀</span>
            <span className="game-name">Quiz Blast</span>
            <span className="game-best">{data.highScores.quiz || 0}/5 Orbit</span>
          </div>
          <div className="score-stat-box">
            <span className="game-icon">🧠</span>
            <span className="game-name">Brain Flip</span>
            <span className="game-best">{data.highScores.memory || 0} pts</span>
          </div>
          <div className="score-stat-box">
            <span className="game-icon">🎯</span>
            <span className="game-name">Catch Bots</span>
            <span className="game-best">{data.highScores.bots || 0} pts</span>
          </div>
        </div>

        {/* Achievements List */}
        <div className="modal-section-title">
          <Award size={16} />
          <span>ACHIEVEMENT BADGES ({unlocked.length}/{ARCADE_ACHIEVEMENTS.length})</span>
        </div>
        <div className="achievements-scroll-list">
          {ARCADE_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlocked.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`achievement-card-row ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}`}
              >
                <div className="ach-icon-circle">
                  <span>{ach.icon}</span>
                </div>
                <div className="ach-info-col">
                  <div className="ach-title-row">
                    <strong>{ach.title}</strong>
                    {isUnlocked ? (
                      <span className="unlocked-tag">
                        <Check size={12} /> UNLOCKED
                      </span>
                    ) : (
                      <span className="locked-tag">
                        <Lock size={12} /> LOCKED
                      </span>
                    )}
                  </div>
                  <p>{ach.desc}</p>
                </div>
                <div className="ach-reward-badge">
                  <Zap size={14} className="zap-icon" />
                  <span>+{ach.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
