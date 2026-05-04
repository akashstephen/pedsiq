/**
 * Feature Wars Page v2 — Refactored with CSS screen transitions + imperative effects
 */

'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { ArcadeScreen } from '@/components/ArcadeScreen';
import { useArcadeSession } from '@/hooks/useArcadeSession';
import { useFeatureWarsEngine } from './hooks/useFeatureWarsEngine';
import battlesData from './data/battles.json';
import { type FeatureWarsBattle, type FeatureWarsFeature, type FeatureWarsDisease } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { updateGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { useArcadeEffects } from '@/lib/arcade-effects';
import { Swords, Trophy, Brain } from 'lucide-react';

const allBattles = battlesData as FeatureWarsBattle[];

// ─── Splash ──────────────────────────────────────────────────────────────────

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <div className="pointer-events-none fixed inset-0 z-[100]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 4px)' }} />

      <div className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#2E4A65] uppercase border border-[#1E3550] px-3 sm:px-4 py-1 rounded-full mb-3 sm:mb-4 relative z-10">
        PedsIQ · Differential Diagnosis
      </div>
      <h1 className="text-[clamp(40px,11vw,72px)] font-extrabold leading-none mb-2 tracking-tight relative z-10"
          style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(120deg, #FBBF24, #F472B6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        FEATURE<br />WARS
      </h1>
      <p className="text-xs sm:text-sm text-[#6E89A8] max-w-xs mb-4 sm:mb-6 leading-relaxed relative z-10">
        Assign each clinical feature to its disease. Some features belong to both — find them all.
      </p>

      <div className="w-full max-w-sm space-y-2 mb-4 sm:mb-6 relative z-10 px-2">
        {allBattles.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3 bg-[#0A1528] border border-[#1E3550] rounded-lg p-2 sm:p-3 text-left">
            <div className="text-base sm:text-lg font-extrabold w-6 shrink-0" style={{fontFamily:"'Syne',sans-serif", color: i === 0 ? '#FBBF24' : i === 1 ? '#A78BFA' : '#F472B6'}}>{i + 1}</div>
            <div>
              <div className="text-[12px] sm:text-[13px] font-semibold text-[#CDD9E8]">{b.name}</div>
              <div className="text-[10px] sm:text-[11px] text-[#6E89A8]">{b.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A1528] border border-[#1E3550] rounded-lg p-3 sm:p-4 max-w-sm mx-auto mb-4 sm:mb-6 text-left relative z-10 w-full">
        <p className="text-[11px] sm:text-xs text-[#6E89A8] leading-relaxed">
          <strong className="text-[#FBBF24] font-semibold">Elaborative interrogation effect:</strong> Deciding WHERE a feature belongs
          forces you to articulate the mechanism. The &quot;why&quot; question produces
          deeper semantic encoding than any form of passive review.
        </p>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-sm text-[#FBBF24] relative z-10">
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button
        onClick={onStart}
        className="px-10 sm:px-12 py-3 sm:py-4 rounded-lg text-[#030812] font-extrabold text-sm sm:text-base tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98] relative z-10"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)' }}
      >
        <Swords size={20} className="inline mr-2" />
        BEGIN BATTLE →
      </button>
    </div>
  );
}

// ─── Battle ──────────────────────────────────────────────────────────────────

function BattleScreen({ engine }: { engine: ReturnType<typeof useFeatureWarsEngine> }) {
  const b = engine.battle;
  if (!b) return null;

  const remaining = b.features.filter((f) => !engine.isFeatureDone(f.id)).length;
  const effects = useArcadeEffects();
  const prevFeedbackRef = useRef<string | null>(null);
  const [expVisible, setExpVisible] = useState(false);
  const expTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle feedback visibility and auto-hide
  useEffect(() => {
    if (!engine.feedback) {
      prevFeedbackRef.current = null;
      setExpVisible(false);
      if (expTimerRef.current) clearTimeout(expTimerRef.current);
      return;
    }
    const key = engine.feedback.type + engine.feedback.feature.id;
    if (prevFeedbackRef.current === key) return;
    prevFeedbackRef.current = key;
    setExpVisible(true);

    // Flash background
    if (engine.feedback.type === 'ok' || engine.feedback.type === 'partial') {
      effects.flash('green');
    } else {
      effects.flash('red');
    }

    // Score popup on correct
    if (engine.feedback.type === 'ok' || engine.feedback.type === 'partial') {
      const centerX = window.innerWidth / 2 - 20;
      const centerY = window.innerHeight / 2 - 10;
      effects.popup(centerX, centerY, '+10', '#34D399');
    }

    // Auto-hide explanation
    if (expTimerRef.current) clearTimeout(expTimerRef.current);
    const delay = engine.feedback.type === 'bad' ? 3000 : 2200;
    expTimerRef.current = setTimeout(() => {
      setExpVisible(false);
    }, delay);

    return () => {
      if (expTimerRef.current) clearTimeout(expTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.feedback]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      {/* Scanline texture */}
      <div className="pointer-events-none fixed inset-0 z-[100]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 4px)' }} />

      {/* HUD — 3-col grid prevents layout shift */}
      <div className="relative z-20 grid grid-cols-3 gap-2 px-3 sm:px-4 py-2 border-b border-[#182A42]"
           style={{ background: 'rgba(4,8,18,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="text-left">
          <div className="text-[clamp(18px,5vw,22px)] font-extrabold text-[#FBBF24] tabular-nums" style={{fontFamily:"'Syne',sans-serif"}}>{engine.score}</div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.12em] text-[#2E4A65] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Score</div>
        </div>
        <div className="text-center self-center px-1">
          <div className="text-[clamp(10px,3vw,13px)] font-semibold text-[#CDD9E8] leading-tight truncate">{b.name}</div>
          <div className="text-[8px] sm:text-[9px] text-[#2E4A65] mt-0.5 truncate" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{b.subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[clamp(18px,5vw,22px)] font-extrabold text-[#22D3EE] tabular-nums" style={{fontFamily:"'Syne',sans-serif"}}>{remaining}</div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.12em] text-[#2E4A65] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Left</div>
        </div>
      </div>

      {/* Round dots */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 py-1.5 bg-[#07101F] border-b border-[#182A42]">
        {allBattles.map((_, i) => (
          <div key={i} className={`w-7 h-1.5 rounded transition-all ${
            i < engine.currentBattleIndex ? 'bg-[#34D399]' :
            i === engine.currentBattleIndex ? 'bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-[#0E1C35]'
          }`} />
        ))}
      </div>

      {/* Instruction */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 py-1 bg-[#07101F]">
        <div className={`text-[10px] sm:text-[11px] text-center transition-colors ${engine.selectedFeatureId ? 'text-[#FBBF24]' : 'text-[#2E4A65]'}`}
             style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          {engine.selectedFeatureId
            ? `Tap a disease column to place the feature`
            : `Tap a feature chip to select, then tap a disease column to place it`}
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-20 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Disease columns */}
        <div className="flex gap-1.5 p-1.5 sm:p-2 shrink-0" style={{ flexWrap: b.diseases.length === 4 ? 'wrap' : 'nowrap' }}>
          {b.diseases.map((d: FeatureWarsDisease) => (
            <ColumnComponent
              key={d.id}
              disease={d}
              features={b.features}
              placements={engine.placements}
              selectedFeatureId={engine.selectedFeatureId}
              onColumnTap={() => engine.onColumnTap(d.id)}
              isFeatureDone={engine.isFeatureDone}
              alreadyPlacedColumnId={engine.alreadyPlacedColumnId}
            />
          ))}
        </div>

        {/* Tray divider */}
        <div className="relative h-px bg-[#182A42] shrink-0 my-1">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] sm:text-[9px] tracking-[0.15em] text-[#2E4A65] uppercase bg-[#040812] px-2"
                style={{fontFamily:"'IBM Plex Mono',monospace"}}>▼ FEATURE TRAY ▼</span>
        </div>

        {/* Feature tray */}
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 min-h-0 arcade-scroll-thin">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1.5 sm:gap-2">
            {b.features.map((f: FeatureWarsFeature) => {
              const done = engine.isFeatureDone(f.id);
              const isMulti = f.correctDiseaseIds.length > 1;
              const placedCount = engine.placements[f.id]?.size ?? 0;
              const remainingCount = isMulti ? f.correctDiseaseIds.length - placedCount : 0;
              const isSelected = engine.selectedFeatureId === f.id;
              const isWrongNow = engine.lastWrongChipId === f.id;
              const isPartiallyPlaced = placedCount > 0 && placedCount < f.correctDiseaseIds.length;

              return (
                <button
                  key={f.id}
                  onClick={() => engine.onChipTap(f.id)}
                  disabled={done}
                  className={`relative rounded-xl p-2 sm:p-3 text-left transition-all cursor-pointer flex flex-col gap-1 min-h-[52px] sm:min-h-[60px]
                    ${done ? 'opacity-0 pointer-events-none scale-90' : ''}
                    ${isSelected && !done ? 'border border-[#FBBF24] shadow-[0_0_14px_rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.07)] scale-[1.04]' : ''}
                    ${!isSelected && !done ? 'bg-[#0E1C35] border border-[#1E3550] hover:bg-[#162240] hover:border-[#1E3550]' : ''}
                  `}
                  style={isSelected ? { transform: 'scale(1.04)' } : {}}
                >
                  {isMulti && !done && remainingCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-[#A78BFA] text-white rounded px-1 py-0.5"
                         style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                      ×{remainingCount}
                    </div>
                  )}
                  <div className={`text-[11px] sm:text-xs font-semibold leading-tight ${isPartiallyPlaced && !done ? 'opacity-55 italic' : 'text-[#CDD9E8]'}`}>
                    {f.text}
                  </div>
                  <div className="text-[9px] sm:text-[9.5px] text-[#2E4A65] leading-tight" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{f.sub}</div>
                  {isWrongNow && (
                    <div className="absolute inset-0 animate-[fw-fShake_0.3s_ease] pointer-events-none rounded-xl" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation popup — always mounted, translated off-screen */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 pointer-events-none"
           style={{ transform: expVisible ? 'translateY(0)' : 'translateY(110%)', transition: 'transform 0.25s cubic-bezier(0.175,0.885,0.32,1.1)' }}>
        {engine.feedback && (
          <div className={`rounded-xl p-3 sm:p-4 max-w-lg mx-auto border pointer-events-auto
            ${engine.feedback.type === 'ok' ? 'bg-[#012B18] border-[#34D399]' :
              engine.feedback.type === 'partial' ? 'bg-[#0A1528] border-[#A78BFA]' :
              'bg-[#160008] border-[#F87171]'}`}
               style={{ boxShadow: engine.feedback.type === 'ok' ? '0 0 22px rgba(52,211,153,0.12)' : engine.feedback.type === 'bad' ? '0 0 22px rgba(248,113,113,0.12)' : '0 0 22px rgba(167,139,250,0.12)' }}>
            <div className={`text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase mb-2
              ${engine.feedback.type === 'ok' ? 'text-[#34D399]' : engine.feedback.type === 'partial' ? 'text-[#A78BFA]' : 'text-[#F87171]'}`}
                 style={{fontFamily:"'Syne',sans-serif"}}>
              {engine.feedback.type === 'ok' ? '✓ CORRECT PLACEMENT' :
               engine.feedback.type === 'partial' ? '✓ PARTIAL — place in another disease too' :
               '✗ WRONG PLACEMENT'}
            </div>
            <div className={`text-xs sm:text-sm font-semibold mb-2
              ${engine.feedback.type === 'ok' ? 'text-[#34D399]' : engine.feedback.type === 'partial' ? 'text-[#A78BFA]' : 'text-[#34D399]'}`}
                 style={{fontFamily:"'IBM Plex Mono',monospace"}}>
              {engine.feedback.type === 'bad'
                ? `Correct: ${engine.feedback.feature.correctDiseaseIds.join(' + ')}`
                : engine.feedback.diseaseName}
            </div>
            <p className="text-[11px] sm:text-xs text-[#6E89A8] leading-relaxed">{engine.feedback.feature.explanation}</p>
            {engine.feedback.feature.trap && (
              <div className="mt-2 p-2 bg-[rgba(251,191,36,0.08)] border-l-[3px] border-[#FBBF24] rounded text-[11px] sm:text-xs text-[#FBBF24] leading-relaxed"
                   style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                <strong>⚡ TRAP:</strong> {engine.feedback.feature.trap}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Column Component ────────────────────────────────────────────────────────

function ColumnComponent({
  disease,
  features,
  placements,
  selectedFeatureId,
  onColumnTap,
  isFeatureDone,
  alreadyPlacedColumnId,
}: {
  disease: FeatureWarsDisease;
  features: FeatureWarsFeature[];
  placements: Record<string, Set<string>>;
  selectedFeatureId: string | null;
  onColumnTap: () => void;
  isFeatureDone: (id: string) => boolean;
  alreadyPlacedColumnId: string | null;
}) {
  const [flash, setFlash] = useState<'ok'|'bad'|null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const handleTap = () => {
    onColumnTap();
    if (selectedFeatureId) {
      const f = features.find((x) => x.id === selectedFeatureId);
      if (f) {
        const isCorrect = f.correctDiseaseIds.includes(disease.id);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        setFlash(isCorrect ? 'ok' : 'bad');
        flashTimeoutRef.current = setTimeout(() => setFlash(null), 400);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTap();
    }
  };

  const placedFeatures = features.filter((f) => placements[f.id]?.has(disease.id));
  const isAlreadyPlacedFlash = alreadyPlacedColumnId === disease.id;

  return (
    <div
      onClick={handleTap}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="flex-1 min-w-0 rounded-xl border overflow-hidden transition-all cursor-pointer"
      style={{
        background: '#0A1528',
        borderColor: selectedFeatureId ? disease.color + '55' : '#1E3550',
        animation: isAlreadyPlacedFlash ? 'fw-colOk 0.4s ease' : flash === 'ok' ? 'fw-colOk 0.4s ease' : flash === 'bad' ? 'fw-colBad 0.3s ease' : undefined,
        boxShadow: selectedFeatureId ? `0 0 16px ${disease.glow}` : undefined,
      }}
    >
      <div className="px-3 py-2 border-b border-[#182A42]" style={{ background: disease.bg }}>
        <div className="text-[clamp(11px,2.8vw,13px)] font-extrabold leading-tight" style={{fontFamily:"'Syne',sans-serif", color: disease.color}}>{disease.name}</div>
        <div className="text-[9px] text-[#2E4A65] mt-0.5" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          {placedFeatures.length} placed
        </div>
      </div>
      <div className="p-1.5 flex flex-col gap-1 min-h-[60px] max-h-[100px] sm:max-h-[140px] md:max-h-[200px] overflow-y-auto arcade-scroll-thin">
        {placedFeatures.map((f) => {
          const isMultiPending = f.correctDiseaseIds.length > 1 && !isFeatureDone(f.id);
          return (
            <div key={f.id} className={`rounded-md px-2 py-1 text-[10px] ${isMultiPending ? 'opacity-55 italic' : 'text-[#CDD9E8]'}`}
                 style={{ background: disease.bg, border: `1px solid ${disease.color}40`, animation: 'fw-chipIn 0.25s cubic-bezier(0.175,0.885,0.32,1.3)' }}>
              {f.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Battle Complete ─────────────────────────────────────────────────────────

function BattleCompleteScreen({ engine, onNext }: { engine: ReturnType<typeof useFeatureWarsEngine>; onNext: () => void }) {
  const b = engine.battle;
  if (!b) return null;
  const isLast = engine.currentBattleIndex >= allBattles.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: 'rgba(4,8,18,0.94)', backdropFilter: 'blur(12px)', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <h2 className="text-[clamp(20px,6vw,36px)] font-extrabold mb-2" style={{fontFamily:"'Syne',sans-serif", color: engine.battleWrongCount === 0 ? '#34D399' : '#FBBF24'}}>
        {engine.battleWrongCount === 0 ? '⚡ CLEAN SWEEP!' : `${b.name} — Round Over`}
      </h2>
      <div className="text-[clamp(40px,12vw,64px)] font-extrabold text-[#FBBF24] mb-2 leading-none" style={{fontFamily:"'Syne',sans-serif", textShadow: '0 0 30px rgba(251,191,36,0.4)'}}>
        {engine.score.toLocaleString()}
      </div>
      <p className="text-[11px] sm:text-xs text-[#6E89A8] mb-4 sm:mb-6">
        {engine.battleCorrectCount} correct · {engine.battleWrongCount} wrong · {engine.battleMultiFound} &quot;both&quot; found
      </p>

      <div className="flex gap-3 sm:gap-4 justify-center mb-4 sm:mb-6">
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-extrabold text-[#34D399]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.battleCorrectCount}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Correct</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-extrabold text-[#F87171]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.battleWrongCount}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Wrong</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 text-center min-w-[60px] sm:min-w-[70px]">
          <div className="text-xl sm:text-2xl font-extrabold text-[#A78BFA]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.battleMultiFound}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Both found</div>
        </div>
      </div>

      {engine.battleMissedFeatures.length > 0 && (
        <div className="w-full max-w-sm mb-4 sm:mb-6 text-left px-2">
          <p className="text-[9px] sm:text-[10px] tracking-wider text-[#2E4A65] uppercase mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
            Missed ({engine.battleMissedFeatures.length}) — review:
          </p>
          <div className="flex flex-col gap-2 max-h-28 sm:max-h-32 overflow-y-auto arcade-scroll-thin">
            {engine.battleMissedFeatures.map((f) => (
              <div key={f.id} className="bg-[#0A1528] border-l-[3px] border-[#F87171] rounded-lg p-2 sm:p-3 text-[11px] sm:text-xs text-[#6E89A8] leading-relaxed">
                <strong className="text-[#CDD9E8] block mb-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{f.text}</strong>
                Belongs to: <span className="text-[#34D399]">{f.correctDiseaseIds.join(' + ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg text-[#030812] font-extrabold text-xs sm:text-sm tracking-wide cursor-pointer transition-all hover:-translate-y-0.5"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #22D3EE, #A78BFA)' }}
      >
        {isLast ? 'SEE FINAL SCORE →' : 'NEXT BATTLE →'}
      </button>
    </div>
  );
}

// ─── Final ───────────────────────────────────────────────────────────────────

function FinalScreen({ engine, onRestart }: { engine: ReturnType<typeof useFeatureWarsEngine>; onRestart: () => void }) {
  const totalHits = engine.totalCorrectCount;
  const totalWrong = engine.totalWrongCount;
  const pct = totalHits + totalWrong > 0 ? Math.round((totalHits / (totalHits + totalWrong)) * 100) : 0;
  let title = 'REVISE & RETRY';
  let col = '#F87171';
  if (pct >= 90) { title = 'CONSULTANT-LEVEL'; col = '#34D399'; }
  else if (pct >= 75) { title = 'SOLID CLINICIAN'; col = '#22D3EE'; }
  else if (pct >= 55) { title = 'KEEP REVISING'; col = '#FBBF24'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <div className="pointer-events-none fixed inset-0 z-[100]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 4px)' }} />

      <h2 className="text-[clamp(22px,7vw,44px)] font-extrabold mb-2 relative z-10" style={{fontFamily:"'Syne',sans-serif", color: col}}>{title}</h2>
      <div className="text-[clamp(56px,18vw,80px)] font-extrabold leading-none mb-4 relative z-10"
           style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {engine.score.toLocaleString()}
      </div>
      <div className="text-xs sm:text-[13px] font-semibold px-4 sm:px-5 py-1.5 rounded-full border mb-4 sm:mb-6 inline-block relative z-10"
           style={{ color: col, borderColor: col }}>
        {pct}% accuracy
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6 sm:mb-8 relative z-10 px-2">
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-extrabold text-[#34D399]" style={{fontFamily:"'Syne',sans-serif"}}>{totalHits}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Hits</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-extrabold text-[#F87171]" style={{fontFamily:"'Syne',sans-serif"}}>{totalWrong}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Wrong</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-extrabold text-[#A78BFA]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.totalMultiFound}</div>
          <div className="text-[9px] sm:text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Both found</div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg text-[#030812] font-extrabold text-xs sm:text-sm tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 relative z-10"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)' }}
      >
        <Brain size={18} className="inline mr-2" />
        PLAY AGAIN
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeatureWarsPage() {
  const stats = useMemo(() => getGameStats('feature-wars'), []);
  const session = useArcadeSession({ gameId: 'feature-wars', totalQuestions: allBattles.reduce((a, b) => a + b.features.length, 0) });
  const engine = useFeatureWarsEngine(allBattles);
  const [showBattleComplete, setShowBattleComplete] = useState(false);

  // Initialize game when entering playing phase
  useEffect(() => {
    if (session.phase === 'playing') {
      engine.initGame();
      setShowBattleComplete(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase]);

  // Check for battle completion
  useEffect(() => {
    if (session.phase === 'playing' && engine.feedback?.type === 'ok') {
      const b = engine.battle;
      if (b) {
        const allDone = b.features.every((f) => engine.isFeatureDone(f.id));
        if (allDone) {
          const t = setTimeout(() => setShowBattleComplete(true), 800);
          return () => clearTimeout(t);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.feedback, engine.placements]);

  // Update session score from engine
  useEffect(() => {
    session.setScore(engine.score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.score]);

  const handleNextBattle = useCallback(() => {
    const isComplete = engine.nextBattle();
    setShowBattleComplete(false);
    if (isComplete) {
      // Save stats
      const arcadeSession = session.endGame();
      const missed = engine.allMissedFeatures.map((f) => ({
        questionId: f.id,
        gameId: 'feature-wars' as const,
        text: f.text,
        correctAnswer: f.correctDiseaseIds.join(' + '),
        explanation: f.explanation,
        trap: f.trap,
        addedAt: new Date().toISOString(),
      }));
      updateGameStats('feature-wars', arcadeSession, missed);
    }
  }, [engine, session]);

  const handleRestart = useCallback(() => {
    setShowBattleComplete(false);
    session.startGame();
    engine.initGame();
  }, [session, engine]);

  return (
    <ArcadeShell gameId="feature-wars" themeClass="theme-feature-wars">
      <GoogleFontsLoader families={['Syne:wght@700;800', 'IBM+Plex+Mono:wght@400;500;600', 'DM+Sans:wght@300;400;500;600']} />
      <div className="relative w-full h-[100dvh]">
        <ArcadeScreen phase="splash" activePhase={session.phase}>
          <SplashScreen onStart={session.startGame} highScore={stats.highScore} />
        </ArcadeScreen>

        <ArcadeScreen phase="playing" activePhase={session.phase} className="game-layout">
          <BattleScreen engine={engine} />
        </ArcadeScreen>

        <ArcadeScreen phase="results" activePhase={session.phase}>
          <FinalScreen engine={engine} onRestart={handleRestart} />
        </ArcadeScreen>
      </div>

      {/* Battle Complete Overlay */}
      {session.phase === 'playing' && showBattleComplete && (
        <div className="fixed inset-0 z-[200]">
          <BattleCompleteScreen engine={engine} onNext={handleNextBattle} />
        </div>
      )}
    </ArcadeShell>
  );
}
