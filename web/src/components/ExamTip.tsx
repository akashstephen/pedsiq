'use client';

import { AlertTriangle, Flame, Stethoscope } from 'lucide-react';

interface ExamTipProps {
  type: 'trap' | 'high-yield' | 'clinical-pearl';
  children: React.ReactNode;
}

export function ExamTip({ type, children }: ExamTipProps) {
  const styles = {
    trap: {
      border: 'border-[#FF3B30]/20',
      bg: 'bg-[#FF3B30]/8',
      icon: <AlertTriangle size={16} className="text-[#FF3B30] shrink-0" />,
      label: 'EXAMINER TRAP',
      labelColor: 'text-[#FF3B30]',
    },
    'high-yield': {
      border: 'border-[#FF9500]/20',
      bg: 'bg-[#FF9500]/8',
      icon: <Flame size={16} className="text-[#FF9500] shrink-0" />,
      label: 'HIGH YIELD',
      labelColor: 'text-[#FF9500]',
    },
    'clinical-pearl': {
      border: 'border-[#007AFF]/20',
      bg: 'bg-[#007AFF]/8',
      icon: <Stethoscope size={16} className="text-[#007AFF] shrink-0" />,
      label: 'CLINICAL PEARL',
      labelColor: 'text-[#007AFF]',
    },
  };

  const style = styles[type];

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-3.5 my-3`}>
      <div className="flex items-center gap-2 mb-2">
        {style.icon}
        <span className={`text-[10px] font-bold tracking-wider ${style.labelColor}`}>
          {style.label}
        </span>
      </div>
      <div className="text-white/85 text-sm leading-relaxed pl-6">
        {children}
      </div>
    </div>
  );
}
