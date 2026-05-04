/**
 * ArcadeEffects — Shared visual effect system for all arcade games
 * Flash overlays, score popups, particles, combo surges, level flashes
 */

'use client';

import { useCallback, useState, useEffect, useRef } from 'react';

// ─── Flash Overlay ───────────────────────────────────────────────────────────

export function FlashOverlay({ color, onDone }: { color: 'green' | 'red' | 'amber'; onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDoneRef.current?.();
    }, 300);
    return () => clearTimeout(t);
  }, []); // intentionally stable — onDone stored in ref

  const bg = color === 'green' ? 'rgba(16,185,129,0.12)' : color === 'red' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.11)';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[35]"
      style={{
        background: bg,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.1s',
      }}
    />
  );
}

// ─── Score Popup ─────────────────────────────────────────────────────────────

interface ScorePopupItem {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

let popupId = 0;

export function useScorePopups() {
  const [popups, setPopups] = useState<ScorePopupItem[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const spawnPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupId;
    setPopups((prev) => [...prev, { id, x, y, text, color }]);
    const t = setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
    timeoutsRef.current.push(t);
  }, []);

  const PopupLayer = useCallback(() => (
    <>
      {popups.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-[60] font-bold text-xl"
          style={{
            left: p.x,
            top: p.y,
            color: p.color,
            animation: 'sniper-spopAnim 0.8s ease forwards',
          }}
        >
          {p.text}
        </div>
      ))}
    </>
  ), [popups]);

  return { spawnPopup, PopupLayer };
}

// ─── Particle Burst ──────────────────────────────────────────────────────────

interface ParticleItem {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: number;
  ty: number;
  duration: string;
}

let particleId = 0;

export function useParticles() {
  const [particles, setParticles] = useState<ParticleItem[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 14) => {
    const newParticles: ParticleItem[] = [];
    for (let i = 0; i < count; i++) {
      const id = ++particleId;
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      newParticles.push({
        id,
        x: x - 3,
        y: y - 3,
        color,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        duration: `${0.35 + Math.random() * 0.45}s`,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 900);
    timeoutsRef.current.push(t);
  }, []);

  const ParticleLayer = useCallback(() => (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[55]"
          style={{
            left: p.x,
            top: p.y,
            background: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--d': p.duration,
            animation: `sniper-ptclFly ${p.duration} ease forwards`,
          } as React.CSSProperties}
        />
      ))}
    </>
  ), [particles]);

  return { spawnParticles, ParticleLayer };
}

// ─── Combo Surge ─────────────────────────────────────────────────────────────

interface SurgeItem {
  id: number;
  text: string;
  color: string;
}

let surgeId = 0;

export function useComboSurge() {
  const [surges, setSurges] = useState<SurgeItem[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const triggerSurge = useCallback((text: string, color: string) => {
    const id = ++surgeId;
    setSurges((prev) => [...prev, { id, text, color }]);
    const t = setTimeout(() => {
      setSurges((prev) => prev.filter((s) => s.id !== id));
    }, 1100);
    timeoutsRef.current.push(t);
  }, []);

  const SurgeLayer = useCallback(() => (
    <>
      {surges.map((s) => (
        <div
          key={s.id}
          className="fixed left-1/2 top-[35%] pointer-events-none z-[60] text-center font-black"
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(22px, 6vw, 36px)',
            color: s.color,
            animation: 'sniper-surgePop 1s ease forwards',
          }}
        >
          {s.text}
        </div>
      ))}
    </>
  ), [surges]);

  return { triggerSurge, SurgeLayer };
}

// ─── Level Flash ─────────────────────────────────────────────────────────────

export function LevelFlash({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDoneRef.current?.();
    }, 700);
    return () => clearTimeout(t);
  }, []); // intentionally stable — onDone stored in ref

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[45] border-[3px] border-[#22CCFF]"
      style={{ animation: 'sniper-lvlAnim 0.65s ease forwards' }}
    />
  );
}
