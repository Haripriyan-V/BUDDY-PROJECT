import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gamepad2, Sparkles, BookOpen, Heart, Eye } from 'lucide-react';
import { BuddyScene } from './components/BuddyScene';
import { CharacterSpeechBubble } from './components/CharacterSpeechBubble';
import { SessionTimer } from './components/SessionTimer';
import { MicrophoneButton } from './components/MicrophoneButton';
import { TextFallback } from './components/TextFallback';
import { XPDisplay } from './components/XPDisplay';
import { ChallengePanel } from './components/ChallengePanel';
import { RelaxMode } from './components/RelaxMode';
import { AskBuddyModal } from './components/AskBuddyModal';
import { StartScreen } from './components/StartScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { ExpoControls } from './components/ExpoControls';
import { ExpoInfoModal } from './components/ExpoInfoModal';
import { GameArcade } from './components/arcade/GameArcade';
import { BuddyVision } from './components/vision/BuddyVision';
import { getArcadeData } from './services/arcadeService';

import { CHARACTER_STATES } from './utils/characterStates';
import { BUDDY_CLICK_REACTIONS } from './services/fallbackResponses';
import { sendMessageToBuddy } from './services/conversationService';
import { useSessionTimer } from './hooks/useSessionTimer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useInactivity } from './hooks/useInactivity';
import { getLanguageConfig, getLocalizedStatus } from './utils/languages';

export default function App() {
  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [recentBonus, setRecentBonus] = useState(0);

  // Expo Configuration (Personality & Multilingual)
  const [personality, setPersonality] = useState('playful');
  const [language, setLanguage] = useState('en');

  // Real Session Metrics & Discovery Badges
  const [sessionStats, setSessionStats] = useState({
    gamesCompleted: 0,
    conversationsCount: 0,
    bestReaction: null,
    hasSolvedRiddle: false,
    hasScienceDone: false,
    hasMysteryDone: false,
    hasSpaceDone: false,
  });

  // Character & Speech State
  const [characterState, setCharacterState] = useState(CHARACTER_STATES.IDLE);
  const [speechBubbleText, setSpeechBubbleText] = useState('Hey! 👋 Come talk to me.');
  const [isThinking, setIsThinking] = useState(false);
  const [isAiResponse, setIsAiResponse] = useState(false);
  const [isFallbackResponse, setIsFallbackResponse] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const [isErrorResponse, setIsErrorResponse] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [lastUserQuery, setLastUserQuery] = useState('');
  const [visitorName, setVisitorName] = useState('');

  const lastReactionIdxRef = useRef(-1);
  const lastClickTimeRef = useRef(0);
  const conversationHistoryRef = useRef([]);
  const visitorNameRef = useRef('');
  const lastTopicRef = useRef('');
  const lastAssistantResponseRef = useRef('');
  const continuousTimerRef = useRef(null);
  const languageRef = useRef(language);
  const personalityRef = useRef(personality);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    personalityRef.current = personality;
  }, [personality]);

  // Modals & Sub-modes
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isRelaxOpen, setIsRelaxOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isExpoInfoOpen, setIsExpoInfoOpen] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [arcadeInitialGame, setArcadeInitialGame] = useState(null);
  const [activeOutfit, setActiveOutfit] = useState(() => getArcadeData().activeOutfit);
  const [speechBubbleActions, setSpeechBubbleActions] = useState([]);
  const [voiceNotice, setVoiceNotice] = useState('');

  // Add XP with bonus animation and deduplication
  const awardXP = useCallback((amount) => {
    if (amount <= 0) return;
    setRecentBonus(amount);
    setSessionXP((prev) => prev + amount);
  }, []);

  // Speech Recognition Hook Ref (to break cycle between speech and synthesis)
  const abortListeningRef = useRef(() => {});
  const startListeningRef = useRef(() => {});

  // Speech Synthesis Hook
  const {
    isSpeaking,
    isMuted,
    speak,
    stop: stopSpeech,
    replay,
    toggleMute,
    speechMode,
  } = useSpeechSynthesis({
    language,
    onSpeechStart: () => {
      // Clear continuous listening timer if running
      if (continuousTimerRef.current) {
        clearTimeout(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
      // Echo cancellation: abort listening when speaking
      abortListeningRef.current();
    },
    onSpeechEnd: () => {
      // Revert character to idle or relax when finished talking
      setCharacterState((prev) =>
        prev === CHARACTER_STATES.RELAXING ? CHARACTER_STATES.RELAXING : CHARACTER_STATES.IDLE
      );

      // Continuous conversation mode: auto-start listening after brief pause
      if (isContinuousMode && isSessionActive && !isSessionCompleted) {
        continuousTimerRef.current = setTimeout(() => {
          if (!isSpeaking) {
            setCharacterState(CHARACTER_STATES.LISTENING);
            setSpeechBubbleText('');
            startListeningRef.current();
          }
        }, 650);
      }
    },
    onVoiceUnavailable: (langConfig) => {
      const notice =
        langConfig?.status?.voiceUnavailable ||
        "This voice isn't available on your browser. Text chat is active! 📝";
      setVoiceNotice(notice);
      // Crucial: Keep the written response text visible! Do NOT overwrite it.
    },
  });

  // Inactivity Reminders Hook
  const handleInactivityNudge = useCallback(
    (nudge) => {
      if (!isSessionActive || isSpeaking || isChallengeOpen || isRelaxOpen || isArcadeOpen || isVisionOpen) return;
      setSpeechBubbleText(nudge.text);
      setCharacterState(nudge.expression);
      speak(nudge.text);
    },
    [isSessionActive, isSpeaking, isChallengeOpen, isRelaxOpen, isArcadeOpen, isVisionOpen, speak]
  );

  const { recordActivity, resetInactivity } = useInactivity({
    isActive: isSessionActive && !isSessionCompleted,
    isSuspended: isSpeaking || isChallengeOpen || isRelaxOpen || isArcadeOpen || isVisionOpen,
    onNudge: handleInactivityNudge,
    timeoutSeconds: 11,
  });

  // Handle clickable game action suggestions in speech bubble
  const handleSpeechActionClick = useCallback(
    (actionId) => {
      recordActivity();
      setSpeechBubbleActions([]);
      if (actionId === 'vision') {
        setIsVisionOpen(true);
      } else if (actionId === 'arcade' || actionId === 'stats') {
        setArcadeInitialGame(null);
        setIsArcadeOpen(true);
      } else {
        setArcadeInitialGame(actionId);
        setIsArcadeOpen(true);
      }
    },
    [recordActivity]
  );

  // Handle user speech or text input submission
  const handleUserMessage = useCallback(
    async (userText) => {
      if (!userText || !userText.trim()) return;

      if (continuousTimerRef.current) {
        clearTimeout(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }

      recordActivity();
      stopSpeech();
      setVoiceNotice('');
      const query = userText.trim();
      setLastUserQuery(query);
      conversationHistoryRef.current.push({ role: 'user', content: query });
      setHasHistory(true);

      setSessionStats((prev) => ({
        ...prev,
        conversationsCount: prev.conversationsCount + 1,
      }));

      // Switch Buddy to thinking state
      setIsThinking(true);
      setCharacterState(CHARACTER_STATES.THINKING);
      setSpeechBubbleText(getLocalizedStatus(language, 'thinking', 'Thinking... 🤔'));

      try {
        const activeLang = languageRef.current || language;
        const activePers = personalityRef.current || personality;

        const response = await sendMessageToBuddy(query, {
          history: conversationHistoryRef.current,
          personality: activePers,
          language: activeLang,
          visitorName: visitorNameRef.current,
          lastTopic: lastTopicRef.current,
        });

        setIsThinking(false);

        // If backend returned an error (e.g. missing API key, network timeout, rate limit)
        if (response.isError) {
          setIsErrorResponse(true);
          setIsAiResponse(false);
          setIsFallbackResponse(false);
          setSpeechBubbleText(response.text);
          setCharacterState(CHARACTER_STATES.ERROR);
          setSpeechBubbleActions([]);
          setCanReplay(false);
          // Remove failed turn from history so follow-up or retry is clean
          conversationHistoryRef.current.pop();
          return;
        }

        setIsErrorResponse(false);

        if (response.detectedName) {
          visitorNameRef.current = response.detectedName;
          setVisitorName(response.detectedName);
        }
        if (response.detectedTopic) {
          lastTopicRef.current = response.detectedTopic;
        }

        conversationHistoryRef.current.push({ role: 'assistant', content: response.text });
        lastAssistantResponseRef.current = response.text;
        setCanReplay(true);
        setIsAiResponse(Boolean(response.isAi));
        setIsFallbackResponse(Boolean(response.isFallback));

        setSpeechBubbleText(response.text);
        setCharacterState(response.expression || CHARACTER_STATES.HAPPY);

        // Automatically speak if auto-speech is enabled
        if (isAutoSpeak) {
          speak(response.text, activeLang);
        }

        if (response.buttons && response.buttons.length > 0) {
          setSpeechBubbleActions(response.buttons);
        } else {
          setSpeechBubbleActions([]);
        }

        // Auto-transition to arcade if user commanded to start a game or control arcade
        if (response.gameAction === 'launch' && response.gameIntent) {
          setTimeout(() => {
            setArcadeInitialGame(response.gameIntent);
            setIsArcadeOpen(true);
          }, 1200);
        } else if (response.gameAction === 'arcade') {
          setTimeout(() => {
            setArcadeInitialGame(null);
            setIsArcadeOpen(true);
          }, 1000);
        } else if (response.gameAction === 'vision') {
          setTimeout(() => {
            setIsVisionOpen(true);
          }, 800);
        } else if (response.gameAction === 'exit' || response.gameAction === 'close') {
          setIsArcadeOpen(false);
          setIsVisionOpen(false);
          setArcadeInitialGame(null);
        }

        if (response.rewardXP) {
          awardXP(response.rewardXP);
        }
      } catch (err) {
        setIsThinking(false);
        setIsErrorResponse(true);
        setIsAiResponse(false);
        setIsFallbackResponse(false);
        const activeLang = languageRef.current || language;
        const fallbackText = getLocalizedStatus(
          activeLang,
          'error',
          "Oops! My connection glitched 😭 Let's try that again!"
        );
        setSpeechBubbleText(`${fallbackText} (${err.message || 'Network error'})`);
        setCharacterState(CHARACTER_STATES.ERROR);
        setSpeechBubbleActions([]);
        setCanReplay(false);
        conversationHistoryRef.current.pop();
      }
    },
    [awardXP, speak, stopSpeech, personality, language, recordActivity, isAutoSpeak]
  );

  // Speech Recognition Hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    abortListening,
  } = useSpeechRecognition({
    language,
    onResult: (finalText) => {
      handleUserMessage(finalText);
    },
    onError: (errMessage) => {
      setSpeechBubbleText(errMessage);
      setCharacterState(CHARACTER_STATES.CONFUSED);
    },
  });

  useEffect(() => {
    abortListeningRef.current = abortListening;
    startListeningRef.current = startListening;
  }, [abortListening, startListening]);

  // Language Change Handler
  const handleSelectLanguage = useCallback(
    (newLang) => {
      setLanguage(newLang);
      languageRef.current = newLang;
      stopSpeech();
      abortListening();
      setVoiceNotice('');
      if (continuousTimerRef.current) {
        clearTimeout(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
      const cfg = getLanguageConfig(newLang);
      const welcome = cfg?.status?.welcome || "Hey! What are we exploring today?";
      setSpeechBubbleText(welcome);
      setCharacterState(CHARACTER_STATES.HAPPY);
      speak(welcome, newLang);
    },
    [stopSpeech, abortListening, speak]
  );

  // Clear Conversation History
  const handleClearConversation = useCallback(() => {
    const promptMsg = getLocalizedStatus(language, 'clearConfirm', 'Clear conversation history?');
    if (window.confirm(promptMsg)) {
      conversationHistoryRef.current = [];
      lastAssistantResponseRef.current = '';
      setLastUserQuery('');
      setIsErrorResponse(false);
      setHasHistory(false);
      setCanReplay(false);
      stopSpeech();
      abortListening();
      if (continuousTimerRef.current) {
        clearTimeout(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
      const cfg = getLanguageConfig(language);
      const welcome = cfg?.status?.welcome || "Hey! What are we exploring today?";
      setSpeechBubbleText(welcome);
      setCharacterState(CHARACTER_STATES.IDLE);
    }
  }, [language, stopSpeech, abortListening]);

  // Timer Completion Handler
  const handleTimerComplete = useCallback(() => {
    setIsSessionActive(false);
    setIsSessionCompleted(true);
    abortListening();
    stopSpeech();
    if (continuousTimerRef.current) {
      clearTimeout(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }

    const endQuote = getLocalizedStatus(
      language,
      'timeUp',
      "Aww, our 3 minutes are over! 😭 That was fun! Come back and challenge me again!"
    );

    setSpeechBubbleText(endQuote);
    setCharacterState(CHARACTER_STATES.GOODBYE);
    speak(endQuote);

    // Completion bonus
    awardXP(100);
  }, [abortListening, stopSpeech, speak, awardXP, language]);

  // Session Timer Hook
  const { timeLeft, urgency, resetTimer } = useSessionTimer({
    isActive: isSessionActive && !isSessionCompleted,
    onComplete: handleTimerComplete,
  });

  // Interactive 3D Character Tap/Click Reaction
  const handleCharacterClick = useCallback(() => {
    recordActivity();
    const now = performance.now();
    // Debounce rapid spam clicks
    if (now - lastClickTimeRef.current < 1200) return;
    lastClickTimeRef.current = now;

    // Pick reaction avoiding repeating previous index
    let nextIdx = Math.floor(Math.random() * BUDDY_CLICK_REACTIONS.length);
    if (nextIdx === lastReactionIdxRef.current) {
      nextIdx = (nextIdx + 1) % BUDDY_CLICK_REACTIONS.length;
    }
    lastReactionIdxRef.current = nextIdx;

    const reaction = BUDDY_CLICK_REACTIONS[nextIdx];
    setSpeechBubbleText(reaction.text);
    setCharacterState(reaction.expression);
    speak(reaction.text);

    if (isSessionActive) {
      awardXP(5);
    }
  }, [recordActivity, speak, isSessionActive, awardXP]);

  // Start Session
  const handleStartSession = useCallback(() => {
    setIsSessionActive(true);
    setIsSessionCompleted(false);
    setSessionXP(0);
    setRecentBonus(0);
    conversationHistoryRef.current = [];
    visitorNameRef.current = '';
    lastTopicRef.current = '';
    lastAssistantResponseRef.current = '';
    setHasHistory(false);
    setCanReplay(false);
    setSessionStats({
      gamesCompleted: 0,
      conversationsCount: 0,
      bestReaction: null,
      hasSolvedRiddle: false,
      hasScienceDone: false,
      hasMysteryDone: false,
      hasSpaceDone: false,
    });
    resetInactivity();
    resetTimer();

    const welcomeMsg = getLocalizedStatus(
      language,
      'welcome',
      "Okay! You've got 3 minutes with me. 😎 What are we doing today?"
    );

    setSpeechBubbleText(welcomeMsg);
    setCharacterState(CHARACTER_STATES.HAPPY);
    speak(welcomeMsg);
  }, [resetInactivity, resetTimer, speak, language]);

  // Reset for Next Player
  const handleResetForNextPlayer = useCallback(() => {
    abortListening();
    stopSpeech();
    resetTimer();
    resetInactivity();
    if (continuousTimerRef.current) {
      clearTimeout(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }

    setIsSessionActive(false);
    setIsSessionCompleted(false);
    setIsChallengeOpen(false);
    setIsRelaxOpen(false);
    setIsAskOpen(false);
    setIsExpoInfoOpen(false);
    setIsArcadeOpen(false);
    setArcadeInitialGame(null);
    setSpeechBubbleActions([]);
    setSessionXP(0);
    setRecentBonus(0);
    conversationHistoryRef.current = [];
    visitorNameRef.current = '';
    lastTopicRef.current = '';
    lastAssistantResponseRef.current = '';
    setLastUserQuery('');
    setIsErrorResponse(false);
    setHasHistory(false);
    setCanReplay(false);

    setSessionStats({
      gamesCompleted: 0,
      conversationsCount: 0,
      bestReaction: null,
      hasSolvedRiddle: false,
      hasScienceDone: false,
      hasMysteryDone: false,
      hasSpaceDone: false,
    });

    setCharacterState(CHARACTER_STATES.IDLE);
    setSpeechBubbleText('Hey! 👋 Come talk to me.');
  }, [abortListening, stopSpeech, resetTimer, resetInactivity]);

  // Mini-game reward handler with session stats tracking
  const handleCompleteChallenge = useCallback(
    (earnedXP, challengeType = '') => {
      recordActivity();
      awardXP(earnedXP);

      setSessionStats((prev) => {
        const isReflex =
          challengeType.toLowerCase().includes('reaction') ||
          challengeType.toLowerCase().includes('reflex');
        const isRiddle =
          challengeType.toLowerCase().includes('riddle') ||
          challengeType.toLowerCase().includes('brain');
        const isScience =
          challengeType.toLowerCase().includes('science') ||
          challengeType.toLowerCase().includes('myth');
        const isMystery =
          challengeType.toLowerCase().includes('mystery') ||
          challengeType.toLowerCase().includes('memory');
        const isSpace =
          challengeType.toLowerCase().includes('mars') ||
          challengeType.toLowerCase().includes('story');

        return {
          ...prev,
          gamesCompleted: prev.gamesCompleted + 1,
          bestReaction: isReflex
            ? prev.bestReaction
              ? Math.min(prev.bestReaction, 295)
              : 295
            : prev.bestReaction,
          hasSolvedRiddle: prev.hasSolvedRiddle || isRiddle,
          hasScienceDone: prev.hasScienceDone || isScience,
          hasMysteryDone: prev.hasMysteryDone || isMystery,
          hasSpaceDone: prev.hasSpaceDone || isSpace,
        };
      });
    },
    [recordActivity, awardXP]
  );

  // Mic Button Action with Listening state synchronization
  const handleMicClick = () => {
    recordActivity();
    if (continuousTimerRef.current) {
      clearTimeout(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }
    if (isSpeaking) {
      stopSpeech();
      // Stop speech and immediately transition to listening
      setCharacterState(CHARACTER_STATES.LISTENING);
      setSpeechBubbleText('');
      startListening();
    } else if (isListening) {
      stopListening();
    } else {
      stopSpeech();
      setCharacterState(CHARACTER_STATES.LISTENING);
      setSpeechBubbleText('');
      startListening();
    }
  };

  return (
    <main className="buddy-app-viewport" id="buddy-main-container">
      {/* Background Star Grid */}
      <div className="ambient-star-grid" />

      {/* TOP NAVIGATION / STATUS BAR */}
      <header className="buddy-top-nav">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <Sparkles size={16} className="brand-sparkle" />
            <span className="brand-name">BUDDY 2.0</span>
          </div>
          <span className="brand-tagline-desktop">YOUR 3-MINUTE AI FRIEND</span>
        </div>

        <div className="top-center-status">
          <SessionTimer timeLeft={timeLeft} urgency={urgency} />
          <XPDisplay xp={sessionXP} recentBonus={recentBonus} />
        </div>

        <div className="top-right-actions">
          <ExpoControls
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onResetSession={handleResetForNextPlayer}
            onClearConversation={handleClearConversation}
            isSessionActive={isSessionActive}
            personality={personality}
            onSelectPersonality={setPersonality}
            language={language}
            onSelectLanguage={handleSelectLanguage}
            onOpenInfo={() => setIsExpoInfoOpen(true)}
            hasHistory={hasHistory}
          />
        </div>
      </header>

      {/* 3D CHARACTER STAGE */}
      <section className="buddy-character-stage">
        <BuddyScene
          characterState={characterState}
          isSpeaking={isSpeaking}
          onCharacterClick={handleCharacterClick}
          outfit={activeOutfit}
        />

        {/* Dynamic Speech Bubble with Interactive Actions */}
        <CharacterSpeechBubble
          text={isListening ? transcript : speechBubbleText}
          expression={characterState}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          isAi={isAiResponse}
          isFallback={isFallbackResponse}
          isError={isErrorResponse}
          canRetry={isErrorResponse && Boolean(lastUserQuery)}
          onRetry={() => {
            if (lastUserQuery) {
              handleUserMessage(lastUserQuery);
            }
          }}
          language={language}
          voiceNotice={voiceNotice}
          speechMode={speechMode}
          actions={speechBubbleActions}
          onActionClick={handleSpeechActionClick}
          onReplay={replay}
          onStopSpeaking={stopSpeech}
        />
      </section>

      {/* BOTTOM CONTROLS & INTERACTION CLUSTER */}
      <footer className="buddy-bottom-stage">
        {/* Quick Action Feature Buttons */}
        <div className="buddy-action-pills-row">
          <button
            id="btn-play-arcade"
            className="action-pill-btn pill-arcade-play"
            onClick={() => {
              recordActivity();
              setArcadeInitialGame(null);
              setIsArcadeOpen(true);
            }}
            disabled={!isSessionActive}
            title="Open BUDDY Arcade (6 Playable Science Expo Games)"
          >
            <Gamepad2 size={18} />
            <span>PLAY WITH BUDDY (6) 🕹️</span>
          </button>

          <button
            id="btn-challenge-me"
            className="action-pill-btn pill-challenge"
            onClick={() => {
              recordActivity();
              setIsChallengeOpen(true);
            }}
            disabled={!isSessionActive}
          >
            <Sparkles size={18} />
            <span>PLAY ZONE (10)</span>
          </button>

          <button
            id="btn-buddy-vision"
            className="action-pill-btn pill-vision"
            onClick={() => {
              recordActivity();
              setIsVisionOpen(true);
            }}
            disabled={!isSessionActive}
            title="Open BUDDY AI Vision (Live Human & Object Detection + Visual Q&A)"
          >
            <Eye size={18} />
            <span>AI VISION 👁️</span>
          </button>

          <button
            id="btn-ask-buddy"
            className="action-pill-btn pill-ask"
            onClick={() => {
              recordActivity();
              setIsAskOpen(true);
            }}
            disabled={!isSessionActive}
          >
            <BookOpen size={18} />
            <span>ASK BUDDY</span>
          </button>

          <button
            id="btn-relax-buddy"
            className="action-pill-btn pill-relax"
            onClick={() => {
              recordActivity();
              setIsRelaxOpen(true);
            }}
            disabled={!isSessionActive}
          >
            <Heart size={18} />
            <span>RELAX WITH BUDDY</span>
          </button>
        </div>

        {/* Central Voice Microphone Trigger with Satellite Controls */}
        <MicrophoneButton
          isListening={isListening}
          isThinking={isThinking}
          isSpeaking={isSpeaking}
          isSupported={isSpeechSupported}
          onStartListening={handleMicClick}
          onStopListening={stopListening}
          onStopSpeaking={stopSpeech}
          onReplay={replay}
          canReplay={canReplay}
          language={language}
          isContinuousMode={isContinuousMode}
          onToggleContinuousMode={() => setIsContinuousMode((prev) => !prev)}
          isAutoSpeak={isAutoSpeak}
          onToggleAutoSpeak={() => setIsAutoSpeak((prev) => !prev)}
          disabled={!isSessionActive}
        />

        {/* Text Input Fallback Bar */}
        <TextFallback
          onSendMessage={(msg) => handleUserMessage(msg)}
          disabled={!isSessionActive || isSpeaking || isListening}
          placeholder={getLanguageConfig(language).status.placeholder}
        />
      </footer>

      {/* OVERLAY: START SCREEN */}
      {!isSessionActive && !isSessionCompleted && (
        <StartScreen onStartSession={handleStartSession} />
      )}

      {/* OVERLAY: MINI-GAMES / CHALLENGE ARENA */}
      {isChallengeOpen && (
        <ChallengePanel
          onCompleteChallenge={handleCompleteChallenge}
          onClose={() => {
            setIsChallengeOpen(false);
            setCharacterState(CHARACTER_STATES.IDLE);
          }}
          setCharacterState={setCharacterState}
        />
      )}

      {/* OVERLAY: BUDDY ARCADE HUB (6 FULL GAMES) */}
      {isArcadeOpen && (
        <GameArcade
          initialGameId={arcadeInitialGame}
          onExit={() => {
            setIsArcadeOpen(false);
            setArcadeInitialGame(null);
            setCharacterState(CHARACTER_STATES.HAPPY);
          }}
          onAwardXP={awardXP}
          setCharacterState={setCharacterState}
          onOutfitChange={(newOutfit) => setActiveOutfit(newOutfit)}
        />
      )}

      {/* OVERLAY: RELAX MODE */}
      {isRelaxOpen && (
        <RelaxMode
          speakText={speak}
          setCharacterState={setCharacterState}
          onComplete={() => {
            setIsRelaxOpen(false);
            setCharacterState(CHARACTER_STATES.HAPPY);
            setSpeechBubbleText('Nice recharge! What challenge are we tackling next? 🚀');
          }}
          onExit={() => {
            stopSpeech();
            setIsRelaxOpen(false);
            setCharacterState(CHARACTER_STATES.IDLE);
          }}
        />
      )}

      {/* OVERLAY: ASK BUDDY SCIENCE HELPER */}
      {isAskOpen && (
        <AskBuddyModal
          onSelectQuestion={(q) => handleUserMessage(q)}
          onClose={() => setIsAskOpen(false)}
        />
      )}

      {/* OVERLAY: EXPO INFO ARCHITECTURE MODAL */}
      {isExpoInfoOpen && (
        <ExpoInfoModal onClose={() => setIsExpoInfoOpen(false)} />
      )}

      {/* OVERLAY: BUDDY AI VISION DASHBOARD */}
      {isVisionOpen && (
        <BuddyVision
          isOpen={isVisionOpen}
          onClose={() => {
            setIsVisionOpen(false);
            setCharacterState(CHARACTER_STATES.IDLE);
          }}
          language={language}
          personality={personality}
          visitorName={visitorName}
          onBuddySpeak={(text, lang) => {
            setSpeechBubbleText(text);
            speak(text, lang || language);
          }}
          onUpdateCharacterState={setCharacterState}
          onAwardXP={awardXP}
        />
      )}

      {/* OVERLAY: SESSION COMPLETE & NEXT PLAYER */}
      {isSessionCompleted && (
        <CompletionScreen
          totalXP={sessionXP}
          stats={sessionStats}
          onNextPlayer={handleResetForNextPlayer}
        />
      )}
    </main>
  );
}
