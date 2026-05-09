import Link from "next/link";
import { notFound } from "next/navigation";
import mcqs from "@/data/mcqs.json";
import { ArrowRight, GitBranch, ListChecks, Route } from "lucide-react";
import { BrainTargetBadge } from "@/components/design-system/BrainTargetBadge";
import { LearningPanel } from "@/components/design-system/LearningPanel";
import { IllnessScriptCard } from "@/components/learning/IllnessScriptCard";
import { McqCoverageBadge } from "@/components/learning/McqCoverageBadge";
import { TopicHeader } from "@/components/learning/TopicHeader";
import { TrapCallout } from "@/components/learning/TrapCallout";
import { getMcqLearningTopicCoverage } from "@/domain/topics/adapters";
import { learningTopicById, learningTopics } from "@/domain/topics/topic-map";
import { pediatricSystemLabels } from "@/domain/topics/system-labels";
import { type McqQuestion } from "@/types/mcq";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return learningTopics.map((topic) => ({ topic: topic.id }));
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { topic: topicId } = await params;
  const topic = learningTopicById[topicId];

  if (!topic) {
    return {
      title: 'Topic Not Found | PedsIQ',
    };
  }

  return {
    title: `${topic.title} | PedsIQ Learn Atlas`,
    description: topic.summary,
  };
}

export default async function LearnTopicPage({ params }: TopicPageProps) {
  const { topic: topicId } = await params;
  const topic = learningTopicById[topicId];

  if (!topic) {
    notFound();
  }

  const relatedTopics = topic.relatedTopicIds
    .map((id) => learningTopicById[id])
    .filter(Boolean);
  const mcqCoverage = new Map(
    getMcqLearningTopicCoverage(mcqs as McqQuestion[]).map((item) => [item.topic.id, item.questionCount])
  );
  const mappedMcqCount = mcqCoverage.get(topic.id) ?? 0;
  const mcqActivity = topic.activities.find((activity) => activity.type === 'mcq');

  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <TopicHeader topic={topic} systemLabel={pediatricSystemLabels[topic.system]} />

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <IllnessScriptCard summary={topic.summary} objectives={topic.learningObjectives} />

          <LearningPanel
            title="Learning activities"
            eyebrow="Existing routes"
            action={<Route size={18} className="text-[var(--clinical-teal)]" aria-hidden="true" />}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <McqCoverageBadge questionCount={mappedMcqCount} />
              {mappedMcqCount > 0 && mcqActivity && (
                <Link
                  href={mcqActivity.href}
                  className="rounded-full bg-[var(--clinical-blue-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-blue)] transition hover:bg-white"
                >
                  Start mapped system drill
                </Link>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {topic.activities.map((activity) => (
                <Link
                  key={`${activity.type}-${activity.href}`}
                  href={activity.href}
                  className="group rounded-lg border border-[var(--clinical-line)] bg-[var(--clinical-surface-muted)] p-4 transition hover:border-[var(--clinical-teal)]/35 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-teal)]/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--clinical-ink-soft)]">
                        {activity.type.replaceAll('-', ' ')}
                      </div>
                      <div className="mt-1 font-semibold">{activity.label}</div>
                    </div>
                    <ArrowRight size={16} className="text-[var(--clinical-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--clinical-teal)]" aria-hidden="true" />
                  </div>
                  <div className="mt-4">
                    <BrainTargetBadge target={activity.brainTarget} />
                  </div>
                </Link>
              ))}
            </div>
          </LearningPanel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <LearningPanel
            title="Reasoning checklist"
            eyebrow="Before you drill"
            action={<ListChecks size={18} className="text-[var(--clinical-teal)]" aria-hidden="true" />}
          >
            <div className="space-y-3">
              {topic.learningObjectives.map((objective, index) => (
                <div key={objective} className="flex gap-3 rounded-lg border border-[var(--clinical-line)] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--clinical-teal-soft)] text-sm font-bold text-[var(--clinical-teal)]">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm font-medium">{objective}</span>
                </div>
              ))}
            </div>
          </LearningPanel>

          <LearningPanel
            title="Related topics"
            eyebrow="Build discrimination"
            action={<GitBranch size={18} className="text-[var(--clinical-teal)]" aria-hidden="true" />}
          >
            {relatedTopics.length > 0 ? (
              <div className="space-y-3">
                {relatedTopics.map((related) => (
                  <Link
                    key={related.id}
                    href={`/learn/${related.id}/`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[var(--clinical-line)] p-3 transition hover:border-[var(--clinical-teal)]/35 hover:bg-[var(--clinical-surface-muted)]"
                  >
                    <div>
                      <div className="font-semibold">{related.shortTitle}</div>
                      <div className="mt-1 text-sm text-[var(--clinical-ink-soft)]">
                        {pediatricSystemLabels[related.system]}
                      </div>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-[var(--clinical-teal)]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--clinical-ink-soft)]">
                Related topics will appear after this part of the atlas is governed.
              </p>
            )}
          </LearningPanel>
        </div>

        <TrapCallout>
          Use this page as the starting route for the topic: encode the clinical script, retrieve the key facts,
          compare related diagnoses, then correct traps through practice.
        </TrapCallout>
      </div>
    </div>
  );
}
