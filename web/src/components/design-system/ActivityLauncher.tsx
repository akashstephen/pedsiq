import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { BrainTargetBadge, type BrainTarget } from "./BrainTargetBadge";

interface ActivityLauncherProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  target: BrainTarget;
  meta?: string;
  className?: string;
}

export function ActivityLauncher({
  href,
  title,
  description,
  icon: Icon,
  target,
  meta,
  className,
}: ActivityLauncherProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "group flex h-full flex-col rounded-[var(--panel-radius)] border border-[var(--clinical-line)] bg-[var(--clinical-surface)] p-4 text-[var(--clinical-ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--clinical-teal)]/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clinical-teal)]/35",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--clinical-teal-soft)] text-[var(--clinical-teal)]">
          <Icon size={20} aria-hidden="true" />
        </div>
        <ArrowRight
          size={17}
          className="text-[var(--clinical-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--clinical-teal)]"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-[var(--clinical-ink-soft)]">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <BrainTargetBadge target={target} />
        {meta && <span className="text-xs font-medium text-[var(--clinical-ink-soft)]">{meta}</span>}
      </div>
    </Link>
  );
}

