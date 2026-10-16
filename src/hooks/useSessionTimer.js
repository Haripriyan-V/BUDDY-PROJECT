import { useState, useEffect, useRef, useCallback } from 'react';

const SESSION_DURATION = 180; // 3 minutes in seconds

export function useSessionTimer({ isActive, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const timerIdRef = useRef(null);
  const completedRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    completedRef.current = false;
    setTimeLeft(SESSION_DURATION);
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    // Starting or resuming session
    completedRef.current = false;
    startTimeRef.current = performance.now() - (pausedElapsedRef.current * 1000);

    const tick = () => {
      if (!startTimeRef.current || completedRef.current) return;

      const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, SESSION_DURATION - elapsedSec);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        completedRef.current = true;
        setTimeLeft(0);
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }
        if (onComplete) {
          onComplete();
        }
      }
    };

    timerIdRef.current = setInterval(tick, 250);
    tick();

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (startTimeRef.current) {
        pausedElapsedRef.current = (performance.now() - startTimeRef.current) / 1000;
      }
    };
  }, [isActive, onComplete]);

  // Urgency tiers
  const urgency = timeLeft <= 30 ? 'critical' : timeLeft <= 60 ? 'warning' : timeLeft <= 120 ? 'moderate' : 'normal';

  return {
    timeLeft,
    urgency,
    resetTimer,
  };
}
