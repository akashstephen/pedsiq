/**
 * ExplanationPanel — Post-answer learning component
 * Shows correct answer, explanations, misconceptions, and confidence rating.
 */

'use client';

import { useState } from 'react';
import { type McqQuestion, type ConfidenceLevel } from '@/types/mcq';
import { Check, X, Lightbulb, AlertTriangle, BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface ExplanationPanelProps {
  question: McqQuestion;
  selectedIndex: number;
  onConfidenceRated?: (confidence: ConfidenceLevel) => void;
}

export function ExplanationPanel({
  question,
  selectedIndex,
  onConfidenceRated,
}: ExplanationPanelProps) {
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [expandedOption, setExpandedOption] = useState<number | null>(null);

  const isCorrect = selectedIndex === question.correctIndex;

  const handleConfidence = (level: ConfidenceLevel) => {
    setConfidence(level);
    onConfidenceRated?.(level);
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
      {/* Result Banner */}
      <div
        className={clsx(
          'rounded-xl p-4 border flex items-start gap-3',
          isCorrect
            ? 'bg-[#34C759]/10 border-[#34C759]/30'
            : 'bg-[#FF3B30]/10 border-[#FF3B30]/30'
        )}
      >
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
            isCorrect ? 'bg-[#34C759]/20' : 'bg-[#FF3B30]/20'
          )}
        >
          {isCorrect ? (
            <Check size={18} className="text-[#34C759]" />
          ) : (
            <X size={18} className="text-[#FF3B30]" />
          )}
        </div>
        <div>
          <p className={clsx('font-semibold', isCorrect ? 'text-[#34C759]' : 'text-[#FF3B30]')}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-white/60 text-sm mt-0.5">
            {isCorrect
              ? 'Great job! Review the explanation to reinforce your understanding.'
              : `The correct answer is ${String.fromCharCode(65 + question.correctIndex)}. Read the explanation carefully.`}
          </p>
        </div>
      </div>

      {/* Correct Answer Explanation */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} className="text-[#34C759]" />
          <h3 className="text-white font-semibold text-sm">Why {String.fromCharCode(65 + question.correctIndex)} is Correct</h3>
        </div>
        <p className="text-white/75 text-[15px] leading-relaxed">
          {question.explanation.correct}
        </p>
      </div>

      {/* Distractor Explanations (Accordion) */}
      <div className="space-y-2">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <X size={16} className="text-[#FF3B30]" />
          Why Other Options Are Wrong
        </h3>
        {question.options.map((option, index) => {
          if (index === question.correctIndex) return null;
          const isExpanded = expandedOption === index;
          return (
            <div
              key={index}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedOption(isExpanded ? null : index)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-white/80 text-sm font-medium">
                  {option}
                </span>
                <ChevronDown
                  size={16}
                  className={clsx(
                    'text-white/40 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
              {isExpanded && (
                <div className="px-5 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/[0.06] pt-3">
                  {question.explanation.distractors[index]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Misconception */}
      <div className="bg-[#FF9500]/8 border border-[#FF9500]/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#FF9500] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[#FF9500] font-semibold text-sm mb-1">Common Misconception</h3>
          <p className="text-white/70 text-sm leading-relaxed">{question.explanation.misconception}</p>
        </div>
      </div>

      {/* Takeaway */}
      <div className="bg-[#007AFF]/8 border border-[#007AFF]/20 rounded-xl p-4 flex items-start gap-3">
        <Lightbulb size={18} className="text-[#007AFF] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[#007AFF] font-semibold text-sm mb-1">Key Takeaway</h3>
          <p className="text-white/70 text-sm leading-relaxed">{question.explanation.takeaway}</p>
        </div>
      </div>

      {/* Related Topic Link */}
      {question.explanation.relatedTopic && (
        <Link
          href={`/structured-answers/?topic=${question.explanation.relatedTopic}`}
          className="flex items-center gap-2 text-[#007AFF] text-sm font-medium hover:underline px-1"
        >
          <BookOpen size={16} />
          Read full structured answer on this topic
        </Link>
      )}

      {/* Confidence Rating */}
      <div className="border-t border-white/[0.08] pt-5">
        <p className="text-white/50 text-sm mb-3">How confident were you in your answer?</p>
        <div className="flex gap-2">
          {(['sure', 'unsure', 'guess'] as ConfidenceLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleConfidence(level)}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border',
                confidence === level
                  ? 'bg-[#007AFF]/15 border-[#007AFF]/30 text-white'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
              )}
            >
              {level === 'sure' ? 'Sure' : level === 'unsure' ? 'Unsure' : 'Guess'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
