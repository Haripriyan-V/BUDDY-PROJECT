import { useState, useEffect, useRef, useCallback } from 'react';
import { getLanguageConfig, getLocalizedStatus } from '../utils/languages.js';

export function useSpeechRecognition({ onResult, onError, language = 'en' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'starting' | 'listening' | 'stopping' | 'error'

  // Stable references for callbacks to prevent effect re-triggering and stale closures
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false);
  const isListeningRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const accumulatedFinalRef = useRef('');
  const accumulatedInterimRef = useRef('');
  const hadErrorRef = useRef(false);
  const userStoppedRef = useRef(false);

  // Recognition instance lifecycle — ONLY recreates when language genuinely changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const langConfig = getLanguageConfig(language);
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = langConfig.speechRecLocale || 'en-IN';

    recognition.onstart = () => {
      isStartingRef.current = false;
      isListeningRef.current = true;
      setIsListening(true);
      setVoiceStatus('listening');
      setErrorStatus(null);
    };

    let autoStopTimer = null;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        accumulatedInterimRef.current = interim;
        setTranscript(interim);
      }

      if (final) {
        accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + final.trim();
        accumulatedInterimRef.current = '';
        setTranscript(accumulatedFinalRef.current);

        // Prompt response: Once final speech is captured in single-utterance mode,
        // stop recognition gracefully after 350ms so Chrome triggers onend immediately
        // instead of hanging in silence for several seconds.
        if (autoStopTimer) clearTimeout(autoStopTimer);
        autoStopTimer = setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current && !hasSubmittedRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              // ignore
            }
          }
        }, 350);
      }
    };

    recognition.onerror = (event) => {
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      setVoiceStatus('error');
      hadErrorRef.current = true;

      const errType = event.error;
      console.warn('Speech recognition status:', errType);

      // Explicit handling for all standard Web Speech API error types
      let userMsg = '';
      if (errType === 'not-allowed' || errType === 'permission-denied' || errType === 'service-not-allowed') {
        setPermissionDenied(true);
        userMsg = getLocalizedStatus(
          language,
          'permissionDenied',
          'Microphone permission blocked. Please allow mic access or type below!'
        );
      } else if (errType === 'no-speech') {
        userMsg = getLocalizedStatus(language, 'noSpeech', "I couldn't hear you. Please try again! 🎙️");
      } else if (errType === 'audio-capture') {
        userMsg = getLocalizedStatus(
          language,
          'error',
          'No microphone detected or audio capture failed. Check your microphone settings!'
        );
      } else if (errType === 'network') {
        userMsg = getLocalizedStatus(
          language,
          'error',
          'Speech recognition network issue. Check your connection or type below!'
        );
      } else if (errType === 'language-not-supported') {
        const cfg = getLanguageConfig(language);
        userMsg = getLocalizedStatus(
          language,
          'voiceUnavailable',
          `Speech recognition for ${cfg?.name || 'this language'} (${cfg?.nativeName || ''}) is not supported in this browser. Please type below! 📝`
        );
      } else if (errType === 'aborted') {
        // Silent if intentionally stopped by user
        if (userStoppedRef.current) return;
        userMsg = '';
      } else {
        userMsg = getLocalizedStatus(language, 'error', 'Speech recognition error. You can type below!');
      }

      if (userMsg) {
        setErrorStatus(userMsg);
        onErrorRef.current?.(userMsg);
      }
    };

    recognition.onend = () => {
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);

      // Single submission guarantee: submit completed utterance exactly once
      if (!hasSubmittedRef.current) {
        const textToSubmit = (accumulatedFinalRef.current || accumulatedInterimRef.current).trim();

        if (textToSubmit) {
          hasSubmittedRef.current = true;
          setVoiceStatus('idle');
          setTranscript(textToSubmit);
          onResultRef.current?.(textToSubmit);
        } else if (!userStoppedRef.current && !hadErrorRef.current) {
          // Finished without detecting speech
          setVoiceStatus('idle');
          const noSpeechNotice = getLocalizedStatus(language, 'noSpeech', "I couldn't hear you. Please try again! 🎙️");
          setErrorStatus(noSpeechNotice);
          onErrorRef.current?.(noSpeechNotice);
        } else {
          setVoiceStatus('idle');
        }
      } else {
        setVoiceStatus('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (autoStopTimer) clearTimeout(autoStopTimer);
      // Clean up only the specific instance created for this language
      try {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch {
        // ignore cleanup errors
      }
      isStartingRef.current = false;
      isListeningRef.current = false;
    };
  }, [language]); // Only re-create instance when the language changes!

  const startListening = useCallback(() => {
    setErrorStatus(null);
    setTranscript('');
    hasSubmittedRef.current = false;
    accumulatedFinalRef.current = '';
    accumulatedInterimRef.current = '';
    hadErrorRef.current = false;
    userStoppedRef.current = false;

    if (!recognitionRef.current) {
      const msg = getLocalizedStatus(language, 'error', 'Speech recognition not available.');
      setErrorStatus(msg);
      onErrorRef.current?.(msg);
      return;
    }

    // Guard against calling start() when already listening or starting
    if (isStartingRef.current || isListeningRef.current) {
      console.debug('Recognition already starting or listening; ignoring duplicate start call');
      return;
    }

    try {
      isStartingRef.current = true;
      setVoiceStatus('starting');
      recognitionRef.current.start();
    } catch (err) {
      isStartingRef.current = false;
      console.warn('Error starting speech recognition:', err);
      // If error indicates already started, synchronize flags
      if (err.name === 'InvalidStateError') {
        isListeningRef.current = true;
        setIsListening(true);
        setVoiceStatus('listening');
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    userStoppedRef.current = true;
    if (recognitionRef.current && (isListeningRef.current || isStartingRef.current)) {
      try {
        setVoiceStatus('stopping');
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    isStartingRef.current = false;
  }, []);

  const abortListening = useCallback(() => {
    userStoppedRef.current = true;
    hasSubmittedRef.current = true; // Guard to prevent late submission on abort
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    isStartingRef.current = false;
    isListeningRef.current = false;
    setIsListening(false);
    setVoiceStatus('idle');
    setTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    voiceStatus,
    transcript,
    errorStatus,
    permissionDenied,
    startListening,
    stopListening,
    abortListening,
    setErrorStatus,
  };
}
