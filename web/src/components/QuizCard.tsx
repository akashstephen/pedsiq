/**
 * QuizCard — Controlled MCQ interaction component
 *
 * All state is external (controlled). The parent orchestrator manages
 * selection, reveal, and reset between questions.
 */

'use client';

import { type McqQuestion } from '@/types/mcq';
import { Check, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface QuizCardProps {
  question: McqQuestion;
  /** 0-based selected option, or null if none */
  selectedOption: number | null;
  /** Has the answer been revealed? */
  isRevealed: boolean;
  /** Callback when user selects (but does not submit) an option */
  onSelect: (index: number) => void;
  /** Callback when user clicks Submit */
  onSubmit: () => void;
  /** Callback when user clicks Next (after reveal) */
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizCard({
  question,
  selectedOption,
  isRevealed,
  onSelect,
  onSubmit,
  onNext,
  questionNumber,
  totalQuestions,
}: QuizCardProps) {
  const handleSelect = (index: number) => {
    if (isRevealed) return;
    onSelect(index);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-sm font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 border border-white/[0.08]">
          {question.meta.subtopic.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Question Stem */}
      <div className="mb-6">
        <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = index === question.correctIndex;
          const showCorrect = isRevealed && isCorrectOption;
          const showIncorrect = isRevealed && isSelected && !isCorrectOption;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isRevealed}
              className={clsx(
                'w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 min-h-[56px]',
                'flex items-center gap-4',
                showCorrect
                  ? 'bg-[#34C759]/10 border-[#34C759]/40 text-white'
                  : showIncorrect
                  ? 'bg-[#FF3B30]/10 border-[#FF3B30]/40 text-white'
                  : isSelected
                  ? 'bg-[#007AFF]/10 border-[#007AFF]/40 text-white'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/80 hover:bg-white/[0.06] hover:border-white/15',
                isRevealed && !isSelected && !isCorrectOption && 'opacity-50'
              )}
              aria-pressed={isSelected}
              aria-label={`Option ${String.fromCharCode(65 + index)}`}
            >
              <span
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                  showCorrect
                    ? 'bg-[#34C759]/20 text-[#34C759]'
                    : showIncorrect
                    ? 'bg-[#FF3B30]/20 text-[#FF3B30]'
                    : isSelected
                    ? 'bg-[#007AFF]/20 text-[#007AFF]'
                    : 'bg-white/[0.06] text-white/50'
                )}
              >
                {showCorrect ? (
                  <Check size={16} />
                ) : showIncorrect ? (
                  <X size={16} />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className="text-[15px] leading-snug">
                {option.replace(/^[A-D]\.\s*/, '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-6">
        {!isRevealed ? (
          <button
            onClick={onSubmit}
            disabled={selectedOption === null}
            className={clsx(
              'w-full py-3.5 rounded-xl font-semibold text-base transition-all',
              selectedOption !== null
                ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90 active:scale-[0.98]'
                : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
            )}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-xl font-semibold text-base bg-[#007AFF] text-white hover:bg-[#007AFF]/90 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Next Question
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
