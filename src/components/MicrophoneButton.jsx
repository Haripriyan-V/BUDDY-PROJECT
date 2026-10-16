import React from 'react';
import { Mic, MicOff, Square, Volume2, VolumeX, RotateCcw, Sparkles, Loader2, Repeat } from 'lucide-react';
import { getLocalizedStatus } from '../utils/languages.js';

export function MicrophoneButton({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  isSupported = true,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onReplay,
  canReplay = false,
  language = 'en',
  statusMessage = '',
  isContinuousMode = false,
  onToggleContinuousMode,
  isAutoSpeak = true,
  onToggleAutoSpeak,
  disabled = false,
}) {
  const handleMainClick = () => {
    if (disabled) return;
    if (isListening) {
      if (onStopListening) onStopListening();
    } else if (isSpeaking) {
      // If clicked while speaking, stop speaking first
      if (onStopSpeaking) onStopSpeaking();
    } else {
      if (onStartListening) onStartListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMainClick();
    }
  };

  const getStatusText = () => {
    if (statusMessage) return statusMessage;
    if (!isSupported) {
      return 'VOICE UNAVAILABLE (TYPE BELOW)';
    }
    if (isListening) {
      return getLocalizedStatus(language, 'listening', "LISTENING... GO AHEAD! 🎙️");
    }
    if (isThinking) {
      return getLocalizedStatus(language, 'thinking', 'THINKING... 🤔');
    }
    if (isSpeaking) {
      return getLocalizedStatus(language, 'speaking', "I'M SPEAKING... 🔊");
    }
    return getLocalizedStatus(language, 'ready', 'TAP TO TALK');
  };

  return (
    <div className="mic-control-cluster" role="region" aria-label="Voice Interaction Controls">
      {/* Top satellite actions row */}
      <div className="mic-satellite-bar">
        {/* Continuous Conversation Mode Opt-in Toggle */}
        {onToggleContinuousMode && (
          <button
            type="button"
            className={`mic-aux-btn btn-continuous-toggle ${isContinuousMode ? 'is-active' : ''}`}
            onClick={onToggleContinuousMode}
            title={
              isContinuousMode
                ? 'Continuous conversation active (Auto-listens after BUDDY speaks). Click to turn off.'
                : 'Turn on Continuous Conversation (Auto-listens after BUDDY speaks)'
            }
            aria-pressed={isContinuousMode}
            aria-label="Toggle continuous conversation mode"
          >
            <Repeat size={14} className={isContinuousMode ? 'spin-gentle' : ''} />
            <span>{isContinuousMode ? 'AUTO-CHAT ON' : 'AUTO-CHAT'}</span>
          </button>
        )}

        {/* Automatic Speech Toggle */}
        {onToggleAutoSpeak && (
          <button
            type="button"
            className={`mic-aux-btn btn-autospeak-toggle ${isAutoSpeak ? 'is-active' : ''}`}
            onClick={onToggleAutoSpeak}
            title={
              isAutoSpeak
                ? 'Auto-Speech is ON (Answers are automatically spoken aloud). Click to disable.'
                : 'Auto-Speech is OFF. Click to enable automatic speech.'
            }
            aria-pressed={isAutoSpeak}
            aria-label="Toggle automatic speech playback"
          >
            {isAutoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{isAutoSpeak ? 'AUTO-SPEECH ON' : 'AUTO-SPEECH OFF'}</span>
          </button>
        )}

        {/* Replay Last Response */}
        {canReplay && onReplay && !isListening && (
          <button
            type="button"
            className="mic-aux-btn btn-replay-response"
            onClick={onReplay}
            title="Replay BUDDY's last answer"
            aria-label="Replay last spoken response"
            disabled={isSpeaking}
          >
            <RotateCcw size={14} />
            <span>REPLAY</span>
          </button>
        )}

        {/* Interrupt / Stop Speaking Button */}
        {isSpeaking && onStopSpeaking && (
          <button
            type="button"
            className="mic-aux-btn btn-stop-speaking animate-pulse"
            onClick={onStopSpeaking}
            title="Stop BUDDY speaking"
            aria-label="Stop speaking"
          >
            <VolumeX size={14} />
            <span>STOP VOICE</span>
          </button>
        )}
      </div>

      {/* Surrounding ripple rings when listening or speaking */}
      {isListening && (
        <div className="mic-pulse-rings listening-rings">
          <div className="mic-ring ring-1"></div>
          <div className="mic-ring ring-2"></div>
        </div>
      )}

      {isSpeaking && (
        <div className="mic-pulse-rings speaking-rings">
          <div className="mic-ring ring-speak-1"></div>
        </div>
      )}

      {/* Main Interactive Mic Button */}
      <button
        id="buddy-main-mic-button"
        className={`main-mic-button ${isListening ? 'is-listening' : ''} ${
          isSpeaking ? 'is-speaking' : ''
        } ${isThinking ? 'is-thinking' : ''} ${!isSupported ? 'not-supported' : ''}`}
        onClick={handleMainClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        tabIndex={0}
        aria-label={
          isListening
            ? 'Stop listening'
            : isSpeaking
            ? 'Stop speaking'
            : isThinking
            ? 'Thinking'
            : 'Start voice conversation'
        }
      >
        <div className="mic-inner-glow">
          {isListening ? (
            <Square size={26} className="mic-icon-stop" />
          ) : isThinking ? (
            <Loader2 size={30} className="mic-icon-spin spin-animation" />
          ) : isSpeaking ? (
            <VolumeX size={28} className="mic-icon-speaking" />
          ) : isSupported ? (
            <Mic size={30} className="mic-icon" />
          ) : (
            <MicOff size={28} className="mic-icon-off" />
          )}
        </div>
      </button>

      {/* Status indicator label */}
      <div className="mic-status-label" aria-live="polite">
        {isListening ? (
          <span className="status-listening">
            <span className="dot-pulse"></span>
            {getStatusText()}
          </span>
        ) : isThinking ? (
          <span className="status-thinking">
            <Sparkles size={12} className="spin-slow" />
            {getStatusText()}
          </span>
        ) : isSpeaking ? (
          <span className="status-speaking">
            <span className="dot-pulse-green"></span>
            {getStatusText()}
          </span>
        ) : !isSupported ? (
          <span className="status-disabled">{getStatusText()}</span>
        ) : (
          <span className="status-ready">{getStatusText()}</span>
        )}
      </div>
    </div>
  );
}
