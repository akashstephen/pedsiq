'use client';

import { useMemo } from 'react';
import { renderMermaidSVG } from 'beautiful-mermaid';

interface MermaidDiagramProps {
  code: string;
  title?: string;
}

/**
 * Dark-theme SVG transformer for Mermaid diagrams.
 * Strips default Mermaid light-theme colors and applies dark-theme tokens
 * that match the site's design system (bg-black, text-white, accent #007AFF).
 */
function transformMermaidForDarkTheme(svg: string): string {
  return svg
    // Remove default white/light backgrounds from nodes and root groups
    .replace(/fill="#[fF]{6}"/g, 'fill="transparent"')
    .replace(/fill="#[eE][eE][eE][eE][eE][eE]"/g, 'fill="transparent"')
    .replace(/fill="white"/g, 'fill="transparent"')
    .replace(/fill="#fff"/g, 'fill="transparent"')
    .replace(/fill="#[fF][fF][fF][fF][fF][fF]"/g, 'fill="transparent"')
    // Light gray backgrounds -> subtle dark surface
    .replace(/fill="#[eE][0-9a-fA-F]{5}"/g, 'fill="rgba(255,255,255,0.04)"')
    .replace(/fill="#[dD][0-9a-fA-F]{5}"/g, 'fill="rgba(255,255,255,0.04)"')
    // Default node fills (light blues, greens, yellows) -> dark themed
    .replace(/fill="#[eE]1[fF]5[fF][eE]"/g, 'fill="rgba(0,122,255,0.12)"')   // light blue
    .replace(/fill="#[fF][fF][fF][fF][bB][bB]"/g, 'fill="rgba(255,149,0,0.12)"') // light yellow
    .replace(/fill="#[fF][fF][eE][eE][eE][eE]"/g, 'fill="rgba(255,45,85,0.12)"') // light red
    .replace(/fill="#[eE][eE][fF][fF][eE][eE]"/g, 'fill="rgba(52,199,89,0.12)"') // light green
    // Text: black/dark gray -> white/light gray
    .replace(/fill="#[0-9a-fA-F]{3}"/g, (match) => {
      const c = match.slice(1);
      // Simple heuristic: very dark colors -> white
      const isDark = parseInt(c, 16) < 0x444;
      return isDark ? 'fill="#ffffff"' : match;
    })
    .replace(/fill="black"/g, 'fill="#ffffff"')
    .replace(/fill="#[0-9a-fA-F]{6}"/g, (match) => {
      const hex = match.slice(6, -1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luminance < 0.25) return 'fill="rgba(255,255,255,0.9)"';
      if (luminance < 0.5) return 'fill="rgba(255,255,255,0.7)"';
      return match;
    })
    // Strokes/borders: dark -> light subtle
    .replace(/stroke="#[0-9a-fA-F]{3}"/g, (match) => {
      const c = match.slice(8, -1);
      const isDark = parseInt(c, 16) < 0x666;
      return isDark ? 'stroke="rgba(255,255,255,0.2)"' : match;
    })
    .replace(/stroke="#[0-9a-fA-F]{6}"/g, (match) => {
      const hex = match.slice(8, -1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luminance < 0.4) return 'stroke="rgba(255,255,255,0.25)"';
      return match;
    })
    // Remove any inline style blocks that set background colors
    .replace(/style="[^"]*background[^"]*"/g, '')
    // Ensure SVG has no hardcoded background rect
    .replace(/<rect[^>]*fill="white"[^>]*\/>/gi, '')
    .replace(/<rect[^>]*fill="#fff"[^>]*\/>/gi, '');
}

/**
 * Lightweight SVG sanitizer.
 * Allows only SVG tags and attributes; strips scripts, event handlers,
 * and foreign objects. This is a defense-in-depth layer since Mermaid
 * code should only ever come from trusted static data (topics.ts).
 */
function sanitizeSvg(svg: string): string {
  const allowedTags = new Set([
    'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
    'polygon', 'text', 'tspan', 'defs', 'marker', 'linearGradient',
    'radialGradient', 'stop', 'clipPath', 'mask', 'pattern', 'image',
    'use', 'symbol', 'title', 'desc', 'foreignObject',
  ]);

  const allowedAttrs = new Set([
    'xmlns', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
    'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
    'opacity', 'transform', 'class', 'id', 'style', 'marker-end', 'marker-start',
    'marker-mid', 'text-anchor', 'font-size', 'font-family', 'font-weight',
    'dx', 'dy', 'offset', 'stop-color', 'stop-opacity', 'clip-path', 'mask',
    'href', 'xlink:href', 'preserveAspectRatio', 'xmlns:xlink',
    'fill-opacity', 'stroke-opacity',
  ]);

  // Remove event handlers and javascript URLs
  const cleaned = svg
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '');

  // Parse and filter through DOM to strip disallowed tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return '';

  const walker = doc.createTreeWalker(svgEl, NodeFilter.SHOW_ELEMENT);
  const toRemove: Element[] = [];

  let node = walker.nextNode() as Element | null;
  while (node) {
    const tag = node.tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      toRemove.push(node);
    } else {
      // Strip disallowed attributes
      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (!allowedAttrs.has(name)) {
          node!.removeAttribute(attr.name);
        }
      });
    }
    node = walker.nextNode() as Element | null;
  }

  toRemove.forEach((el) => {
    if (el.parentNode) {
      while (el.firstChild) {
        el.parentNode.insertBefore(el.firstChild, el);
      }
      el.parentNode.removeChild(el);
    }
  });

  return svgEl.outerHTML;
}

export function MermaidDiagram({ code, title }: MermaidDiagramProps) {
  const svg = useMemo(() => {
    try {
      const raw = renderMermaidSVG(code);
      const themed = transformMermaidForDarkTheme(raw);
      return sanitizeSvg(themed);
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
