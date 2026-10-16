import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, RotateCcw, Info, Trash2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages.js';

export function ExpoControls({
  isMuted,
  onToggleMute,
  onResetSession,
  onClearConversation,
  isSessionActive,
  personality = 'playful',
  onSelectPersonality,
  language = 'en',
  onSelectLanguage,
  onOpenInfo,
  hasHistory = false,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="expo-controls-bar">
      {/* Personality Mode Switcher */}
      <div className="expo-selector-wrapper" title="Switch AI Personality">
        <select
          id="buddy-personality-selector"
          className="expo-select-dropdown"
          value={personality}
          onChange={(e) => onSelectPersonality && onSelectPersonality(e.target.value)}
          aria-label="Select AI Personality"
        >
          <option value="playful">🎭 Playful</option>
          <option value="explorer">🔭 Explorer</option>
          <option value="helper">💡 Helper</option>
        </select>
      </div>

      {/* Multilingual Selector (All 9 Supported Languages) */}
      <div className="expo-selector-wrapper" title="Select Voice/Chat Language">
        <select
          id="buddy-language-selector"
          className="expo-select-dropdown lang-select"
          value={language}
          onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value)}
          aria-label="Select Language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {/* Clear Conversation History Button */}
      {hasHistory && onClearConversation && (
        <button
          id="buddy-clear-history-btn"
          className="expo-icon-btn btn-clear-history"
          onClick={onClearConversation}
          title="Clear Conversation History"
          aria-label="Clear Conversation History"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* "How BUDDY Works" Expo Info button */}
      <button
        id="buddy-info-btn"
        className="expo-icon-btn btn-info-help"
        onClick={onOpenInfo}
        title="How BUDDY Works (Science Expo Info)"
        aria-label="How BUDDY Works Info"
      >
        <Info size={18} />
      </button>

      {/* Voice Mute Toggle */}
      <button
        id="buddy-mute-btn"
        className={`expo-icon-btn ${isMuted ? 'btn-active-mute' : ''}`}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute BUDDY voice' : 'Mute BUDDY voice'}
        aria-label="Toggle voice sound"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Fullscreen Expo Mode Toggle */}
      <button
        id="buddy-fullscreen-btn"
        className="expo-icon-btn btn-fullscreen"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Expo Fullscreen Mode'}
        aria-label="Toggle Expo Fullscreen Mode"
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Quick Reset button if session is active */}
      {isSessionActive && (
        <button
          id="buddy-reset-session-btn"
          className="expo-icon-btn btn-reset"
          onClick={onResetSession}
          title="Reset to New Student (Next Visitor)"
          aria-label="Reset session"
        >
          <RotateCcw size={17} />
        </button>
      )}
    </div>
  );
}
