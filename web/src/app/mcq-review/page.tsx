/**
 * MCQ Review Page — Browse all questions with explanations
 * Study mode: view all MCQs, filter by topic/difficulty, read explanations.
 */

'use client';

import { useState, useMemo } from 'react';
import mcqs from '@/data/mcqs.json';
import { type McqQuestion, type Topic, TOPIC_LABELS, DIFFICULTY_LABELS } from '@/types/mcq';
import { Search, Filter, BookOpen, Check, X } from 'lucide-react';
import clsx from 'clsx';

const allQuestions = mcqs as McqQuestion[];

export default function McqReviewPage() {
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allQuestions.filter((q) => {
      if (topicFilter !== 'all' && q.meta.topic !== topicFilter) return false;
      if (difficultyFilter !== 'all' && q.meta.difficulty !== difficultyFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        q.question.toLowerCase().includes(s) ||
        q.meta.subtopic.toLowerCase().includes(s) ||
        q.meta.tags.some((t) => t.toLowerCase().includes(s)) ||
        q.meta.nelsonRef.toLowerCase().includes(s)
      );
    });
  }, [search, topicFilter, difficultyFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">MCQ Review</h1>
        <p className="text-white/50">Browse all {allQuestions.length} questions with explanations</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="Search questions, topics, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as Topic | 'all')}
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#007AFF]/50"
          >
            <option value="all">All Topics</option>
            <option value="gastroenterology">Gastroenterology</option>
            <option value="nephrology">Nephrology</option>
            <option value="endocrinology">Endocrinology</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#007AFF]/50"
          >
            <option value="all">All Difficulties</option>
            <option value={1}>Easy</option>
            <option value={2}>Moderate</option>
            <option value={3}>Hard</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-white/40 text-sm">
        Showing {filtered.length} of {allQuestions.length} questions
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/15 transition-all"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50 uppercase tracking-wider">
                    {q.meta.topic}
                  </span>
                  <span
                    className={clsx(
                      'text-[11px] font-bold px-2 py-0.5 rounded-full',
                      q.meta.difficulty === 1
                        ? 'bg-[#34C759]/15 text-[#34C759]'
                        : q.meta.difficulty === 2
                        ? 'bg-[#FF9500]/15 text-[#FF9500]'
                        : 'bg-[#FF2D55]/15 text-[#FF2D55]'
                    )}
                  >
                    {DIFFICULTY_LABELS[q.meta.difficulty]}
                  </span>
                  <span className="text-[11px] text-white/30">{q.meta.subtopic.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-white/90 text-[15px] leading-relaxed">{q.question}</p>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                  {/* Options with correct highlighted */}
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm',
                          i === q.correctIndex
                            ? 'bg-[#34C759]/10 border border-[#34C759]/30 text-white'
                            : 'bg-white/[0.02] border border-white/[0.06] text-white/60'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0',
                            i === q.correctIndex
                              ? 'bg-[#34C759]/20 text-[#34C759]'
                              : 'bg-white/[0.06] text-white/40'
                          )}
                        >
                          {i === q.correctIndex ? <Check size={14} /> : String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="bg-white/[0.02] rounded-xl p-4 space-y-3">
                    <div>
                      <h4 className="text-[#34C759] font-semibold text-sm mb-1 flex items-center gap-2">
                        <Check size={14} /> Correct Answer
                      </h4>
                      <p className="text-white/70 text-sm leading-relaxed">{q.explanation.correct}</p>
                    </div>

                    <div>
                      <h4 className="text-[#FF9500] font-semibold text-sm mb-1 flex items-center gap-2">
                        <X size={14} /> Common Misconception
                      </h4>
                      <p className="text-white/60 text-sm leading-relaxed">{q.explanation.misconception}</p>
                    </div>

                    <div>
                      <h4 className="text-[#007AFF] font-semibold text-sm mb-1 flex items-center gap-2">
                        <BookOpen size={14} /> Key Takeaway
                      </h4>
                      <p className="text-white/60 text-sm leading-relaxed">{q.explanation.takeaway}</p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-white/30 text-xs">
                        Source: {q.meta.nelsonRef}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-white/40 py-12">
          No questions match your filters.
        </div>
      )}
    </div>
  );
}
