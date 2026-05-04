/**
 * Dose Sniper Page — Falling-card pediatric dosing game
 */

'use client';

import { useMemo } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { useSniperEngine, BASE_SPEED, MAX_SPEED } from './hooks/useSniperEngine';
import questionsData from './data/questions.json';
import { type SniperQuestion } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { Crosshair, Zap, Trophy, Target } from 'lucide-react';

const allQuestions = questionsData as SniperQuestion[];

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center relative"
         style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 4px)' }} />

      <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-wide relative z-10"
          style={{ fontFamily: "'Orbitron', monospace", color: '#22CCFF', textShadow: '0 0 30px rgba(34,204,255,.55), 0 0 80px rgba(34,204,255,.2)' }}>
        DOSE SNIPER
      </h1>
      <p className="text-[11px] tracking-[0.22em] text-[#6B8BAA] uppercase mb-6 relative z-10" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        Falling Cards · Pediatric Dosing · PedsIQ
      </p>
      <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-[#22CCFF] to-transparent opacity-35 mb-6 relative z-10" />

      <div className="bg-[#0A1428] border border-[#243C5A] rounded-lg p-4 max-w-sm mx-auto mb-6 text-left relative z-10">
        <p className="text-xs text-[#6B8BAA] leading-relaxed">
          <strong className="text-[#22CCFF] font-semibold">Perceptual discrimination + motor encoding.</strong> Choosing between
          near-correct doses forces visual comparison that reading never does.
          The tap encodes procedural memory — your hand learns the answer.
        </p>
      </div>

      <div className="space-y-2 max-w-sm w-full mb-6 text-left relative z-10">
        <div className="flex items-start gap-3 text-xs text-[#6B8BAA]">
          <span className="text-[#22CCFF] font-bold text-sm pt-0.5" style={{fontFamily:"'Orbitron',monospace", width:20}}>1</span>
          <span>Patient context and drug appear at the top</span>
        </div>
        <div className="flex items-start gap-3 text-xs text-[#6B8BAA]">
          <span className="text-[#22CCFF] font-bold text-sm pt-0.5" style={{fontFamily:"'Orbitron',monospace", width:20}}>2</span>
          <span>Three dose cards fall — tap the correct one before it hits the floor</span>
        </div>
        <div className="flex items-start gap-3 text-xs text-[#6B8BAA]">
          <span className="text-[#22CCFF] font-bold text-sm pt-0.5" style={{fontFamily:"'Orbitron',monospace", width:20}}>3</span>
          <span>Combos multiply your score. Each correct answer speeds up the next card.</span>
        </div>
      </div>

      <div className="flex gap-8 mb-8 text-xs text-[#1E3A5A] relative z-10" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        <div><span className="text-[#22CCFF] text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>{allQuestions.length}</span>Rounds</div>
        <div><span className="text-[#22CCFF] text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>×4</span>Max combo</div>
        <div><span className="text-[#22CCFF] text-xl font-bold block" style={{fontFamily:"'Orbitron',monospace"}}>∞</span>Speed</div>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-[#FFB800] relative z-10">
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button
        onClick={onStart}
        className="px-12 py-4 rounded text-[#03050E] font-bold text-sm tracking-wider uppercase cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98] relative z-10"
        style={{ fontFamily: "'Orbitron', monospace", background: '#22CCFF', boxShadow: '0 0 28px rgba(34,204,255,.45)' }}
      >
        LAUNCH →
      </button>
    </div>
  );
}

function CountdownScreen({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center min-h-screen"
         style={{ background: 'rgba(3,5,14,0.82)', fontFamily: "'Orbitron', monospace" }}>
      <div className="text-[clamp(80px,22vw,130px)] font-black text-[#22CCFF]"
           style={{ textShadow: '0 0 40px rgba(34,204,255,0.6)', animation: 'cdpop 0.8s ease' }}>
        {value === 0 ? 'GO!' : value}
      </div>
    </div>
  );
}

function GameScreen({
  engine,
}: {
  engine: ReturnType<typeof useSniperEngine>;
}) {
  const q = engine.questions[engine.currentRound];
  const speedPct = Math.min(100, Math.max(4, ((engine.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)) * 100 + 4));

  return (
    <div className="flex flex-col min-h-screen relative"
         style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(34,204,255,0.06) 0%,transparent 55%), repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(34,204,255,0.018) 40px)' }} />
      <div className="pointer-events-none fixed inset-0 z-[99]"
           style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)' }} />

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-[#1A2E4A]"
           style={{ background: 'rgba(7,14,31,0.7)', backdropFilter: 'blur(6px)' }}>
        <div>
          <div className="text-[clamp(17px,4.5vw,22px)] font-bold text-[#FFB800]" style={{fontFamily:"'Orbitron',monospace"}}>{engine.score.toLocaleString()}</div>
          <div className="text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Score</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-[clamp(17px,4.5vw,22px)] font-bold text-[#22CCFF]" style={{fontFamily:"'Orbitron',monospace"}}>
            {String(engine.currentRound + 1).padStart(2, '0')} / {allQuestions.length}
          </div>
          <div className="text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Round</div>
        </div>
        <div className="text-right">
          <div className="text-[clamp(17px,4.5vw,22px)] font-bold" style={{fontFamily:"'Orbitron',monospace", color: engine.combo >= 5 ? '#FFB800' : engine.combo >= 3 ? '#22CCFF' : '#FF6BF5'}}>
            ×{engine.combo}
          </div>
          <div className="text-[9px] tracking-[0.14em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Combo</div>
        </div>
      </div>

      {/* Velocity bar */}
      <div className="relative z-20 w-full h-[3px] bg-[#0D1835]">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${speedPct}%`, background: 'linear-gradient(90deg,#22CCFF,#FF6BF5)', boxShadow: '0 0 6px #22CCFF' }} />
      </div>

      {/* Question Panel */}
      <div className="relative z-20 px-4 py-2 border-b border-[#1A2E4A]"
           style={{ background: 'rgba(7,14,31,0.6)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="text-[13px] font-bold text-[#22CCFF]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q?.context}</div>
          <div className="text-xs text-[#6B8BAA]">{q?.label}</div>
        </div>
        <div className="text-[clamp(12px,3.2vw,15px)] font-bold text-[#D8E8F8] mb-1 leading-tight" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q?.drug}</div>
        <div className="text-[9px] tracking-[0.15em] text-[#1E3A5A] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>▼ tap the correct dose before it hits the floor ▼</div>
      </div>

      {/* Fall Zone */}
      <div ref={engine.zoneRef} className="relative flex-1 overflow-hidden z-10">
        <div className="absolute bottom-0 left-0 right-0 h-9 flex items-center justify-center pointer-events-none"
             style={{ background: 'linear-gradient(0deg,rgba(255,59,59,0.07),transparent)', borderTop: '1px solid rgba(255,59,59,0.18)' }}>
          <span className="text-[9px] tracking-[0.2em] text-[rgba(255,59,59,0.25)] uppercase" style={{fontFamily:"'IBM Plex Mono',monospace"}}>floor — miss zone</span>
        </div>
      </div>

      {/* Feedback Panel */}
      {engine.feedback && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 transition-transform duration-300"
             style={{ transform: 'translateY(0)' }}>
          <div className={`rounded-xl p-4 max-w-lg mx-auto border
            ${engine.feedback.type === 'ok' ? 'bg-[#001B0D] border-[#00FF94]' : engine.feedback.type === 'bad' ? 'bg-[#180000] border-[#FF3B3B]' : 'bg-[#180E00] border-[#FFB800]'}`}
               style={{ boxShadow: engine.feedback.type === 'ok' ? '0 0 22px rgba(0,255,148,0.12)' : engine.feedback.type === 'bad' ? '0 0 22px rgba(255,59,59,0.12)' : '0 0 22px rgba(255,184,0,0.12)' }}>
            <div className={`text-[11px] font-bold tracking-wider uppercase mb-2
              ${engine.feedback.type === 'ok' ? 'text-[#00FF94]' : engine.feedback.type === 'bad' ? 'text-[#FF3B3B]' : 'text-[#FFB800]'}`}
                 style={{fontFamily:"'Orbitron',monospace"}}>
              {engine.feedback.type === 'ok' ? '✓ INTERCEPTED' : engine.feedback.type === 'bad' ? '✗ WRONG DRUG' : '⏱ FLOOR HIT'}
            </div>
            <div className={`text-[15px] font-bold mb-2 ${engine.feedback.type === 'ok' ? 'text-[#00FF94]' : 'text-[#00FF94]'}`}
                 style={{fontFamily:"'IBM Plex Mono',monospace"}}>
              {engine.feedback.type === 'ok' ? engine.feedback.q.correctAnswer : `Correct: ${engine.feedback.q.correctAnswer}`}
            </div>
            <p className="text-xs text-[#6B8BAA] leading-relaxed">{engine.feedback.q.explanation}</p>
            {engine.feedback.q.trap && (
              <div className="mt-2 p-2 bg-[rgba(255,184,0,0.07)] border-l-2 border-[#FFB800] rounded text-xs text-[#FFB800] leading-relaxed"
                   style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                <strong>⚡ TRAP:</strong> {engine.feedback.q.trap}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next button after feedback */}
      {engine.feedback && (
        <div className="fixed bottom-32 left-0 right-0 z-50 flex justify-center">
          <button
            onClick={engine.nextRound}
            className="px-8 py-3 rounded bg-[#22CCFF] text-[#03050E] font-bold text-sm tracking-wider uppercase"
            style={{fontFamily:"'Orbitron',monospace", boxShadow: '0 0 24px rgba(34,204,255,0.4)'}}
          >
            {engine.currentRound + 1 >= engine.questions.length ? 'SEE RESULTS →' : 'NEXT →'}
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsScreen({
  score,
  hits,
  misses,
  maxCombo,
  onRestart,
  questions,
  missedQuestions,
}: {
  score: number;
  hits: number;
  misses: number;
  maxCombo: number;
  onRestart: () => void;
  questions: SniperQuestion[];
  missedQuestions: SniperQuestion[];
}) {
  const pct = Math.round((hits / questions.length) * 100);
  let title = 'REVISE & RETRY';
  let col = '#FF3B3B';
  if (pct >= 92) { title = 'EXPERT SNIPER'; col = '#00FF94'; }
  else if (pct >= 72) { title = 'SOLID RECALL'; col = '#22CCFF'; }
  else if (pct >= 52) { title = 'KEEP TRAINING'; col = '#FFB800'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: '#03050E', fontFamily: "'DM Sans', sans-serif", color: '#D8E8F8' }}>
      <h2 className="text-[clamp(18px,5vw,26px)] font-black mb-2" style={{fontFamily:"'Orbitron',monospace", color: col}}>{title}</h2>
      <div className="text-[clamp(60px,16vw,88px)] font-black text-[#FFB800] mb-1 leading-none"
           style={{fontFamily:"'Orbitron',monospace", textShadow: '0 0 30px rgba(255,184,0,0.4)'}}>
        {score.toLocaleString()}
      </div>
      <p className="text-[11px] tracking-wider text-[#1E3A5A] mb-6" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{pct}% accuracy · max combo ×{maxCombo}</p>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6">
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-3">
          <div className="text-[22px] font-bold text-[#00FF94]" style={{fontFamily:"'Orbitron',monospace"}}>{hits}</div>
          <div className="text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Hit</div>
        </div>
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-3">
          <div className="text-[22px] font-bold text-[#FF3B3B]" style={{fontFamily:"'Orbitron',monospace"}}>{misses}</div>
          <div className="text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Missed</div>
        </div>
        <div className="bg-[#0A1428] border border-[#1A2E4A] rounded-lg p-3">
          <div className="text-[22px] font-bold text-[#FF6BF5]" style={{fontFamily:"'Orbitron',monospace"}}>{maxCombo}</div>
          <div className="text-[10px] text-[#1E3A5A]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Max ×</div>
        </div>
      </div>

      {missedQuestions.length > 0 && (
        <div className="w-full max-w-sm mb-6">
          <p className="text-[11px] tracking-wider text-[#1E3A5A] uppercase text-left mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
            Missed — study these:
          </p>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {missedQuestions.map((q) => (
              <div key={q.id} className="bg-[#0A1428] border-l-2 border-[#FF3B3B] rounded-lg p-3 text-left text-xs leading-relaxed">
                <strong className="text-[#D8E8F8] block mb-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{q.drug}</strong>
                <span className="text-[#6B8BAA]">{q.context}</span>
                <br />
                <span className="text-[#00FF94]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Answer: {q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="px-10 py-3 rounded text-[#03050E] font-bold text-sm tracking-wider uppercase transition-all hover:-translate-y-0.5"
        style={{ fontFamily: "'Orbitron', monospace", background: '#22CCFF', boxShadow: '0 0 24px rgba(34,204,255,0.4)' }}
      >
        <Crosshair size={16} className="inline mr-2" />
        PLAY AGAIN
      </button>
    </div>
  );
}

export default function DoseSniperPage() {
  const engine = useSniperEngine(allQuestions);
  const stats = useMemo(() => getGameStats('dose-sniper'), []);

  return (
    <ArcadeShell gameId="dose-sniper" themeClass="theme-dose-sniper">
      <GoogleFontsLoader families={['Orbitron:wght@700;900', 'IBM+Plex+Mono:wght@400;600;700', 'DM+Sans:wght@400;500;600']} />
      {engine.phase === 'splash' && <SplashScreen onStart={engine.startGame} highScore={stats.highScore} />}
      {engine.phase === 'countdown' && <CountdownScreen value={engine.countdown} />}
      {engine.phase === 'playing' && <GameScreen engine={engine} />}
      {engine.phase === 'results' && (
        <ResultsScreen
          score={engine.score}
          hits={engine.hits}
          misses={engine.misses}
          maxCombo={engine.maxCombo}
          onRestart={engine.startGame}
          questions={engine.questions}
          missedQuestions={engine.missedQuestions}
        />
      )}
    </ArcadeShell>
  );
}
