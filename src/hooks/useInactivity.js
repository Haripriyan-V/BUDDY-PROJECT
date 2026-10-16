import { useEffect, useRef, useCallback } from 'react';
import { INACTIVITY_NUDGES } from '../services/fallbackResponses';

export function useInactivity({
  isActive,
  isSuspended,
  onNudge,
  timeoutSeconds = 10,
}) {
  const nudgeIndexRef = useRef(0);
  const timerRef = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isActive || isSuspended) return;

    timerRef.current = setTimeout(() => {
      if (!isActive || isSuspended) return;

      const nudge = INACTIVITY_NUDGES[nudgeIndexRef.current % INACTIVITY_NUDGES.length];
      nudgeIndexRef.current += 1;

      if (onNudge) {
        onNudge(nudge);
      }

      // Schedule next nudge slightly longer
      resetInactivityTimer();
    }, timeoutSeconds * 1000);
  }, [isActive, isSuspended, onNudge, timeoutSeconds]);

  useEffect(() => {
    if (!isActive || isSuspended) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    resetInactivityTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isSuspended, resetInactivityTimer]);

  const resetAll = useCallback(() => {
    nudgeIndexRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    recordActivity: resetInactivityTimer,
    resetInactivity: resetAll,
  };
}
