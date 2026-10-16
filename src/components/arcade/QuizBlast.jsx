import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell } from './GameShell';
import { GameResults } from './GameResults';
import { soundEffects } from '../../services/soundEffects';
import { recordGameScore, getArcadeData } from '../../services/arcadeService';
import { getQuizQuestions, QUIZ_CATEGORIES } from '../../utils/quizQuestions';
import { CHARACTER_STATES } from '../../utils/characterStates';
import { CheckCircle2, XCircle, Clock, Zap, Rocket, Sparkles } from 'lucide-react';

const ALTITUDE_STAGES = [
  { name: 'Launchpad', km: '0 km' },
  { name: 'Troposphere', km: '12 km' },
  { name: 'Stratosphere', km: '50 km' },
  { name: 'Karman Line', km: '100 km' },
  { name: 'Low Earth Orbit', km: '380 km' },
  { name: 'Lunar Orbit', km: '384,400 km' },
];

export function QuizBlast({ onExit, onAwardXP, setCharacterState }) {
  const [questions, setQuestions] = useState(() => getQuizQuestions('all', 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [highScore, setHighScore] = useState(() => getArcadeData().highScores.quiz || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());
  const [isOver, setIsOver] = useState(false);
  const [resultData, setResultData] = useState(null);

  const hasAwardedRef = useRef(false);
  const timerRef = useRef(null);

  const currentQ = questions[currentIndex] || questions[0];

  // Answer handler
  const handleSelectOption = useCallback(
    (index) => {
      if (isAnswered || isOver || isPaused) return;
      setIsAnswered(true);
      setSelectedOption(index);
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = index === currentQ.correctIndex;

      if (isCorrect) {
        soundEffects.playCorrect();
        const streakBonus = streak * 10;
        const newScore = score + 50 + streakBonus;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
        setCorrectCount((c) => c + 1);

        if (setCharacterState) {
          setCharacterState(CHARACTER_STATES.HAPPY);
        }
      } else {
        soundEffects.playWrong();
        setStreak(0);
        if (setCharacterState) {
          setCharacterState(CHARACTER_STATES.CONFUSED);
        }
      }
    },
    [isAnswered, isOver, isPaused, currentQ, score, streak, setCharacterState]
  );

  // Question countdown timer
  useEffect(() => {
    if (isAnswered || isOver || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSelectOption(-1); // Timeout marked as wrong
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, isOver, isPaused, handleSelectOption]);

  // Next question or game complete
  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimerSeconds(15);
      if (setCharacterState) setCharacterState(CHARACTER_STATES.THINKING);
    } else {
      finishQuiz();
    }
  };

  // Finish quiz handler
  const finishQuiz = () => {
    if (hasAwardedRef.current) return;
    hasAwardedRef.current = true;
    setIsOver(true);

    const accuracy = Math.round((correctCount / questions.length) * 100);
    const altitude = ALTITUDE_STAGES[Math.min(ALTITUDE_STAGES.length - 1, correctCount)];

    // Record score & calculate XP
    const record = recordGameScore('quiz', correctCount);
    setHighScore(record.highScore);

    if (onAwardXP && record.earnedXP > 0) {
      onAwardXP(record.earnedXP);
    }

    if (setCharacterState) {
      setCharacterState(correctCount >= 3 ? CHARACTER_STATES.CELEBRATING : CHARACTER_STATES.PLAYFUL);
    }

    setResultData({
      score,
      highScore: record.highScore,
      isNewHighScore: record.isNewHighScore,
      earnedXP: record.earnedXP,
      newAchievements: record.newAchievements,
      extraStats: [
        { label: 'Rocket Altitude', value: `${altitude.name} (${altitude.km})` },
        { label: 'Accuracy', value: `${accuracy}% (${correctCount}/${questions.length})` },
        { label: 'Max Streak', value: `${maxStreak}🔥` },
      ],
      buddyComment:
        correctCount === questions.length
          ? 'PERFECT LAUNCH! You scored 100%! Ready to pilot NASA rockets! 🚀🌌'
          : correctCount >= 3
          ? `Mission Accomplished! You launched our rocket to ${altitude.name}! 🪐`
          : 'Great effort! Review the science notes and let us try for high orbit next round! 💡',
    });
  };

  // Restart handler
  const handleRestart = () => {
    hasAwardedRef.current = false;
    setQuestions(getQuizQuestions('all', 5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimerSeconds(15);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setIsOver(false);
    setResultData(null);
    if (setCharacterState) setCharacterState(CHARACTER_STATES.HAPPY);
  };

  const altitudeStage = ALTITUDE_STAGES[Math.min(ALTITUDE_STAGES.length - 1, correctCount)];
  const rocketHeightPercent = (correctCount / questions.length) * 85;

  return (
    <GameShell
      title="Quiz Blast"
      icon="🚀"
      score={score}
      highScore={highScore}
      isPaused={isPaused}
      isMuted={isMuted}
      onTogglePause={() => setIsPaused((p) => !p)}
      onRestart={handleRestart}
      onToggleMute={() => {
        const next = soundEffects.toggleMute();
        setIsMuted(next);
      }}
      onExit={onExit}
      extraHeaderInfo={
        <div className="shell-score-pill streak-pill">
          <Zap size={14} className="zap-icon" />
          <span className="label">Streak</span>
          <span className="value">{streak}🔥</span>
        </div>
      }
    >
      <div className="quiz-blast-layout">
        {/* Left Side: Rocket Launch Stage Visualizer */}
        <div className="rocket-launch-tower">
          <div className="launch-sky-bg">
            <div className="altitude-meter">
              <span className="alt-label">{altitudeStage.name}</span>
              <span className="alt-km">{altitudeStage.km}</span>
            </div>

            {/* Rising Cartoon Rocket */}
            <div
              className="rocket-sprite-container"
              style={{ bottom: `${15 + rocketHeightPercent}%` }}
            >
              <div className="rocket-flame-burst">
                <Rocket size={44} className="rocket-svg" />
                <div className="rocket-engine-exhaust" />
              </div>
            </div>

            {/* Launchpad Ground line */}
            <div className="launchpad-base" />
          </div>
        </div>

        {/* Right Side: Interactive Question Panel */}
        <div className="quiz-question-card-container">
          {!isOver && currentQ && (
            <div className="quiz-card-glass">
              {/* Question Top Meta */}
              <div className="quiz-meta-row">
                <span className="quiz-step-tag">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <div className={`quiz-timer-bubble ${timerSeconds <= 5 ? 'timer-urgent' : ''}`}>
                  <Clock size={15} />
                  <span>{timerSeconds}s</span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="quiz-question-title">{currentQ.question}</h2>

              {/* 4 Multiple Choice Options */}
              <div className="quiz-options-list">
                {currentQ.options.map((opt, i) => {
                  let btnStyle = 'quiz-opt-btn';
                  if (isAnswered) {
                    if (i === currentQ.correctIndex) {
                      btnStyle += ' opt-correct';
                    } else if (i === selectedOption) {
                      btnStyle += ' opt-incorrect';
                    } else {
                      btnStyle += ' opt-disabled';
                    }
                  }

                  return (
                    <button
                      key={i}
                      className={btnStyle}
                      onClick={() => handleSelectOption(i)}
                      disabled={isAnswered}
                    >
                      <span className="opt-letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="opt-text">{opt}</span>
                      {isAnswered && i === currentQ.correctIndex && (
                        <CheckCircle2 size={18} className="icon-state check" />
                      )}
                      {isAnswered && i === selectedOption && i !== currentQ.correctIndex && (
                        <XCircle size={18} className="icon-state cross" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation & Next Button */}
              {isAnswered && (
                <div className="quiz-feedback-box">
                  <div className="explanation-content">
                    <div className="exp-badge">
                      <Sparkles size={14} />
                      <span>BUDDY'S SCIENCE NOTE</span>
                    </div>
                    <p>{currentQ.explanation}</p>
                  </div>

                  <button
                    className="btn-quiz-next"
                    onClick={handleNextQuestion}
                  >
                    <span>
                      {currentIndex + 1 < questions.length ? 'NEXT QUESTION ➔' : 'SEE RESULTS 🚀'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Modal */}
          {isOver && resultData && (
            <GameResults
              title="Quiz Blast Rocket Mission"
              score={resultData.score}
              highScore={resultData.highScore}
              isNewHighScore={resultData.isNewHighScore}
              earnedXP={resultData.earnedXP}
              newAchievements={resultData.newAchievements}
              extraStats={resultData.extraStats}
              buddyComment={resultData.buddyComment}
              onPlayAgain={handleRestart}
              onExit={onExit}
            />
          )}
        </div>
      </div>
    </GameShell>
  );
}
