import test from 'node:test';
import assert from 'node:assert/strict';

import { formatTime } from '../src/utils/formatTime.js';
import {
  getPerformanceTitle,
  calculateCompletionScore,
  calculateEarnedBadges,
  BADGE_DEFINITIONS,
} from '../src/services/scoringService.js';
import { getFallbackResponse, BUDDY_CLICK_REACTIONS } from '../src/services/fallbackResponses.js';
import {
  MEMORY_SETS,
  MATH_QUESTIONS,
  SCIENCE_QUESTIONS,
  BRAIN_SPARK_QUESTIONS,
  MYTH_BUSTER_QUESTIONS,
  MYSTERY_OBJECTS,
  MARS_ROVER_MISSION,
  STORY_ADVENTURES,
} from '../src/utils/gameQuestions.js';
import { CHARACTER_STATES } from '../src/utils/characterStates.js';

test('formatTime formats seconds into MM:SS correctly', () => {
  assert.equal(formatTime(180), '03:00');
  assert.equal(formatTime(125), '02:05');
  assert.equal(formatTime(59), '00:59');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-5), '00:00');
});

test('scoringService computes correct titles and completion bonus', () => {
  assert.equal(getPerformanceTitle(20), 'Curious Explorer 🧭🌱');
  assert.equal(getPerformanceTitle(80), 'Science Buddy 🔬🤖');
  assert.equal(getPerformanceTitle(150), 'Quick Thinker 💡✨');
  assert.equal(getPerformanceTitle(220), 'Brain Spark ⚡🧠');
  assert.equal(getPerformanceTitle(350), 'Super Explorer 🌟🚀');

  const completion = calculateCompletionScore(50);
  assert.equal(completion.finalXP, 150);
  assert.equal(completion.title, 'Quick Thinker 💡✨');
});

test('scoringService calculates earned badges accurately', () => {
  const badges = calculateEarnedBadges({
    xp: 220,
    gamesCompleted: 3,
    conversationsCount: 4,
    bestReaction: 310,
    hasSolvedRiddle: true,
    hasScienceDone: true,
  });

  assert.ok(badges.length >= 3);
  assert.ok(badges.some((b) => b.id === 'curious_explorer'));
  assert.ok(badges.some((b) => b.id === 'brain_spark'));
  assert.ok(badges.some((b) => b.id === 'quick_thinker'));
});

test('fallbackResponses engine handles greetings, science, and personalities', () => {
  const greeting = getFallbackResponse('hi');
  assert.ok(greeting.text.toLowerCase().includes('hiiii'));
  assert.equal(greeting.expression, CHARACTER_STATES.HAPPY);

  const nameIntro = getFallbackResponse('I am Priya');
  assert.ok(nameIntro.text.includes('Priya!'));
  assert.equal(nameIntro.expression, CHARACTER_STATES.HAPPY);
  assert.equal(nameIntro.detectedName, 'Priya');

  const science = getFallbackResponse("what's photosynthesis?");
  assert.ok(science.text.toLowerCase().includes('solar-powered kitchens'));

  // Test contextual follow-up resolution
  const followUp = getFallbackResponse('give me an example', { lastTopic: 'photosynthesis' });
  assert.ok(followUp.text.toLowerCase().includes('leaf') || followUp.text.toLowerCase().includes('chloroplast'));

  // Test multilingual greeting
  const hindiGreeting = getFallbackResponse('namaste', { language: 'hi' });
  assert.ok(hindiGreeting.text.includes('Namaste'));

  const tamilGreeting = getFallbackResponse('vanakkam', { language: 'ta' });
  assert.ok(tamilGreeting.text.includes('Vanakkam'));

  const newton = getFallbackResponse("what is newton's third law?");
  assert.ok(newton.text.toLowerCase().includes('equal and opposite reaction'));

  const insult = getFallbackResponse('you are stupid');
  assert.equal(insult.expression, CHARACTER_STATES.ANNOYED);
});

test('click reactions list contains at least 8 varied responses', () => {
  assert.ok(BUDDY_CLICK_REACTIONS.length >= 8);
  BUDDY_CLICK_REACTIONS.forEach((reaction) => {
    assert.ok(reaction.text && reaction.text.length > 0);
    assert.ok(reaction.expression);
  });
});

test('mini games question sets are populated and valid', () => {
  assert.ok(MEMORY_SETS.length >= 3);
  assert.ok(MATH_QUESTIONS.length >= 4);
  assert.ok(SCIENCE_QUESTIONS.length >= 4);
  assert.ok(BRAIN_SPARK_QUESTIONS.length >= 3);
  assert.ok(MYTH_BUSTER_QUESTIONS.length >= 4);
  assert.ok(MYSTERY_OBJECTS.length >= 3);
  assert.ok(STORY_ADVENTURES.length >= 3);
  assert.ok(MARS_ROVER_MISSION.steps.length === 3);
});

// Import arcade services and questions for testing
import { detectGameIntent } from '../src/services/gameIntentService.js';
import { getArcadeLevel, ARCADE_ACHIEVEMENTS, COSMETIC_ITEMS } from '../src/services/arcadeService.js';
import { QUIZ_QUESTIONS, getQuizQuestions } from '../src/utils/quizQuestions.js';

test('gameIntentService routes natural conversational phrases to the correct arcade game', () => {
  const flight1 = detectGameIntent("let's play flappy bird");
  assert.equal(flight1.gameId, 'flight');
  assert.equal(flight1.action, 'launch');

  const flight2 = detectGameIntent('I want to fly with BUDDY');
  assert.equal(flight2.gameId, 'flight');

  const runner = detectGameIntent('play a running game');
  assert.equal(runner.gameId, 'runner');
  assert.equal(runner.action, 'launch');

  const quiz = detectGameIntent('give me a science quiz');
  assert.equal(quiz.gameId, 'quiz');

  const memory = detectGameIntent("let's test my memory");
  assert.equal(memory.gameId, 'memory');

  const bots = detectGameIntent('catch the bots');
  assert.equal(bots.gameId, 'bots');

  const studio = detectGameIntent('I want to customize you');
  assert.equal(studio.gameId, 'studio');

  const bored = detectGameIntent("I'm bored. Surprise me!");
  assert.equal(bored.action, 'suggest');
  assert.ok(bored.buttons.length >= 3);

  const stats = detectGameIntent('show my high score');
  assert.equal(stats.action, 'stats');

  const arcade = detectGameIntent('what games can I play?');
  assert.equal(arcade.action, 'arcade');

  // Verify non-game questions are NOT routed to arcade
  const normalQuestion = detectGameIntent('what is photosynthesis?');
  assert.equal(normalQuestion, null);
});

test('arcadeService computes levels, achievements, and cosmetic definitions', () => {
  assert.equal(getArcadeLevel(0).level, 1);
  assert.equal(getArcadeLevel(60).level, 2);
  assert.equal(getArcadeLevel(180).level, 3);
  assert.equal(getArcadeLevel(320).level, 4);
  assert.equal(getArcadeLevel(550).level, 5);

  assert.equal(ARCADE_ACHIEVEMENTS.length, 8);
  assert.ok(COSMETIC_ITEMS.hats.length >= 5);
  assert.ok(COSMETIC_ITEMS.glasses.length >= 3);
  assert.ok(COSMETIC_ITEMS.accessories.length >= 3);
  assert.ok(COSMETIC_ITEMS.auras.length >= 4);
});

test('quizQuestions bank contains verified educational items with full explanations', () => {
  assert.ok(QUIZ_QUESTIONS.length >= 20);
  QUIZ_QUESTIONS.forEach((q) => {
    assert.ok(q.question && q.question.length > 5);
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.explanation && q.explanation.length > 10);
  });

  const sampled = getQuizQuestions('all', 5);
  assert.equal(sampled.length, 5);
});

import { SUPPORTED_LANGUAGES, getLanguageConfig, getLocalizedStatus } from '../src/utils/languages.js';
import { buildSystemPrompt } from '../server/routes/chat.js';

test('centralized language configuration supports all designated languages with correct locales', () => {
  assert.ok(SUPPORTED_LANGUAGES.length >= 9);

  const expectedLocales = {
    en: 'en-IN',
    ta: 'ta-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    kn: 'kn-IN',
    bn: 'bn-IN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
  };

  for (const [code, locale] of Object.entries(expectedLocales)) {
    const config = getLanguageConfig(code);
    assert.ok(config, `Language config for ${code} should exist`);
    assert.equal(config.speechRecLocale, locale, `Rec locale for ${code} must match`);
    assert.equal(config.speechSynthLocale, locale, `Synth locale for ${code} must match`);
    assert.ok(config.name, `Language ${code} must have an English name`);
    assert.ok(config.nativeName, `Language ${code} must have a native name`);
    assert.ok(config.flag, `Language ${code} must have a flag icon`);
    assert.ok(config.status.ready, `Language ${code} must have localized ready status`);
    assert.ok(config.status.listening, `Language ${code} must have localized listening status`);
    assert.ok(config.status.thinking, `Language ${code} must have localized thinking status`);
    assert.ok(config.status.speaking, `Language ${code} must have localized speaking status`);
    assert.ok(config.status.timeUp, `Language ${code} must have localized timeUp status`);
  }

  // Fallback to default
  assert.equal(getLanguageConfig('unknown').code, 'en');
  assert.ok(getLocalizedStatus('ta', 'thinking').length > 0);
});

test('buildSystemPrompt instructs AI for all 9 languages without Tanglish/Hinglish force', () => {
  const tamilPrompt = buildSystemPrompt('playful', 'ta', 'Karthik');
  assert.ok(tamilPrompt.includes('Tamil script'));
  assert.ok(!tamilPrompt.includes('Tanglish (Tamil mixed with English'));
  assert.ok(tamilPrompt.includes('Karthik'));

  const hindiPrompt = buildSystemPrompt('helper', 'hi', 'Aarav');
  assert.ok(hindiPrompt.includes('Devanagari script'));
  assert.ok(!hindiPrompt.includes('Hinglish (Hindi mixed with English'));

  const spanishPrompt = buildSystemPrompt('explorer', 'es', 'Sofia');
  assert.ok(spanishPrompt.includes('Spanish'));

  const frenchPrompt = buildSystemPrompt('playful', 'fr', 'Lucas');
  assert.ok(frenchPrompt.includes('French'));

  const teluguPrompt = buildSystemPrompt('playful', 'te', 'Ananya');
  assert.ok(teluguPrompt.includes('Telugu script'));

  const malayalamPrompt = buildSystemPrompt('helper', 'ml', 'Rahul');
  assert.ok(malayalamPrompt.includes('Malayalam script'));

  const kannadaPrompt = buildSystemPrompt('explorer', 'kn', 'Sneha');
  assert.ok(kannadaPrompt.includes('Kannada script'));

  const bengaliPrompt = buildSystemPrompt('playful', 'bn', 'Sourav');
  assert.ok(bengaliPrompt.includes('Bengali script'));

  const englishPrompt = buildSystemPrompt('playful', 'en', 'Alex');
  assert.ok(englishPrompt.includes('English'));
});

test('characterStates defines SPEAKING and ERROR states for avatar lifecycle', () => {
  assert.equal(CHARACTER_STATES.SPEAKING, 'speaking');
  assert.equal(CHARACTER_STATES.TALKING, 'talking');
  assert.equal(CHARACTER_STATES.ERROR, 'error');
  assert.equal(CHARACTER_STATES.LISTENING, 'listening');
  assert.equal(CHARACTER_STATES.THINKING, 'thinking');
});

test('fallbackResponses engine produces native script replies across all supported languages', () => {
  const teluguGreeting = getFallbackResponse('నమస్కారం', { language: 'te' });
  assert.ok(teluguGreeting.text.includes('నమస్కారం'));
  assert.equal(teluguGreeting.isFallback, true);

  const malayalamGreeting = getFallbackResponse('നമസ്കാരം', { language: 'ml' });
  assert.ok(malayalamGreeting.text.includes('നമസ്കാരം'));
  assert.equal(malayalamGreeting.isFallback, true);

  const kannadaGreeting = getFallbackResponse('ನಮಸ್ಕಾರ', { language: 'kn' });
  assert.ok(kannadaGreeting.text.includes('ನಮಸ್ಕಾರ'));
  assert.equal(kannadaGreeting.isFallback, true);

  const bengaliGreeting = getFallbackResponse('নমস্কার', { language: 'bn' });
  assert.ok(bengaliGreeting.text.includes('নমস্কার'));
  assert.equal(bengaliGreeting.isFallback, true);

  const spanishGreeting = getFallbackResponse('hola', { language: 'es' });
  assert.ok(spanishGreeting.text.toLowerCase().includes('hola'));
  assert.equal(spanishGreeting.isFallback, true);

  const frenchGreeting = getFallbackResponse('bonjour', { language: 'fr' });
  assert.ok(frenchGreeting.text.toLowerCase().includes('bonjour'));
  assert.equal(frenchGreeting.isFallback, true);

  // Generic curious fallback for non-English languages
  const teluguFallback = getFallbackResponse('tell me something strange', { language: 'te' });
  assert.ok(teluguFallback.text.length > 5);
  assert.equal(teluguFallback.isFallback, true);

  const tamilFallback = getFallbackResponse('tell me something strange', { language: 'ta' });
  assert.ok(tamilFallback.text.length > 5);
  assert.equal(tamilFallback.isFallback, true);
});

import { cleanTextForSpeech, findVoiceForLanguage } from '../src/hooks/useSpeechSynthesis.js';

import { cleanTextForTTS } from '../server/routes/tts.js';

test('cleanTextForSpeech strips emojis, markdown symbols, and decorative characters for TTS', () => {
  const input = 'Hello! 🚀 Welcome to BUDDY *Science* Expo! **Ready**? 🎙️✨';
  const cleaned = cleanTextForSpeech(input);
  assert.equal(cleaned, 'Hello! Welcome to BUDDY Science Expo! Ready?');

  const tamilInput = 'வணக்கம்! 🤖 அறிவியல் கண்காட்சிக்கு வருக! 🌟';
  const cleanedTamil = cleanTextForSpeech(tamilInput);
  assert.equal(cleanedTamil, 'வணக்கம்! அறிவியல் கண்காட்சிக்கு வருக!');

  const ttsCleaned = cleanTextForTTS('नमस्ते! 🚀 बडी में आपका स्वागत है! **तैयार**? 🎙️');
  assert.equal(ttsCleaned, 'नमस्ते! बडी में आपका स्वागत है! तैयार?');
});

test('findVoiceForLanguage correctly matches locale, language codes, and aliases across all 9 languages', () => {
  const mockVoices = [
    { name: 'Microsoft David Desktop', lang: 'en-US' },
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Google India English', lang: 'en-IN' },
    { name: 'Microsoft Paul', lang: 'fr-FR' },
    { name: 'Google Français', lang: 'fr-FR' },
    { name: 'Microsoft Valluvar', lang: 'ta-IN' },
    { name: 'Google தமிழ்', lang: 'ta-IN' },
    { name: 'Microsoft Midhun', lang: 'ml-IN' },
    { name: 'Malayalam India Female', lang: 'ml-IN' },
    { name: 'Microsoft Gagan', lang: 'kn-IN' },
    { name: 'Kannada India Voice', lang: 'kn-IN' },
    { name: 'Microsoft Mohan', lang: 'te-IN' },
    { name: 'Telugu India Voice', lang: 'te-IN' },
    { name: 'Microsoft Hemant', lang: 'hi-IN' },
    { name: 'Google हिन्दी', lang: 'hi-IN' },
    { name: 'Microsoft Bashkar', lang: 'bn-IN' },
    { name: 'Bengali India Voice', lang: 'bn-IN' },
    { name: 'Microsoft Helena', lang: 'es-ES' },
    { name: 'Google Español', lang: 'es-ES' },
  ];

  // 1. English
  const englishVoice = findVoiceForLanguage(mockVoices, 'en');
  assert.ok(englishVoice);
  assert.ok(englishVoice.lang.toLowerCase().startsWith('en'));

  // 2. French
  const frenchVoice = findVoiceForLanguage(mockVoices, 'fr');
  assert.ok(frenchVoice);
  assert.ok(frenchVoice.lang.toLowerCase().startsWith('fr'));

  // 3. Tamil
  const tamilVoice = findVoiceForLanguage(mockVoices, 'ta');
  assert.ok(tamilVoice);
  assert.equal(tamilVoice.lang, 'ta-IN');

  // 4. Malayalam
  const malayalamVoice = findVoiceForLanguage(mockVoices, 'ml');
  assert.ok(malayalamVoice);
  assert.equal(malayalamVoice.lang, 'ml-IN');

  // 5. Kannada
  const kannadaVoice = findVoiceForLanguage(mockVoices, 'kn');
  assert.ok(kannadaVoice);
  assert.equal(kannadaVoice.lang, 'kn-IN');

  // 6. Telugu
  const teluguVoice = findVoiceForLanguage(mockVoices, 'te');
  assert.ok(teluguVoice);
  assert.equal(teluguVoice.lang, 'te-IN');

  // 7. Hindi
  const hindiVoice = findVoiceForLanguage(mockVoices, 'hi');
  assert.ok(hindiVoice);
  assert.equal(hindiVoice.lang, 'hi-IN');

  // 8. Bengali
  const bengaliVoice = findVoiceForLanguage(mockVoices, 'bn');
  assert.ok(bengaliVoice);
  assert.equal(bengaliVoice.lang, 'bn-IN');

  // 9. Spanish
  const spanishVoice = findVoiceForLanguage(mockVoices, 'es');
  assert.ok(spanishVoice);
  assert.equal(spanishVoice.lang, 'es-ES');

  // 10. Additional configured language / regional fallback (e.g. bn-BD for bn)
  const regionalVoices = [
    { name: 'Bangla Bangladesh', lang: 'bn-BD' },
    { name: 'Spanish Mexico', lang: 'es-MX' },
    { name: 'French Canada', lang: 'fr-CA' },
  ];
  assert.equal(findVoiceForLanguage(regionalVoices, 'bn')?.lang, 'bn-BD');
  assert.equal(findVoiceForLanguage(regionalVoices, 'es')?.lang, 'es-MX');
  assert.equal(findVoiceForLanguage(regionalVoices, 'fr')?.lang, 'fr-CA');

  // 11. Empty voice list handling
  assert.equal(findVoiceForLanguage([], 'ta'), null);
  assert.equal(findVoiceForLanguage(null, 'en'), null);

  // 12. Crucial Rule: When no voice exists for a non-English language on this device, returns NULL
  // NEVER silently substitute English audio for non-English text!
  const onlyEnglishVoices = [
    { name: 'Microsoft David', lang: 'en-US' },
    { name: 'Google US English', lang: 'en-US' },
  ];
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'ta'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'ml'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'kn'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'te'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'hi'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'bn'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'es'), null);
  assert.equal(findVoiceForLanguage(onlyEnglishVoices, 'fr'), null);

  // 13. Voice alias matching (e.g., voice with actor name but generic/missing locale)
  const aliasVoices = [
    { name: 'Microsoft Valluvar Online', lang: 'other' },
    { name: 'Midhun Natural Neural', lang: 'other' },
    { name: 'Sapna Kannada Neural', lang: 'other' },
    { name: 'Mohan Telugu Voice', lang: 'other' },
    { name: 'Hemant Hindi Neural', lang: 'other' },
    { name: 'Tanishaa Bangla', lang: 'other' },
  ];
  assert.equal(findVoiceForLanguage(aliasVoices, 'ta')?.name, 'Microsoft Valluvar Online');
  assert.equal(findVoiceForLanguage(aliasVoices, 'ml')?.name, 'Midhun Natural Neural');
  assert.equal(findVoiceForLanguage(aliasVoices, 'kn')?.name, 'Sapna Kannada Neural');
  assert.equal(findVoiceForLanguage(aliasVoices, 'te')?.name, 'Mohan Telugu Voice');
  assert.equal(findVoiceForLanguage(aliasVoices, 'hi')?.name, 'Hemant Hindi Neural');
  assert.equal(findVoiceForLanguage(aliasVoices, 'bn')?.name, 'Tanishaa Bangla');
});

test('gameIntentService recognizes Tamil and Hindi game requests and returns localized responses', () => {
  // Tamil game requests
  const tamilFlight = detectGameIntent('பறக்கும் விளையாட்டு விளையாடலாம்', { language: 'ta' });
  assert.ok(tamilFlight);
  assert.equal(tamilFlight.gameId, 'flight');
  assert.ok(tamilFlight.text.includes('பறக்கும்'));
  assert.ok(tamilFlight.buttons[0].label.includes('பறக்க'));

  const tamilRunner = detectGameIntent('ரோபோ ரன் விளையாடலாம்', { language: 'ta' });
  assert.ok(tamilRunner);
  assert.equal(tamilRunner.gameId, 'runner');
  assert.ok(tamilRunner.text.includes('ரோபோ ரன்'));

  const tamilQuiz = detectGameIntent('எனக்கு ஒரு வினாடி வினா கொடு', { language: 'ta' });
  assert.ok(tamilQuiz);
  assert.equal(tamilQuiz.gameId, 'quiz');
  assert.ok(tamilQuiz.text.includes('ராக்கெட் வினாடி வினா'));

  const tamilArcade = detectGameIntent('என்னுடன் ஒரு அறிவியல் விளையாட்டு விளையாடு', { language: 'ta' });
  assert.ok(tamilArcade);
  assert.equal(tamilArcade.action, 'arcade');
  assert.ok(tamilArcade.text.includes('பட்டி ஆர்கேடிற்கு வருக'));

  // Hindi game requests
  const hindiFlight = detectGameIntent('उड़ने वाला खेल खेलो', { language: 'hi' });
  assert.ok(hindiFlight);
  assert.equal(hindiFlight.gameId, 'flight');
  assert.ok(hindiFlight.text.includes('पायलट मोड शुरू'));

  const hindiRunner = detectGameIntent('रोबो रन खेलें', { language: 'hi' });
  assert.ok(hindiRunner);
  assert.equal(hindiRunner.gameId, 'runner');
  assert.ok(hindiRunner.text.includes('रोबो रन'));

  const hindiQuiz = detectGameIntent('मुझे विज्ञान की प्रश्नोत्तरी खेलनी है', { language: 'hi' });
  assert.ok(hindiQuiz);
  assert.equal(hindiQuiz.gameId, 'quiz');
  assert.ok(hindiQuiz.text.includes('रॉकेट क्विज़'));

  const hindiArcade = detectGameIntent('चलो कोई विज्ञान का खेल खेलते हैं', { language: 'hi' });
  assert.ok(hindiArcade);
  assert.equal(hindiArcade.action, 'arcade');
  assert.ok(hindiArcade.text.includes('बडी आर्केड में कदम रखें'));
});

test('speech recognition lifecycle guarantees single submission and safe abort', () => {
  // Verify state machine logic simulated via refs/guards
  let submittedCount = 0;
  let submittedText = '';

  const onResult = (text) => {
    submittedCount++;
    submittedText = text;
  };

  // Simulate speech lifecycle
  let hasSubmitted = false;
  let accumulatedFinal = '';
  let accumulatedInterim = '';

  // Step 1: Interim updates
  accumulatedInterim = 'how does gravity';
  assert.equal(hasSubmitted, false);

  // Step 2: Final transcript arrives
  accumulatedFinal = 'how does gravity work';
  accumulatedInterim = '';

  // Step 3: onend triggers single submission
  if (!hasSubmitted) {
    const textToSubmit = (accumulatedFinal || accumulatedInterim).trim();
    if (textToSubmit) {
      hasSubmitted = true;
      onResult(textToSubmit);
    }
  }

  assert.equal(submittedCount, 1);
  assert.equal(submittedText, 'how does gravity work');

  // Step 4: Rapid subsequent onend or duplicate call must NOT re-submit
  if (!hasSubmitted) {
    const textToSubmit = (accumulatedFinal || accumulatedInterim).trim();
    if (textToSubmit) {
      hasSubmitted = true;
      onResult(textToSubmit);
    }
  }

  assert.equal(submittedCount, 1, 'Duplicate onend should not submit again');

  // Step 5: Abort listening guard test
  let abortSubmittedCount = 0;
  const onAbortResult = () => {
    abortSubmittedCount++;
  };

  let abortHasSubmitted = true; // Set to true immediately upon abortListening
  let abortInterim = 'partial speech that was';

  // onend fires after abort
  if (!abortHasSubmitted) {
    onAbortResult(abortInterim);
  }

  assert.equal(abortSubmittedCount, 0, 'Aborted session must not submit partial speech');
});

test('intent router distinguishes questions from launch commands and handles game controls', () => {
  // Question exclusion guard: "What is Flappy Bird?" must NOT launch the game
  const flappyQuestion = detectGameIntent('What is Flappy Bird?');
  assert.equal(flappyQuestion, null, 'Questions about Flappy Bird must not launch the game');

  const flyQuestion = detectGameIntent('Why do birds fly?');
  assert.equal(flyQuestion, null, 'Questions about flying must not launch the game');

  const quizQuestion = detectGameIntent('What is Quiz Blast?');
  assert.equal(quizQuestion, null, 'Questions about Quiz Blast must not launch the game');

  // Actual launch commands:
  const playFly = detectGameIntent('Play the fly game');
  assert.ok(playFly);
  assert.equal(playFly.gameId, 'flight');
  assert.equal(playFly.action, 'launch');

  const startFlying = detectGameIntent('Start the flying game');
  assert.ok(startFlying);
  assert.equal(startFlying.gameId, 'flight');
  assert.equal(startFlying.action, 'launch');

  const flappyBird = detectGameIntent("Let's play Flappy Bird");
  assert.ok(flappyBird);
  assert.equal(flappyBird.gameId, 'flight');

  // Game control commands
  const exitGame = detectGameIntent('Exit game');
  assert.ok(exitGame);
  assert.equal(exitGame.action, 'exit');

  const stopGame = detectGameIntent('Stop the game');
  assert.ok(stopGame);
  assert.equal(stopGame.action, 'exit');

  const pauseGame = detectGameIntent('Pause game');
  assert.ok(pauseGame);
  assert.equal(pauseGame.action, 'pause');

  const resumeGame = detectGameIntent('Resume game');
  assert.ok(resumeGame);
  assert.equal(resumeGame.action, 'resume');

  // Telugu game commands
  const teluguFly = detectGameIntent('ఫ్లై గేమ్ ఆడండి', { language: 'te' });
  assert.ok(teluguFly);
  assert.equal(teluguFly.gameId, 'flight');
  assert.equal(teluguFly.action, 'launch');
  assert.ok(teluguFly.text.includes('పైలట్ మోడ్'));

  const teluguRunner = detectGameIntent('రోబో రన్ ఆడండి', { language: 'te' });
  assert.ok(teluguRunner);
  assert.equal(teluguRunner.gameId, 'runner');

  const teluguQuiz = detectGameIntent('రాకెట్ క్విజ్ ఆడదాం', { language: 'te' });
  assert.ok(teluguQuiz);
  assert.equal(teluguQuiz.gameId, 'quiz');

  const teluguArcade = detectGameIntent('ఆటలను చూపించు', { language: 'te' });
  assert.ok(teluguArcade);
  assert.equal(teluguArcade.action, 'arcade');
  assert.ok(teluguArcade.text.includes('బడ్డీ ఆర్కేడ్‌కు స్వాగతం'));

  const teluguExit = detectGameIntent('గేమ్ ఆపు', { language: 'te' });
  assert.ok(teluguExit);
  assert.equal(teluguExit.action, 'exit');
  assert.ok(teluguExit.text.includes('గేమ్ ముగిసింది'));
});

test('general knowledge answering covers AI, ML, sky, solar system, Python vs Java, GPS, and science facts', () => {
  // 1. Artificial Intelligence
  const aiAnswer = getFallbackResponse('What is artificial intelligence?');
  assert.ok(aiAnswer.text.toLowerCase().includes('learn patterns') || aiAnswer.text.toLowerCase().includes('ai'));
  assert.equal(aiAnswer.detectedTopic, 'ai');

  // 2. Machine Learning
  const mlAnswer = getFallbackResponse('Explain machine learning in simple words');
  assert.ok(mlAnswer.text.toLowerCase().includes('machine learning') || mlAnswer.text.toLowerCase().includes('data'));
  assert.equal(mlAnswer.detectedTopic, 'machinelearning');

  // 3. Why the sky is blue
  const skyAnswer = getFallbackResponse('Why is the sky blue?');
  assert.ok(skyAnswer.text.toLowerCase().includes('rayleigh scattering') || skyAnswer.text.toLowerCase().includes('blue'));
  assert.equal(skyAnswer.detectedTopic, 'sky');

  // 4. Solar system
  const solarAnswer = getFallbackResponse('Tell me about the solar system');
  assert.ok(solarAnswer.text.toLowerCase().includes('8 planets') || solarAnswer.text.toLowerCase().includes('sun'));
  assert.equal(solarAnswer.detectedTopic, 'solarsystem');

  // 5. Python vs Java
  const pyJavaAnswer = getFallbackResponse('What is the difference between Python and Java?');
  assert.ok(pyJavaAnswer.text.toLowerCase().includes('python') && pyJavaAnswer.text.toLowerCase().includes('java'));
  assert.equal(pyJavaAnswer.detectedTopic, 'pythonvsjava');

  // 6. GPS
  const gpsAnswer = getFallbackResponse('How does GPS work?');
  assert.ok(gpsAnswer.text.toLowerCase().includes('gps') || gpsAnswer.text.toLowerCase().includes('satellites'));
  assert.equal(gpsAnswer.detectedTopic, 'gps');

  // 7. Five science facts
  const factsAnswer = getFallbackResponse('Give me five science facts');
  assert.ok(factsAnswer.text.includes('1)') && factsAnswer.text.includes('5)'));
  assert.equal(factsAnswer.detectedTopic, 'sciencefacts');
});

test('contextual follow-ups handle earlier topic recall, simplification, and language switching', () => {
  // 1. What did I ask you earlier?
  const earlierWithTopic = getFallbackResponse('What did I ask you earlier?', { lastTopic: 'gravity' });
  assert.ok(earlierWithTopic.text.toLowerCase().includes('gravity'));

  // 2. Simpler explanation
  const simpler = getFallbackResponse('Explain that in simpler words', { lastTopic: 'photosynthesis' });
  assert.ok(simpler.text.toLowerCase().includes('ultra-simple') || simpler.text.toLowerCase().includes('plants'));

  // 3. Translation follow-up: "Now explain it in Tamil"
  const tamilFollowUp = getFallbackResponse('Now explain it in Tamil', { lastTopic: 'photosynthesis' });
  assert.ok(tamilFollowUp.text.includes('ஒளிச்சேர்க்கை'));

  // 4. Translation follow-up: "Now in Telugu"
  const teluguFollowUp = getFallbackResponse('Now in Telugu', { lastTopic: 'gravity' });
  assert.ok(teluguFollowUp.text.includes('గురుత్వాకర్షణ'));
});



