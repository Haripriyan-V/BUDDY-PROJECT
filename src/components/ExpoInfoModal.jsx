import React from 'react';
import { X, Cpu, Mic, Brain, Sparkles, ShieldCheck, Gamepad2, Award } from 'lucide-react';

export function ExpoInfoModal({ onClose }) {
  return (
    <div className="ask-modal-backdrop" onClick={onClose}>
      <div className="expo-info-card-glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ask-header">
          <div className="ask-title-wrap">
            <Cpu size={22} className="book-icon" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#00f2fe' }}>
                BUDDY 2.0 • SCIENCE EXPO INNOVATION ARCHITECTURE
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                How Your 3-Minute AI Friend Works
              </span>
            </div>
          </div>
          <button className="ask-close-btn" onClick={onClose} aria-label="Close architecture modal">
            <X size={18} />
          </button>
        </div>

        {/* Informational Cards Grid */}
        <div className="expo-info-grid">
          <div className="info-pill-card">
            <div className="info-pill-header">
              <Mic size={18} className="info-icon-cyan" />
              <h4>1. Voice & Speech Recognition</h4>
            </div>
            <p>
              Uses client-side Web Speech Recognition API with multi-language detection (English, Hindi, Tamil). Includes echo cancellation and talk-back protection so BUDDY never hears his own voice.
            </p>
          </div>

          <div className="info-pill-card">
            <div className="info-pill-header">
              <Brain size={18} className="info-icon-purple" />
              <h4>2. Dual-Engine Conversational AI</h4>
            </div>
            <p>
              Combines a secure backend proxy (supporting Google Gemini & OpenAI models) with a high-speed offline rule-engine. If the internet or API is unavailable, BUDDY seamlessly continues conversation without interruption.
            </p>
          </div>

          <div className="info-pill-card">
            <div className="info-pill-header">
              <Sparkles size={18} className="info-icon-gold" />
              <h4>3. 3D Procedural Character Controller</h4>
            </div>
            <p>
              Built using Three.js and React Three Fiber. Features cursor eye/head tracking, natural breathing, procedural blinking, talking mouth synchronization, and 15 emotional expression states.
            </p>
          </div>

          <div className="info-pill-card">
            <div className="info-pill-header">
              <Gamepad2 size={18} className="info-icon-cyan" />
              <h4>4. 10 Interactive STEM Activities</h4>
            </div>
            <p>
              Play Zone with 10 touch-friendly science activities: Brain Spark riddles, adaptive Science Quiz, Mystery Object clues, Mars Rover Rescue, and Reaction Rush timing millisecond reflexes.
            </p>
          </div>

          <div className="info-pill-card">
            <div className="info-pill-header">
              <Award size={18} className="info-icon-gold" />
              <h4>5. Session XP & Gamified Badges</h4>
            </div>
            <p>
              Lightweight session rewards calculate real performance titles and badges (Curious Explorer, Science Buddy, Quick Thinker, Cosmic Explorer) without unfair spamming or fake stats.
            </p>
          </div>

          <div className="info-pill-card">
            <div className="info-pill-header">
              <ShieldCheck size={18} className="info-icon-green" />
              <h4>6. Expo Privacy & Instant Reset</h4>
            </div>
            <p>
              Strict privacy by design: No personal data is stored or uploaded. Session memory (visitor's name and topic context) resets cleanly within 2 seconds for the next visiting student.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <button className="primary-action-btn" onClick={onClose}>
            Back to BUDDY Stage →
          </button>
        </div>
      </div>
    </div>
  );
}
