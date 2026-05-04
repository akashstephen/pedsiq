/**
 * useDoseDuelEngine v2 — Refactored with proper cleanup and no stale closures
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { type DoseDuelQuestion } from '@/types/arcade';

export const TIMER_SEC = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useDoseDuelEngine(allQuestions: DoseDuelQuestion[]) {
  const [questions, setQuestions] = useState<DoseDuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeoutCount, setTimeoutCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<DoseDuelQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearTimer();
          setIsRevealed(true);
          setStreak(0);
          setTimeoutCount((t) => t + 1);
          setMissedQuestions((mq) => {
            const q = questions[currentIndex];
            return q && !mq.find((m) => m.id === q.id) ? [...mq, q] : mq;
          });
          setSelectedOption(null);
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer, questions, currentIndex]);

  const initGame = useCallback(() => {
    clearTimer();
    const shuffled = shuffle(allQuestions);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeoutCount(0);
    setMissedQuestions([]);
    setTimeLeft(TIMER_SEC);
    setSelectedOption(null);
    setIsRevealed(false);
    // Start timer after a brief delay to let UI render
    setTimeout(() => startTimer(), 100);
  }, [allQuestions, clearTimer, startTimer]);

  const selectOption = useCallback((option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  }, []);

  const submitAnswer = useCallback(() => {
    clearTimer();
    setIsRevealed(true);
    const q = questions[currentIndex];
    if (!q || !selectedOption) return;

    const isCorrect = selectedOption === q.correctAnswer;
    const timeBonus = Math.ceil(timeLeft);
    const points = isCorrect ? 10 + timeBonus : 0;

    if (isCorrect) {
      setScore((s) => s + points);
      setStreak((st) => {
        const nst = st + 1;
        setMaxStreak((m) => Math.max(m, nst));
        return nst;
      });
      setCorrectCount((c) => c + 1);
    } else {
      setStreak(0);
      setWrongCount((w) => w + 1);
      setMissedQuestions((mq) => (!mq.find((m) => m.id === q.id) ? [...mq, q] : mq));
    }
  }, [clearTimer, questions, currentIndex, selectedOption, timeLeft]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Game over - handled by caller
      return;
    }
    setCurrentIndex(nextIndex);
    setTimeLeft(TIMER_SEC);
    setSelectedOption(null);
    setIsRevealed(false);
    setTimeout(() => startTimer(), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const currentQuestion = questions[currentIndex] ?? null;

  return {
    questions,
    currentIndex,
    currentQuestion,
    score,
    streak,
    maxStreak,
    correctCount,
    wrongCount,
    timeoutCount,
    missedQuestions,
    timeLeft,
    selectedOption,
    isRevealed,
    initGame,
    selectOption,
    submitAnswer,
    nextQuestion,
  };
}
