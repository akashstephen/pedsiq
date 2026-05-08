import { CheckCircle2, Stethoscope } from "lucide-react";

interface IllnessScriptCardProps {
  summary: string;
  objectives: string[];
}

export function IllnessScriptCard({ summary, objectives }: IllnessScriptCardProps) {
  return (
    <div className="rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--clinical-teal-soft)] text-[var(--clinical-teal)]">
          <Stethoscope size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--clinical-teal)]">Illness script</p>
          <h2 className="text-lg font-semibold text-[var(--clinical-ink)]">What to encode first</h2>
        </div>
      </div>
      <p className="text-sm leading-7 text-[var(--clinical-ink-soft)]">{summary}</p>
      <div className="mt-5 space-y-3">
        {objectives.map((objective) => (
          <div key={objective} className="flex gap-3 text-sm text-[var(--clinical-ink)]">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--clinical-green)]" aria-hidden="true" />
            <span>{objective}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
