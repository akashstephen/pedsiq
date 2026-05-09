import { Brain } from "lucide-react";

interface McqCoverageBadgeProps {
  questionCount: number;
}

export function McqCoverageBadge({ questionCount }: McqCoverageBadgeProps) {
  if (questionCount <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--clinical-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
        No mapped MCQs
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--clinical-blue-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-blue)]">
      <Brain size={12} aria-hidden="true" />
      {questionCount} mapped MCQs
    </span>
  );
}
