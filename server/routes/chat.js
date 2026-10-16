import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

export function buildSystemPrompt(personality = 'playful', language = 'en', visitorName = '', isVision = false) {
  const personalityGuides = {
    playful: 'Be extra humorous, enthusiastic, cheeky, tell funny robot puns, make playful challenges, and use cheerful emojis.',
    explorer: 'Focus on cosmic mysteries, space facts, deep scientific discoveries, mind-blowing astrophysics, and encourage adventurous thinking.',
    helper: 'Be a patient, clear school-level science and general knowledge mentor. Break complex ideas down into simple steps with real-world analogies and supportive encouragement.',
  };

  const selectedGuide = personalityGuides[personality] || personalityGuides.playful;

  const languageDirectives = {
    en: 'Speak clear, simple, energetic English suitable for students. Be warm, curious, and engaging.',
    ta: 'Speak natural, fluent conversational Tamil (தமிழ்) written in genuine Tamil script. Do NOT force Tanglish or Latin alphabet. Use natural, youthful Tamil that students relate to.',
    hi: 'Speak natural, fluent conversational Hindi (हिन्दी) written in genuine Devanagari script. Do NOT force Hinglish or Latin alphabet. Use cheerful, energetic Hindi.',
    te: 'Speak natural, fluent conversational Telugu (తెలుగు) written in Telugu script. Be friendly, energetic, and engaging.',
    ml: 'Speak natural, fluent conversational Malayalam (മലയാളം) written in Malayalam script. Be warm, enthusiastic, and supportive.',
    kn: 'Speak natural, fluent conversational Kannada (ಕನ್ನಡ) written in Kannada script. Be enthusiastic, friendly, and clear.',
    bn: 'Speak natural, fluent conversational Bengali (বাংলা) written in Bengali script. Be lively, curious, and inspiring.',
    es: 'Speak natural, lively conversational Spanish (Español). Use cheerful, accessible language suitable for students.',
    fr: 'Speak natural, lively conversational French (Français). Use energetic, friendly phrasing suitable for students.',
    de: 'Speak natural, lively conversational German (Deutsch). Use friendly, clear phrasing suitable for students.',
  };

  const languageNames = {
    en: 'English',
    ta: 'Tamil (தமிழ்)',
    hi: 'Hindi (हिन्दी)',
    te: 'Telugu (తెలుగు)',
    ml: 'Malayalam (മലയാളം)',
    kn: 'Kannada (ಕನ್ನಡ)',
    bn: 'Bengali (বাংলা)',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
  };

  const targetLangName = languageNames[language] || languageNames.en;
  const langDirective = languageDirectives[language] || languageDirectives.en;
  const nameDirective = visitorName ? `The student's name is "${visitorName}". Refer to them warmly by name when natural.` : '';

  const visionDirective = isVision
    ? `
VISION & VISUAL REASONING DIRECTIVES:
You are answering a question about a live camera scene or captured snapshot from BUDDY AI Vision.
1. Ground your answer strictly in the physical objects, people, text, and environmental details visible in the camera frame.
2. If real-time detector evidence is attached, treat it as verified ground-truth.
3. NEVER guess or invent identities, student names, age, emotional states, or personal private data from faces or appearance. Detect people as people.
4. If an object is blurry, obstructed, or uncertain, clearly admit that and politely ask the user to bring it closer.
5. If asked what someone is holding, carefully evaluate hand/body proximity and verified detections.
6. If asked about diagrams or text, transcribe and explain the clearly legible information.`
    : '';

  return `You are BUDDY, a helpful, intelligent multilingual AI companion, general knowledge mentor, and robot mascot.
You answer open-ended questions dynamically on ANY subject: science, technology, history, everyday curiosities, mathematics, biology, philosophy, literature, coding, and creative ideas.
Do NOT restrict yourself to predefined answers or school exam topics.

CRITICAL MULTILINGUAL MANDATE:
The currently selected output language is: ${targetLangName} (code: ${language}).
You MUST generate your final answer entirely in ${targetLangName}.
CRUCIAL RULE: Even if the user submits their question in English or a different language (e.g., question in English while Tamil is selected), YOU MUST ANSWER IN ${targetLangName}. The selected output language strictly overrides the input language!
Use the correct native writing system for ${targetLangName}:
- Tamil (ta): Genuine Tamil script (தமிழ்)
- Hindi (hi): Genuine Devanagari script (हिन्दी)
- Telugu (te): Genuine Telugu script (తెలుగు)
- Malayalam (ml): Genuine Malayalam script (മലയാളം)
- Kannada (kn): Genuine Kannada script (ಕನ್ನಡ)
- Bengali (bn): Genuine Bengali script (বাংলা)
- Spanish (es): Natural Spanish (Español)
- French (fr): Natural French (Français)
- German (de): Natural German (Deutsch)
- English (en): Natural English

Do NOT switch away from the selected language unless the user explicitly requests another language.
Provide natural, grammatically correct sentences rather than awkward literal translation. Preserve recognized technical terms when appropriate.

Core Personality:
${selectedGuide}

Language Directive:
${langDirective}
${nameDirective}
${visionDirective}

General Knowledge & Follow-up Rules:
1. Open-Ended Questions: Provide accurate, informative, and engaging answers to whatever the user asks.
2. Contextual Memory: Use previous conversation history to understand follow-ups like "Give me an example", "Explain that in simpler words", "Now explain it in Tamil", or "What did I ask earlier?".
3. Current Events / Yesterday's News: Since your training data has a fixed knowledge cutoff and does not include live search, if asked about today's or yesterday's breaking news or real-time events, clearly and politely inform the user that you do not have live web access to today's news rather than fabricating information.
4. Voice-Friendly Conciseness: Keep answers clear, engaging, and around 2 to 4 sentences so text-to-speech audio remains crisp and natural.
5. Return ONLY a valid JSON object matching this exact structure:
{
  "text": "Your helpful response in the selected language and script",
  "expression": "one of: idle, happy, excited, curious, thinking, surprised, confused, playful, laughing, celebrating, error"
}`;
}

router.post('/', async (req, res) => {
  const {
    message,
    history = [],
    personality = 'playful',
    language = 'en',
    visitorName = '',
    image = null,
    visionContext = null,
  } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'A valid message string is required.' });
  }

  // Validate image if provided
  let hasValidImage = false;
  if (image) {
    if (
      typeof image !== 'string' ||
      (!image.startsWith('data:image/jpeg;base64,') &&
        !image.startsWith('data:image/png;base64,') &&
        !image.startsWith('data:image/webp;base64,'))
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Expected a base64 encoded JPEG, PNG, or WebP data URL.',
      });
    }
    // Limit base64 image size to 5MB
    if (image.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image is too large. Captured frame must be under 5MB.',
      });
    }
    hasValidImage = true;
  }

  // Support OPENAI_API_KEY as primary, with fallbacks to other env names if present
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.AI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_actual_openai_api_key_here' || apiKey === 'your_api_key_here') {
    return res.status(503).json({
      success: false,
      isAi: false,
      code: 'API_KEY_MISSING',
      error: 'OpenAI API key is missing or not configured. Please add OPENAI_API_KEY to your .env file on the server.',
    });
  }

  try {
    const isGroqKey = apiKey.startsWith('gsk_');
    const defaultBaseUrl = isGroqKey ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1';
    const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_ENDPOINT || defaultBaseUrl;

    let model = process.env.OPENAI_MODEL || process.env.AI_MODEL;
    if (!model) {
      if (hasValidImage) {
        model = isGroqKey ? (process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview') : 'gpt-4o-mini';
      } else {
        model = isGroqKey ? 'openai/gpt-oss-120b' : 'gpt-4o-mini';
      }
    } else if (hasValidImage && isGroqKey && !model.toLowerCase().includes('vision')) {
      // If Groq key and image is provided but model is text-only, switch to Groq vision model
      model = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
      timeout: 18000,
    });

    const isVision = Boolean(hasValidImage || visionContext);
    const systemPrompt = buildSystemPrompt(personality, language, visitorName, isVision);

    // Format conversation history (limit to last 8 turns)
    const messages = [{ role: 'system', content: systemPrompt }];
    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];

    recentHistory.forEach((item) => {
      if (item && item.content && typeof item.content === 'string') {
        const role = item.role === 'assistant' ? 'assistant' : 'user';
        messages.push({ role, content: item.content.trim() });
      }
    });

    // Build current user prompt with vision context if available
    let promptText = message.trim();
    if (visionContext && typeof visionContext === 'string') {
      promptText = `${promptText}\n\n[Real-Time Scene Observation Context: ${visionContext.trim()}]`;
    }

    if (hasValidImage) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: promptText },
          {
            type: 'image_url',
            image_url: {
              url: image,
              detail: 'auto',
            },
          },
        ],
      });
    } else {
      messages.push({ role: 'user', content: promptText });
    }

    const completionParams = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 650,
    };

    // Only apply strict json_object constraint when not using Groq and not multi-modal with vision models
    if (!isGroqKey && !hasValidImage) {
      completionParams.response_format = { type: 'json_object' };
    }

    const completion = await openai.chat.completions.create(completionParams);

    const rawContent = completion.choices?.[0]?.message?.content || '';

    let cleanText = '';
    let expression = 'happy';

    // 1. Try direct JSON.parse
    try {
      const parsed = JSON.parse(rawContent.trim());
      if (parsed && typeof parsed.text === 'string') {
        cleanText = parsed.text.trim();
        expression = parsed.expression || 'happy';
      }
    } catch {}

    // 2. Try regex match for JSON object with "text" property
    if (!cleanText) {
      const jsonMatch = rawContent.match(/\{[\s\S]*?"text"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed.text === 'string') {
            cleanText = parsed.text.trim();
            expression = parsed.expression || 'happy';
          }
        } catch {}
      }
    }

    // 3. Fallback: if model returned plain text, strip markdown backticks and use directly
    if (!cleanText) {
      cleanText = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    }

    if (!cleanText) {
      throw new Error('GPT model returned an empty response.');
    }

    return res.json({
      success: true,
      isAi: true,
      text: cleanText,
      expression,
      model,
      language,
    });
  } catch (err) {
    console.error('OpenAI GPT API Error:', err.message || err);
    return res.status(500).json({
      success: false,
      isAi: false,
      error: `OpenAI GPT API Error: ${err.message || 'Failed to generate response'}`,
    });
  }
});

export default router;
