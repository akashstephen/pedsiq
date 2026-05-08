'use client';

import Link from 'next/link';
import { BookMarked, Check, Filter, RotateCcw, ShieldAlert } from 'lucide-react';
import { BrainTargetBadge } from '@/components/design-system/BrainTargetBadge';
import { LearningPanel } from '@/components/design-system/LearningPanel';
import { useReviewQueue, type ReviewFilter } from '@/hooks/useReviewQueue';

const filterOptions: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'arcade', label: 'Retrieval Lab' },
  { id: 'mcq', label: 'MCQ' },
  { id: 'traps', label: 'Traps' },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently added';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotebookPage() {
  const { visibleItems, summary, filter, setFilter, refresh, remove } = useReviewQueue();

  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <header className="grid gap-6 pt-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <BookMarked size={14} className="text-[var(--clinical-teal)]" aria-hidden="true" />
              Review Notebook
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
              Turn misses into a deliberate correction queue.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--clinical-ink-soft)]">
              Notebook gathers missed Retrieval Lab prompts and repeat-wrong MCQs into one place, with traps separated from ordinary recall gaps.
            </p>
          </div>

          <LearningPanel title="Queue pressure" eyebrow="Local data">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Total due</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.traps}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Trap items</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.arcade}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Lab misses</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.mcq}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">MCQ misses</div>
              </div>
            </div>
          </LearningPanel>
        </header>

        <div className="flex flex-col justify-between gap-3 rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-3 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--clinical-ink-soft)]">
            <Filter size={16} aria-hidden="true" />
            Review filter
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-teal)]/35 ${
                  filter === option.id
                    ? 'bg-[var(--clinical-teal)] text-white'
                    : 'bg-[var(--clinical-surface-muted)] text-[var(--clinical-ink-soft)] hover:text-[var(--clinical-ink)]'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--clinical-blue-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--clinical-blue)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-blue)]/35"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--clinical-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
                    {item.sourceLabel}
                  </span>
                  <span className="rounded-full bg-[var(--clinical-blue-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-blue)]">
                    {formatDate(item.addedAt)}
                  </span>
                  <BrainTargetBadge target={item.brainTarget} />
                </div>

                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--clinical-ink-soft)]">{item.prompt}</p>

                <div className="mt-4 rounded-lg border border-[var(--clinical-line)] bg-[var(--clinical-surface-muted)] p-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--clinical-teal)]">Correct answer</div>
                  <div className="mt-1 text-sm font-semibold">{item.answer}</div>
                  {item.explanation && (
                    <p className="mt-2 text-sm leading-6 text-[var(--clinical-ink-soft)]">{item.explanation}</p>
                  )}
                </div>

                {item.trap && (
                  <div className="mt-4 rounded-lg border border-[var(--clinical-coral)]/20 bg-[var(--clinical-coral-soft)] p-3">
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--clinical-coral)]">
                      <ShieldAlert size={15} aria-hidden="true" />
                      Trap to correct
                    </div>
                    <p className="text-sm leading-6 text-[var(--clinical-ink-soft)]">{item.trap}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {item.href && (
                    <Link
                      href={item.href}
                      className="rounded-full bg-[var(--clinical-teal)] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[var(--clinical-teal)]/90"
                    >
                      Practice
                    </Link>
                  )}
                  {item.source === 'arcade' && (
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--clinical-green-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--clinical-green)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-green)]/35"
                    >
                      <Check size={14} aria-hidden="true" />
                      Clear
                    </button>
                  )}
                  {item.attempts !== undefined && (
                    <span className="text-xs font-medium text-[var(--clinical-ink-soft)]">
                      {item.correctAttempts ?? 0}/{item.attempts} correct attempts
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <LearningPanel title="No review items yet" eyebrow="Empty state">
            <div className="max-w-2xl space-y-4 text-sm leading-7 text-[var(--clinical-ink-soft)]">
              <p>
                Missed Retrieval Lab prompts and repeat-wrong MCQs will appear here after practice. Start with a short retrieval session, then return when there is something worth correcting.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/arcade/" className="rounded-full bg-[var(--clinical-teal)] px-3 py-1.5 font-semibold text-white">
                  Retrieval Lab
                </Link>
                <Link href="/quiz/session/?mode=quick_10" className="rounded-full bg-[var(--clinical-blue-soft)] px-3 py-1.5 font-semibold text-[var(--clinical-blue)]">
                  Quick Retrieval
                </Link>
              </div>
            </div>
          </LearningPanel>
        )}
      </div>
    </div>
  );
}
