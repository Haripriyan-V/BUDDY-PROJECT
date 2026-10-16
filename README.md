<div align="center">

# 🤖 BUDDY 2.0

### Your Interactive AI Companion — *Talk. Play. Learn. Explore.*

A voice-enabled 3D AI mascot built for a hands-on Science Expo experience.

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?logo=nodedotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Expo_Ready-brightgreen)

</div>

---

## 📖 Overview

**BUDDY 2.0** is an interactive kiosk-style application that combines an animated 3D robot character, conversational AI, multilingual voice interaction, mini-games, and a session-based rewards system. Visitors can talk or type to BUDDY, pick a personality, explore STEM topics, play arcade games, and earn XP.

An optional backend connects to a supported AI provider. If the backend or provider is unavailable, a **local fallback response engine** keeps BUDDY usable, so a demo never goes completely silent.

> **Scope note:** This README documents only what is implemented in the repository. Webcam object detection and visual question answering are listed under [Roadmap](#-roadmap) and are **not** yet available.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Arcade & Activities](#-arcade--activities)
- [Languages & Voice](#-languages--voice)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Expo Day Checklist](#-expo-day-checklist)
- [Privacy & Responsible Use](#-privacy--responsible-use)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

| Feature | Description |
|---|---|
| 🧍 **Interactive 3D robot** | Animated character with idle movement, expressions, blinking, cursor tracking, and speaking reactions |
| 🎙️ **Voice + text chat** | Speak via the browser's speech recognition, or type a question |
| 🌍 **Multilingual** | Centralized language and speech settings for 10 languages |
| 🧠 **AI conversation** | Backend chat proxy with configurable providers, plus an offline fallback engine |
| 🎭 **Personality modes** | Playful, Explorer, and Helper conversation styles |
| 🕹️ **Game arcade** | Six mini-games and activities with high scores and arcade progress |
| 🏆 **Rewards system** | XP, levels, achievements, session scoring, and completion screens |
| 🎪 **Science Expo mode** | Presentation-friendly controls, info panel, and one-click visitor reset |
| 🧘 **Relax mode** | A short guided breathing experience |
| 🖱️ **Flexible input** | Built for laptops and large displays with mouse, keyboard, and touch (where supported) |

## 🧰 Tech Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Bundler / dev server | Vite |
| 3D rendering | Three.js, React Three Fiber, Drei |
| Backend | Node.js, Express |
| AI integration | Configurable provider via the backend chat route (Gemini, OpenAI, Groq, OpenRouter, or any OpenAI-compatible endpoint) |
| Voice input | Browser Web Speech API (where supported) |
| Voice output | Browser Speech Synthesis (where voices are available) |
| UI extras | Lucide React, Canvas Confetti |
| Testing | Node.js built-in test runner |
| Linting | Oxlint |

## 🚀 Quick Start

### Prerequisites

- **Node.js** — a current LTS release (npm is included)
- A modern browser such as **Chrome** or **Edge**
- Internet access (for installing dependencies and using an external AI provider)
- Microphone permission (for voice input)

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# then edit .env (see "Environment Variables" below)

# 4. Start the frontend and backend together
npm run dev
```

Then open **http://localhost:5173** and allow microphone access if you want to use **Tap to Talk**. Camera access is not required.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |

The Vite dev server proxies `/api` requests to the Express backend on port `3001`.

## 🔐 Environment Variables

Create a `.env` file in the project root (use `.env.example` as the template):

```env
# Express backend
PORT=3001

# AI provider: gemini | openai | groq | openrouter | compatible OpenAI-format endpoint
AI_PROVIDER=gemini
AI_API_KEY=your_api_key_here
AI_MODEL=your_model_name_here

# Frontend API base (defaults to the Vite /api proxy)
VITE_API_BASE_URL=/api
```

> ⚠️ **Security**
> - Keep real API keys in `.env` on the **server side** only. Never commit `.env` or place keys in client code.
> - Use a model identifier that your provider and account actually support; model names change over time.
> - With no key configured, BUDDY uses the limited local fallback engine.
> - See `.env.example` and `server/routes/chat.js` for the exact options your code supports.

## 🧪 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Express backend and Vite frontend together |
| `npm run dev:client` | Start only the frontend |
| `npm run server` | Start only the backend |
| `npm test` | Run the test suite (`test/core.test.js`) |
| `npm run lint` | Run Oxlint |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

Before submitting changes, run:

```bash
npm test && npm run lint && npm run build
```

## 🎮 Arcade & Activities

| Game / Activity | Description |
|---|---|
| **BUDDY Flight** | Guide BUDDY through obstacles by flapping and timing your moves |
| **Robo Run** | Sprint through a neon course, dodge obstacles, collect power-ups |
| **Quiz Blast** | Answer STEM and computing questions in a rocket-themed quiz |
| **Brain Flip** | Match cards and test your visual memory |
| **Catch the Bots** | Test reaction speed: tap targets, avoid decoys |
| **BUDDY Pet Studio** | Customize BUDDY's look with cosmetic options |

Other areas: the **Ask BUDDY** panel, personality selection, **Relax Mode**, the session timer, and reward/completion screens.

> Game launching by voice or AI command only works for intents that are connected to a game handler (see `gameIntentService.js`). Don't assume every AI-generated command can start or control a game.

## 🌐 Languages & Voice

Language settings live in `src/utils/languages.js` and cover **English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Spanish, French, and German**.

Speech recognition and synthesis depend on the browser, operating system, and installed voices. A language may work for typed chat while spoken output is unavailable on a given device; BUDDY should keep the text response visible and report that voice is unavailable.

**For best results:**
1. Use a modern browser with microphone permission enabled.
2. Select the language *before* speaking.
3. Confirm the browser supports speech recognition for that language.
4. Check installed speech-synthesis voices if BUDDY doesn't speak.
5. Fall back to typed chat when speech input isn't supported.

## 🏗️ Architecture

```text
BUDDY 2.0
├── React + Vite frontend
│   ├── App and Expo controls
│   ├── 3D character and Three.js scene
│   ├── Speech recognition / synthesis hooks
│   ├── Conversation service + offline fallback
│   ├── Arcade games and game state
│   ├── XP, scoring, achievements, completion screens
│   └── Session timer and visitor reset
│
├── Node.js + Express backend
│   ├── GET  /api/health
│   └── POST /api/chat   → AI provider proxy
│
└── AI provider (optional, configured server-side via env vars)
```

### Conversation flow

```text
Visitor types or speaks
        ↓
Frontend → conversationService (message + context)
        ↓
Backend /api/chat ──(if configured)──→ AI provider
        ↓                                   │
   Response ←───────────────────────────────┘
        ↓
Displayed in speech bubble → spoken via speech synthesis (if a voice exists)
        ↓
Character state and UI update
```

If the AI service can't be reached, the local fallback engine returns a limited response. It is **not** equivalent to a full general-purpose AI model.

## 📁 Project Structure

```text
BUDDY PROJECT/
├── server/
│   ├── index.js
│   └── routes/chat.js
├── src/
│   ├── components/
│   │   ├── arcade/            # BuddyFlight, RoboRun, QuizBlast, BrainFlip,
│   │   │                      # CatchTheBots, BuddyPetStudio, GameArcade
│   │   ├── BuddyCharacter.jsx
│   │   ├── BuddyScene.jsx
│   │   ├── ExpoControls.jsx
│   │   ├── ExpoInfoModal.jsx
│   │   ├── AskBuddyModal.jsx
│   │   ├── MicrophoneButton.jsx
│   │   ├── ChallengePanel.jsx
│   │   ├── CompletionScreen.jsx
│   │   ├── CharacterSpeechBubble.jsx
│   │   └── RelaxMode.jsx
│   ├── hooks/                 # useSpeechRecognition, useSpeechSynthesis,
│   │                          # useSessionTimer, useInactivity
│   ├── services/              # conversationService, fallbackResponses,
│   │                          # gameIntentService, arcadeService,
│   │                          # scoringService, soundEffects
│   ├── utils/                 # languages, characterStates, gameQuestions,
│   │                          # quizQuestions, formatTime
│   ├── App.jsx
│   └── main.jsx
├── test/core.test.js
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

*This is a guide to the main files; minor files and details may change as the project evolves.*

## 🛠️ Troubleshooting

<details>
<summary><b>Chatbot gives fallback answers instead of AI answers</b></summary>

1. Confirm the backend is running.
2. Open http://localhost:3001/api/health.
3. Check that `.env` is in the project root.
4. Verify `AI_PROVIDER`, `AI_API_KEY`, and `AI_MODEL`.
5. Confirm the model name is valid for your provider.
6. Read the backend terminal for provider or network errors.

Never paste API keys into public issues or screenshots.
</details>

<details>
<summary><b>Tap to Talk doesn't work</b></summary>

- Use a supported browser (Chrome or Edge recommended).
- Allow microphone access for `localhost`.
- Confirm the correct language is selected.
- Check the browser console for errors.
- Try typing a message to tell a speech issue apart from a backend issue.
</details>

<details>
<summary><b>BUDDY shows text but doesn't speak</b></summary>

- Check that sound is enabled and system volume is up.
- Check the voices available in your browser/OS.
- Choose a language that has a compatible voice installed.
- Remember that speech recognition and speech synthesis are separate capabilities.
</details>

<details>
<summary><b>The 3D scene is slow</b></summary>

- Close unnecessary browser tabs.
- Enable hardware acceleration in the browser.
- Check the console for WebGL errors.
- Test on the actual Expo device well in advance.
</details>

<details>
<summary><b>Port already in use</b></summary>

Stop the conflicting process, or change the port consistently in `.env`, `vite.config.js` (proxy target), and `VITE_API_BASE_URL`.
</details>

## ✅ Expo Day Checklist

- [ ] `npm run build` and `npm run preview` work on the **Expo machine**
- [ ] Microphone permission granted and tested in the venue's noise level
- [ ] Voices installed for every language you plan to demo
- [ ] API key valid; fallback behavior tested with Wi-Fi off
- [ ] Browser in fullscreen / kiosk mode; sleep and notifications disabled
- [ ] Visitor reset tested between sessions

## 🔒 Privacy & Responsible Use

- Microphone access requires explicit browser permission; tell visitors when voice input is active.
- Never place API credentials in frontend code or public repositories.
- Ask visitors not to enter sensitive personal information during demos.
- Reset the session between visitors when running as a kiosk.
- If camera-based vision is added later, request camera permission explicitly, show when the camera is active, and state whether images are processed locally or sent to an external provider.

## 🛣️ Roadmap

*Potential extensions — **not** implemented yet:*

- [ ] Real-time webcam human and object detection
- [ ] Better small-object recognition (e.g., watches, books)
- [ ] Visual question answering from a captured camera frame
- [ ] Hand-gesture controls for the interface and games
- [ ] More reliable voice availability across languages
- [ ] Additional learning challenges and adaptive quizzes
- [ ] Optional, user-controlled progress persistence

## 🤝 Contributing

1. Create a feature branch.
2. Keep changes focused and consistent with the existing architecture.
3. Don't commit secrets, build output, or `node_modules`.
4. Run `npm test`, `npm run lint`, and `npm run build`.
5. Describe behavior changes and known limitations in your pull request.

## 📄 License

No license is currently specified, so none should be assumed. Add a `LICENSE` file (e.g., MIT) and update this section before distributing or accepting external contributions.

---

<div align="center">

**BUDDY 2.0** — conversational AI, multilingual voice, an expressive 3D robot, STEM games, and gamified learning in one Science Expo experience.

*Talk. Play. Learn. Explore.* 🚀

</div>
