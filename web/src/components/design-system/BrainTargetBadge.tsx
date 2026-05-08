import {
  Brain,
  Eye,
  GitBranch,
  MousePointer2,
  RotateCcw,
  Sparkles,
  Timer,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

export type BrainTarget =
  | "retrieval"
  | "generation"
  | "arousal"
  | "visuomotor"
  | "dual-coding"
  | "discrimination"
  | "sequencing"
  | "hypercorrection"
  | "consolidation";

const TARGET_META: Record<BrainTarget, { label: string; icon: LucideIcon }> = {
  retrieval: { label: "Retrieval", icon: RotateCcw },
  generation: { label: "Generation", icon: Sparkles },
  arousal: { label: "Arousal Encoding", icon: Timer },
  visuomotor: { label: "Visuomotor", icon: MousePointer2 },
  "dual-coding": { label: "Dual Coding", icon: Eye },
  discrimination: { label: "Discrimination", icon: GitBranch },
  sequencing: { label: "Sequencing", icon: Workflow },
  hypercorrection: { label: "Hypercorrection", icon: Brain },
  consolidation: { label: "Consolidation", icon: Brain },
};

interface BrainTargetBadgeProps {
  target: BrainTarget;
  className?: string;
}

export function BrainTargetBadge({ target, className }: BrainTargetBadgeProps) {
  const meta = TARGET_META[target];
  const Icon = meta.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--clinical-violet)]/20 bg-[var(--clinical-violet-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--clinical-violet)]",
        className
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

