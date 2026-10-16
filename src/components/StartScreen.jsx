import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export function StartScreen({ onStartSession }) {
  return (
    <div className="start-screen-overlay">
      <div className="start-glass-card">
        <div className="start-brand-badge">
          <Sparkles size={16} className="sparkle-cyan" />
          <span>COLLEGE SCIENCE EXPO 2026</span>
        </div>

        <h1 className="start-title">BUDDY</h1>
        <h2 className="start-tagline">YOUR 3-MINUTE AI FRIEND</h2>

        <div className="start-welcome-quote">
          <p className="quote-hi">"Hey! 👋"</p>
          <p className="quote-sub">"Come talk to me."</p>
        </div>

        <button
          id="btn-start-session"
          className="start-session-btn"
          onClick={onStartSession}
        >
          <Play size={20} className="play-icon" />
          <span>START 3-MINUTE SESSION</span>
        </button>

        <p className="start-footer-pills">
          Talk • Play • Relax • Learn
        </p>
      </div>
    </div>
  );
}
