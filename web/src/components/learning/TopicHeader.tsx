import Link from "next/link";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { BrainTargetBadge } from "@/components/design-system/BrainTargetBadge";
import { ExamSignalBadge } from "@/components/design-system/ExamSignalBadge";
import { type LearningTopic } from "@/domain/topics/types";

interface TopicHeaderProps {
  topic: LearningTopic;
  systemLabel: string;
}

export function TopicHeader({ topic, systemLabel }: TopicHeaderProps) {
  const firstTarget = topic.activities[0]?.brainTarget ?? "retrieval";

  return (
    <header className="space-y-6 pt-10">
      <Link
        href="/learn/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--clinical-teal)] hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Learn Atlas
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <BookOpenCheck size={14} className="text-[var(--clinical-teal)]" aria-hidden="true" />
              {systemLabel}
            </span>
            <ExamSignalBadge signal={topic.examSignal} />
            <BrainTargetBadge target={firstTarget} />
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
            {topic.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--clinical-ink-soft)]">
            {topic.summary}
          </p>
        </div>

        {topic.examSignal && (
          <div className="rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--clinical-teal)]">
              Exam signal
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <div className="text-2xl font-bold">{topic.examSignal.appearances}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Appearances</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{topic.examSignal.papersAnalyzed}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Papers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{topic.examSignal.lastAppeared}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Last seen</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--clinical-ink-soft)]">
              Historical frequency is shown for prioritization.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
