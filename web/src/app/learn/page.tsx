import Link from "next/link";
import { ArrowRight, BookOpenCheck, Layers3, Route, ShieldCheck } from "lucide-react";
import mcqs from "@/data/mcqs.json";
import { BrainTargetBadge } from "@/components/design-system/BrainTargetBadge";
import { ExamSignalBadge } from "@/components/design-system/ExamSignalBadge";
import { LearningPanel } from "@/components/design-system/LearningPanel";
import { McqCoverageBadge } from "@/components/learning/McqCoverageBadge";
import { getMcqLearningTopicCoverage } from "@/domain/topics/adapters";
import { getLearningTopicsBySystem, learningTopics } from "@/domain/topics/topic-map";
import { pediatricSystemLabels } from "@/domain/topics/system-labels";
import { type McqQuestion } from "@/types/mcq";

const systemGroups = getLearningTopicsBySystem();
const featuredTopics = learningTopics.slice(0, 6);
const mcqCoverage = new Map(
  getMcqLearningTopicCoverage(mcqs as McqQuestion[]).map((item) => [item.topic.id, item.questionCount])
);

export default function LearnAtlasPage() {
  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <header className="grid gap-6 pt-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <BookOpenCheck size={14} className="text-[var(--clinical-teal)]" aria-hidden="true" />
              Learn Atlas
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
              Pediatrics atlas
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--clinical-ink-soft)]">
              Browse mapped topics, linked practice, answer frameworks, and exam signals from one place.
            </p>
          </div>

          <LearningPanel title="Atlas status" eyebrow="Mapped content">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-2xl font-bold">{learningTopics.length}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Topics mapped</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(systemGroups).length}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Systems</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Array.from(mcqCoverage.values()).reduce((sum, count) => sum + count, 0)}</div>
                <div className="text-xs font-medium text-[var(--clinical-ink-soft)]">Mapped MCQs</div>
              </div>
            </div>
          </LearningPanel>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [Layers3, 'Topic map', 'Review core pediatric topics with consistent IDs and linked learning paths.'],
            [Route, 'Practice links', 'Move from a topic into MCQs, structured answers, or Retrieval Lab.'],
            [ShieldCheck, 'Exam context', 'Use historical signals as context for prioritization.'],
          ].map(([Icon, title, detail]) => {
            const IconComponent = Icon as typeof Layers3;
            return (
              <div key={title as string} className="rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-5 shadow-sm">
                <IconComponent size={20} className="mb-4 text-[var(--clinical-teal)]" aria-hidden="true" />
                <h2 className="font-semibold">{title as string}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--clinical-ink-soft)]">{detail as string}</p>
              </div>
            );
          })}
        </section>

        <LearningPanel title="Featured topics" eyebrow="High-yield">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/learn/${topic.id}/`}
                className="group flex h-full flex-col rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface-muted)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--clinical-teal)]/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-teal)]/35"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--clinical-teal)]">
                      {pediatricSystemLabels[topic.system]}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{topic.shortTitle}</h3>
                  </div>
                  <ArrowRight size={17} className="text-[var(--clinical-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--clinical-teal)]" aria-hidden="true" />
                </div>
                <p className="flex-1 text-sm leading-7 text-[var(--clinical-ink-soft)]">{topic.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ExamSignalBadge signal={topic.examSignal} />
                  <McqCoverageBadge questionCount={mcqCoverage.get(topic.id) ?? 0} />
                  {topic.activities[0] && <BrainTargetBadge target={topic.activities[0].brainTarget} />}
                </div>
              </Link>
            ))}
          </div>
        </LearningPanel>

        <section className="grid gap-5 lg:grid-cols-2">
          {Object.entries(systemGroups).map(([system, topics]) => (
            <LearningPanel
              key={system}
              title={pediatricSystemLabels[system as keyof typeof pediatricSystemLabels]}
              eyebrow={`${topics.length} topic${topics.length === 1 ? '' : 's'}`}
            >
              <div className="space-y-3">
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/learn/${topic.id}/`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[var(--clinical-line)] p-3 transition hover:border-[var(--clinical-teal)]/35 hover:bg-[var(--clinical-surface-muted)]"
                  >
                    <div>
                      <div className="font-semibold">{topic.title}</div>
                      <div className="mt-1 text-sm text-[var(--clinical-ink-soft)]">
                        {topic.activities.length} linked learning activities
                      </div>
                      <div className="mt-2">
                        <McqCoverageBadge questionCount={mcqCoverage.get(topic.id) ?? 0} />
                      </div>
                    </div>
                    <ArrowRight size={17} className="shrink-0 text-[var(--clinical-teal)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </LearningPanel>
          ))}
        </section>
      </div>
    </div>
  );
}
