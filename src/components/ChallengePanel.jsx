import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Zap,
  RefreshCw,
  Sparkles,
  Smile,
} from 'lucide-react';
import {
  MEMORY_SETS,
  MATH_QUESTIONS,
  SCIENCE_QUESTIONS,
  BRAIN_SPARK_QUESTIONS,
  MYSTERY_OBJECTS,
  MYTH_BUSTER_QUESTIONS,
  WOULD_YOU_RATHER_QUESTIONS,
  JOKE_BATTLE_ROUNDS,
  STORY_ADVENTURES,
  MARS_ROVER_MISSION,
} from '../utils/gameQuestions';
import { CHARACTER_STATES } from '../utils/characterStates';

export function ChallengePanel({ onCompleteChallenge, onClose, setCharacterState }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sparks' | 'quiz' | 'adventures'
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState('idle'); // 'memorizing' | 'question' | 'waiting' | 'target' | 'result'
  const [currentSet, setCurrentSet] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [earlyClick, setEarlyClick] = useState(false);

  // Progressive clues state for Mystery Object
  const [revealedClues, setRevealedClues] = useState(1);

  // Mars Rover mission state
  const [missionStepIndex, setMissionStepIndex] = useState(0);
  const [missionLog, setMissionLog] = useState([]);

  // Joke Battle state
  const [jokeReaction, setJokeReaction] = useState(null);

  // Adaptive difficulty tracking
  const [difficultyLevel, setDifficultyLevel] = useState('easy');

  // Timers and refs
  const reactionStartRef = useRef(0);
  const reactionTimerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // 1. Brain Spark (Riddles & Logic)
  const startBrainSpark = () => {
    const item = BRAIN_SPARK_QUESTIONS[Math.floor(Math.random() * BRAIN_SPARK_QUESTIONS.length)];
    setCurrentSet(item);
    setSelectedGame('brain_spark');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.CURIOUS);
  };

  // 2. Memory Flash
  const startMemoryGame = () => {
    const item = MEMORY_SETS[Math.floor(Math.random() * MEMORY_SETS.length)];
    setCurrentSet(item);
    setSelectedGame('memory');
    setGameState('memorizing');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.CURIOUS);

    autoAdvanceTimerRef.current = setTimeout(() => {
      setGameState('question');
      setCharacterState(CHARACTER_STATES.THINKING);
    }, 3200);
  };

  // 3. Reaction Rush
  const startReactionGame = () => {
    setSelectedGame('reaction');
    setGameState('waiting');
    setResultMessage(null);
    setReactionTime(null);
    setEarlyClick(false);
    setCharacterState(CHARACTER_STATES.LISTENING);

    const delay = 1600 + Math.random() * 2200;
    reactionTimerRef.current = setTimeout(() => {
      setGameState('target');
      reactionStartRef.current = performance.now();
      setCharacterState(CHARACTER_STATES.SURPRISED);
    }, delay);
  };

  const handleReactionClick = () => {
    if (gameState === 'waiting') {
      clearTimeout(reactionTimerRef.current);
      setEarlyClick(true);
      setGameState('result');
      setResultMessage({
        success: false,
        text: 'Too early! Wait for the electric neon target to ignite! ⚡',
      });
      setCharacterState(CHARACTER_STATES.CONFUSED);
      return;
    }

    if (gameState === 'target') {
      const elapsed = Math.round(performance.now() - reactionStartRef.current);
      setReactionTime(elapsed);
      setGameState('result');
      const isFast = elapsed < 320;
      setResultMessage({
        success: true,
        text: isFast
          ? `Super Reflexes! ⚡ ${elapsed}ms! Faster than an Olympic sprinter!`
          : `Great reaction time! ⏱️ ${elapsed}ms! Solid neural reflexes!`,
      });
      setCharacterState(CHARACTER_STATES.CELEBRATING);
      onCompleteChallenge(75, 'Reflex Tap');
    }
  };

  // 4. Science Quiz (Adaptive Level)
  const startScienceQuiz = () => {
    // Filter by difficulty if available, else random
    const pool = SCIENCE_QUESTIONS.filter((q) => q.difficulty === difficultyLevel);
    const item = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : SCIENCE_QUESTIONS[Math.floor(Math.random() * SCIENCE_QUESTIONS.length)];

    setCurrentSet(item);
    setSelectedGame('science');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.THINKING);
  };

  // 5. Quick Math
  const startMathGame = () => {
    const item = MATH_QUESTIONS[Math.floor(Math.random() * MATH_QUESTIONS.length)];
    setCurrentSet(item);
    setSelectedGame('math');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.THINKING);
  };

  // 6. Science Myth Buster
  const startMythBuster = () => {
    const item = MYTH_BUSTER_QUESTIONS[Math.floor(Math.random() * MYTH_BUSTER_QUESTIONS.length)];
    setCurrentSet(item);
    setSelectedGame('myth_buster');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.CURIOUS);
  };

  // 7. Mystery Object (Progressive Clues)
  const startMysteryObject = () => {
    const item = MYSTERY_OBJECTS[Math.floor(Math.random() * MYSTERY_OBJECTS.length)];
    setCurrentSet(item);
    setRevealedClues(1);
    setSelectedGame('mystery_object');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.CURIOUS);
  };

  // 8. Would You Rather?
  const startWouldYouRather = () => {
    const item = WOULD_YOU_RATHER_QUESTIONS[Math.floor(Math.random() * WOULD_YOU_RATHER_QUESTIONS.length)];
    setCurrentSet(item);
    setSelectedGame('would_you_rather');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.PLAYFUL);
  };

  // 9. Joke Battle
  const startJokeBattle = () => {
    const item = JOKE_BATTLE_ROUNDS[Math.floor(Math.random() * JOKE_BATTLE_ROUNDS.length)];
    setCurrentSet(item);
    setJokeReaction(null);
    setSelectedGame('joke_battle');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.LAUGHING);
  };

  // 10. AI Story Adventure
  const startStoryAdventure = () => {
    const item = STORY_ADVENTURES[Math.floor(Math.random() * STORY_ADVENTURES.length)];
    setCurrentSet(item);
    setStoryOutcome(null);
    setSelectedGame('story_adventure');
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.EXCITED);
  };

  // 11. Mars Rover Rescue
  const startMarsMission = () => {
    setSelectedGame('mars_rover');
    setMissionStepIndex(0);
    setMissionLog([]);
    setGameState('question');
    setResultMessage(null);
    setCharacterState(CHARACTER_STATES.THINKING);
  };

  // Handling Multiple Choice Answers
  const handleAnswerSelect = (option) => {
    if (gameState === 'result') return;

    let isCorrect = false;
    let feedback = '';

    if (selectedGame === 'brain_spark') {
      isCorrect = option === currentSet.answer;
      feedback = isCorrect
        ? `Brilliant deduction! 💡 ${currentSet.explanation}`
        : `Close! The answer was: ${currentSet.answer}. (${currentSet.explanation})`;
    } else if (selectedGame === 'memory') {
      isCorrect = option === currentSet.correct;
      feedback = isCorrect
        ? 'Spot on! Your visual memory matrix is razor sharp! 🎯'
        : `Almost! The correct item was ${currentSet.correct}!`;
    } else if (selectedGame === 'math') {
      isCorrect = option === currentSet.answer;
      feedback = isCorrect
        ? 'Genius calculation! Correct! 🔢✨'
        : `Nice try! The correct solution was ${currentSet.answer}!`;
    } else if (selectedGame === 'science') {
      isCorrect = option === currentSet.answer;
      feedback = isCorrect
        ? `Brilliant! 🔬 ${currentSet.explanation}`
        : `Almost! The correct answer was ${currentSet.answer}. (${currentSet.explanation})`;

      // Adaptive difficulty tuning
      if (isCorrect) {
        setDifficultyLevel((prev) => (prev === 'easy' ? 'medium' : 'hard'));
      } else {
        setDifficultyLevel((prev) => (prev === 'hard' ? 'medium' : 'easy'));
      }
    } else if (selectedGame === 'mystery_object') {
      isCorrect = option === currentSet.name;
      const points = revealedClues === 1 ? 60 : revealedClues === 2 ? 45 : 30;
      feedback = isCorrect
        ? `Outstanding detective work! 🕵️ You identified ${currentSet.name} with ${revealedClues} clue(s)!`
        : `Almost! It was the ${currentSet.name}!`;

      setGameState('result');
      setResultMessage({ success: isCorrect, text: feedback });
      if (isCorrect) {
        setCharacterState(CHARACTER_STATES.CELEBRATING);
        onCompleteChallenge(points, 'Mystery Object Solved');
      } else {
        setCharacterState(CHARACTER_STATES.CONFUSED);
      }
      return;
    }

    setGameState('result');
    setResultMessage({ success: isCorrect, text: feedback });

    if (isCorrect) {
      setCharacterState(CHARACTER_STATES.CELEBRATING);
      onCompleteChallenge(50, `${selectedGame.toUpperCase()} Challenge`);
    } else {
      setCharacterState(CHARACTER_STATES.CURIOUS);
    }
  };

  // Handle Myth Buster (True / False)
  const handleMythAnswer = (userChoice) => {
    if (gameState === 'result') return;
    const isCorrect = userChoice === currentSet.isTrue;
    setGameState('result');
    setResultMessage({
      success: isCorrect,
      text: `${currentSet.explanation}`,
    });

    if (isCorrect) {
      setCharacterState(CHARACTER_STATES.CELEBRATING);
      onCompleteChallenge(45, 'Myth Buster Verified');
    } else {
      setCharacterState(CHARACTER_STATES.SURPRISED);
    }
  };

  // Handle Would You Rather
  const handleWouldYouRatherChoice = (choiceKey) => {
    if (gameState === 'result') return;
    const reaction = choiceKey === 'A' ? currentSet.buddyReactionA : currentSet.buddyReactionB;
    setGameState('result');
    setResultMessage({
      success: true,
      text: reaction,
    });
    setCharacterState(CHARACTER_STATES.PLAYFUL);
    onCompleteChallenge(30, 'Would You Rather Choice');
  };

  // Handle Joke Battle actions
  const handleJokeAction = (actionKey) => {
    const reaction = currentSet.reactions[actionKey];
    setJokeReaction(reaction);
    setCharacterState(CHARACTER_STATES.LAUGHING);
    onCompleteChallenge(25, 'Joke Battle Laugh');
  };

  // Handle Story Adventure choice
  const handleStoryChoice = (choice) => {
    setStoryOutcome(choice.outcome);
    setGameState('result');
    setResultMessage({
      success: true,
      text: choice.outcome,
    });
    setCharacterState(CHARACTER_STATES.CELEBRATING);
    onCompleteChallenge(choice.scoreXP, 'Story Mission Complete');
  };

  // Handle Mars Rover Rescue steps
  const handleRoverChoice = (option) => {
    const newLog = [...missionLog, { step: missionStepIndex + 1, text: option.textSuccess, success: option.success }];
    setMissionLog(newLog);

    if (missionStepIndex < MARS_ROVER_MISSION.steps.length - 1) {
      setMissionStepIndex((prev) => prev + 1);
      setCharacterState(option.success ? CHARACTER_STATES.HAPPY : CHARACTER_STATES.CURIOUS);
    } else {
      // Completed all 3 emergency steps
      setGameState('result');
      const allSuccess = newLog.every((l) => l.success);
      setResultMessage({
        success: true,
        text: allSuccess
          ? '🌟 FULL ROVER RESCUE! Pioneer is back online with telemetry locked to NASA! Incredible mission control leadership!'
          : 'Mission accomplished! Rover Pioneer weathered the dust storm and reconnected with orbiter relay!',
      });
      setCharacterState(CHARACTER_STATES.CELEBRATING);
      onCompleteChallenge(75, 'Mars Rover Saved');
    }
  };

  return (
    <div className="challenge-modal-backdrop">
      <div className="challenge-card-glass">
        {/* Top Header */}
        <div className="challenge-header">
          <button className="challenge-back-btn" onClick={onClose} aria-label="Back to main stage">
            <ArrowLeft size={18} />
            <span>Back to Stage</span>
          </button>
          <div className="challenge-title-wrap">
            <Trophy size={20} className="trophy-gold" />
            <h3>BUDDY 2.0 • PLAY ZONE</h3>
          </div>
        </div>

        {/* Game Category Navigation Tabs (when no game is currently open) */}
        {!selectedGame && (
          <div className="challenge-tabs-row">
            <button
              className={`challenge-tab-btn ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All (10)
            </button>
            <button
              className={`challenge-tab-btn ${activeTab === 'sparks' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('sparks')}
            >
              ⚡ Quick Sparks
            </button>
            <button
              className={`challenge-tab-btn ${activeTab === 'quiz' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              🔬 Science & Trivia
            </button>
            <button
              className={`challenge-tab-btn ${activeTab === 'adventures' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('adventures')}
            >
              🚀 Missions & Fun
            </button>
          </div>
        )}

        {/* Game Selection Menu Grid */}
        {!selectedGame && (
          <div className="challenge-menu">
            <p className="challenge-menu-subtitle">
              Choose a quick 15-30 second science challenge to spark your brain and earn XP!
            </p>
            <div className="game-cards-grid">
              {/* Category: Sparks */}
              {(activeTab === 'all' || activeTab === 'sparks') && (
                <>
                  <button className="game-choice-btn spark-theme" onClick={startBrainSpark}>
                    <div className="game-choice-icon">💡</div>
                    <h4>Brain Spark</h4>
                    <p>Riddles & rapid logic teasers (+50 XP)</p>
                  </button>

                  <button className="game-choice-btn memory-theme" onClick={startMemoryGame}>
                    <div className="game-choice-icon">🧠</div>
                    <h4>Memory Flash</h4>
                    <p>Recall objects before they vanish (+50 XP)</p>
                  </button>

                  <button className="game-choice-btn reflex-theme" onClick={startReactionGame}>
                    <div className="game-choice-icon">⚡</div>
                    <h4>Reaction Rush</h4>
                    <p>Millisecond speed reflex challenge (+75 XP)</p>
                  </button>
                </>
              )}

              {/* Category: Quiz */}
              {(activeTab === 'all' || activeTab === 'quiz') && (
                <>
                  <button className="game-choice-btn science-theme" onClick={startScienceQuiz}>
                    <div className="game-choice-icon">🔬</div>
                    <h4>Science Quiz</h4>
                    <p>Space, physics, and biology trivia (+50 XP)</p>
                  </button>

                  <button className="game-choice-btn math-theme" onClick={startMathGame}>
                    <div className="game-choice-icon">🔢</div>
                    <h4>Quick Math</h4>
                    <p>Speed calculations & brain math (+50 XP)</p>
                  </button>

                  <button className="game-choice-btn myth-theme" onClick={startMythBuster}>
                    <div className="game-choice-icon">🧪</div>
                    <h4>Myth Buster</h4>
                    <p>Test facts vs myths (True / False) (+45 XP)</p>
                  </button>

                  <button className="game-choice-btn mystery-theme" onClick={startMysteryObject}>
                    <div className="game-choice-icon">🕵️</div>
                    <h4>Mystery Object</h4>
                    <p>Guess scientific object in 3 clues (+60 XP)</p>
                  </button>
                </>
              )}

              {/* Category: Adventures & Missions */}
              {(activeTab === 'all' || activeTab === 'adventures') && (
                <>
                  <button className="game-choice-btn rover-theme" onClick={startMarsMission}>
                    <div className="game-choice-icon">🪐</div>
                    <h4>Mars Rover Rescue</h4>
                    <p>Save stranded rover Pioneer Sol 42 (+75 XP)</p>
                  </button>

                  <button className="game-choice-btn story-theme" onClick={startStoryAdventure}>
                    <div className="game-choice-icon">📖</div>
                    <h4>AI Story Adventure</h4>
                    <p>Branching sci-fi decision quest (+50 XP)</p>
                  </button>

                  <button className="game-choice-btn rather-theme" onClick={startWouldYouRather}>
                    <div className="game-choice-icon">⚖️</div>
                    <h4>Would You Rather?</h4>
                    <p>Cosmic and tech dilemmas (+30 XP)</p>
                  </button>

                  <button className="game-choice-btn joke-theme" onClick={startJokeBattle}>
                    <div className="game-choice-icon">😂</div>
                    <h4>Joke Battle</h4>
                    <p>Rate jokes & hear robot puns (+25 XP)</p>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 1. Memory Game View */}
        {selectedGame === 'memory' && (
          <div className="game-active-stage">
            {gameState === 'memorizing' && (
              <div className="memory-sequence-box">
                <span className="sequence-badge">MEMORIZE THESE! (Hiding in 3 seconds...)</span>
                <div className="sequence-emojis">
                  {currentSet.sequence.map((em, idx) => (
                    <span key={idx} className="seq-emoji">{em}</span>
                  ))}
                </div>
              </div>
            )}

            {(gameState === 'question' || gameState === 'result') && (
              <div className="quiz-box">
                <h4 className="quiz-question">{currentSet.question}</h4>
                <div className="quiz-options-grid">
                  {currentSet.options.map((opt, idx) => (
                    <button
                      key={idx}
                      className="quiz-option-btn"
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={gameState === 'result'}
                    >
                      <span className="option-emoji">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Reaction Rush View */}
        {selectedGame === 'reaction' && (
          <div className="game-active-stage">
            <div
              className={`reaction-arena-target ${
                gameState === 'target'
                  ? 'ready-to-tap'
                  : gameState === 'waiting'
                  ? 'waiting-target'
                  : ''
              }`}
              onClick={handleReactionClick}
            >
              {gameState === 'waiting' && (
                <div className="reaction-prompt">
                  <div className="pulse-warning-dot"></div>
                  <h4>WAIT FOR ELECTRIC NEON...</h4>
                  <p>Keep fingers ready, do NOT tap yet!</p>
                </div>
              )}
              {gameState === 'target' && (
                <div className="reaction-prompt-active">
                  <Zap size={48} className="zap-flash" />
                  <h4>TAP NOW! ⚡</h4>
                </div>
              )}
              {gameState === 'result' && (
                <div className="reaction-prompt-done">
                  <h4>{earlyClick ? 'TOO EARLY!' : `${reactionTime} ms`}</h4>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Brain Spark / Math / Science Quiz View */}
        {(selectedGame === 'brain_spark' || selectedGame === 'math' || selectedGame === 'science') && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">
                {selectedGame === 'brain_spark'
                  ? '💡 BRAIN SPARK RIDDLE'
                  : selectedGame === 'math'
                  ? '🔢 QUICK MATH'
                  : `🔬 SCIENCE QUIZ (${difficultyLevel.toUpperCase()})`}
              </div>
              <h4 className="quiz-question">{currentSet.question}</h4>
              <div className="quiz-options-grid">
                {currentSet.options.map((opt, idx) => (
                  <button
                    key={idx}
                    className="quiz-option-btn text-opt"
                    onClick={() => handleAnswerSelect(opt)}
                    disabled={gameState === 'result'}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Mystery Object View */}
        {selectedGame === 'mystery_object' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">🕵️ MYSTERY OBJECT • {currentSet.category}</div>
              <div className="clues-stack">
                {currentSet.clues.slice(0, revealedClues).map((clue, idx) => (
                  <div key={idx} className="clue-card-pill">
                    {clue}
                  </div>
                ))}
              </div>

              {revealedClues < 3 && gameState !== 'result' && (
                <button
                  className="secondary-hint-btn"
                  onClick={() => setRevealedClues((prev) => prev + 1)}
                >
                  <Sparkles size={14} /> Need another clue? Reveal Clue {revealedClues + 1} (-15 pts)
                </button>
              )}

              <h4 className="quiz-question" style={{ marginTop: '14px' }}>
                What object am I?
              </h4>
              <div className="quiz-options-grid">
                {currentSet.options.map((opt, idx) => (
                  <button
                    key={idx}
                    className="quiz-option-btn text-opt"
                    onClick={() => handleAnswerSelect(opt)}
                    disabled={gameState === 'result'}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Myth Buster View */}
        {selectedGame === 'myth_buster' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">🧪 SCIENCE MYTH BUSTER</div>
              <h4 className="quiz-question">"{currentSet.statement}"</h4>
              <p className="myth-prompt-sub">Is this a genuine scientific FACT, or a busted MYTH?</p>
              <div className="myth-buttons-row">
                <button
                  className="myth-btn fact-btn"
                  onClick={() => handleMythAnswer(true)}
                  disabled={gameState === 'result'}
                >
                  ✅ FACT
                </button>
                <button
                  className="myth-btn myth-btn-choice"
                  onClick={() => handleMythAnswer(false)}
                  disabled={gameState === 'result'}
                >
                  ❌ MYTH
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Would You Rather View */}
        {selectedGame === 'would_you_rather' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">⚖️ WOULD YOU RATHER?</div>
              <h4 className="quiz-question">Pick your ultimate science adventure:</h4>
              <div className="would-rather-grid">
                <button
                  className="rather-choice-card choice-a"
                  onClick={() => handleWouldYouRatherChoice('A')}
                  disabled={gameState === 'result'}
                >
                  <span className="rather-badge-pill">OPTION A</span>
                  <p>{currentSet.optionA}</p>
                </button>
                <button
                  className="rather-choice-card choice-b"
                  onClick={() => handleWouldYouRatherChoice('B')}
                  disabled={gameState === 'result'}
                >
                  <span className="rather-badge-pill">OPTION B</span>
                  <p>{currentSet.optionB}</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Joke Battle View */}
        {selectedGame === 'joke_battle' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">😂 JOKE BATTLE WITH BUDDY</div>
              <div className="joke-bubble-display">
                <Smile size={28} className="joke-icon" />
                <p className="joke-bubble-text">"{currentSet.joke}"</p>
              </div>

              {!jokeReaction ? (
                <div className="joke-reactions-row">
                  <button className="joke-action-btn" onClick={() => handleJokeAction('rate')}>
                    👏 10/10 Comedy Gold!
                  </button>
                  <button className="joke-action-btn" onClick={() => handleJokeAction('better')}>
                    😏 Tell me a better one!
                  </button>
                  <button className="joke-action-btn" onClick={() => handleJokeAction('another')}>
                    🤣 Give me another pun!
                  </button>
                </div>
              ) : (
                <div className="joke-buddy-reply">
                  <strong>BUDDY says:</strong>
                  <p>{jokeReaction}</p>
                  <button
                    className="play-again-btn"
                    style={{ marginTop: '12px' }}
                    onClick={startJokeBattle}
                  >
                    Next Joke Round 🔄
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. AI Story Adventure View */}
        {selectedGame === 'story_adventure' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">📖 {currentSet.title.toUpperCase()}</div>
              <span className="story-setting-tag">{currentSet.setting}</span>
              <p className="story-scene-text">{currentSet.initialScene}</p>

              {gameState !== 'result' && (
                <div className="story-choices-stack">
                  <span className="story-prompt-label">What is your next command?</span>
                  {currentSet.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      className="story-choice-btn"
                      onClick={() => handleStoryChoice(choice)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. Mars Rover Rescue View */}
        {selectedGame === 'mars_rover' && (
          <div className="game-active-stage">
            <div className="quiz-box">
              <div className="quiz-badge">🪐 {MARS_ROVER_MISSION.title.toUpperCase()}</div>
              {missionStepIndex === 0 && (
                <p className="rover-brief-text">{MARS_ROVER_MISSION.brief}</p>
              )}

              {/* Progress step dots */}
              <div className="mission-progress-bar">
                {MARS_ROVER_MISSION.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className={`mission-step-dot ${
                      idx === missionStepIndex
                        ? 'dot-active'
                        : idx < missionStepIndex
                        ? 'dot-done'
                        : ''
                    }`}
                  >
                    Step {idx + 1}
                  </div>
                ))}
              </div>

              {gameState !== 'result' && (
                <>
                  <h4 className="quiz-question">
                    {MARS_ROVER_MISSION.steps[missionStepIndex].scenario}
                  </h4>
                  <div className="story-choices-stack">
                    {MARS_ROVER_MISSION.steps[missionStepIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        className="story-choice-btn"
                        onClick={() => handleRoverChoice(opt)}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {missionLog.length > 0 && (
                <div className="mission-log-box">
                  <span className="mission-log-title">TELEMETRY LOG:</span>
                  {missionLog.map((log, idx) => (
                    <div key={idx} className="mission-log-line">
                      {log.success ? '✅' : '⚠️'} Step {log.step}: {log.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Banner for all games */}
        {gameState === 'result' && resultMessage && (
          <div
            className={`challenge-result-banner ${
              resultMessage.success ? 'result-win' : 'result-lose'
            }`}
          >
            <div className="result-icon">
              {resultMessage.success ? <CheckCircle size={26} /> : <XCircle size={26} />}
            </div>
            <div className="result-text-content">
              <strong>{resultMessage.success ? 'AWESOME SCORE!' : 'GOOD TRY!'}</strong>
              <p>{resultMessage.text}</p>
            </div>
            <div className="result-actions">
              <button
                className="play-again-btn"
                onClick={() => {
                  setSelectedGame(null);
                  setGameState('idle');
                  setResultMessage(null);
                  setStoryOutcome(null);
                  setJokeReaction(null);
                }}
              >
                <RefreshCw size={15} /> All Activities
              </button>
              <button className="primary-action-btn" onClick={onClose}>
                Continue Session →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
