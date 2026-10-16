import express from 'express';

const router = express.Router();

// Clean emojis, markdown, and symbols from text before sending to TTS
export function cleanTextForTTS(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F\u200D]/gu, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[*_#`~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Supported TTS language codes
const SUPPORTED_TTS_LANGUAGES = {
  en: 'en',
  ta: 'ta',
  ml: 'ml',
  kn: 'kn',
  te: 'te',
  hi: 'hi',
  bn: 'bn',
  es: 'es',
  fr: 'fr',
  de: 'de',
};

/**
 * Split text into chunks safe for the Google Translate TTS URL (< 200 chars)
 */
function chunkText(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];
  const words = text.split(' ');
  const chunks = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks;
}

/**
 * Synthesize a single chunk using Google Translate TTS (free, highly accurate native pronunciations)
 */
async function fetchGoogleTranslateChunk(chunk, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`TTS upstream responded with HTTP ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Synthesize speech for full text
 */
export async function synthesizeSpeech(text, langCode = 'en') {
  const cleaned = cleanTextForTTS(text);
  if (!cleaned) {
    throw new Error('No readable text to synthesize');
  }

  const lang = SUPPORTED_TTS_LANGUAGES[langCode.toLowerCase()] || 'en';
  const chunks = chunkText(cleaned, 180);
  const audioBuffers = [];

  for (const chunk of chunks) {
    const buf = await fetchGoogleTranslateChunk(chunk, lang);
    audioBuffers.push(buf);
  }

  return Buffer.concat(audioBuffers);
}

// Handler for both GET and POST requests
async function handleTTS(req, res) {
  const text = req.method === 'POST' ? req.body?.text : req.query?.text;
  const language = req.method === 'POST' ? req.body?.language : req.query?.lang || req.query?.language;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or invalid text parameter' });
  }

  const langCode = (language || 'en').toLowerCase().split(/[-_]/)[0];

  try {
    const audioBuffer = await synthesizeSpeech(text, langCode);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(audioBuffer);
  } catch (error) {
    console.error('TTS synthesis error:', error.message);
    return res.status(502).json({
      error: 'TTS synthesis failed',
      details: error.message,
      language: langCode,
      fallback: true,
    });
  }
}

router.get('/', handleTTS);
router.post('/', handleTTS);

export default router;
