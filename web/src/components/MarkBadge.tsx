'use client';

import { Award } from 'lucide-react';

interface MarkBadgeProps {
  marks: number;
  label?: string;
}

export function MarkBadge({ marks, label }: MarkBadgeProps) {
  const getColor = () => {
    if (marks >= 4) return 'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/20';
    if (marks >= 2) return 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/20';
    return 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/20';
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getColor()}`}>
      <Award size={10} />
      {marks}M{label ? ` ${label}` : ''}
    </span>
  );
}
