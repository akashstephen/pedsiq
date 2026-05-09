import { ShieldAlert } from "lucide-react";

interface TrapCalloutProps {
  children: React.ReactNode;
}

export function TrapCallout({ children }: TrapCalloutProps) {
  return (
    <div className="rounded-[var(--panel-radius)] border border-[var(--clinical-coral)]/20 bg-[var(--clinical-coral-soft)] p-4 text-[var(--clinical-ink)]">
      <div className="mb-2 flex items-center gap-2 font-semibold text-[var(--clinical-coral)]">
        <ShieldAlert size={17} aria-hidden="true" />
        Exam traps
      </div>
      <div className="text-sm leading-7 text-[var(--clinical-ink-soft)]">{children}</div>
    </div>
  );
}
