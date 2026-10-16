import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export function XPDisplay({ xp = 0, recentBonus = 0 }) {
  const [floatingBonus, setFloatingBonus] = useState(null);

  useEffect(() => {
    if (recentBonus > 0) {
      setFloatingBonus(`+${recentBonus} XP`);
      const timer = setTimeout(() => {
        setFloatingBonus(null);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [recentBonus]);

  return (
    <div className="xp-badge-container">
      <div className="xp-badge-pill">
        <Zap size={16} className="xp-icon" />
        <span className="xp-label">XP</span>
        <span className="xp-value">{xp}</span>
      </div>

      {floatingBonus && (
        <div key={Date.now()} className="xp-floating-popup">
          {floatingBonus}
        </div>
      )}
    </div>
  );
}
