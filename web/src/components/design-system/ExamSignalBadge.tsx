import { SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import clsx from "clsx";
import { type ExamSignal } from "@/domain/topics/types";

interface ExamSignalBadgeProps {
  signal?: ExamSignal;
  className?: string;
}

const SIGNAL_META = {
  Strong: {
    Icon: SignalHigh,
    className: "border-[var(--clinical-green)]/20 bg-[var(--clinical-green-soft)] text-[var(--clinical-green)]",
  },
  Moderate: {
    Icon: SignalMedium,
    className: "border-[var(--clinical-amber)]/20 bg-[var(--clinical-amber-soft)] text-[var(--clinical-amber)]",
  },
  Emerging: {
    Icon: SignalLow,
    className: "border-[var(--clinical-blue)]/20 bg-[var(--clinical-blue-soft)] text-[var(--clinical-blue)]",
  },
} as const;

export function ExamSignalBadge({ signal, className }: ExamSignalBadgeProps) {
  if (!signal) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border border-[var(--clinical-line)] bg-[var(--clinical-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-ink-soft)]",
          className
        )}
      >
        No exam signal yet
      </span>
    );
  }

  const meta = SIGNAL_META[signal.patternStrength];
  const Icon = meta.Icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.className,
        className
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {signal.patternStrength} exam signal
    </span>
  );
}
