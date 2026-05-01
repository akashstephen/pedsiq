'use client';

import { useMemo } from 'react';
import { renderMermaidSVG } from 'beautiful-mermaid';

interface MermaidDiagramProps {
  code: string;
  title?: string;
}

export function MermaidDiagram({ code, title }: MermaidDiagramProps) {
  const svg = useMemo(() => {
    try {
      return renderMermaidSVG(code);
    } catch (e) {
      console.error('Mermaid render error:', e);
      return null;
    }
  }, [code]);

  if (!svg) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white/40 text-sm">
        Failed to render diagram
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 md:p-6 overflow-x-auto my-4">
      {title && (
        <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 text-center">
          {title}
        </div>
      )}
      <div 
        className="flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
