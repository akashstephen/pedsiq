/**
 * useDoseDuelEngine — Game state machine for Dose Duel
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type DoseDuelQuestion,
  type DoseDuelState,
  type ArcadeSession,
  type StudyListItem,
} from '@/types/arcade';
import { updateGameStats } from '@/lib/arcade-storage';

export const TIMER_SEC = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSessionId(): string {
  return 'dd_' + Date.now().toString(36);
}

export function useDoseDuelEngine(allQuestions: DoseDuelQuestion[]) {
  const [state, setState] = useState<DoseDuelState>({
    phase: 'splash',
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    timeoutCount: 0,
    missedQuestions: [],
    timeLeft: TIMER_SEC,
    timerActive: false,
    selectedOption: null,
    isRevealed: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== 'playing' || prev.isRevealed) return prev;
        const newTime = prev.timeLeft - 0.1;
        if (newTime <= 0) {
          const q = prev.questions[prev.currentIndex];
          return {
            ...prev,
            timeLeft: 0,
            timerActive: false,
            isRevealed: true,
            streak: 0,
            timeoutCount: prev.timeoutCount + 1,
            missedQuestions: [...prev.missedQuestions, q],
            selectedOption: null,
          };
        }
        return { ...prev, timeLeft: newTime };
      });
    }, 100);
  }, [clearTimer]);

  const startGame = useCallback(() => {
    clearPendingTimeout();
    clearTimer();
    const shuffled = shuffle(allQuestions);
    setState({
      phase: 'playing',
      questions: shuffled,
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      missedQuestions: [],
      timeLeft: TIMER_SEC,
      timerActive: true,
      selectedOption: null,
      isRevealed: false,
    });
    timeoutRef.current = setTimeout(() => startTimer(), 100);
  }, [allQuestions, startTimer, clearTimer, clearPendingTimeout]);

  const selectOption = useCallback((option: string) => {
    setState((prev) => {
      if (prev.phase !== 'playing' || prev.isRevealed) return prev;
      return { ...prev, selectedOption: option };
    });
  }, []);

  const submitAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing' || prev.isRevealed || !prev.selectedOption) return prev;
      clearTimer();
      const q = prev.questions[prev.currentIndex];
      const isCorrect = prev.selectedOption === q.correctAnswer;
      const timeBonus = Math.ceil(prev.timeLeft);
      const points = isCorrect ? 10 + timeBonus : 0;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      return {
        ...prev,
        score: prev.score + points,
        streak: newStreak,
        maxStreak: newMaxStreak,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        wrongCount: isCorrect ? prev.wrongCount : prev.wrongCount + 1,
        missedQuestions: isCorrect ? prev.missedQuestions : [...prev.missedQuestions, q],
        isRevealed: true,
        timerActive: false,
      };
    });
  }, [clearTimer]);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        const session: ArcadeSession = {
          id: generateSessionId(),
          gameId: 'dose-duel',
          score: prev.score,
          correctCount: prev.correctCount,
          wrongCount: prev.wrongCount,
          totalQuestions: prev.questions.length,
          accuracyPct: Math.round((prev.correctCount / prev.questions.length) * 100),
          durationMs: Date.now() - startTimeRef.current,
          startedAt: new Date(startTimeRef.current).toISOString(),
          completedAt: new Date().toISOString(),
        };

        const missed: StudyListItem[] = prev.missedQuestions.map((q) => ({
          questionId: q.id,
          gameId: 'dose-duel',
          text: `${q.drug} · ${q.patient.diagnosis}`,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          trap: q.trap,
          addedAt: new Date().toISOString(),
        }));

        updateGameStats('dose-duel', session, missed);

        return {
          ...prev,
          phase: 'results',
          timerActive: false,
        };
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        timeLeft: TIMER_SEC,
        timerActive: true,
        selectedOption: null,
        isRevealed: false,
      };
    });
    timeoutRef.current = setTimeout(() => startTimer(), 100);
  }, [startTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearPendingTimeout();
    };
  }, [clearTimer, clearPendingTimeout]);

  const currentQuestion = state.questions[state.currentIndex] ?? null;

  return {
    state,
    currentQuestion,
    startGame,
    selectOption,
    submitAnswer,
    nextQuestion,
  };
}
