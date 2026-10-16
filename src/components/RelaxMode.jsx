import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import { CHARACTER_STATES } from '../utils/characterStates';

const RELAX_STEPS = [
  { text: "Okay... let's take 20 seconds and chill. 😌", phase: 'ready', duration: 4000 },
  { text: 'Take a slow, gentle breath in... 🌬️', phase: 'inhale', duration: 4500 },
  { text: 'Hold softly... 🧘', phase: 'hold', duration: 4000 },
  { text: 'And gently breathe out... 💫', phase: 'exhale', duration: 4500 },
  { text: 'Nice! Feeling refreshed and recharged? ✨', phase: 'done', duration: 3000 },
];

export function RelaxMode({ onComplete, onExit, speakText, setCharacterState }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setCharacterState(CHARACTER_STATES.RELAXING);
    const current = RELAX_STEPS[stepIndex];
    if (speakText && current) {
      speakText(current.text);
    }

    const timer = setTimeout(() => {
      if (stepIndex < RELAX_STEPS.length - 1) {
        setStepIndex((prev) => prev + 1);
      } else {
        if (onComplete) onComplete();
      }
    }, current.duration);

    return () => clearTimeout(timer);
  }, [stepIndex, onComplete, speakText, setCharacterState]);

  const currentStep = RELAX_STEPS[stepIndex];

  return (
    <div className="relax-mode-overlay">
      <div className="relax-ambient-backdrop" />

      {/* Top control bar */}
      <div className="relax-top-bar">
        <div className="relax-badge">
          <Heart size={16} className="heart-glow-icon" />
          <span>MINDFUL RECHARGE WITH BUDDY</span>
        </div>
        <button className="relax-exit-btn" onClick={onExit} aria-label="Skip relaxation">
          <X size={18} />
          <span>Skip Exercise</span>
        </button>
      </div>

      {/* Main Breathing Stage */}
      <div className="relax-circle-stage">
        <div className={`breathing-halo-circle breathing-${currentStep.phase}`}>
          <div className="breathing-inner-core">
            <Sparkles size={28} className="breath-icon" />
            <span className="breath-phase-tag">{currentStep.phase.toUpperCase()}</span>
          </div>
        </div>

        <h2 className="relax-instruction-text">{currentStep.text}</h2>
        <p className="relax-sub-text">Breathe naturally at your own comfortable pace</p>
      </div>
    </div>
  );
}
