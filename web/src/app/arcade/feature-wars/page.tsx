/**
 * Feature Wars Page — Differential diagnosis sorting game
 */

'use client';

import { useMemo } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { useFeatureWarsEngine } from './hooks/useFeatureWarsEngine';
import battlesData from './data/battles.json';
import { type FeatureWarsBattle, type FeatureWarsFeature } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { Swords, Trophy, Zap, Target, Brain } from 'lucide-react';

const allBattles = battlesData as FeatureWarsBattle[];

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <div className="text-[10px] tracking-[0.2em] text-[#2E4A65] uppercase border border-[#1E3550] px-4 py-1 rounded-full mb-4">
        PedsIQ · Differential Diagnosis
      </div>
      <h1 className="text-[clamp(44px,11vw,72px)] font-extrabold leading-none mb-2 tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(120deg, #FBBF24, #F472B6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        FEATURE<br />WARS
      </h1>
      <p className="text-sm text-[#6E89A8] max-w-xs mb-6 leading-relaxed">
        Assign each clinical feature to its disease. Some features belong to both — find them all.
      </p>

      <div className="w-full max-w-sm space-y-2 mb-6">
        {allBattles.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3 bg-[#0A1528] border border-[#1E3550] rounded-lg p-3 text-left">
            <div className="text-lg font-extrabold w-6 shrink-0" style={{fontFamily:"'Syne',sans-serif", color: i === 0 ? '#FBBF24' : i === 1 ? '#A78BFA' : '#F472B6'}}>{i + 1}</div>
            <div>
              <div className="text-[13px] font-semibold text-[#CDD9E8]">{b.name}</div>
              <div className="text-[11px] text-[#6E89A8]">{b.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A1528] border border-[#1E3550] rounded-lg p-4 max-w-sm mx-auto mb-6 text-left">
        <p className="text-xs text-[#6E89A8] leading-relaxed">
          <strong className="text-[#FBBF24] font-semibold">Elaborative interrogation effect:</strong> Deciding WHERE a feature belongs
          forces you to articulate the mechanism. The &quot;why&quot; question produces
          deeper semantic encoding than any form of passive review.
        </p>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-[#FBBF24]">
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button
        onClick={onStart}
        className="px-12 py-4 rounded-lg text-[#030812] font-extrabold text-base tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)' }}
      >
        <Swords size={20} className="inline mr-2" />
        BEGIN BATTLE →
      </button>
    </div>
  );
}

function BattleScreen({ engine }: { engine: ReturnType<typeof useFeatureWarsEngine> }) {
  const b = engine.battle;
  if (!b) return null;

  const remaining = b.features.filter((f) => !engine.isFeatureDone(f.id)).length;

  return (
    <div className="flex flex-col min-h-screen"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-[100]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 4px)' }} />

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-[#182A42]"
           style={{ background: 'rgba(4,8,18,0.85)', backdropFilter: 'blur(8px)' }}>
        <div>
          <div className="text-[22px] font-extrabold text-[#FBBF24]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.score}</div>
          <div className="text-[9px] tracking-[0.12em] text-[#2E4A65] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Score</div>
        </div>
        <div className="text-center max-w-[170px]">
          <div className="text-[clamp(11px,3vw,13px)] font-semibold text-[#CDD9E8] leading-tight">{b.name}</div>
          <div className="text-[9px] text-[#2E4A65] mt-0.5" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{b.subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-extrabold text-[#22D3EE]" style={{fontFamily:"'Syne',sans-serif"}}>{remaining}</div>
          <div className="text-[9px] tracking-[0.12em] text-[#2E4A65] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Left</div>
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
        <div className={`text-[11px] text-center ${engine.selectedFeatureId ? 'text-[#FBBF24]' : 'text-[#2E4A65]'}`}
             style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          {engine.selectedFeatureId
            ? `Tap a disease column to place the feature`
            : `Tap a feature chip to select, then tap a disease column to place it`}
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-20 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Disease columns */}
        <div className="flex gap-1.5 p-2 shrink-0" style={{ flexWrap: b.diseases.length === 4 ? 'wrap' : 'nowrap' }}>
          {b.diseases.map((d) => (
            <div
              key={d.id}
              onClick={() => engine.onColumnTap(d.id)}
              className="flex-1 min-w-0 rounded-xl border transition-all cursor-pointer"
              style={{
                background: '#0A1528',
                borderColor: engine.selectedFeatureId ? d.color + '55' : '#1E3550',
                flexBasis: b.diseases.length === 4 ? 'calc(50% - 3px)' : undefined,
              }}
            >
              <div className="px-3 py-2 border-b border-[#182A42]" style={{ background: d.bg }}>
                <div className="text-[clamp(11px,2.8vw,13px)] font-extrabold leading-tight" style={{fontFamily:"'Syne',sans-serif", color: d.color}}>{d.name}</div>
                <div className="text-[9px] text-[#2E4A65] mt-0.5" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                  {(engine.placements[d.id]?.size ?? 0)} placed
                </div>
              </div>
              <div className="p-1.5 flex flex-col gap-1 min-h-[60px] max-h-[120px] overflow-y-auto">
                {b.features.filter((f) => engine.placements[f.id]?.has(d.id)).map((f) => (
                  <div key={f.id} className="rounded-md px-2 py-1 text-[10px] text-[#CDD9E8]"
                       style={{ background: d.bg, border: `1px solid ${d.color}40`, animation: 'chipIn 0.25s ease' }}>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tray divider */}
        <div className="relative h-px bg-[#182A42] shrink-0 my-1">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 text-[9px] tracking-[0.15em] text-[#2E4A65] uppercase bg-[#040812] px-2"
                style={{fontFamily:"'IBM Plex Mono',monospace"}}>▼ FEATURE TRAY ▼</span>
        </div>

        {/* Feature tray */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            {b.features.map((f) => {
              const done = engine.isFeatureDone(f.id);
              const isMulti = f.correctDiseaseIds.length > 1;
              const remaining = isMulti ? f.correctDiseaseIds.length - (engine.placements[f.id]?.size ?? 0) : 0;

              return (
                <button
                  key={f.id}
                  onClick={() => engine.onChipTap(f.id)}
                  disabled={done}
                  className={`relative rounded-xl p-3 text-left transition-all cursor-pointer flex flex-col gap-1 min-h-[60px]
                    ${done ? 'opacity-0 pointer-events-none scale-90' : ''}
                    ${engine.selectedFeatureId === f.id ? 'border border-[#FBBF24] shadow-[0_0_14px_rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.07)] scale-[1.04]' : 'bg-[#0E1C35] border border-[#1E3550] hover:bg-[#162240] hover:border-[#1E3550]'}
                  `}
                >
                  {isMulti && !done && (
                    <div className="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-[#A78BFA] text-white rounded px-1 py-0.5"
                         style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                      ×{remaining}
                    </div>
                  )}
                  <div className="text-xs font-semibold text-[#CDD9E8] leading-tight">{f.text}</div>
                  <div className="text-[9.5px] text-[#2E4A65] leading-tight" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{f.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback popup */}
      {engine.feedback && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 transition-transform duration-300"
             style={{ transform: 'translateY(0)' }}>
          <div className={`rounded-xl p-4 max-w-lg mx-auto border
            ${engine.feedback.type === 'ok' ? 'bg-[#012B18] border-[#34D399]' :
              engine.feedback.type === 'partial' ? 'bg-[#0A1528] border-[#A78BFA]' :
              'bg-[#160008] border-[#F87171]'}`}
               style={{ boxShadow: engine.feedback.type === 'ok' ? '0 0 22px rgba(52,211,153,0.12)' : engine.feedback.type === 'bad' ? '0 0 22px rgba(248,113,113,0.12)' : '0 0 22px rgba(167,139,250,0.12)' }}>
            <div className={`text-[11px] font-extrabold tracking-wider uppercase mb-2
              ${engine.feedback.type === 'ok' ? 'text-[#34D399]' : engine.feedback.type === 'partial' ? 'text-[#A78BFA]' : 'text-[#F87171]'}`}
                 style={{fontFamily:"'Syne',sans-serif"}}>
              {engine.feedback.type === 'ok' ? '✓ CORRECT PLACEMENT' :
               engine.feedback.type === 'partial' ? '✓ PARTIAL — place in another disease too' :
               '✗ WRONG PLACEMENT'}
            </div>
            <div className={`text-sm font-semibold mb-2
              ${engine.feedback.type === 'ok' ? 'text-[#34D399]' : engine.feedback.type === 'partial' ? 'text-[#A78BFA]' : 'text-[#34D399]'}`}
                 style={{fontFamily:"'IBM Plex Mono',monospace"}}>
              {engine.feedback.type === 'bad'
                ? `Correct: ${engine.feedback.feature.correctDiseaseIds.join(' + ')}`
                : engine.feedback.diseaseName}
            </div>
            <p className="text-xs text-[#6E89A8] leading-relaxed">{engine.feedback.feature.explanation}</p>
            {engine.feedback.feature.trap && (
              <div className="mt-2 p-2 bg-[rgba(251,191,36,0.08)] border-l-2 border-[#FBBF24] rounded text-xs text-[#FBBF24] leading-relaxed"
                   style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                <strong>⚡ TRAP:</strong> {engine.feedback.feature.trap}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BattleCompleteScreen({ engine }: { engine: ReturnType<typeof useFeatureWarsEngine> }) {
  const b = engine.battle;
  if (!b) return null;
  const isLast = engine.currentBattleIndex >= allBattles.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: 'rgba(4,8,18,0.94)', backdropFilter: 'blur(12px)', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <h2 className="text-[clamp(24px,6vw,36px)] font-extrabold mb-2" style={{fontFamily:"'Syne',sans-serif", color: engine.wrongCount === 0 ? '#34D399' : '#FBBF24'}}>
        {engine.wrongCount === 0 ? '⚡ CLEAN SWEEP!' : `${b.name} — Round Over`}
      </h2>
      <div className="text-6xl font-extrabold text-[#FBBF24] mb-2 leading-none" style={{fontFamily:"'Syne',sans-serif", textShadow: '0 0 30px rgba(251,191,36,0.4)'}}>
        {engine.score.toLocaleString()}
      </div>
      <p className="text-xs text-[#6E89A8] mb-6">
        {engine.correctCount} correct · {engine.wrongCount} wrong · {engine.multiFound} &quot;both&quot; found
      </p>

      <div className="flex gap-4 justify-center mb-6">
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-5 py-3 text-center min-w-[70px]">
          <div className="text-2xl font-extrabold text-[#34D399]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.correctCount}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Correct</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-5 py-3 text-center min-w-[70px]">
          <div className="text-2xl font-extrabold text-[#F87171]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.wrongCount}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Wrong</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#1E3550] rounded-lg px-5 py-3 text-center min-w-[70px]">
          <div className="text-2xl font-extrabold text-[#A78BFA]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.multiFound}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Both found</div>
        </div>
      </div>

      {engine.missedFeatures.length > 0 && (
        <div className="w-full max-w-sm mb-6 text-left">
          <p className="text-[10px] tracking-wider text-[#2E4A65] uppercase mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
            Missed ({engine.missedFeatures.length}) — review:
          </p>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
            {engine.missedFeatures.map((f) => (
              <div key={f.id} className="bg-[#0A1528] border-l-2 border-[#F87171] rounded-lg p-3 text-xs text-[#6E89A8] leading-relaxed">
                <strong className="text-[#CDD9E8] block mb-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{f.text}</strong>
                Belongs to: <span className="text-[#34D399]">{f.correctDiseaseIds.join(' + ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={engine.nextBattle}
        className="px-10 py-3 rounded-lg text-[#030812] font-extrabold text-sm tracking-wide cursor-pointer transition-all hover:-translate-y-0.5"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #22D3EE, #A78BFA)' }}
      >
        {isLast ? 'SEE FINAL SCORE →' : 'NEXT BATTLE →'}
      </button>
    </div>
  );
}

function FinalScreen({ engine }: { engine: ReturnType<typeof useFeatureWarsEngine> }) {
  const totalHits = engine.correctCount;
  const totalWrong = engine.wrongCount;
  const pct = totalHits + totalWrong > 0 ? Math.round((totalHits / (totalHits + totalWrong)) * 100) : 0;
  let title = 'REVISE & RETRY';
  let col = '#F87171';
  if (pct >= 90) { title = 'CONSULTANT-LEVEL'; col = '#34D399'; }
  else if (pct >= 75) { title = 'SOLID CLINICIAN'; col = '#22D3EE'; }
  else if (pct >= 55) { title = 'KEEP REVISING'; col = '#FBBF24'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: '#040812', fontFamily: "'DM Sans', sans-serif", color: '#CDD9E8' }}>
      <h2 className="text-[clamp(26px,7vw,44px)] font-extrabold mb-2" style={{fontFamily:"'Syne',sans-serif", color: col}}>{title}</h2>
      <div className="text-[80px] font-extrabold leading-none mb-4"
           style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {engine.score.toLocaleString()}
      </div>
      <div className="text-[13px] font-semibold px-5 py-1.5 rounded-full border mb-6 inline-block"
           style={{ color: col, borderColor: col }}>
        {pct}% accuracy
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-8">
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-3">
          <div className="text-[22px] font-extrabold text-[#34D399]" style={{fontFamily:"'Syne',sans-serif"}}>{totalHits}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Hits</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-3">
          <div className="text-[22px] font-extrabold text-[#F87171]" style={{fontFamily:"'Syne',sans-serif"}}>{totalWrong}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Wrong</div>
        </div>
        <div className="bg-[#0E1C35] border border-[#182A42] rounded-lg p-3">
          <div className="text-[22px] font-extrabold text-[#A78BFA]" style={{fontFamily:"'Syne',sans-serif"}}>{engine.multiFound}</div>
          <div className="text-[10px] text-[#2E4A65]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Both found</div>
        </div>
      </div>

      <button
        onClick={engine.restartGame}
        className="px-10 py-3 rounded-lg text-[#030812] font-extrabold text-sm tracking-wide cursor-pointer transition-all hover:-translate-y-0.5"
        style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #FBBF24, #F472B6)' }}
      >
        <Brain size={18} className="inline mr-2" />
        PLAY AGAIN
      </button>
    </div>
  );
}

export default function FeatureWarsPage() {
  const engine = useFeatureWarsEngine(allBattles);
  const stats = useMemo(() => getGameStats('feature-wars'), []);

  return (
    <ArcadeShell gameId="feature-wars" themeClass="theme-feature-wars">
      <GoogleFontsLoader families={['Syne:wght@700;800', 'IBM+Plex+Mono:wght@400;500;600', 'DM+Sans:wght@300;400;500;600']} />
      {engine.phase === 'splash' && <SplashScreen onStart={engine.startGame} highScore={stats.highScore} />}
      {engine.phase === 'battle' && <BattleScreen engine={engine} />}
      {engine.phase === 'battle-complete' && <BattleCompleteScreen engine={engine} />}
      {engine.phase === 'final' && <FinalScreen engine={engine} />}
    </ArcadeShell>
  );
}
