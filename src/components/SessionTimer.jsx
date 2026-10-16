import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export function SessionTimer({ timeLeft = 180, urgency = 'normal' }) {
  const percent = Math.max(0, Math.min(100, (timeLeft / 180) * 100));

  return (
    <div className={`session-timer-pill urgency-${urgency}`}>
      <div className="timer-icon-wrap">
        {urgency === 'critical' ? (
          <AlertTriangle size={16} className="timer-blink-icon" />
        ) : (
          <Clock size={16} />
        )}
      </div>

      <div className="timer-content">
        <span className="timer-digits">{formatTime(timeLeft)}</span>
      </div>

      {/* Subtle background progress fill */}
      <div
        className="timer-progress-fill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
