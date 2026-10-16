import React from 'react';
import { Volume2, VolumeX, Sparkles, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { getLocalizedStatus } from '../utils/languages.js';

export function CharacterSpeechBubble({
  text,
  expression = 'idle',
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  isAi = false,
  isFallback = false,
  isError = false,
  canRetry = false,
  onRetry,
  language = 'en',
  voiceNotice = '',
  speechMode = 'native',
  actions = [],
  onActionClick,
  onReplay,
  onStopSpeaking,
}) {
  if (!text && !isListening && !isThinking) return null;

  return (
    <div
      className={`character-speech-container ${isSpeaking ? 'speaking-active' : ''} ${
        isListening ? 'listening-active' : ''
      } ${isError ? 'speech-error-active' : ''}`}
    >
      <div className="speech-bubble-glass">
        {/* Top header badge */}
        <div className="speech-header">
          <div className="speech-header-left">
            <span className="speech-mascot-tag">
              <Sparkles size={13} className="spin-slow" />
              BUDDY • {expression.toUpperCase()}
            </span>

            {/* Clear distinction: Genuine GPT AI or Error */}
            {isAi && (
              <span className="speech-source-badge badge-ai" title="Generated dynamically by OpenAI GPT">
                <Bot size={11} />
                <span>GPT-POWERED</span>
              </span>
            )}
            {isError && (
              <span className="speech-source-badge badge-error" title="GPT API returned an issue">
                <AlertCircle size={11} />
                <span>API NOTICE</span>
              </span>
            )}
            {isFallback && !isAi && !isListening && !isThinking && !isError && (
              <span className="speech-source-badge badge-fallback" title="Response generated locally">
                <span>OFFLINE BRAIN</span>
              </span>
            )}
            {voiceNotice && !isListening && !isThinking && (
              <span className="speech-source-badge badge-voice-notice" title={voiceNotice}>
                <VolumeX size={11} />
                <span>TEXT ACTIVE</span>
              </span>
            )}
            {speechMode === 'tts-fallback' && !voiceNotice && !isListening && !isThinking && !isError && (
              <span className="speech-source-badge badge-tts-fallback" title="Spoken via cloud TTS fallback for native pronunciation">
                <Volume2 size={11} />
                <span>TTS VOICE</span>
              </span>
            )}
          </div>

          <div className="speech-header-right">
            {/* Stop playback button */}
            {isSpeaking && onStopSpeaking && (
              <button
                type="button"
                className="speech-header-mini-btn btn-stop-speech"
                onClick={onStopSpeaking}
                title="Stop audio playback"
                aria-label="Stop audio"
              >
                <VolumeX size={13} />
                <span>Stop</span>
              </button>
            )}

            {/* Speak / Replay answer aloud */}
            {!isSpeaking && !isListening && !isThinking && text && !isError && onReplay && (
              <button
                type="button"
                className="speech-header-mini-btn btn-replay-speech"
                onClick={onReplay}
                title="Speak answer aloud"
                aria-label="Speak answer"
              >
                <Volume2 size={13} />
                <span>Speak</span>
              </button>
            )}

            {/* Retry button on error */}
            {isError && canRetry && onRetry && (
              <button
                type="button"
                className="speech-header-mini-btn btn-retry-speech"
                onClick={onRetry}
                title="Retry asking GPT"
                aria-label="Retry question"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            )}

            {isSpeaking && (
              <div className="audio-wave-bars">
                <span className="wave-bar bar-1"></span>
                <span className="wave-bar bar-2"></span>
                <span className="wave-bar bar-3"></span>
                <span className="wave-bar bar-4"></span>
                <Volume2 size={13} className="volume-icon" />
              </div>
            )}
          </div>
        </div>

        {/* Text body */}
        <div className="speech-text">
          {isListening ? (
            <span className="listening-interim">
              <span className="pulse-dot"></span>
              {text ? `"${text}"` : getLocalizedStatus(language, 'listening', "Listening to you... go ahead! 🎙️")}
            </span>
          ) : isThinking ? (
            <span className="thinking-text">
              <span className="pulse-dot thinking-dot"></span>
              {text || getLocalizedStatus(language, 'thinking', 'Let me think about that... 🤔')}
            </span>
          ) : (
            text
          )}
        </div>

        {/* Error Retry Bar inside speech bubble */}
        {isError && canRetry && onRetry && (
          <div className="speech-error-retry-row">
            <button
              type="button"
              className="speech-action-chip retry-chip"
              onClick={onRetry}
            >
              <RefreshCw size={14} />
              <span>Retry this question with GPT</span>
            </button>
          </div>
        )}

        {/* Interactive Game Action Chips */}
        {actions && actions.length > 0 && !isListening && !isThinking && (
          <div className="speech-action-buttons">
            {actions.map((act) => (
              <button
                key={act.id}
                className="speech-action-chip"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onActionClick) onActionClick(act.id);
                }}
              >
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Pointer arrow to character */}
        <div className="speech-pointer-arrow" />
      </div>
    </div>
  );
}
