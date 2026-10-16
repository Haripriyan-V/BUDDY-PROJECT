import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import chatRouter, { buildSystemPrompt } from '../server/routes/chat.js';
import dotenv from 'dotenv';

dotenv.config();

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/chat', chatRouter);
  return app;
}

test('buildSystemPrompt supports German, Tamil, Hindi, and English with strict multilingual rules', () => {
  const promptEn = buildSystemPrompt('playful', 'en');
  assert.ok(promptEn.includes('English'));

  const promptTa = buildSystemPrompt('playful', 'ta');
  assert.ok(promptTa.includes('Tamil (தமிழ்)'));
  assert.ok(promptTa.includes('Tamil script'));

  const promptHi = buildSystemPrompt('helper', 'hi');
  assert.ok(promptHi.includes('Hindi (हिन्दी)'));
  assert.ok(promptHi.includes('Devanagari script'));

  const promptDe = buildSystemPrompt('explorer', 'de');
  assert.ok(promptDe.includes('German (Deutsch)'));
  assert.ok(promptDe.includes('Deutsch'));

  assert.ok(promptTa.includes('CRITICAL MULTILINGUAL MANDATE'));
  assert.ok(promptTa.includes('The selected output language strictly overrides the input language'));
});

test('POST /api/chat rejects empty or invalid message', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('required'));
  } finally {
    server.close();
  }
});

test('POST /api/chat handles API key missing gracefully', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalAiKey = process.env.AI_API_KEY;
  const originalGroqKey = process.env.GROQ_API_KEY;
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  delete process.env.OPENAI_API_KEY;
  delete process.env.AI_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is artificial intelligence?' }),
    });

    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'API_KEY_MISSING');
    assert.ok(data.error.includes('OPENAI_API_KEY'));
  } finally {
    server.close();
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    if (originalAiKey) process.env.AI_API_KEY = originalAiKey;
    if (originalGroqKey) process.env.GROQ_API_KEY = originalGroqKey;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
  }
});

test('POST /api/chat generates dynamic answers to Test 1: Unknown question (Quantum entanglement)', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Explain how quantum entanglement works in simple terms.',
        language: 'en',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isAi, true);
    assert.ok(data.text && data.text.length > 20);
    assert.ok(data.text.toLowerCase().includes('quantum') || data.text.toLowerCase().includes('particle'));
  } finally {
    server.close();
  }
});

test('POST /api/chat generates Test 2: Tamil answer for English question with Tamil language selected', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is a neural network?',
        language: 'ta',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isAi, true);
    // Must contain genuine Tamil Unicode characters
    assert.ok(/[\u0B80-\u0BFF]/.test(data.text), 'Output must contain genuine Tamil script characters');
  } finally {
    server.close();
  }
});

test('POST /api/chat handles Test 3: Tamil voice question input', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'மனித மூளை எப்படி வேலை செய்கிறது?',
        language: 'ta',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isAi, true);
    assert.ok(/[\u0B80-\u0BFF]/.test(data.text), 'Output must contain genuine Tamil script characters');
  } finally {
    server.close();
  }
});

test('POST /api/chat handles Test 4: Follow-up question with conversation history', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const history = [
      { role: 'user', content: 'What is photosynthesis?' },
      { role: 'assistant', content: 'Photosynthesis is how plants turn sunlight and water into glucose food and oxygen!' },
    ];

    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Why is sunlight important for this process?',
        history,
        language: 'en',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isAi, true);
    assert.ok(data.text.toLowerCase().includes('sunlight') || data.text.toLowerCase().includes('energy') || data.text.toLowerCase().includes('plant'));
  } finally {
    server.close();
  }
});

test('POST /api/chat handles Test 5: Non-educational creative question', async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Give me 3 innovative ideas for a college science exhibition.',
        language: 'en',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isAi, true);
    assert.ok(data.text.length > 30);
  } finally {
    server.close();
  }
});
