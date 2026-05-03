/**
 * QuizSessionContent — Inner component wrapped in Suspense
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import mcqs from '@/data/mcqs.json';
import { type McqQuestion, type QuizSession, type QuizResponse, type ConfidenceLevel } from '@/types/mcq';
import { createSession, recordResponse, isSessionComplete } from '@/lib/session';
import { saveActiveSession, clearActiveSession, loadActiveSession } from '@/lib/storage';
import { updatePerformance, updateSpacedRepetition } from '@/lib/analytics';
import { QuizCard } from '@/components/QuizCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ArrowLeft, Pause } from 'lucide-react';
import Link from 'next/link';

export function QuizSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<McqQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);

  const allQuestions = useMemo(() => mcqs as McqQuestion[], []);

  useEffect(() => {
    const active = loadActiveSession();
    if (active && active.status === 'active') {
      setSession(active);
      const q = allQuestions.find((q) => q.id === active.questionIds[active.currentIndex]);
      if (q) setCurrentQuestion(q);
      setStartTime(Date.now());
      return;
    }

    const mode = (searchParams.get('mode') as QuizSession['mode']) || 'quick_10';
    const topicsParam = searchParams.get('topics');
    const topics = topicsParam ? topicsParam.split(',') as McqQuestion['meta']['topic'][] : undefined;
    const countParam = searchParams.get('count');
    const questionCount = countParam ? parseInt(countParam, 10) : undefined;

    const newSession = createSession(allQuestions, {
      mode,
      topics,
      questionCount,
    });

    setSession(newSession);
    saveActiveSession(newSession);
    const q = allQuestions.find((q) => q.id === newSession.questionIds[0]);
    if (q) setCurrentQuestion(q);
    setStartTime(Date.now());
  }, [searchParams, allQuestions]);

  const handleAnswer = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setRevealed(true);

      if (!session || !currentQuestion) return;

      const timeSpent = Date.now() - startTime;
      const correct = index === currentQuestion.correctIndex;

      updatePerformance(currentQuestion, {
        questionId: currentQuestion.id,
        selectedIndex: index,
        correct,
        timeSpentMs: timeSpent,
        confidence: 'unsure',
      });
    },
    [session, currentQuestion, startTime]
  );

  const handleConfidenceRated = useCallback(
    (conf: ConfidenceLevel) => {
      setConfidence(conf);
      if (!session || !currentQuestion || selectedIndex === null) return;

      const correct = selectedIndex === currentQuestion.correctIndex;

      updateSpacedRepetition(currentQuestion.id, correct, conf);

      const updatedSession = recordResponse(session, {
        questionId: currentQuestion.id,
        selectedIndex,
        correct,
        timeSpentMs: Date.now() - startTime,
        confidence: conf,
      });

      setSession(updatedSession);
      saveActiveSession(updatedSession);
    },
    [session, currentQuestion, selectedIndex, startTime]
  );

  const handleNext = useCallback(() => {
    if (!session) return;

    if (isSessionComplete({ ...session, currentIndex: session.currentIndex + 1 })) {
      const completedSession = { ...session, status: 'completed' as const, completedAt: new Date().toISOString() };
      saveActiveSession(null);
      router.push(`/quiz/results/?session=${session.id}`);
      return;
    }

    const nextIndex = session.currentIndex + 1;
    const nextQ = allQuestions.find((q) => q.id === session.questionIds[nextIndex]);

    setCurrentQuestion(nextQ || null);
    setSelectedIndex(null);
    setRevealed(false);
    setConfidence(null);
    setStartTime(Date.now());
  }, [session, allQuestions, router]);

  const handlePause = useCallback(() => {
    if (session) {
      saveActiveSession({ ...session, status: 'paused' });
      router.push('/quiz/');
    }
  }, [session, router]);

  if (!session || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white/40 text-center">
          <div className="animate-pulse">Loading session...</div>
        </div>
      </div>
    );
  }

  const progress = ((session.currentIndex) / session.questionIds.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/quiz/"
          onClick={handlePause}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Exit
        </Link>
        <button
          onClick={handlePause}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <Pause size={16} />
          Pause
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#007AFF] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 md:p-6">
        <QuizCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          onNext={handleNext}
          questionNumber={session.currentIndex + 1}
          totalQuestions={session.questionIds.length}
        />
      </div>

      {/* Explanation Panel */}
      {revealed && selectedIndex !== null && (
        <div className="mt-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 md:p-6">
          <ExplanationPanel
            question={currentQuestion}
            selectedIndex={selectedIndex}
            onConfidenceRated={handleConfidenceRated}
          />
        </div>
      )}
    </div>
  );
}
