'use client';

interface FlowchartNode {
  id: string;
  label: string;
  type?: 'default' | 'decision' | 'start' | 'end';
}

interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowchartProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export function Flowchart({ nodes, edges }: FlowchartProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Compute levels (topological layering)
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function setLevel(id: string, level: number) {
    if (visited.has(id)) return;
    visited.add(id);
    const current = levels.get(id) ?? 0;
    levels.set(id, Math.max(current, level));
    edges
      .filter((e) => e.from === id)
      .forEach((e) => setLevel(e.to, level + 1));
  }

  const incoming = new Set(edges.map((e) => e.to));
  const hasOutgoing = new Set(edges.map((e) => e.from));
  const roots = nodes.filter((n) => !incoming.has(n.id));
  roots.forEach((r) => setLevel(r.id, 0));

  // Handle orphan nodes (no incoming AND no outgoing edges)
  const orphans = nodes.filter((n) => !incoming.has(n.id) && !hasOutgoing.has(n.id));
  orphans.forEach((o) => {
    if (!levels.has(o.id)) levels.set(o.id, 0);
  });

  // Group by level
  const rows = new Map<number, string[]>();
  levels.forEach((lvl, id) => {
    if (!rows.has(lvl)) rows.set(lvl, []);
    rows.get(lvl)!.push(id);
  });

  const maxLevel = Math.max(0, ...Array.from(levels.values()));

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 overflow-x-auto">
      <div className="min-w-[300px] flex flex-col items-center gap-3">
        {Array.from({ length: maxLevel + 1 }, (_, lvl) => {
          const rowNodes = rows.get(lvl) ?? [];
          const isLast = lvl === maxLevel;
          return (
            <div key={lvl} className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-wrap justify-center gap-3 w-full">
                {rowNodes.map((id) => {
                  const node = nodeMap.get(id)!;
                  const isDecision = node.type === 'decision';
                  const outgoing = edges.filter((e) => e.from === id);
                  return (
                    <div key={id} className="flex flex-col items-center">
                      <div
                        className={`px-4 py-2.5 text-sm font-medium text-center min-w-[140px] max-w-[260px] rounded-xl border ${
                          isDecision
                            ? 'bg-white/[0.08] border-[#FF9500]/40 text-[#FF9500]'
                            : node.type === 'start'
                            ? 'bg-[#007AFF]/15 border-[#007AFF]/30 text-[#007AFF]'
                            : node.type === 'end'
                            ? 'bg-[#34C759]/15 border-[#34C759]/30 text-[#34C759]'
                            : 'bg-white/[0.06] border-white/[0.12] text-white/90'
                        }`}
                      >
                        {node.label}
                      </div>
                      {outgoing.length > 0 && outgoing.some((e) => e.label) && (
                        <div className="flex gap-2 mt-1 flex-wrap justify-center">
                          {outgoing.map((e, i) =>
                            e.label ? (
                              <span key={i} className="text-[10px] text-white/40 px-1.5">
                                {e.label}
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!isLast && (
                <div className="flex flex-col items-center">
                  <div className="w-px h-5 bg-white/15" />
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
