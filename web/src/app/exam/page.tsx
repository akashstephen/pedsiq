import Link from "next/link";
import { Activity, ArrowRight, BarChart3, BookOpen, FileText, Flame, Layers3 } from "lucide-react";
import { LearningPanel } from "@/components/design-system/LearningPanel";

const examTools = [
  {
    href: "/exam/overview/",
    title: "Exam Overview",
    description: "Historical paper volume, marks, sections, and subject distribution.",
    icon: BarChart3,
  },
  {
    href: "/questions/",
    title: "PYQ Browser",
    description: "Browse the underlying KUHS pediatrics question archive.",
    icon: FileText,
  },
  {
    href: "/nelson/",
    title: "Nelson Analysis",
    description: "Map exam questions against Nelson sections and chapters.",
    icon: BookOpen,
  },
  {
    href: "/subjects/",
    title: "Subject Trends",
    description: "Compare topic and subject weight across the historical set.",
    icon: Layers3,
  },
  {
    href: "/insights/",
    title: "Pattern Insights",
    description: "Review strong, moderate, and emerging historical exam signals.",
    icon: Activity,
  },
  {
    href: "/structured-answers/",
    title: "Answer Studio",
    description: "Use structured answer sheets for generation and exam-writing practice.",
    icon: Flame,
  },
];

export default function ExamModePage() {
  return (
    <div className="-mx-4 -mt-16 min-h-screen bg-[var(--clinical-bg)] px-4 py-8 text-[var(--clinical-ink)] md:-mx-8 md:-mt-8 md:px-8">
      <div className="mx-auto max-w-[var(--content-max)] space-y-8">
        <header className="grid gap-6 pt-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface)] px-3 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
              <BarChart3 size={14} className="text-[var(--clinical-teal)]" aria-hidden="true" />
              Exam Mode
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--clinical-ink)] md:text-5xl">
              Historical exam intelligence, kept secondary to learning.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--clinical-ink-soft)]">
              KUHS patterns are still useful for prioritization, but they should support the learning engine rather than define the product.
            </p>
          </div>

          <LearningPanel title="Use this mode for" eyebrow="Secondary signal">
            <div className="space-y-3 text-sm leading-7 text-[var(--clinical-ink-soft)]">
              <p>Prioritize revision, inspect historical coverage, and practice answer structure.</p>
              <p>Do not treat paper frequency as a prediction model.</p>
            </div>
          </LearningPanel>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {examTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex h-full flex-col rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-5 text-[var(--clinical-ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--clinical-teal)]/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-teal)]/35"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--clinical-teal-soft)] text-[var(--clinical-teal)]">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-[var(--clinical-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--clinical-teal)]"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-lg font-semibold">{tool.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-7 text-[var(--clinical-ink-soft)]">{tool.description}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
