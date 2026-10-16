import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Trophy } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export function GameShell({
  title,
  icon = '🕹️',
  score = 0,
  highScore = 0,
  scoreLabel = 'Score',
  isPaused = false,
  isMuted = false,
  onTogglePause,
  onRestart,
  onToggleMute,
  onExit,
  children,
  extraHeaderInfo,
}) {
  return (
    <div className="arcade-game-shell">
      {/* Top Arcade HUD Header */}
      <header className="arcade-shell-header">
        <div className="shell-left-group">
          <button
            className="shell-btn-back"
            onClick={() => {
              soundEffects.playClick();
              if (onExit) onExit();
            }}
            title="Exit to Arcade Hub"
          >
            <ArrowLeft size={18} />
            <span>Arcade</span>
          </button>

          <div className="shell-title-cluster">
            <span className="shell-game-icon">{icon}</span>
            <span className="shell-game-title">{title}</span>
          </div>
        </div>

        {/* Center Live Scoreboard */}
        <div className="shell-center-scores">
          <div className="shell-score-pill current-score">
            <span className="label">{scoreLabel}</span>
            <span className="value">{score}</span>
          </div>

          <div className="shell-score-pill high-score" title="Your Personal Best">
            <Trophy size={14} className="trophy-icon" />
            <span className="label">Best</span>
            <span className="value">{highScore}</span>
          </div>

          {extraHeaderInfo}
        </div>

        {/* Right Action Controls */}
        <div className="shell-right-controls">
          {onTogglePause && (
            <button
              className={`shell-icon-btn ${isPaused ? 'active-paused' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                onTogglePause();
              }}
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          )}

          {onRestart && (
            <button
              className="shell-icon-btn"
              onClick={() => {
                soundEffects.playClick();
                onRestart();
              }}
              title="Restart Game"
            >
              <RotateCcw size={18} />
            </button>
          )}

          {onToggleMute && (
            <button
              className={`shell-icon-btn ${isMuted ? 'muted' : ''}`}
              onClick={() => {
                onToggleMute();
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </header>

      {/* Main Game Play Area */}
      <div className="arcade-shell-viewport">
        {children}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="arcade-pause-overlay">
            <div className="pause-dialog-glass">
              <h2>⏸️ GAME PAUSED</h2>
              <p>Take a breath! Press resume when ready.</p>
              <button
                className="btn-resume-game"
                onClick={() => {
                  soundEffects.playClick();
                  if (onTogglePause) onTogglePause();
                }}
              >
                <Play size={18} />
                <span>RESUME PLAYING</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
