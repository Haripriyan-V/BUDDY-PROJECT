import { useState, useEffect, useRef, useCallback } from 'react';
import { getLanguageConfig } from '../utils/languages.js';

// Regex to strip emojis, variation selectors, markdown formatting, and decorative symbols from spoken audio
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F\u200D]/gu, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FB}\u{25FC}\u{25B6}\u{25C0}\u{1F004}\u{1F0CF}\u{1FA00}-\u{1FAFF}]/gu, '')
    .replace(/[*_#`~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent voice matching across all BUDDY languages:
 * 1. Exact match on preferred locale (e.g. 'ta-in', 'ml-in', 'kn-in', 'te-in', 'hi-in', 'bn-in', 'es-es', 'fr-fr', 'en-in')
 * 2. Starts with preferred locale
 * 3. Configured fallback locales (e.g. 'bn-bd', 'ta-lk', 'es-mx', 'fr-ca')
 * 4. Language code prefix (e.g. 'ta', 'ml', 'kn', 'te', 'hi', 'bn', 'es', 'fr')
 * 5. Voice name matching against English name, native name, or vendor synthesizer actor aliases
 * 6. For English: pick friendly mascot English voice
 * 7. For non-English without genuine match: return NULL (never substitute English for other languages)
 */
export function findVoiceForLanguage(voices, langCode) {
  if (!voices || !Array.isArray(voices) || voices.length === 0) return null;
  const config = getLanguageConfig(langCode);
  const preferredLocale = (config?.speechSynthLocale || 'en-IN').toLowerCase().replace(/_/g, '-');
  const fallbackLocales = (config?.fallbackSynthLocales || []).map((l) =>
    l.toLowerCase().replace(/_/g, '-')
  );
  const langLower = (langCode || 'en').toLowerCase().split(/[-_]/)[0];
  const langNameLower = (config?.name || '').toLowerCase();
  const nativeNameLower = (config?.nativeName || '').toLowerCase();

  const norm = (loc) => (loc || '').toLowerCase().replace(/_/g, '-');

  // 1. Exact match on preferred locale
  let matched = voices.find((v) => norm(v.lang) === preferredLocale);
  if (matched) return matched;

  // 2. Starts with preferred locale
  matched = voices.find((v) => norm(v.lang).startsWith(preferredLocale));
  if (matched) return matched;

  // 3. Match against configured fallback locales
  for (const fb of fallbackLocales) {
    matched = voices.find((v) => norm(v.lang) === fb || norm(v.lang).startsWith(fb));
    if (matched) return matched;
  }

  // 4. Prefix match for language code
  matched = voices.find((v) => {
    const vLang = norm(v.lang);
    return vLang.startsWith(`${langLower}-`) || vLang === langLower;
  });
  if (matched) return matched;

  // 5. Match by voice name containing English or native language name or vendor synthesizer aliases
  if (langLower !== 'en') {
    if (langNameLower) {
      matched = voices.find((v) => v.name.toLowerCase().includes(langNameLower));
      if (matched) return matched;
    }
    if (nativeNameLower) {
      matched = voices.find((v) => v.name.toLowerCase().includes(nativeNameLower));
      if (matched) return matched;
    }

    // Specific Microsoft / Google / Apple / Android synthesizer voice actor aliases for these languages
    const voiceAliases = {
      ta: ['valluvar', 'vani', 'ananya', 'tamil', 'தமிழ்'],
      ml: ['midhun', 'sobana', 'malayalam', 'മലയാളം'],
      kn: ['gagan', 'sapna', 'kannada', 'ಕನ್ನಡ'],
      te: ['mohan', 'chitra', 'shruti', 'telugu', 'తెలుగు'],
      hi: ['hemant', 'kalpana', 'swara', 'madhur', 'hindi', 'हिन्दी'],
      bn: ['bashkar', 'tanishaa', 'bangla', 'bengali', 'বাংলা'],
      es: ['helena', 'laura', 'pablo', 'sabina', 'monica', 'jorge', 'espanol', 'castellano', 'spanish'],
      fr: ['paul', 'julie', 'hortense', 'thomas', 'amelie', 'french', 'francais', 'français'],
      de: ['stefan', 'hedda', 'marlene', 'katja', 'german', 'deutsch'],
    };
    const aliases = voiceAliases[langLower] || [];
    for (const alias of aliases) {
      matched = voices.find((v) => v.name.toLowerCase().includes(alias));
      if (matched) return matched;
    }
  }

  // 6. If language is English, pick friendly mascot English voice
  if (langLower === 'en') {
    return (
      voices.find(
        (v) =>
          norm(v.lang).startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny') ||
            v.name.includes('India'))
      ) || voices.find((v) => norm(v.lang).startsWith('en'))
    );
  }

  // IMPORTANT: For non-English languages with no genuine match, return null!
  // Do NOT silently substitute English audio for another language.
  return null;
}

export function useSpeechSynthesis({ onSpeechStart, onSpeechEnd, onVoiceUnavailable, language = 'en' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [speechMode, setSpeechMode] = useState('native'); // 'native' | 'tts-fallback'

  // Stable references for callbacks to prevent effect re-triggering and dependency cycles
  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const onVoiceUnavailableRef = useRef(onVoiceUnavailable);

  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart;
  }, [onSpeechStart]);

  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    onVoiceUnavailableRef.current = onVoiceUnavailable;
  }, [onVoiceUnavailable]);

  const lastSpokenTextRef = useRef('');
  const lastSpokenLangRef = useRef(language);
  const voicesRef = useRef([]);
  const languageRef = useRef(language);
  const audioRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const updateVoices = useCallback(() => {
    if (typeof window === 'undefined') return;
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
    voicesRef.current = voices;

    const currentLang = languageRef.current || 'en';
    const matched = findVoiceForLanguage(voices, currentLang);

    if (matched) {
      setSelectedVoice(matched);
      setSpeechMode('native');
      setIsVoiceAvailable(true);
    } else {
      setSelectedVoice(null);
      // External fallback TTS provider (/api/tts) is integrated and active for all 9 languages!
      setSpeechMode('tts-fallback');
      setIsVoiceAvailable(true);
    }
  }, []);

  useEffect(() => {
    const hasSpeechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const hasAudio = typeof window !== 'undefined' && typeof Audio !== 'undefined';
    const supported = hasSpeechSynth || hasAudio;

    setIsSupported(supported);
    if (!supported) {
      setIsVoiceAvailable(false);
      return;
    }

    updateVoices();

    if (hasSpeechSynth && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Async voice loading fallback for Chrome/Windows where onvoiceschanged might not fire
    const timer1 = setTimeout(updateVoices, 300);
    const timer2 = setTimeout(updateVoices, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (hasSpeechSynth && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language, updateVoices]);

  // Clean up audio and timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(speakTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    clearTimeout(speakTimeoutRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    isSpeakingRef.current = false;
    setIsSpeaking(false);
    onSpeechEndRef.current?.();
  }, []);

  // Play audio via backend fallback TTS provider
  const playFallbackTTS = useCallback(async (spokenText, lang) => {
    try {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(spokenText)}&lang=${encodeURIComponent(lang)}`;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const audio = new Audio(ttsUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setSpeechMode('tts-fallback');
        onSpeechStartRef.current?.({ mode: 'tts-fallback' });
      };

      audio.onended = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        audioRef.current = null;
        onSpeechEndRef.current?.();
      };

      audio.onerror = (e) => {
        console.warn('Fallback TTS audio playback error:', e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        audioRef.current = null;
        onVoiceUnavailableRef.current?.(getLanguageConfig(lang));
        onSpeechEndRef.current?.();
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('Fallback TTS play invocation failed:', err);
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      audioRef.current = null;
      onVoiceUnavailableRef.current?.(getLanguageConfig(lang));
      onSpeechEndRef.current?.();
      return false;
    }
  }, []);

  const speak = useCallback(
    (text, targetLang) => {
      const activeLang = targetLang || languageRef.current || 'en';
      if (!text || isMuted || typeof window === 'undefined') {
        return false;
      }

      const spoken = cleanTextForSpeech(text);
      if (!spoken) return false;

      // Prevent immediate duplicate speak of exact text if currently speaking
      if (
        isSpeakingRef.current &&
        lastSpokenTextRef.current === text &&
        lastSpokenLangRef.current === activeLang
      ) {
        return true;
      }

      lastSpokenTextRef.current = text;
      lastSpokenLangRef.current = activeLang;

      // Stop any ongoing speech or audio first
      clearTimeout(speakTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Ensure voices list is populated on demand
      let currentVoices = voicesRef.current;
      if (!currentVoices || currentVoices.length === 0) {
        currentVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
        voicesRef.current = currentVoices;
      }

      const voice = findVoiceForLanguage(currentVoices, activeLang);

      // BRANCH 1: Native browser voice is installed and available
      if (voice && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(spoken);
        utterance.voice = voice;
        utterance.lang = voice.lang || getLanguageConfig(activeLang)?.speechSynthLocale || 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.08;

        utterance.onstart = () => {
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          setSpeechMode('native');
          onSpeechStartRef.current?.({ mode: 'native', voice: voice.name });
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          onSpeechEndRef.current?.();
        };

        utterance.onerror = (e) => {
          // If interrupted or canceled by user or next speak, don't fallback to TTS
          if (e.error === 'interrupted' || e.error === 'canceled') {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            onSpeechEndRef.current?.();
            return;
          }
          console.warn('Native speech error, switching to fallback TTS:', e);
          playFallbackTTS(spoken, activeLang);
        };

        // Slight micro-delay prevents Chromium bug where cancel() synchronously discards the next speak()
        speakTimeoutRef.current = setTimeout(() => {
          try {
            window.speechSynthesis.speak(utterance);
          } catch (err) {
            console.warn('Native speak threw exception, using fallback TTS:', err);
            playFallbackTTS(spoken, activeLang);
          }
        }, 20);

        return true;
      }

      // BRANCH 2: No compatible native voice on this device (e.g. Tamil/Malayalam/Kannada on default Windows)
      // Automatically use the high-quality backend fallback TTS provider!
      playFallbackTTS(spoken, activeLang);
      return true;
    },
    [isMuted, playFallbackTTS]
  );

  const replay = useCallback(() => {
    if (lastSpokenTextRef.current) {
      return speak(lastSpokenTextRef.current, lastSpokenLangRef.current || languageRef.current);
    }
    return false;
  }, [speak]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        stop();
      }
      return !prev;
    });
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    isMuted,
    isVoiceAvailable,
    selectedVoice,
    speechMode,
    lastSpokenText: lastSpokenTextRef.current,
    speak,
    stop,
    replay,
    toggleMute,
  };
}
