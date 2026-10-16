import { CHARACTER_STATES } from '../utils/characterStates.js';
import { detectGameIntent } from './gameIntentService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Sends the user's question directly to the GPT-powered backend API.
 * Does not depend on predefined question lists or hardcoded answer dictionaries.
 */
export async function sendMessageToBuddy(message, context = {}) {
  if (!message || !message.trim()) {
    return {
      text: "I didn't quite catch that! Say something again! 🎙️",
      expression: CHARACTER_STATES.CONFUSED,
      rewardXP: 0,
    };
  }

  const trimmed = message.trim();

  // Instant arcade game routing (for launching or controlling arcade games)
  const gameIntent = detectGameIntent(trimmed, context);
  if (gameIntent) {
    return {
      text: gameIntent.text,
      expression: gameIntent.expression,
      rewardXP: 10,
      gameIntent: gameIntent.gameId,
      gameAction: gameIntent.action,
      buttons: gameIntent.buttons,
    };
  }

  const history = Array.isArray(context) ? context : context.history || [];
  const personality = context.personality || 'playful';
  const language = context.language || 'en';
  const visitorName = context.visitorName || '';
  const image = context.image || null;
  const visionContext = context.visionContext || null;

  // Call the secure backend OpenAI GPT API proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        history: history.slice(-8),
        personality,
        language,
        visitorName,
        image,
        visionContext,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.success && data.text) {
      return {
        text: data.text,
        expression: data.expression || CHARACTER_STATES.HAPPY,
        rewardXP: 10,
        isAi: true,
        isFallback: false,
        model: data.model || 'gpt',
      };
    }

    // Server returned an error (e.g. missing API key, rate limit, or upstream failure)
    const errorMsg =
      data?.error ||
      `OpenAI API request failed (HTTP ${res.status}). Please check server logs and configuration.`;

    return {
      isError: true,
      text: errorMsg,
      expression: CHARACTER_STATES.ERROR,
      canRetry: true,
      retryQuery: trimmed,
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    const errorText = isTimeout
      ? 'The AI request timed out. Please check your connection and tap Retry.'
      : `Unable to connect to BUDDY AI Server: ${err.message}. Please verify the backend is running.`;

    return {
      isError: true,
      text: errorText,
      expression: CHARACTER_STATES.ERROR,
      canRetry: true,
      retryQuery: trimmed,
    };
  }
}
