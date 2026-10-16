import React from 'react';
import { Play, Trophy, Sparkles } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export function GameCard({
  id,
  title,
  icon,
  category,
  difficulty,
  desc,
  highScore = 0,
  scoreUnit = 'pts',
  isFeatured = false,
  onPlay,
}) {
  return (
    <div className={`arcade-game-card ${isFeatured ? 'featured-card' : ''}`}>
      {isFeatured && (
        <div className="card-featured-badge">
          <Sparkles size={13} className="spin-slow" />
          <span>SCIENCE EXPO FEATURED</span>
        </div>
      )}

      {/* Card Header Illustration */}
      <div className="card-visual-top">
        <span className="card-big-icon">{icon}</span>
        <div className="card-category-pill">{category}</div>
      </div>

      {/* Card Body */}
      <div className="card-content-body">
        <div className="card-title-row">
          <h3 className="card-game-title">{title}</h3>
          <span className="card-diff-tag">{difficulty}</span>
        </div>

        <p className="card-game-desc">{desc}</p>

        {/* High Score Pill */}
        <div className="card-best-score">
          <Trophy size={14} className="trophy-gold" />
          <span className="best-label">Best:</span>
          <span className="best-val">
            {highScore} {scoreUnit}
          </span>
        </div>
      </div>

      {/* Play Action Button */}
      <div className="card-action-footer">
        <button
          className="btn-play-game"
          onClick={() => {
            soundEffects.playClick();
            if (onPlay) onPlay(id);
          }}
        >
          <Play size={16} fill="currentColor" />
          <span>PLAY NOW</span>
        </button>
      </div>
    </div>
  );
}
