/**
 * ArcadeEffects — Imperative visual effect system
 * Uses refs + direct DOM manipulation (like original HTML) instead of React state.
 * Prevents re-renders, stale closures, and mount/unmount leaks.
 */

'use client';

import { useRef, useCallback } from 'react';

// ─── Flash Overlay ───────────────────────────────────────────────────────────

export function flashOverlay(color: 'green' | 'red' | 'amber') {
  const existing = document.getElementById('arcade-flash-overlay');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'arcade-flash-overlay';
  el.className = 'fixed inset-0 pointer-events-none z-[35]';
  const bg =
    color === 'green'
      ? 'rgba(16,185,129,0.12)'
      : color === 'red'
      ? 'rgba(239,68,68,0.12)'
      : 'rgba(245,158,11,0.11)';
  el.style.cssText = `background:${bg};opacity:1;transition:opacity 0.1s;`;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '0';
    });
  });

  setTimeout(() => el.remove(), 300);
}

// ─── Score Popup ─────────────────────────────────────────────────────────────

let popupId = 0;

export function scorePopup(x: number, y: number, text: string, color: string) {
  const id = ++popupId;
  const el = document.createElement('div');
  el.id = `spop-${id}`;
  el.className = 'fixed pointer-events-none z-[60] font-bold';
  el.style.cssText = `left:${x}px;top:${y}px;color:${color};font-family:'Orbitron',monospace;font-size:clamp(18px,5vw,22px);animation:sniper-spopAnim 0.8s ease forwards;`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ─── Particle Burst ──────────────────────────────────────────────────────────

let particleId = 0;

export function particleBurst(x: number, y: number, color: string, count: number = 14) {
  for (let i = 0; i < count; i++) {
    const id = ++particleId;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    const duration = 0.35 + Math.random() * 0.45;

    const el = document.createElement('div');
    el.id = `ptcl-${id}`;
    el.className = 'fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[55]';
    el.style.cssText = `left:${x - 3}px;top:${y - 3}px;background:${color};animation:sniper-ptclFly ${duration}s ease forwards;`;
    el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    el.style.setProperty('--d', `${duration}s`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

// ─── Combo Surge ─────────────────────────────────────────────────────────────

let surgeId = 0;

export function comboSurge(text: string, color: string) {
  const id = ++surgeId;
  const el = document.createElement('div');
  el.id = `surge-${id}`;
  el.className = 'fixed left-1/2 top-[35%] pointer-events-none z-[60] text-center font-black';
  el.style.cssText = `font-family:'Orbitron',monospace;font-size:clamp(22px,6vw,36px);color:${color};transform:translateX(-50%);animation:sniper-surgePop 1s ease forwards;`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// ─── Level Flash ─────────────────────────────────────────────────────────────

export function levelFlash() {
  const el = document.createElement('div');
  el.className = 'fixed inset-0 pointer-events-none z-[45] border-[3px] border-[#22CCFF]';
  el.style.cssText = 'animation:sniper-lvlAnim 0.65s ease forwards;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ─── React Hook Wrappers (for convenience inside components) ─────────────────

export function useArcadeEffects() {
  const flash = useCallback(flashOverlay, []);
  const popup = useCallback(scorePopup, []);
  const particles = useCallback(particleBurst, []);
  const surge = useCallback(comboSurge, []);
  const flashLevel = useCallback(levelFlash, []);

  return { flash, popup, particles, surge, flashLevel };
}
