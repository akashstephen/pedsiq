import { CheckCircle2, Circle, Clock3 } from "lucide-react";

interface CoverageStateProps {
  attempts: number;
}

export function CoverageState({ attempts }: CoverageStateProps) {
  if (attempts >= 20) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--clinical-green-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-green)]">
        <CheckCircle2 size={12} aria-hidden="true" />
        Strengthening
      </span>
    );
  }

  if (attempts > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--clinical-amber-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-amber)]">
        <Clock3 size={12} aria-hidden="true" />
        In progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--clinical-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]">
      <Circle size={12} aria-hidden="true" />
      Not started
    </span>
  );
}
