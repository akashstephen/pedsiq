'use client';

import { useRef, useEffect, useState } from 'react';

interface FlowchartNode {
  id: string;
  label: string;
  type?: 'default' | 'decision' | 'start' | 'end' | 'process';
  subLabel?: string;
}

interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowchartProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  title?: string;
}

export function Flowchart({ nodes, edges, title }: FlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    nodes.forEach((node) => {
      const el = document.getElementById(`flow-node-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();
        positions.set(node.id, {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        });
      }
    });
    setNodePositions(positions);
  }, [nodes]);

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
  const roots = nodes.filter((n) => !incoming.has(n.id));
  roots.forEach((r) => setLevel(r.id, 0));

  // Handle orphans
  const hasOutgoing = new Set(edges.map((e) => e.from));
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
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Generate SVG paths for edges
  const getPathD = (fromId: string, toId: string): string => {
    const from = nodePositions.get(fromId);
    const to = nodePositions.get(toId);
    if (!from || !to) return '';
    
    const startY = from.y + from.height / 2;
    const endY = to.y - to.height / 2;
    const midY = (startY + endY) / 2;
    
    return `M ${from.x} ${startY} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${endY}`;
  };

  const getNodeStyle = (type?: string) => {
    switch (type) {
      case 'start':
        return 'bg-[#007AFF]/15 border-[#007AFF]/30 text-[#007AFF] rounded-full';
      case 'end':
        return 'bg-[#34C759]/15 border-[#34C759]/30 text-[#34C759] rounded-full';
      case 'decision':
        return 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]';
      case 'process':
        return 'bg-[#5856D6]/10 border-[#5856D6]/30 text-[#5856D6]';
      default:
        return 'bg-white/[0.06] border-white/[0.12] text-white/90';
    }
  };

  const getNodeShape = (type?: string) => {
    switch (type) {
      case 'decision':
        return 'rounded-lg transform rotate-0'; // Could add diamond shape with clip-path
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 md:p-6 overflow-x-auto my-4 relative">
      {title && (
        <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 text-center">
          {title}
        </div>
      )}
      <div ref={containerRef} className="relative min-w-[300px]">
        {/* SVG overlay for connectors */}
        <svg 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="rgba(255,255,255,0.2)"
              />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const d = getPathD(edge.from, edge.to);
            if (!d) return null;
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {Array.from({ length: maxLevel + 1 }, (_, lvl) => {
            const rowNodes = rows.get(lvl) ?? [];
            const isLast = lvl === maxLevel;
            return (
              <div key={lvl} className="flex flex-col items-center gap-4 w-full">
                <div className="flex flex-wrap items-start justify-center gap-4 w-full">
                  {rowNodes.map((id) => {
                    const node = nodeMap.get(id)!;
                    const outgoing = edges.filter((e) => e.from === id);
                    return (
                      <div key={id} className="flex flex-col items-center">
                        <div
                          id={`flow-node-${node.id}`}
                          className={`px-4 py-2.5 text-xs md:text-sm font-medium text-center min-w-[120px] max-w-[280px] border ${getNodeStyle(node.type)} ${getNodeShape(node.type)} shadow-sm`}
                        >
                          <div>{node.label}</div>
                          {node.subLabel && (
                            <div className="text-[10px] opacity-70 mt-0.5">{node.subLabel}</div>
                          )}
                        </div>
                        {outgoing.length > 0 && outgoing.some((e) => e.label) && (
                          <div className="flex gap-2 mt-1.5 flex-wrap justify-center">
                            {outgoing.map((e, i) =>
                              e.label ? (
                                <span key={i} className="text-[10px] font-semibold text-white/50 bg-white/[0.05] px-2 py-0.5 rounded-full">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
