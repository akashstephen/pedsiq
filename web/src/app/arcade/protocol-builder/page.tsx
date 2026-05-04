/**
 * Protocol Builder — Reconstruct pediatric management algorithms from scrambled steps
 * Learning mechanism: Generation effect + spatial encoding
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { getGameStats, updateGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import protocolsData from './data/protocols.json';
import { type ProtocolBuilderProtocol } from '@/types/arcade';
import { FlaskConical, Trophy, ArrowRight, RotateCcw } from 'lucide-react';

const PROTOCOLS = protocolsData as ProtocolBuilderProtocol[];

function shuf<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ══════════════════════════════════════════════════
// SPLASH
// ══════════════════════════════════════════════════
function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#06080F', fontFamily: "'DM Sans', sans-serif", color: '#C8D8EC' }}>
      <div className="inline-block px-3.5 py-1 rounded-full border text-[10px] tracking-[0.25em] uppercase mb-4"
           style={{ borderColor: '#1F3254', color: '#243650', fontFamily: "'JetBrains Mono', monospace" }}>
        PedsIQ · Protocol Reconstruction
      </div>
      <h1 className="mb-2 leading-[0.9] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(46px, 12vw, 76px)', fontWeight: 700, color: '#C8D8EC' }}>
        Protocol<br /><em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Builder</em>
      </h1>
      <div className="w-[60px] h-px mx-auto mb-4"
           style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
      <p className="text-sm max-w-[330px] mx-auto mb-4 leading-relaxed" style={{ color: '#5A7899' }}>
        Reconstruct each management algorithm from scratch. Empty slots on the left — scrambled steps on the right.
      </p>

      <div className="bg-[#0C1222] border border-[#1F3254] rounded-lg p-3 sm:p-4 max-w-[340px] mx-auto mb-5 text-left w-full text-xs leading-relaxed"
           style={{ color: '#5A7899' }}>
        <strong style={{ color: '#1FB8C0' }}>Generation effect + spatial encoding.</strong> Constructing a structure
        encodes it spatially, not just verbally. Patients who build recall maps score
        ~35% higher than those who highlight. The act of placing each step creates
        a causal trace you simply cannot get from reading.
      </div>

      <div className="flex flex-col gap-2 w-full max-w-[340px] mb-5">
        {PROTOCOLS.map((p, i) => (
          <div key={p.id} className="bg-[#0C1222] border border-[#1F3254] rounded-lg px-3.5 py-2.5 flex items-center gap-3 text-left">
            <div className="text-[13px] font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: p.color, width: 22 }}>
              {['①','②','③','④'][i]}
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: '#C8D8EC' }}>{p.name}</div>
              <div className="text-[10px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>
                {p.steps.length} steps · {p.sub.split('·')[1]?.trim() || p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#C9A84C' }}>
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button onClick={onStart}
              className="px-14 py-3.5 rounded-md text-[#06080F] font-bold text-base tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ fontFamily: "'Fraunces', serif", background: 'linear-gradient(135deg, #C9A84C, #E8C96A)', boxShadow: '0 0 32px rgba(201,168,76,.3)' }}>
        BUILD PROTOCOLS →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════
// GAME
// ══════════════════════════════════════════════════
interface GameState {
  pIdx: number;
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalPerfect: number;
  selectedCard: { id: string; realIdx: number } | null;
  slotFilled: (number | string)[];
  wrongCount: number;
  perfectCount: number;
  correctCount: number;
}

function GameScreen({
  state, setState, onComplete, onAllComplete
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  onComplete: () => void;
  onAllComplete: () => void;
}) {
  const p = PROTOCOLS[state.pIdx];
  const [shuffledSteps, setShuffledSteps] = useState<{ id: string; text: string; tag: string; trap?: string; realIdx: number }[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  const [scorePops, setScorePops] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [slotFlash, setSlotFlash] = useState<Record<number, 'correct' | 'wrong'>>({});
  const [cardShake, setCardShake] = useState<string | null>(null);

  useEffect(() => {
    const s = shuf(p.steps.map((st, i) => ({ ...st, realIdx: i })));
    setShuffledSteps(s);
  }, [state.pIdx]);

  const protocolFrac = p.steps.length > 0 ? state.correctCount / p.steps.length : 0;

  const handleCardClick = useCallback((stepId: string, realIdx: number) => {
    setState(prev => {
      if (!prev.selectedCard || prev.selectedCard.id !== stepId) {
        return { ...prev, selectedCard: { id: stepId, realIdx } };
      }
      return { ...prev, selectedCard: null };
    });
  }, [setState]);

  const handleSlotClick = useCallback((slotIdx: number) => {
    setState(prev => {
      if (!prev.selectedCard) return prev;
      const isCorrect = prev.selectedCard.realIdx === slotIdx;

      if (isCorrect) {
        const wasFirstTry = !prev.slotFilled.includes('tried-' + slotIdx);
        const pts = wasFirstTry ? 15 : 5;
        const newSlotFilled = [...prev.slotFilled, slotIdx];
        const newCorrectCount = prev.correctCount + 1;
        const newPerfectCount = wasFirstTry ? prev.perfectCount + 1 : prev.perfectCount;
        const newScore = prev.score + pts;
        const newTotalCorrect = prev.totalCorrect + 1;

        // Flash green
        setFlashColor('rgba(61,191,138,.09)');
        setTimeout(() => setFlashColor(''), 150);

        // Score pop
        const id = Date.now() + Math.random();
        setScorePops(sp => [...sp, { id, x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 40, text: '+' + pts, color: wasFirstTry ? '#C9A84C' : '#3DBF8A' }]);
        setTimeout(() => setScorePops(sp => sp.filter(s => s.id !== id)), 780);

        // Slot flash
        setSlotFlash(f => ({ ...f, [slotIdx]: 'correct' }));
        setTimeout(() => setSlotFlash(f => { const n = { ...f }; delete n[slotIdx]; return n; }), 500);

        if (newCorrectCount === p.steps.length) {
          setTimeout(() => {
            setShowCompletion(true);
          }, 800);
        }

        return {
          ...prev,
          score: newScore,
          totalCorrect: newTotalCorrect,
          perfectCount: newPerfectCount,
          correctCount: newCorrectCount,
          slotFilled: newSlotFilled,
          selectedCard: null,
        };
      } else {
        // Wrong placement
        setFlashColor('rgba(224,82,82,.1)');
        setTimeout(() => setFlashColor(''), 150);
        setSlotFlash(f => ({ ...f, [slotIdx]: 'wrong' }));
        setTimeout(() => setSlotFlash(f => { const n = { ...f }; delete n[slotIdx]; return n; }), 380);
        setCardShake(prev.selectedCard.id);
        setTimeout(() => setCardShake(null), 320);

        const newSlotFilled = prev.slotFilled.includes('tried-' + slotIdx)
          ? prev.slotFilled
          : [...prev.slotFilled, 'tried-' + slotIdx];

        return {
          ...prev,
          score: Math.max(0, prev.score - 3),
          wrongCount: prev.wrongCount + 1,
          totalWrong: prev.totalWrong + 1,
          slotFilled: newSlotFilled,
          selectedCard: null,
        };
      }
    });
  }, [p.steps.length, setState]);

  const nextProtocol = useCallback(() => {
    setShowCompletion(false);
    setState(prev => {
      const isLast = prev.pIdx >= PROTOCOLS.length - 1;
      if (isLast) {
        setTimeout(onAllComplete, 100);
        return prev;
      }
      return {
        ...prev,
        pIdx: prev.pIdx + 1,
        selectedCard: null,
        slotFilled: [],
        wrongCount: 0,
        perfectCount: 0,
        correctCount: 0,
        totalPerfect: prev.totalPerfect + prev.perfectCount,
      };
    });
  }, [setState, onAllComplete]);

  const reviewProtocol = useCallback(() => {
    setShowCompletion(false);
  }, []);

  const isSlotFilled = (idx: number) => state.slotFilled.includes(idx);
  const isCardUsed = (stepId: string) => {
    const step = shuffledSteps.find(s => s.id === stepId);
    if (!step) return false;
    return isSlotFilled(step.realIdx);
  };

  const pct = p.steps.length > 0 ? Math.round((state.perfectCount / p.steps.length) * 100) : 0;
  let grade: string;
  if (state.wrongCount === 0) grade = '⚡ PERFECT PROTOCOL';
  else if (pct >= 70) grade = 'Strong Build';
  else grade = 'Review Needed';

  return (
    <div className="flex flex-col h-full w-full relative" style={{ background: '#06080F', fontFamily: "'DM Sans', sans-serif", color: '#C8D8EC' }}>
      {/* Flash overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-150"
           style={{ background: flashColor, opacity: flashColor ? 1 : 0 }} />

      {/* Score pops */}
      {scorePops.map(sp => (
        <div key={sp.id} className="fixed pointer-events-none z-50 text-lg font-bold"
             style={{ left: sp.x, top: sp.y, color: sp.color, fontFamily: "'JetBrains Mono', monospace",
                      animation: 'spopA 0.75s ease forwards' }}>
          {sp.text}
        </div>
      ))}

      {/* Top bar */}
      <div className="w-full shrink-0 flex items-center justify-between px-3.5 py-2 z-20"
           style={{ background: 'rgba(6,8,15,.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #182640' }}>
        <div>
          <div className="font-semibold text-sm sm:text-base max-w-[200px] leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>{p.name}</div>
          <div className="text-[9px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650', letterSpacing: '0.1em' }}>{p.sub}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C' }}>{state.score.toLocaleString()}</div>
          <div className="text-[9px] mt-px" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650', letterSpacing: '0.1em' }}>SCORE</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[3px] shrink-0 overflow-hidden" style={{ background: '#14203C' }}>
        <div className="h-full transition-[width] duration-400 ease-out"
             style={{ width: `${protocolFrac * 100}%`, background: 'linear-gradient(90deg, #1FB8C0, #C9A84C)', boxShadow: '0 0 8px #1FB8C0' }} />
      </div>

      {/* Instruction bar */}
      <div className="w-full shrink-0 flex items-center justify-center px-3 py-1.5"
           style={{ background: '#090D1A', borderBottom: '1px solid #182640' }}>
        <div className="text-[10px] text-center leading-snug" style={{ fontFamily: "'JetBrains Mono', monospace", color: state.selectedCard ? '#C9A84C' : '#243650', letterSpacing: '0.08em' }}>
          {state.selectedCard ? 'Step selected — now tap the correct numbered slot ↑' : 'Tap a step from the right bank, then tap the correct numbered slot'}
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden w-full min-h-0">
        {/* LEFT: Slots */}
        <div className="w-[55%] shrink-0 overflow-y-auto px-2.5 py-2.5 flex flex-col gap-1.5"
             style={{ scrollbarWidth: 'thin' }}>
          {p.steps.map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div className="flex items-center justify-start pl-[18px] h-3.5 shrink-0">
                  <div className="w-px h-full" style={{ background: isSlotFilled(i - 1) ? '#1FB8C0' : '#1F3254', boxShadow: isSlotFilled(i - 1) ? '0 0 4px #1FB8C0' : 'none' }} />
                </div>
              )}
              <button
                onClick={() => handleSlotClick(i)}
                disabled={isSlotFilled(i)}
                className={`flex items-start gap-2 px-2.5 py-2 rounded-lg text-left relative w-full transition-all duration-200 min-h-[52px] ${
                  isSlotFilled(i)
                    ? 'border-solid cursor-default'
                    : state.selectedCard
                      ? 'hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.06)] hover:shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                      : ''
                } ${slotFlash[i] === 'wrong' ? 'animate-[slotWrong_0.35s_ease]' : ''} ${slotFlash[i] === 'correct' ? 'animate-[slotOk_0.45s_ease]' : ''}`}
                style={{
                  border: isSlotFilled(i) ? '1.5px solid #3DBF8A' : '1.5px dashed #1F3254',
                  background: isSlotFilled(i) ? 'rgba(61,191,138,0.05)' : '#0D1628',
                }}
              >
                <div className="text-[11px] font-bold pt-0.5 shrink-0 leading-none w-[18px]"
                     style={{ fontFamily: "'JetBrains Mono', monospace", color: isSlotFilled(i) ? '#3DBF8A' : '#243650' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 text-[11.5px] leading-snug pr-5" style={{ color: isSlotFilled(i) ? '#C8D8EC' : '#5A7899' }}>
                  {isSlotFilled(i) ? (
                    <>
                      {step.text}
                      {step.trap && (
                        <div className="mt-1.5 px-2 py-1 rounded text-[10px] leading-snug"
                             style={{ background: 'rgba(201,168,76,0.08)', borderLeft: '2px solid #C9A84C', color: '#C9A84C' }}>
                          ⚠ {step.trap}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[9px] italic" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>
                      empty — place step {i + 1} here
                    </span>
                  )}
                </div>
                {isSlotFilled(i) && (
                  <div className="absolute right-2 top-2 text-[13px]" style={{ color: '#3DBF8A' }}>✓</div>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px shrink-0 my-1.5" style={{ background: '#182640' }} />

        {/* RIGHT: Bank */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 flex flex-col gap-1"
             style={{ scrollbarWidth: 'thin' }}>
          <div className="text-[9px] uppercase pb-1.5 mb-0.5 shrink-0"
               style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650', letterSpacing: '0.15em', borderBottom: '1px solid #182640' }}>
            Step Bank — scrambled
          </div>
          {shuffledSteps.map((step) => {
            const used = isCardUsed(step.id);
            const selected = state.selectedCard?.id === step.id;
            const isShaking = cardShake === step.id;
            return (
              <button
                key={step.id}
                onClick={() => !used && handleCardClick(step.id, step.realIdx)}
                disabled={used}
                className={`text-left rounded-lg px-2.5 py-2 transition-all duration-150 select-none w-full ${
                  used ? 'opacity-0 pointer-events-none' : ''
                } ${selected ? 'scale-[1.02]' : ''} ${isShaking ? 'animate-[cardShake_0.3s_ease]' : ''}`}
                style={{
                  background: selected ? 'rgba(201,168,76,0.08)' : '#101830',
                  border: selected ? '1.5px solid #C9A84C' : '1.5px solid #1F3254',
                  boxShadow: selected ? '0 0 14px rgba(201,168,76,0.2)' : 'none',
                }}
              >
                <div className="text-[11.5px] leading-snug" style={{ color: '#C8D8EC' }}>{step.text}</div>
                <div className="text-[8px] uppercase mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650', letterSpacing: '0.1em' }}>
                  {step.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Overlay */}
      {showCompletion && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center transition-opacity duration-400"
             style={{ background: 'rgba(6,8,15,.88)', backdropFilter: 'blur(10px)' }}>
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1FB8C0' }}>
            Protocol {state.pIdx + 1} of {PROTOCOLS.length}
          </div>
          <div className="font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 7vw, 42px)', color: '#C8D8EC' }}>
            {grade}
          </div>
          <div className="text-[52px] font-bold leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C', textShadow: '0 0 24px rgba(201,168,76,.35)' }}>
            {state.score.toLocaleString()}
          </div>
          <div className="text-[13px]" style={{ color: '#5A7899' }}>
            {state.perfectCount}/{p.steps.length} first-try correct · {state.wrongCount} wrong attempts
          </div>

          <div className="flex gap-3.5 justify-center">
            <div className="bg-[#0C1222] border border-[#1F3254] rounded-lg px-4 py-2.5 text-center">
              <div className="text-[22px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3DBF8A' }}>{state.correctCount}</div>
              <div className="text-[10px] mt-px" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>CORRECT</div>
            </div>
            <div className="bg-[#0C1222] border border-[#1F3254] rounded-lg px-4 py-2.5 text-center">
              <div className="text-[22px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#E05252' }}>{state.wrongCount}</div>
              <div className="text-[10px] mt-px" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>WRONG TRIES</div>
            </div>
            <div className="bg-[#0C1222] border border-[#1F3254] rounded-lg px-4 py-2.5 text-center">
              <div className="text-[22px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C' }}>{state.perfectCount}</div>
              <div className="text-[10px] mt-px" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>PERFECT</div>
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap justify-center">
            <button onClick={nextProtocol}
                    className="px-7 py-3 rounded-md text-white font-semibold text-sm cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ fontFamily: "'Fraunces', serif", background: 'linear-gradient(135deg, #1FB8C0, #8B6FE8)' }}>
              {state.pIdx >= PROTOCOLS.length - 1 ? 'SEE FINAL SCORE →' : 'NEXT PROTOCOL →'}
            </button>
            <button onClick={reviewProtocol}
                    className="px-7 py-3 rounded-md text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ fontFamily: "'Fraunces', serif", background: '#0F1C30', border: '1px solid #1F3254', color: '#C8D8EC' }}>
              REVIEW STEPS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════════
function ResultsScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const totalSteps = PROTOCOLS.reduce((s, p) => s + p.steps.length, 0);
  const pct = Math.round((state.totalCorrect / totalSteps) * 100);
  let title: string, col: string;
  if (pct >= 90) { title = 'Attending Physician'; col = '#3DBF8A'; }
  else if (pct >= 75) { title = 'Senior Registrar'; col = '#1FB8C0'; }
  else if (pct >= 55) { title = 'House Officer'; col = '#C9A84C'; }
  else { title = 'Intern — keep building'; col = '#E05252'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#06080F', fontFamily: "'DM Sans', sans-serif", color: '#C8D8EC' }}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>
        All Protocols Complete
      </div>
      <h2 className="font-bold mb-2 leading-none" style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(30px, 8vw, 50px)' }}>
        Well<br /><em style={{ color: '#C9A84C', fontStyle: 'italic' }}>done, Doctor.</em>
      </h2>
      <div className="text-[72px] font-bold leading-none mb-2"
           style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C', textShadow: '0 0 30px rgba(201,168,76,.4)' }}>
        {state.score.toLocaleString()}
      </div>
      <p className="text-[13px] mb-5" style={{ color: '#5A7899' }}>
        {title} · {pct}% accuracy
      </p>

      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[360px] mb-6">
        <div className="bg-[#0C1222] border border-[#182640] rounded-lg px-1.5 py-2.5 text-center">
          <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3DBF8A' }}>{state.totalCorrect}</div>
          <div className="text-[10px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>CORRECT</div>
        </div>
        <div className="bg-[#0C1222] border border-[#182640] rounded-lg px-1.5 py-2.5 text-center">
          <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#E05252' }}>{state.totalWrong}</div>
          <div className="text-[10px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>WRONG</div>
        </div>
        <div className="bg-[#0C1222] border border-[#182640] rounded-lg px-1.5 py-2.5 text-center">
          <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C' }}>{state.totalPerfect + state.perfectCount}</div>
          <div className="text-[10px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#243650' }}>PERFECT STEPS</div>
        </div>
      </div>

      <button onClick={onRestart}
              className="px-11 py-3 rounded-md text-[#06080F] font-bold text-sm tracking-wide cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ fontFamily: "'Fraunces', serif", background: 'linear-gradient(135deg, #C9A84C, #E8C96A)', boxShadow: '0 0 32px rgba(201,168,76,.3)' }}>
        <RotateCcw size={16} className="inline mr-2" />
        REBUILD ALL →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════
export default function ProtocolBuilderPage() {
  const stats = useMemo(() => getGameStats('protocol-builder'), []);

  const [phase, setPhase] = useState<'splash' | 'playing' | 'results'>('splash');
  const [gameState, setGameState] = useState<GameState>({
    pIdx: 0,
    score: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalPerfect: 0,
    selectedCard: null,
    slotFilled: [],
    wrongCount: 0,
    perfectCount: 0,
    correctCount: 0,
  });

  const startGame = useCallback(() => {
    setGameState({
      pIdx: 0,
      score: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalPerfect: 0,
      selectedCard: null,
      slotFilled: [],
      wrongCount: 0,
      perfectCount: 0,
      correctCount: 0,
    });
    setPhase('playing');
  }, []);

  const handleAllComplete = useCallback(() => {
    // Save stats
    const finalState = {
      ...gameState,
      totalPerfect: gameState.totalPerfect + gameState.perfectCount,
    };
    const session = {
      id: 'pb_' + Date.now().toString(36),
      gameId: 'protocol-builder' as const,
      score: finalState.score,
      correctCount: finalState.totalCorrect,
      wrongCount: finalState.totalWrong,
      totalQuestions: PROTOCOLS.reduce((s, p) => s + p.steps.length, 0),
      accuracyPct: Math.round((finalState.totalCorrect / (finalState.totalCorrect + finalState.totalWrong || 1)) * 100),
      durationMs: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    updateGameStats('protocol-builder', session, []);
    setPhase('results');
  }, [gameState]);

  return (
    <ArcadeShell gameId="protocol-builder" themeClass="theme-protocol-builder">
      <GoogleFontsLoader families={['Fraunces:wght@300;600;700', 'JetBrains+Mono:wght@400;600;700', 'DM+Sans:wght@300;400;500;600']} />
      <div className="relative w-full h-[100dvh]">
        {/* Splash */}
        <div className={`arcade-screen ${phase === 'splash' ? '' : 'hidden-down'}`}>
          <SplashScreen onStart={startGame} highScore={stats.highScore} />
        </div>

        {/* Playing */}
        <div className={`arcade-screen game-layout ${phase === 'playing' ? '' : 'hidden-down'}`}>
          {phase === 'playing' && (
            <GameScreen
              state={gameState}
              setState={setGameState}
              onComplete={() => {}}
              onAllComplete={handleAllComplete}
            />
          )}
        </div>

        {/* Results */}
        <div className={`arcade-screen ${phase === 'results' ? '' : 'hidden-down'}`}>
          <ResultsScreen state={gameState} onRestart={startGame} />
        </div>
      </div>
    </ArcadeShell>
  );
}
