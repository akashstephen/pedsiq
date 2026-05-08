import clsx from "clsx";

interface MasteryMeterProps {
  value?: number;
  label: string;
  attempts?: number;
  className?: string;
}

export function MasteryMeter({ value, label, attempts = 0, className }: MasteryMeterProps) {
  const hasEnoughData = typeof value === "number" && attempts >= 5;
  const displayValue = hasEnoughData ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--clinical-ink)]">{label}</span>
        <span className="text-xs font-semibold text-[var(--clinical-ink-soft)]">
          {hasEnoughData ? `${Math.round(displayValue)}%` : attempts > 0 ? `${attempts} attempts` : "Not started"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--clinical-surface-muted)]">
        <div
          className={clsx(
            "h-full rounded-full transition-[width]",
            hasEnoughData ? "bg-[var(--clinical-green)]" : "bg-[var(--clinical-amber)]"
          )}
          style={{ width: hasEnoughData ? `${displayValue}%` : attempts > 0 ? "28%" : "0%" }}
        />
      </div>
    </div>
  );
}

