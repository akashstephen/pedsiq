'use client';

import Link from 'next/link';
import mcqs from '@/data/mcqs.json';
import { ActivityLauncher } from '@/components/design-system/ActivityLauncher';
import { BrainTargetBadge } from '@/components/design-system/BrainTargetBadge';
import { LearningPanel } from '@/components/design-system/LearningPanel';
import { MasteryMeter } from '@/components/design-system/MasteryMeter';
import { getGameStats, getStudyList } from '@/lib/arcade-storage';
import { getOverallAccuracy, loadActiveSession, loadProfile } from '@/lib/storage';
import {
  BookOpen,
  Brain,
  ClipboardList,
  FlaskConical,
  Gamepad2,
  RotateCcw,
  ShieldAlert,
  Target,
  Zap,
} from 'lucide-react';

const totalMcqs = mcqs.length;

const dailyActivities = [
  {
    href: '/quiz/session/?mode=quick_10',
    title: 'Quick Retrieval',
    description: 'Ten focused MCQs to wake up active recall and expose weak concepts.',
    icon: Brain,
    target: 'retrieval' as const,
    meta: '~8 min',
  },
  {
    href: '/arcade/protocol-builder/',
    title: 'Protocol Builder',
    description: 'Rebuild a pediatric management algorithm from ordered clinical steps.',
    icon: FlaskConical,
    target: 'sequencing' as const,
    meta: '~6 min',
  },
  {
    href: '/arcade/trap-defuser/',
    title: 'Trap Defuser',
    description: 'Convert examiner traps and confident mistakes into durable corrections.',
    icon: ShieldAlert,
    target: 'hypercorrection' as const,
    meta: '~5 min',
  },
  {
    href: '/structured-answers/',
    title: 'Answer Studio',
    description: 'Review a structured long-answer skeleton before reading the model answer.',
    icon: ClipboardList,
    target: 'generation' as const,
    meta: 'print-ready',
  },
];

export default function TodayPage() {
  const profile = loadProfile();
  const activeSession = loadActiveSession();

  const games = [
    'dose-duel',
    'dose-sniper',
    'feature-wars',
    'protocol-builder',
    'trap-defuser',
  ] as const;
  const arcadeStats = games.map((gameId) => {
    const stats = getGameStats(gameId);
    return { gameId, ...stats };
  });
  const arcadeStudyList = getStudyList();
  const overallAccuracy = Math.round(getOverallAccuracy(profile) * 100);
  const completedArcadeSessions = arcadeStats.reduce((sum, stats) => sum + stats.totalSessions, 0);
  const bestArcadeScore = Math.max(0, ...arcadeStats.map((stats) => stats.highScore));

  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <header className="grid gap-6 pt-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <Zap size={14} className="text-[var(--clinical-teal)]" />
              Pediatrics Learning Engine
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
              Learn pediatrics through retrieval, reasoning, and memory science.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--clinical-ink-soft)]">
              Today combines MCQs, protocols, examiner traps, and answer building into a practical study loop:
              understand, retrieve, reason, correct, and consolidate.
            </p>
          </div>

          <LearningPanel title="Today at a glance" eyebrow="Local progress">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold">{profile.totalAnswered}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">MCQs answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.totalAnswered > 0 ? `${overallAccuracy}%` : '--'}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">MCQ accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{completedArcadeSessions}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Lab sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{arcadeStudyList.length}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Review items</div>
              </div>
            </div>
          </LearningPanel>
        </header>

        {activeSession?.status === 'active' && (
          <Link
            href="/quiz/session/"
            className="flex items-center justify-between rounded-[var(--panel-radius)] border border-[var(--clinical-teal)]/25 bg-[var(--clinical-teal-soft)] p-4 text-[var(--clinical-ink)] transition hover:border-[var(--clinical-teal)]/45"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[var(--clinical-teal)]">
                <RotateCcw size={18} />
              </div>
              <div>
                <div className="font-semibold">Resume active MCQ session</div>
                <div className="text-sm text-[var(--clinical-ink-soft)]">
                  Question {activeSession.currentIndex + 1} of {activeSession.questionIds.length}
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-[var(--clinical-teal)]">Continue</span>
          </Link>
        )}

        <section>
          <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold">Recommended study loop</h2>
              <p className="text-sm text-[var(--clinical-ink-soft)]">
                A first-pass plan using the learning modes that already exist.
              </p>
            </div>
            <BrainTargetBadge target="consolidation" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dailyActivities.map((activity) => (
              <ActivityLauncher key={activity.href} {...activity} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <LearningPanel title="Coverage snapshot" eyebrow="Honest progress">
            <div className="space-y-5">
              <MasteryMeter label="MCQ practice coverage" attempts={profile.totalAnswered} value={(profile.totalAnswered / totalMcqs) * 100} />
              <MasteryMeter label="Retrieval Lab exposure" attempts={completedArcadeSessions} value={Math.min(100, completedArcadeSessions * 10)} />
              <MasteryMeter label="Review queue activity" attempts={arcadeStudyList.length} />
              <p className="rounded-lg bg-[var(--clinical-amber-soft)] p-3 text-sm leading-relaxed text-[var(--clinical-ink-soft)]">
                Mastery scores stay hidden until there is enough activity data. For now, PedsIQ shows coverage,
                attempts, and review pressure instead of false precision.
              </p>
            </div>
          </LearningPanel>

          <LearningPanel
            title="Next best areas"
            eyebrow="Start with existing high-yield systems"
            action={
              <Link href="/quiz/" className="text-sm font-semibold text-[var(--clinical-teal)] hover:underline">
                Practice
              </Link>
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Nephrology', 'AGN, nephrotic syndrome, hematuria traps', Target],
                ['Gastroenterology', 'dehydration, hepatology, acute abdomen', BookOpen],
                ['Endocrinology', 'rickets, DKA, thyroid, puberty', Gamepad2],
              ].map(([title, detail, Icon]) => {
                const IconComponent = Icon as typeof Target;
                return (
                  <div key={title as string} className="rounded-lg border border-[var(--clinical-line)] bg-[var(--clinical-surface-muted)] p-4">
                    <IconComponent size={18} className="mb-3 text-[var(--clinical-teal)]" />
                    <div className="font-semibold">{title as string}</div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--clinical-ink-soft)]">{detail as string}</p>
                  </div>
                );
              })}
            </div>
          </LearningPanel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <LearningPanel title="Memory queue" eyebrow="Review pressure">
            {arcadeStudyList.length > 0 ? (
              <div className="space-y-3">
                {arcadeStudyList.slice(0, 4).map((item) => (
                  <div key={`${item.gameId}-${item.questionId}`} className="rounded-lg border border-[var(--clinical-line)] p-3">
                    <div className="text-sm font-semibold">{item.text}</div>
                    <div className="mt-1 text-xs text-[var(--clinical-ink-soft)]">{item.correctAnswer}</div>
                  </div>
                ))}
                <Link href="/notebook/" className="inline-flex text-sm font-semibold text-[var(--clinical-teal)] hover:underline">
                  Open notebook
                </Link>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--clinical-ink-soft)]">
                Missed arcade and practice items will appear here as review prompts. Play Trap Defuser or Dose Duel to start building the queue.
              </p>
            )}
          </LearningPanel>

          <LearningPanel title="Exam watch" eyebrow="Secondary signal">
            <div className="space-y-3 text-sm leading-relaxed text-[var(--clinical-ink-soft)]">
              <p>
                Historical KUHS patterns remain available, but they are no longer the center of the product.
                Use them to prioritize, not to predict.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/insights/" className="rounded-full bg-[var(--clinical-amber-soft)] px-3 py-1 font-semibold text-[var(--clinical-amber)]">
                  Pattern Insights
                </Link>
                <Link href="/questions/" className="rounded-full bg-[var(--clinical-blue-soft)] px-3 py-1 font-semibold text-[var(--clinical-blue)]">
                  PYQ Browser
                </Link>
                <Link href="/structured-answers/" className="rounded-full bg-[var(--clinical-green-soft)] px-3 py-1 font-semibold text-[var(--clinical-green)]">
                  Structured Answers
                </Link>
              </div>
              {bestArcadeScore > 0 && (
                <p className="text-xs font-medium text-[var(--clinical-ink-soft)]">
                  Best Retrieval Lab score: {bestArcadeScore.toLocaleString()}
                </p>
              )}
            </div>
          </LearningPanel>
        </div>
      </div>
    </div>
  );
}
