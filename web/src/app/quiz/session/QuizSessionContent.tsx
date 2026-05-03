/**
 * QuizSessionContent — Inner component wrapped in Suspense
 *
 * Uses useQuizSession orchestrator for all state management.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mcqs from '@/data/mcqs.json';
import { type McqQuestion } from '@/types/mcq';
import { useQuizSession } from '@/hooks/useQuizSession';
import { QuizCard } from '@/components/QuizCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ArrowLeft, Pause } from 'lucide-react';
import Link from 'next/link';

export function QuizSessionContent() {
  const router = useRouter();
  const allQuestions = mcqs as McqQuestion[];

  const {
    session,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isRevealed,
    selectedOption,
    canSubmit,
    progress,
    selectOption,
    submitAnswer,
    rateConfidence,
    goToNext,
    pauseSession,
  } = useQuizSession(allQuestions);

  const handleSelect = useCallback(
    (index: number) => {
      if (!isRevealed) {
        selectOption(index);
      }
    },
    [isRevealed, selectOption]
  );

  const handleSubmit = useCallback(() => {
    if (selectedOption !== null && !isRevealed) {
      submitAnswer();
    }
  }, [selectedOption, isRevealed, submitAnswer]);

  const handleNext = useCallback(() => {
    const { completed } = goToNext();
    if (completed && session) {
      router.push(`/quiz/results/?session=${session.id}`);
    }
  }, [goToNext, session, router]);

  const handlePause = useCallback(() => {
    pauseSession();
  }, [pauseSession]);

  if (!session || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white/40 text-center">
          <div className="animate-pulse">Loading session...</div>
        </div>
      </div>
    );
  }

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
          selectedOption={selectedOption}
          isRevealed={isRevealed}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
        />
      </div>

      {/* Explanation Panel */}
      {isRevealed && selectedOption !== null && (
        <div className="mt-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 md:p-6">
          <ExplanationPanel
            question={currentQuestion}
            selectedIndex={selectedOption}
            onConfidenceRated={rateConfidence}
          />
        </div>
      )}
    </div>
  );
}
