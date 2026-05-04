'use client';

import { useMemo, useId } from 'react';
import { graphlib, layout } from '@dagrejs/dagre';

interface FlowchartNode {
  id: string;
  label: string;
  type?: 'default' | 'decision' | 'start' | 'end' | 'process';
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

const NODE_PAD_X = 24;
const NODE_PAD_Y = 14;
const FONT_SIZE = 13;
const LINE_H = 18;
const CHAR_W = 7.0;
const MIN_W = 100;
const MIN_H = 42;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function measureText(text: string) {
  const decoded = decodeHtmlEntities(text);
  const lines = decoded.split('\n');
  const maxChars = Math.max(...lines.map((l) => l.length));
  const w = Math.max(MIN_W, maxChars * CHAR_W + NODE_PAD_X * 2);
  const h = Math.max(MIN_H, lines.length * LINE_H + NODE_PAD_Y * 2);
  return { w, h, lines };
}

function getNodeBox(node: FlowchartNode) {
  const { w, h } = measureText(node.label);
  switch (node.type) {
    case 'decision': {
      const s = Math.max(130, w, h) * 1.2;
      return { w: s, h: s };
    }
    case 'start':
    case 'end': {
      const s = Math.max(110, w + 24, h + 10);
      return { w: s, h: s * 0.58 };
    }
    default:
      return { w, h };
  }
}

function nodeColors(type?: string) {
  switch (type) {
    case 'start':
      return { fill: 'rgba(0,122,255,0.12)', stroke: 'rgba(0,122,255,0.45)', text: '#5CADFF', glow: 'rgba(0,122,255,0.08)' };
    case 'end':
      return { fill: 'rgba(52,199,89,0.12)', stroke: 'rgba(52,199,89,0.45)', text: '#5BD778', glow: 'rgba(52,199,89,0.08)' };
    case 'decision':
      return { fill: 'rgba(255,149,0,0.10)', stroke: 'rgba(255,149,0,0.45)', text: '#FFBD4A', glow: 'rgba(255,149,0,0.08)' };
    case 'process':
      return { fill: 'rgba(88,86,214,0.10)', stroke: 'rgba(88,86,214,0.45)', text: '#8A88E6', glow: 'rgba(88,86,214,0.08)' };
    default:
      return { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.18)', text: 'rgba(255,255,255,0.88)', glow: 'rgba(255,255,255,0.03)' };
  }
}

function edgePath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  // Smooth orthogonal-ish path using cubic beziers between waypoints
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx.toFixed(1)} ${p0.y.toFixed(1)}, ${mx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

function diamondPath(w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;
  return `M 0 ${(-hh).toFixed(1)} L ${hw.toFixed(1)} 0 L 0 ${hh.toFixed(1)} L ${(-hw).toFixed(1)} 0 Z`;
}

function pillPath(w: number, h: number) {
  const r = h / 2;
  const hw = w / 2;
  const hh = h / 2;
  return `M ${(-hw + r).toFixed(1)} ${(-hh).toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(hw - r).toFixed(1)} ${(-hh).toFixed(1)} L ${(hw - r).toFixed(1)} ${hh.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(-hw + r).toFixed(1)} ${hh.toFixed(1)} Z`;
}

function rectPath(w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;
  const r = 10;
  return `M ${(-hw + r).toFixed(1)} ${(-hh).toFixed(1)} L ${(hw - r).toFixed(1)} ${(-hh).toFixed(1)} A ${r} ${r} 0 0 1 ${hw.toFixed(1)} ${(-hh + r).toFixed(1)} L ${hw.toFixed(1)} ${(hh - r).toFixed(1)} A ${r} ${r} 0 0 1 ${(hw - r).toFixed(1)} ${hh.toFixed(1)} L ${(-hw + r).toFixed(1)} ${hh.toFixed(1)} A ${r} ${r} 0 0 1 ${(-hw).toFixed(1)} ${(hh - r).toFixed(1)} L ${(-hw).toFixed(1)} ${(-hh + r).toFixed(1)} A ${r} ${r} 0 0 1 ${(-hw + r).toFixed(1)} ${(-hh).toFixed(1)} Z`;
}

function getShapePath(type: string | undefined, w: number, h: number) {
  switch (type) {
    case 'decision':
      return diamondPath(w, h);
    case 'start':
    case 'end':
      return pillPath(w, h);
    default:
      return rectPath(w, h);
  }
}

export function Flowchart({ nodes, edges, title }: FlowchartProps) {
  const id = useId();
  const arrowId = `fc-arrow-${id}`;
  const glowId = `fc-glow-${id}`;

  const data = useMemo(() => {
    const g = new graphlib.Graph({ directed: true, compound: false, multigraph: false });
    g.setGraph({ rankdir: 'TB', nodesep: 44, edgesep: 28, ranksep: 72, marginx: 24, marginy: 24 });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((n) => {
      const box = getNodeBox(n);
      g.setNode(n.id, { label: n.label, width: box.w, height: box.h, type: n.type });
    });

    edges.forEach((e) => {
      g.setEdge(e.from, e.to, { label: e.label });
    });

    layout(g);

    const nodeMap = new Map<string, { x: number; y: number; w: number; h: number; type?: string; label: string; lines: string[] }>();
    g.nodes().forEach((id) => {
      const n = g.node(id);
      nodeMap.set(id, { x: n.x, y: n.y, w: n.width, h: n.height, type: n.type, label: decodeHtmlEntities(n.label), lines: measureText(n.label).lines });
    });

    const edgeList: { points: { x: number; y: number }[]; label?: string }[] = [];
    g.edges().forEach((e) => {
      const edgeObj = g.edge(e);
      edgeList.push({ points: edgeObj.points, label: edgeObj.label ? decodeHtmlEntities(edgeObj.label) : undefined });
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodeMap.forEach((n) => {
      minX = Math.min(minX, n.x - n.w / 2);
      minY = Math.min(minY, n.y - n.h / 2);
      maxX = Math.max(maxX, n.x + n.w / 2);
      maxY = Math.max(maxY, n.y + n.h / 2);
    });
    edgeList.forEach((e) => {
      e.points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    });

    const pad = 32;
    const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
    const vw = maxX - minX + pad * 2;
    const vh = maxY - minY + pad * 2;

    return { nodeMap, edgeList, vb, vw, vh };
  }, [nodes, edges]);

  const { nodeMap, edgeList, vb, vw, vh } = data;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 md:p-6 overflow-x-auto my-4">
      {title && (
        <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 text-center">
          {title}
        </div>
      )}
      <div className="flex justify-center min-w-fit">
        <svg viewBox={vb} width={vw} height={vh} className="max-w-full h-auto" style={{ minWidth: Math.min(vw, 640) }}>
          <defs>
            <marker id={arrowId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.3)" />
            </marker>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Edges */}
          {edgeList.map((edge, i) => {
            const d = edgePath(edge.points);
            if (!d) return null;
            // Find a good label position: midpoint of the path
            const midIdx = Math.max(1, Math.floor(edge.points.length / 2));
            const mid = edge.points[midIdx];
            const prev = edge.points[midIdx - 1];
            const angle = Math.atan2(mid.y - prev.y, mid.x - prev.x);
            // Offset perpendicular to edge direction
            const off = 12;
            const lx = mid.x + Math.sin(angle) * off;
            const ly = mid.y - Math.cos(angle) * off;

            return (
              <g key={`e${i}`}>
                <path d={d} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" markerEnd={`url(#${arrowId})`} />
                {edge.label && (
                  <g>
                    <rect
                      x={lx - (edge.label.length * 3.5 + 8)}
                      y={ly - 9}
                      width={edge.label.length * 7 + 16}
                      height={18}
                      rx={9}
                      fill="rgba(10,10,10,0.9)"
                      stroke="rgba(255,255,255,0.10)"
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from(nodeMap.entries()).map(([id, n]) => {
            const c = nodeColors(n.type);
            const shapeD = getShapePath(n.type, n.w, n.h);
            return (
              <g key={id} transform={`translate(${n.x.toFixed(1)}, ${n.y.toFixed(1)})`}>
                <path d={shapeD} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" filter={`url(#${glowId})`} />
                <path d={shapeD} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                {n.lines.length === 1 ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={c.text}
                    fontSize={FONT_SIZE}
                    fontWeight="500"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {n.label}
                  </text>
                ) : (
                  n.lines.map((line, i) => (
                    <text
                      key={i}
                      textAnchor="middle"
                      dominantBaseline="central"
                      y={((i - (n.lines.length - 1) / 2) * LINE_H).toFixed(1)}
                      fill={c.text}
                      fontSize={FONT_SIZE}
                      fontWeight="500"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {line}
                    </text>
                  ))
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
