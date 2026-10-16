import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, Zap, Star, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { getPerformanceTitle, calculateEarnedBadges } from '../services/scoringService';

export function CompletionScreen({ totalXP = 0, onNextPlayer, stats = {} }) {
  const performanceTitle = getPerformanceTitle(totalXP);
  const earnedBadges = stats.badges || calculateEarnedBadges({ xp: totalXP, ...stats });

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#00f2fe', '#7f00ff', '#ffb703', '#ffffff', '#10b981'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="completion-screen-overlay">
      <div className="completion-glass-card">
        {/* Top Header Badge */}
        <div className="completion-badge">
          <Star size={18} className="star-gold" />
          <span>3-MINUTE EXPO SESSION COMPLETE ⭐</span>
        </div>

        <h2 className="completion-headline">"NOOO! Time's up! 😭 That was epic!"</h2>
        <p className="completion-subline">
          "You were an incredible science companion! Check out what you accomplished!"
        </p>

        {/* Score & Title Pill */}
        <div className="score-summary-box">
          <span className="summary-label">TOTAL SESSION XP</span>
          <div className="score-number-row">
            <Zap size={32} className="score-icon-large" />
            <span className="score-total-digits">{totalXP}</span>
            <span className="score-unit">XP</span>
          </div>

          <div className="performance-title-pill">
            <Award size={18} className="award-icon" />
            <span className="title-text">{performanceTitle}</span>
          </div>
        </div>

        {/* Real Session Metrics */}
        <div className="completion-stats-row">
          <div className="stat-card-pill">
            <span className="stat-label">Activities Done</span>
            <span className="stat-value">{stats.gamesCompleted || 0}</span>
          </div>
          <div className="stat-card-pill">
            <span className="stat-label">AI Questions</span>
            <span className="stat-value">{stats.conversationsCount || 0}</span>
          </div>
          <div className="stat-card-pill">
            <span className="stat-label">Best Reflex</span>
            <span className="stat-value">{stats.bestReaction ? `${stats.bestReaction}ms` : '—'}</span>
          </div>
        </div>

        {/* Badges Earned Section */}
        {earnedBadges.length > 0 && (
          <div className="badges-earned-section">
            <span className="badges-section-label">
              <Trophy size={15} className="trophy-gold" /> EXPO DISCOVERY BADGES EARNED
            </span>
            <div className="badges-grid-pill">
              {earnedBadges.map((badge, idx) => (
                <div key={idx} className="badge-item-pill" title={badge.desc}>
                  <span className="badge-icon-emoji">{badge.icon}</span>
                  <div className="badge-text-wrap">
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc">{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset For Next Visitor Button */}
        <button
          id="btn-next-player"
          className="next-player-btn"
          onClick={onNextPlayer}
          aria-label="Reset session for next visitor"
        >
          <span>NEXT VISITOR / PLAY AGAIN</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
