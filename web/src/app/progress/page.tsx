'use client';

import Link from 'next/link';
import { Activity, BarChart3, BookOpenCheck, Gauge, RotateCcw, ShieldAlert } from 'lucide-react';
import { LearningPanel } from '@/components/design-system/LearningPanel';
import { MasteryMeter } from '@/components/design-system/MasteryMeter';
import { CoverageState } from '@/components/learning/CoverageState';
import { getCoverageSummary } from '@/domain/progress/getCoverageSummary';

function formatPercent(value: number | null) {
  if (value === null) return '--';
  return `${Math.round(value * 100)}%`;
}

function formatDate(value?: string) {
  if (!value) return 'Not seen';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not seen';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ProgressPage() {
  const summary = getCoverageSummary();
  const topicRows = summary.topicRows.length > 0 ? summary.topicRows : [
    { topic: 'gastroenterology', attempts: 0, correct: 0, accuracy: null },
    { topic: 'nephrology', attempts: 0, correct: 0, accuracy: null },
    { topic: 'endocrinology', attempts: 0, correct: 0, accuracy: null },
  ];

  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <header className="grid gap-6 pt-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <BarChart3 size={14} className="text-[var(--clinical-teal)]" aria-hidden="true" />
              Progress
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
              Track effort, coverage, and correction pressure without overclaiming mastery.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--clinical-ink-soft)]">
              PedsIQ shows what has actually happened on this device: questions answered, topics touched, Retrieval Lab exposure, and items waiting for correction.
            </p>
          </div>

          <LearningPanel title="Learning signal" eyebrow="Measured locally">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold">{summary.mcqAnswered}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">MCQs answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatPercent(summary.mcqAccuracy)}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">MCQ accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.arcadeSessions}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Lab sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.reviewDue}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Review due</div>
              </div>
            </div>
          </LearningPanel>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <LearningPanel title="Topic coverage" eyebrow="Breadth">
            <MasteryMeter
              label="Tracked MCQ topics touched"
              attempts={summary.mcqAnswered}
              value={(summary.topicsTouched / summary.totalTrackedTopics) * 100}
            />
            <p className="mt-4 text-sm leading-7 text-[var(--clinical-ink-soft)]">
              This tracks broad MCQ systems for now. Canonical Learn Atlas mastery remains hidden until topic-level mapping is deeper.
            </p>
          </LearningPanel>

          <LearningPanel title="Retrieval exposure" eyebrow="Practice volume">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--clinical-violet-soft)] text-[var(--clinical-violet)]">
                <RotateCcw size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.arcadeQuestions}</div>
                <div className="text-sm text-[var(--clinical-ink-soft)]">Lab prompts attempted</div>
              </div>
            </div>
          </LearningPanel>

          <LearningPanel title="Correction pressure" eyebrow="Notebook">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--clinical-coral-soft)] text-[var(--clinical-coral)]">
                <ShieldAlert size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.trapItems}</div>
                <div className="text-sm text-[var(--clinical-ink-soft)]">Trap items waiting</div>
              </div>
            </div>
          </LearningPanel>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <LearningPanel
            title="Topic activity"
            eyebrow="MCQ systems"
            action={<Gauge size={18} className="text-[var(--clinical-teal)]" aria-hidden="true" />}
          >
            <div className="space-y-3">
              {topicRows.map((row) => (
                <div key={row.topic} className="rounded-lg border border-[var(--clinical-line)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold capitalize">{row.topic}</div>
                      <div className="mt-1 text-sm text-[var(--clinical-ink-soft)]">
                        {row.correct}/{row.attempts} correct · last seen {formatDate(row.lastSeen)}
                      </div>
                    </div>
                    <CoverageState attempts={row.attempts} />
                  </div>
                  <div className="mt-4">
                    <MasteryMeter
                      label="Accuracy signal"
                      attempts={row.attempts}
                      value={row.accuracy === null ? undefined : row.accuracy * 100}
                    />
                  </div>
                </div>
              ))}
            </div>
          </LearningPanel>

          <div className="space-y-5">
            <LearningPanel title="Recent strengthening" eyebrow="Last 7 days">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--clinical-green-soft)] text-[var(--clinical-green)]">
                  <Activity size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.recentSessions}</div>
                  <div className="text-sm text-[var(--clinical-ink-soft)]">Completed MCQ sessions this week</div>
                </div>
              </div>
            </LearningPanel>

            <LearningPanel title="Next actions" eyebrow="Keep it practical">
              <div className="space-y-3">
                <Link href="/notebook/" className="block rounded-lg border border-[var(--clinical-line)] p-3 font-semibold transition hover:border-[var(--clinical-teal)]/35 hover:bg-[var(--clinical-surface-muted)]">
                  Clear highest-pressure review items
                </Link>
                <Link href="/quiz/session/?mode=weak_topics" className="block rounded-lg border border-[var(--clinical-line)] p-3 font-semibold transition hover:border-[var(--clinical-teal)]/35 hover:bg-[var(--clinical-surface-muted)]">
                  Practice weak MCQ systems
                </Link>
                <Link href="/learn/" className="block rounded-lg border border-[var(--clinical-line)] p-3 font-semibold transition hover:border-[var(--clinical-teal)]/35 hover:bg-[var(--clinical-surface-muted)]">
                  Re-enter the Learn Atlas
                </Link>
              </div>
            </LearningPanel>

            <div className="rounded-[var(--panel-radius)] border border-[var(--clinical-amber)]/20 bg-[var(--clinical-amber-soft)] p-4 text-sm leading-7 text-[var(--clinical-ink-soft)]">
              <BookOpenCheck size={18} className="mb-2 text-[var(--clinical-amber)]" aria-hidden="true" />
              Numeric mastery is intentionally withheld. The current app can measure activity and accuracy, but it cannot yet prove durable, transferable pediatric competence.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
