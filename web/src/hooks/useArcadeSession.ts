/**
 * useArcadeSession — Generic game session orchestrator
 * Manages phase transitions, session lifecycle, and stats persistence.
 * Games call start() → the hook handles splash/countdown/playing/results flow.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { type ArcadeGameId, type ArcadeSession } from '@/types/arcade';
import { updateGameStats } from '@/lib/arcade-storage';

export type ArcadePhase = 'splash' | 'countdown' | 'playing' | 'results';

interface UseArcadeSessionOptions {
  gameId: ArcadeGameId;
  totalQuestions: number;
  onStart?: () => void;
}

function generateSessionId(prefix: string): string {
  return prefix + '_' + Date.now().toString(36);
}

export function useArcadeSession({ gameId, totalQuestions, onStart }: UseArcadeSessionOptions) {
  const [phase, setPhase] = useState<ArcadePhase>('splash');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);

  const sessionIdRef = useRef('');
  const startTimeRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCountdownTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearCountdownTimers();
  }, [clearCountdownTimers]);

  const startCountdown = useCallback(() => {
    clearCountdownTimers();
    setPhase('countdown');
    setCountdownValue(3);
    let v = 3;

    countdownIntervalRef.current = setInterval(() => {
      v--;
      if (v <= 0) {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        setCountdownValue(0);
        countdownTimeoutRef.current = setTimeout(() => {
          setPhase('playing');
          startTimeRef.current = Date.now();
          onStart?.();
        }, 450);
      } else {
        setCountdownValue(v);
      }
    }, 800);
  }, [clearCountdownTimers, onStart]);

  const startGame = useCallback(() => {
    sessionIdRef.current = generateSessionId(gameId.substring(0, 2));
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    startCountdown();
  }, [gameId, startCountdown]);

  const endGame = useCallback(() => {
    const session: ArcadeSession = {
      id: sessionIdRef.current,
      gameId,
      score,
      correctCount,
      wrongCount,
      totalQuestions,
      accuracyPct: Math.round((correctCount / (correctCount + wrongCount || 1)) * 100),
      durationMs: Date.now() - startTimeRef.current,
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
    };
    setPhase('results');
    return session;
  }, [gameId, totalQuestions, score, correctCount, wrongCount]);

  const goToResults = useCallback(() => {
    setPhase('results');
  }, []);

  return {
    phase,
    score,
    correctCount,
    wrongCount,
    countdownValue,
    startGame,
    endGame,
    goToResults,
    setScore,
    setCorrectCount,
    setWrongCount,
  };
}
