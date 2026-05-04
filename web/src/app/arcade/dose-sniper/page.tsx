/**
 * Dose Sniper Page v2 — Refactored with CSS screen transitions + imperative effects
 */

'use client';

import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { ArcadeScreen } from '@/components/ArcadeScreen';
import { useArcadeSession } from '@/hooks/useArcadeSession';
import { useSniperEngine, BASE_SPEED, MAX_SPEED } from './hooks/useSniperEngine';
import questionsData from './data/questions.json';
import { type SniperQuestion } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { useArcadeEffects } from '@/lib/arcade-effects';
import { updateGameStats } from '@/lib/arcade-storage';
import { Crosshair, Trophy } from 'lucide-react';

const allQuestions = questionsData as SniperQuestion[];
const CMULT_LABELS: Record<number, { text: string; color: string }> = {
  3: { text: 'TRIPLE ×1.5', color: '#FF6BF5' },
  5: { text: '× 3 COMBO!', color: '#FFB800' },
  7: { text: '× 4 GODMODE', color: '#22CCFF' },
};

// ─── Splash ──────────────────────────────────────────────────────────────────

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center relative"
         style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(34,204,255,0.06) 0%,transparent 55%), repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px)' }} />
      <div className="pointer-events-none fixed inset-0 z-[99]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)' }} />

      <h1 className="text-[clamp(42px,11vw,74px)] font-black mb-2 tracking-wide relative z-10 leading-none"
          style={{ fontFamily: "'Orbitron', monospace", color: '#22CCFF', textShadow: '0 0 30px rgba(34,204,255,.55), 0 0 80px rgba(34,204,255,.2)' }}>
        DOSE SNIPER
      </h1>
      <p className="text-[10px] sm:text-[11px] tracking-[0.22em] text-[#6B8BAA] uppercase mb-4 sm:mb-6 relative z-10" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        Falling Cards · Pediatric Dosing · PedsIQ
      </p>
      <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-[#22CCFF] to-transparent opacity-35 mb-4 sm:mb-6 relative z-10" />

      <div className="bg-[#0A1428] border border-[#243C5A] rounded-lg p-3 sm:p-4 max-w-sm mx-auto mb-4 sm:mb-6 text-left relative z-10 w-full">
        <p className="text-[11px] sm:text-xs text-[#6B8BAA] leading-relaxed">
          <strong className="text-[#22CCFF] font-semibold">Perceptual discrimination + motor encoding.</strong> Choosing between
          near-correct doses forces visual comparison that reading never does.
          The tap encodes procedural memory — your hand learns the answer.
        </p>
      </div>

      <div className="space-y-2 max-w-sm w-full mb-4 sm:mb-6 text-left relative z-10 px-2">
        {['Patient context and drug appear at the top', 'Three dose cards fall — tap the correct one before it hits the floor', 'Combos multiply your score. Each correct answer speeds up the next card.'].map((text, i) => (
          <div key={i} className="flex items-start gap-3 text-[11px] sm:text-xs text-[#6B8BAA]">
            <span className="text-[#22CCFF] font-bold text-sm pt-0.5 shrink-0" style={{fontFamily:"'Orbitron',monospace", width:20}}>{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 text-[10px] sm:text-xs text-[#1E3A5A] relative z-10" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        <div><span className="text-[#22CCFF] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>{allQuestions.length}</span>Rounds</div>
        <div><span className="text-[#22CCFF] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>×4</span>Max combo</div>
        <div><span className="text-[#22CCFF] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>∞</span>Speed</div>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-sm text-[#FFB800] relative z-10">
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button onClick={onStart} className="px-10 sm:px-12 py-3 sm:py-4 rounded text-[#03050E] font-bold text-sm tracking-wider uppercase cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98] relative z-10"
              style={{ fontFamily: "'Orbitron', monospace", background: '#22CCFF', boxShadow: '0 0 28px rgba(34,204,255,.45)' }}>
        LAUNCH →
      </button>
    </div>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function CountdownScreen({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center h-full" style={{ background: 'rgba(3,5,14,0.82)', fontFamily: "'Orbitron', monospace" }}>
      <div className="text-[clamp(80px,22vw,130px)] font-black text-[#22CCFF]"
           style={{ textShadow: '0 0 40px rgba(34,204,255,0.6)', animation: 'sniper-cdpop 0.8s ease' }}>
        {value === 0 ? 'GO!' : value}
      </div>
    </div>
  );
}

// ─── Game ────────────────────────────────────────────────────────────────────

function GameScreen({ engine, session }: { engine: ReturnType<typeof useSniperEngine>; session: ReturnType<typeof useArcadeSession> }) {
  const q = engine.q;
  const speedPct = Math.min(100, Math.max(4, ((engine.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)) * 100 + 4));
  const effects = useArcadeEffects();
  const prevComboRef = useRef(0);
  const missedRef = useRef<SniperQuestion[]>([]);

  // Trigger effects when feedback changes
  useEffect(() => {
    if (!engine.feedback) {
      prevComboRef.current = engine.combo;
      return;
    }

    const zone = engine.zoneRef.current;
    const zh = zone ? zone.offsetHeight / 2 : window.innerHeight / 2;
    const zw = zone ? zone.offsetWidth / 2 : window.innerWidth / 2;

    if (engine.feedback.type === 'ok') {
      const mult = [1, 1, 1.5, 2, 2.5, 3, 4][Math.min(engine.combo, 6)];
      const pts = Math.round(100 * mult);
      effects.popup(zw - 20, zh - 30, '+' + pts, '#FFB800');
      effects.particles(zw, zh, '#00FF94', 18);
      effects.flash('green');

      if (CMULT_LABELS[engine.combo]) {
        const surge = CMULT_LABELS[engine.combo];
        effects.surge(surge.text, surge.color);
      }
      if (engine.combo === 7) {
        effects.flashLevel();
      }
    } else {
      effects.particles(zw, zh, '#FF3B3B', 10);
      effects.flash('red');
    }

    // Track misses for results
    if (engine.feedback.type === 'bad' || engine.feedback.type === 'tmout') {
      missedRef.current.push(engine.feedback.q);
    }

    prevComboRef.current = engine.combo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.feedback]);

  // Update session score/combo
  useEffect(() => {
    if (engine.feedback?.type === 'ok') {
      const mult = [1, 1, 1.5, 2, 2.5, 3, 4][Math.min(prevComboRef.current, 6)];
      const pts = Math.round(100 * mult);
      session.setScore((s) => s + pts);
      session.setCorrectCount((c) => c + 1);
    } else if (engine.feedback?.type === 'bad' || engine.feedback?.type === 'tmout') {
      session.setWrongCount((w) => w + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.feedback]);

  if (!q) return null;

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      {/* Grid + scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(34,204,255,0.06) 0%,transparent 55%), repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px)' }} />
      <div className="pointer-events-none fixed inset-0 z-[99]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)' }} />

      {/* HUD — 3-col grid prevents layout shift when score/combo grow */}
      <div className="relative z-20 grid grid-cols-3 gap-2 px-3 sm:px-4 py-2 border-b border-[#1A2E4A]"
           style={{ background: 'rgba(7,14,31,0.7)', backdropFilter: 'blur(6px)' }}>
        <div className="text-left">
          <div className="text-[clamp(15px,4.5vw,22px)] font-bold text-[#FFB800] tabular-nums" style={{fontFamily:"'Orbitron',monospace"}}>{session.score.toLocaleString()}</div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Score</div>
        </div>
        <div className="text-center self-center">
          <div className="text-[clamp(15px,4.5vw,22px)] font-bold text-[#22CCFF] tabular-nums" style={{fontFamily:"'Orbitron',monospace"}}>
            {String(engine.currentRound + 1).padStart(2, '0')} / {allQuestions.length}
          </div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Round</div>
        </div>
        <div className="text-right">
          <div className="text-[clamp(15px,4.5vw,22px)] font-bold tabular-nums" style={{fontFamily:"'Orbitron',monospace", color: engine.combo >= 5 ? '#FFB800' : engine.combo >= 3 ? '#22CCFF' : '#FF6BF5'}}>
            ×{engine.combo}
          </div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Combo</div>
        </div>
      </div>

      {/* Velocity bar */}
      <div className="relative z-20 w-full h-[3px] bg-[#0D1835]">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${speedPct}%`, background: 'linear-gradient(90deg,#22CCFF,#FF6BF5)', boxShadow: '0 0 6px #22CCFF' }} />
      </div>

      {/* Question Panel */}
      <div className="relative z-20 px-3 sm:px-4 py-2 border-b border-[#1A2E4A]"
           style={{ background: 'rgba(7,14,31,0.6)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2 sm:gap-3 mb-1">
          <div className="text-[11px] sm:text-[13px] font-bold text-[#22CCFF]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q.context}</div>
          <div className="text-[10px] sm:text-xs text-[#6B8BAA]">{q.label}</div>
        </div>
        <div className="text-[clamp(11px,3.2vw,15px)] font-bold text-[#D8E8F8] mb-1 leading-tight" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q.drug}</div>
        <div className="text-[8px] sm:text-[9px] tracking-[0.15em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>▼ tap the correct dose before it hits the floor ▼</div>
      </div>

      {/* Fall Zone */}
      <div ref={engine.zoneRef} className="relative flex-1 overflow-hidden z-10">
        <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-center pointer-events-none"
             style={{ background: 'linear-gradient(0deg,rgba(255,59,59,0.07),transparent)', borderTop: '1px solid rgba(255,59,59,0.18)' }}>
          <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[rgba(255,59,59,0.25)] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>floor — miss zone</span>
        </div>
      </div>

      {/* Feedback Panel */}
      <FeedbackPanel feedback={engine.feedback} onNext={engine.nextRound} currentRound={engine.currentRound} totalRounds={allQuestions.length} />
    </div>
  );
}

// ─── Feedback Panel ──────────────────────────────────────────────────────────

function FeedbackPanel({ feedback, onNext, currentRound, totalRounds }: {
  feedback: { type: 'ok' | 'bad' | 'tmout'; q: SniperQuestion } | null;
  onNext: () => void;
  currentRound: number;
  totalRounds: number;
}) {
  const visible = !!feedback;
  const isLast = currentRound + 1 >= totalRounds;

  return (
    <>
      {/* Feedback — always mounted, translated off-screen when hidden */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none"
           style={{ transform: visible ? 'translateY(0)' : 'translateY(110%)', transition: 'transform 0.28s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
        {feedback && (
          <div className={`rounded-xl p-3 sm:p-4 max-w-lg mx-auto border pointer-events-auto
            ${feedback.type === 'ok' ? 'bg-[#001B0D] border-[#00FF94]' : feedback.type === 'bad' ? 'bg-[#180000] border-[#FF3B3B]' : 'bg-[#180E00] border-[#FFB800]'}`}
               style={{ boxShadow: feedback.type === 'ok' ? '0 0 22px rgba(0,255,148,0.12)' : feedback.type === 'bad' ? '0 0 22px rgba(255,59,59,0.12)' : '0 0 22px rgba(255,184,0,0.12)' }}>
            <div className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-2
              ${feedback.type === 'ok' ? 'text-[#00FF94]' : feedback.type === 'bad' ? 'text-[#FF3B3B]' : 'text-[#FFB800]'}`}
                 style={{fontFamily:"'Orbitron',monospace"}}>
              {feedback.type === 'ok' ? '✓ INTERCEPTED' : feedback.type === 'bad' ? '✗ WRONG DRUG' : '⏱ FLOOR HIT'}
            </div>
            <div className={`text-[13px] sm:text-[15px] font-bold mb-2 ${feedback.type === 'ok' ? 'text-[#00FF94]' : 'text-[#00FF94]'}`}
                 style={{fontFamily:"'IBM Plex Mono',monospace"}}>
              {feedback.type === 'ok' ? feedback.q.correctAnswer : `Correct: ${feedback.q.correctAnswer}`}
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B8BAA] leading-relaxed">{feedback.q.explanation}</p>
            {feedback.q.trap && (
              <div className="mt-2 p-2 bg-[rgba(255,184,0,0.07)] border-l-2 border-[#FFB800] rounded text-[11px] sm:text-xs text-[#FFB800] leading-relaxed"
                   style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                <strong>⚡ TRAP:</strong> {feedback.q.trap}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next button — always mounted, translated off-screen when hidden */}
      <div className="fixed bottom-24 sm:bottom-32 left-0 right-0 z-50 flex justify-center pointer-events-none"
           style={{ transform: visible ? 'translateY(0)' : 'translateY(200%)', transition: 'transform 0.28s cubic-bezier(0.175,0.885,0.32,1.275) 0.05s' }}>
        <button onClick={onNext}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-[#22CCFF] text-[#03050E] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all hover:-translate-y-0.5 pointer-events-auto"
                style={{fontFamily:"'Orbitron',monospace", boxShadow: '0 0 24px rgba(34,204,255,0.4)'}}>
          {isLast ? 'SEE RESULTS →' : 'NEXT →'}
        </button>
      </div>
    </>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsScreen({ score, hits, misses, maxCombo, onRestart, missedQuestions }: {
  score: number; hits: number; misses: number; maxCombo: number;
  onRestart: () => void; missedQuestions: SniperQuestion[];
}) {
  const pct = Math.round((hits / allQuestions.length) * 100);
  let title = 'REVISE & RETRY'; let col = '#FF3B3B';
  if (pct >= 92) { title = 'EXPERT SNIPER'; col = '#00FF94'; }
  else if (pct >= 72) { title = 'SOLID RECALL'; col = '#22CCFF'; }
  else if (pct >= 52) { title = 'KEEP TRAINING'; col = '#FFB800'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      <div className="pointer-events-none fixed inset-0 z-[99]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)' }} />
      <h2 className="text-[clamp(16px,5vw,26px)] font-black mb-2 relative z-10" style={{fontFamily:"'Orbitron',monospace", color: col}}>{title}</h2>
      <div className="text-[clamp(48px,16vw,88px)] font-black text-[#FFB800] mb-1 leading-none relative z-10"
           style={{fontFamily:"'Orbitron',monospace", textShadow: '0 0 30px rgba(255,184,0,0.4)'}}>{score.toLocaleString()}</div>
      <p className="text-[10px] sm:text-[11px] tracking-wider text-[#1E3A5A] mb-4 sm:mb-6 relative z-10" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{pct}% accuracy · max combo ×{maxCombo}</p>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-4 sm:mb-6 relative z-10 px-2">
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-bold text-[#00FF94]" style={{fontFamily:"'Orbitron',monospace"}}>{hits}</div>
          <div className="text-[9px] sm:text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Hit</div>
        </div>
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-bold text-[#FF3B3B]" style={{fontFamily:"'Orbitron',monospace"}}>{misses}</div>
          <div className="text-[9px] sm:text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Missed</div>
        </div>
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-2 sm:p-3">
          <div className="text-[18px] sm:text-[22px] font-bold text-[#FF6BF5]" style={{fontFamily:"'Orbitron',monospace"}}>{maxCombo}</div>
          <div className="text-[9px] sm:text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Max ×</div>
        </div>
      </div>

      {missedQuestions.length > 0 && (
        <div className="w-full max-w-sm mb-4 sm:mb-6 relative z-10 px-2">
          <p className="text-[10px] sm:text-[11px] tracking-wider text-[#1E3A5A] uppercase text-left mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Missed — study these:</p>
          <div className="flex flex-col gap-2 max-h-36 sm:max-h-40 overflow-y-auto pr-1 arcade-scroll-thin">
            {missedQuestions.map((q) => (
              <div key={q.id} className="bg-[#0A1428] border-l-2 border-[#FF3B3B] rounded-lg p-2 sm:p-3 text-left text-[11px] sm:text-xs leading-relaxed">
                <strong className="text-[#D8E8F8] block mb-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q.drug}</strong>
                <span className="text-[#6B8BAA]">{q.context}</span><br />
                <span className="text-[#00FF94]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Answer: {q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRestart}
              className="px-8 sm:px-10 py-2.5 sm:py-3 rounded text-[#03050E] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all hover:-translate-y-0.5 relative z-10"
              style={{ fontFamily: "'Orbitron', monospace", background: '#22CCFF', boxShadow: '0 0 24px rgba(34,204,255,0.4)' }}>
        <Crosshair size={16} className="inline mr-2" /> PLAY AGAIN
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DoseSniperPage() {
  const stats = useMemo(() => getGameStats('dose-sniper'), []);
  const effects = useArcadeEffects();
  const missedRef = useRef<SniperQuestion[]>([]);

  const handleGameStart = useCallback(() => {
    missedRef.current = [];
  }, []);

  const session = useArcadeSession({
    gameId: 'dose-sniper',
    totalQuestions: allQuestions.length,
    onStart: handleGameStart,
  });

  const engine = useSniperEngine(allQuestions);

  // Initialize game when entering playing phase
  useEffect(() => {
    if (session.phase === 'playing') {
      engine.initGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase]);

  // Handle game end
  useEffect(() => {
    if (engine.feedback && engine.currentRound + 1 >= allQuestions.length) {
      // Last round completed - save stats when results shown
    }
  }, [engine.feedback, engine.currentRound]);

  const handleRestart = useCallback(() => {
    missedRef.current = [];
    session.startGame();
    engine.initGame();
  }, [session, engine]);

  const handleSaveResults = useCallback(() => {
    const arcadeSession = session.endGame();
    const missed = missedRef.current.map((q) => ({
      questionId: q.id,
      gameId: 'dose-sniper' as const,
      text: `${q.drug} · ${q.context}`,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      trap: q.trap,
      addedAt: new Date().toISOString(),
    }));
    updateGameStats('dose-sniper', arcadeSession, missed);
  }, [session]);

  // Save when entering results
  useEffect(() => {
    if (session.phase === 'results') {
      handleSaveResults();
    }
  }, [session.phase, handleSaveResults]);

  return (
    <ArcadeShell gameId="dose-sniper" themeClass="theme-dose-sniper">
      <GoogleFontsLoader families={['Orbitron:wght@700;900', 'IBM+Plex+Mono:wght@400;600;700', 'DM+Sans:wght@400;500;600']} />
      <div className="relative w-full h-[100dvh]">
        <ArcadeScreen phase="splash" activePhase={session.phase}>
          <SplashScreen onStart={session.startGame} highScore={stats.highScore} />
        </ArcadeScreen>

        <ArcadeScreen phase="countdown" activePhase={session.phase}>
          <CountdownScreen value={session.countdownValue} />
        </ArcadeScreen>

        <ArcadeScreen phase="playing" activePhase={session.phase} className="game-layout">
          <GameScreen engine={engine} session={session} />
        </ArcadeScreen>

        <ArcadeScreen phase="results" activePhase={session.phase}>
          <ResultsScreen
            score={session.score}
            hits={session.correctCount}
            misses={session.wrongCount}
            maxCombo={engine.maxCombo}
            onRestart={handleRestart}
            missedQuestions={missedRef.current}
          />
        </ArcadeScreen>
      </div>
    </ArcadeShell>
  );
}
