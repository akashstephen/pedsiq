import clsx from "clsx";

interface LearningPanelProps {
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LearningPanel({
  title,
  eyebrow,
  action,
  children,
  className,
}: LearningPanelProps) {
  return (
    <section
      className={clsx(
        "rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] text-[var(--clinical-ink)] shadow-sm",
        className
      )}
    >
      {(title || eyebrow || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--clinical-line)] px-5 py-4">
          <div>
            {eyebrow && (
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--clinical-teal)]">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-lg font-semibold text-[var(--clinical-ink)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

