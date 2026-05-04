/**
 * useQuizSession — Modular Quiz Session Orchestrator
 *
 * Centralizes all session state, transitions, and side effects.
 * Guarantees single-response-per-question, correct index progression,
 * and clean completion handling.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { type McqQuestion, type QuizSession, type ConfidenceLevel } from '@/types/mcq';
import { createSession, recordResponse, isSessionComplete } from '@/lib/session';
import { saveActiveSession, clearActiveSession, loadActiveSession } from '@/lib/storage';
import { updatePerformance, updateSpacedRepetition, finalizeSession } from '@/lib/analytics';
// Note: updatePerformance is called only in rateConfidence to avoid double-counting

export interface UseQuizSessionReturn {
  /** Current session state (null while loading) */
  session: QuizSession | null;
  /** The question currently on screen */
  currentQuestion: McqQuestion | null;
  /** 0-based index of current question */
  currentIndex: number;
  /** Total questions in this session */
  totalQuestions: number;
  /** Has the user submitted an answer for the current question? */
  isRevealed: boolean;
  /** The option index the user selected (null if not yet chosen) */
  selectedOption: number | null;
  /** Confidence rating for the current question (null until rated) */
  confidence: ConfidenceLevel | null;
  /** Can the user submit? (true when an option is selected and not yet revealed) */
  canSubmit: boolean;
  /** Is the entire session finished? */
  isComplete: boolean;
  /** Progress percentage 0–100 */
  progress: number;
  /** Select an option (does not reveal). */
  selectOption: (index: number) => void;
  /** Submit the selected answer (reveals explanation). */
  submitAnswer: () => void;
  /** Rate confidence (after reveal). Idempotent. */
  rateConfidence: (level: ConfidenceLevel) => void;
  /** Advance to the next question. Idempotent for the current question. */
  goToNext: () => { completed: boolean };
  /** Mark session paused and persist */
  pauseSession: () => void;
}

export function useQuizSession(allQuestions: McqQuestion[]): UseQuizSessionReturn {
  const searchParams = useSearchParams();

  // ─── Core State ────────────────────────────────────────────────────────────
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<McqQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [startTime, setStartTime] = useState(0);

  // ─── Derived ───────────────────────────────────────────────────────────────
  const currentIndex = session?.currentIndex ?? 0;
  const totalQuestions = session?.questionIds.length ?? 0;
  const canSubmit = selectedOption !== null && !isRevealed;
  const isComplete = session ? isSessionComplete(session) : false;
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const findQuestion = useCallback(
    (id: string) => allQuestions.find((q) => q.id === id) ?? null,
    [allQuestions]
  );

  const persistSession = useCallback((s: QuizSession | null) => {
    if (s) saveActiveSession(s);
    else clearActiveSession();
  }, []);

  // ─── Initialization ────────────────────────────────────────────────────────
  useEffect(() => {
    const active = loadActiveSession();
    if (active && active.status === 'active') {
      setSession(active);
      setCurrentQuestion(findQuestion(active.questionIds[active.currentIndex]));
      setStartTime(Date.now());
      return;
    }

    const mode = (searchParams.get('mode') as QuizSession['mode']) || 'quick_10';
    const topicsParam = searchParams.get('topics');
    const topics = topicsParam
      ? (topicsParam.split(',') as McqQuestion['meta']['topic'][])
      : undefined;
    const countParam = searchParams.get('count');
    const questionCount = countParam ? parseInt(countParam, 10) : undefined;

    const newSession = createSession(allQuestions, { mode, topics, questionCount });
    setSession(newSession);
    persistSession(newSession);
    setCurrentQuestion(findQuestion(newSession.questionIds[0]));
    setStartTime(Date.now());
  }, [searchParams, allQuestions, findQuestion, persistSession]);

  // ─── Select Option (no reveal) ─────────────────────────────────────────────
  const selectOption = useCallback(
    (index: number) => {
      if (isRevealed || !session || !currentQuestion) return;
      setSelectedOption(index);
    },
    [isRevealed, session, currentQuestion]
  );

  // ─── Submit Answer (reveals) ───────────────────────────────────────────────
  const submitAnswer = useCallback(() => {
    if (isRevealed || !session || !currentQuestion || selectedOption === null) return;

    setIsRevealed(true);
  }, [isRevealed, session, currentQuestion, selectedOption]);

  // ─── Confidence Rating ─────────────────────────────────────────────────────
  const rateConfidence = useCallback(
    (level: ConfidenceLevel) => {
      if (!session || !currentQuestion || selectedOption === null || isRevealed === false) return;

      setConfidence(level);

      const correct = selectedOption === currentQuestion.correctIndex;
      updateSpacedRepetition(currentQuestion.id, correct, level);

      // Update performance with the FINAL confidence
      updatePerformance(currentQuestion, {
        questionId: currentQuestion.id,
        selectedIndex: selectedOption,
        correct,
        timeSpentMs: Date.now() - startTime,
        confidence: level,
      });
    },
    [session, currentQuestion, selectedOption, isRevealed, startTime]
  );

  // ─── Next Question / Completion ────────────────────────────────────────────
  const goToNext = useCallback((): { completed: boolean } => {
    if (!session || !currentQuestion || selectedOption === null) {
      return { completed: false };
    }

    // Guard: only record once per question
    const alreadyRecorded = session.responses.some(
      (r) => r.questionId === currentQuestion.id
    );

    let workingSession = session;

    if (!alreadyRecorded) {
      const timeSpent = Date.now() - startTime;
      const correct = selectedOption === currentQuestion.correctIndex;

      workingSession = recordResponse(session, {
        questionId: currentQuestion.id,
        selectedIndex: selectedOption,
        correct,
        timeSpentMs: timeSpent,
        confidence: confidence ?? 'unsure',
      });
    }

    // Check completion AFTER recording
    if (isSessionComplete(workingSession)) {
      setSession(workingSession);
      persistSession(null);
      // Save session summary to user profile
      const correctCount = workingSession.responses.filter((r) => r.correct).length;
      finalizeSession(workingSession.id, correctCount, workingSession.responses.length);
      return { completed: true };
    }

    // Advance to next question
    const nextQ = findQuestion(workingSession.questionIds[workingSession.currentIndex]);

    setSession(workingSession);
    persistSession(workingSession);
    setCurrentQuestion(nextQ);
    setSelectedOption(null);
    setIsRevealed(false);
    setConfidence(null);
    setStartTime(Date.now());

    return { completed: false };
  }, [session, currentQuestion, selectedOption, startTime, confidence, findQuestion, persistSession]);

  // ─── Pause ─────────────────────────────────────────────────────────────────
  const pauseSession = useCallback(() => {
    if (session) {
      persistSession({ ...session, status: 'paused' });
    }
  }, [session, persistSession]);

  return {
    session,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isRevealed,
    selectedOption,
    confidence,
    canSubmit,
    isComplete,
    progress,
    selectOption,
    submitAnswer,
    rateConfidence,
    goToNext,
    pauseSession,
  };
}
