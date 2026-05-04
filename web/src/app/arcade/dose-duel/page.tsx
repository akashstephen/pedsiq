/**
 * Dose Duel Page v2 — Refactored with CSS screen transitions + imperative effects
 */

'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { ArcadeScreen } from '@/components/ArcadeScreen';
import { useArcadeSession } from '@/hooks/useArcadeSession';
import { useDoseDuelEngine, TIMER_SEC } from './hooks/useDoseDuelEngine';
import questionsData from './data/questions.json';
import { type DoseDuelQuestion } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { updateGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { useArcadeEffects } from '@/lib/arcade-effects';
import { Gamepad2, Zap, Target, Trophy } from 'lucide-react';

const allQuestions = questionsData as DoseDuelQuestion[];

// ─── Splash ──────────────────────────────────────────────────────────────────

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: 'linear-gradient(180deg, #080C18 0%, #0F1628 100%)', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-2">
        <Gamepad2 size={40} className="text-[#22D3EE] mx-auto mb-3 sm:mb-4" />
      </div>
      <h1 className="text-[clamp(36px,8vw,60px)] font-bold mb-2 tracking-tight leading-none"
          style={{ fontFamily: "'Space Mono', monospace", background: 'linear-gradient(135deg, #22D3EE, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        DOSE DUEL
      </h1>
      <p className="text-[10px] sm:text-xs tracking-[0.25em] text-[#94A3B8] uppercase mb-4 sm:mb-6">Pediatric Dosing Arcade · PedsIQ</p>
      <div className="w-12 h-0.5 bg-gradient-to-r from-[#22D3EE] to-[#818CF8] rounded-full mb-4 sm:mb-6 mx-auto" />

      <div className="bg-[#161E35] border border-[#2D4A6E] rounded-lg p-3 sm:p-4 max-w-sm mx-auto mb-4 sm:mb-6 text-left w-full">
        <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">
          <strong className="text-[#22D3EE] font-semibold">Why this works:</strong> Generation effect + norepinephrine arousal.
          Time pressure forces genuine <em>retrieval</em> (not recognition) and activates
          the LC-NE system, tagging these doses as important. Doses recalled under
          mild stress are retained ~40% longer.
        </p>
      </div>

      <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 text-[10px] sm:text-xs text-[#475569]">
        <div><span className="text-[#22D3EE] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>{allQuestions.length}</span>Questions</div>
        <div><span className="text-[#22D3EE] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>12s</span>Per dose</div>
        <div><span className="text-[#22D3EE] text-lg sm:text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>∞</span>Topics</div>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4 text-sm text-[#F59E0B]">
          <Trophy size={16} />
          <span>Best: {highScore} pts</span>
        </div>
      )}

      <button
        onClick={onStart}
        className="px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #0891B2, #6D28D9)', boxShadow: '0 0 32px rgba(34,211,238,.25)' }}
      >
        <Zap size={20} className="inline mr-2" />
        START DUEL
      </button>

      <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-[#94A3B8] max-w-xs px-2">
        APSGN · NS · Rickets · DKA · Diarrhea · HUS · Hypothyroidism & more
      </p>
    </div>
  );
}

// ─── Game ────────────────────────────────────────────────────────────────────

function GameScreen({ engine, session }: { engine: ReturnType<typeof useDoseDuelEngine>; session: ReturnType<typeof useArcadeSession> }) {
  const q = engine.currentQuestion;
  const timerPct = Math.max(0, (engine.timeLeft / TIMER_SEC) * 100);
  const timerColor = timerPct < 30 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'linear-gradient(90deg, #22D3EE, #818CF8)';
  const effects = useArcadeEffects();

  useEffect(() => {
    if (engine.isRevealed) {
      if (engine.selectedOption === null) {
        effects.flash('amber');
      } else if (engine.selectedOption === q?.correctAnswer) {
        effects.flash('green');
      } else {
        effects.flash('red');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isRevealed]);

  // Update session stats when revealed
  useEffect(() => {
    if (engine.isRevealed) {
      if (engine.selectedOption === q?.correctAnswer) {
        const timeBonus = Math.ceil(engine.timeLeft);
        const points = 10 + timeBonus;
        session.setScore(engine.score + points);
        session.setCorrectCount(engine.correctCount);
        session.setWrongCount(engine.wrongCount);
      } else {
        session.setScore(engine.score);
        session.setCorrectCount(engine.correctCount);
        session.setWrongCount(engine.wrongCount);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isRevealed]);

  if (!q) return null;

  const feedbackType = engine.isRevealed
    ? engine.selectedOption === q.correctAnswer
      ? 'correct'
      : engine.selectedOption === null
      ? 'timeout'
      : 'wrong'
    : null;

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-hidden"
         style={{ background: '#080C18', fontFamily: "'DM Sans', sans-serif", color: '#E2E8F0' }}>
      {/* HUD — 3-col grid prevents layout shift when score grows */}
      <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
        <div className="text-left">
          <div className="text-xl font-bold text-[#22D3EE] tabular-nums" style={{fontFamily:"'Space Mono',monospace"}}>{engine.score}</div>
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Score</div>
        </div>
        <div className="text-center self-center">
          <div className="text-xs text-[#475569]" style={{fontFamily:"'Space Mono',monospace"}}>
            Q {engine.currentIndex + 1} / {engine.questions.length}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#F59E0B] tabular-nums" style={{fontFamily:"'Space Mono',monospace"}}>{engine.streak}🔥</div>
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Streak</div>
        </div>
      </div>

      {/* Timer */}
      <div className="w-full h-[5px] bg-[#1D2847] rounded-[3px] overflow-hidden mb-3 shrink-0">
        <div className="h-full rounded-[3px] transition-[width] duration-100"
             style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      {/* Scrollable content area — stable scrollbar gutter prevents layout shift when feedback appears */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1" style={{ scrollbarGutter: 'stable' }}>
        {/* Patient Card */}
        <div className="bg-[#161E35] border border-[#2D4A6E] rounded-xl p-3 sm:p-4 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] tracking-wider text-[#475569] uppercase">Age</div>
            <div className="text-sm font-medium">{q.patient.age}</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] tracking-wider text-[#475569] uppercase">Weight</div>
            <div className="text-lg font-bold text-[#22D3EE] tabular-nums" style={{fontFamily:"'Space Mono',monospace"}}>
              {q.patient.weightKg} <span className="text-xs text-[#475569] font-normal" style={{fontFamily:"'DM Sans',sans-serif"}}>kg</span>
            </div>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-[#1D2847] rounded-lg p-3 mt-1">
            <div className="text-[10px] tracking-wider text-[#475569] uppercase mb-1">Clinical Context</div>
            <div className="text-sm leading-relaxed">{q.patient.diagnosis}</div>
          </div>
        </div>

        {/* Drug Box */}
        <div className="bg-[#0F1628] border border-[#1E3A5F] rounded-xl p-3 sm:p-4 mb-3 text-center">
          <div className="text-sm font-bold text-[#818CF8] mb-1" style={{fontFamily:"'Space Mono',monospace"}}>{q.drug}</div>
          <div className="text-xs text-[#475569]">{q.route}</div>
          <div className="text-sm text-[#94A3B8] mt-2">Select the correct dose / answer:</div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {q.options.map((opt) => {
            const isSelected = engine.selectedOption === opt;
            const isCorrect = opt === q.correctAnswer;
            const showCorrect = engine.isRevealed && isCorrect;
            const showWrong = engine.isRevealed && isSelected && !isCorrect;

            return (
              <button
                key={opt}
                onClick={() => { if (!engine.isRevealed) engine.selectOption(opt); }}
                disabled={engine.isRevealed}
                className={`rounded-xl p-3 text-center text-xs font-bold cursor-pointer min-h-[52px] sm:min-h-[56px] flex items-center justify-center leading-tight transition-all
                  ${showCorrect ? 'bg-[#052E16] border border-[#10B981] text-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.2)]' : ''}
                  ${showWrong ? 'bg-[#2A0A0A] border border-[#EF4444] text-[#EF4444]' : ''}
                  ${!engine.isRevealed && isSelected ? 'bg-[#007AFF]/10 border border-[#007AFF]/40 text-white' : ''}
                  ${!engine.isRevealed && !isSelected ? 'bg-[#161E35] border border-[#2D4A6E] text-[#E2E8F0] hover:bg-[#1D2847] hover:border-[#1E3A5F] hover:-translate-y-px' : ''}
                  ${engine.isRevealed && !isSelected && !isCorrect ? 'bg-[#161E35] border border-[#2D4A6E] text-[#475569] opacity-60' : ''}
                `}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  animation: showWrong ? 'dd-shake 0.3s ease' : undefined,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom action area — fixed height prevents layout shift */}
      <div className="shrink-0 pt-2">
        {feedbackType && (
          <div className={`rounded-xl p-3 sm:p-4 mb-2
            ${feedbackType === 'correct' ? 'bg-[#052E16] border border-[#10B981]' :
              feedbackType === 'timeout' ? 'bg-[#1A1000] border border-[#F59E0B]' :
              'bg-[#1A0A0A] border border-[#EF4444]'}`}
               style={{ animation: 'dd-fadeUp 0.2s ease' }}>
            <div className={`text-xs font-bold tracking-wider uppercase mb-1
              ${feedbackType === 'correct' ? 'text-[#10B981]' :
                feedbackType === 'timeout' ? 'text-[#F59E0B]' :
                'text-[#EF4444]'}`}>
              {feedbackType === 'correct'
                ? `✓ CORRECT +${10 + Math.ceil(engine.timeLeft)} pts`
                : feedbackType === 'timeout'
                ? `⏱ TIME'S UP · Answer: ${q.correctAnswer}`
                : `✗ WRONG · Correct: ${q.correctAnswer}`}
            </div>
            <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">{q.explanation}</p>
            {q.trap && (
              <div className="mt-2 p-2 bg-[rgba(245,158,11,0.08)] border-l-[3px] border-[#F59E0B] rounded text-[11px] sm:text-xs text-[#F59E0B] leading-relaxed">
                <strong>⚠ TRAP:</strong> {q.trap}
              </div>
            )}
          </div>
        )}

        {!engine.isRevealed ? (
          <button
            onClick={engine.submitAnswer}
            disabled={!engine.selectedOption}
            className={`w-full py-3 rounded-xl font-semibold transition-all
              ${engine.selectedOption ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90' : 'bg-white/[0.06] text-white/30 cursor-not-allowed'}`}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={engine.nextQuestion}
            className="w-full py-3 rounded-xl font-semibold bg-[#007AFF] text-white hover:bg-[#007AFF]/90 transition-all"
          >
            {engine.currentIndex + 1 >= engine.questions.length ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsScreen({ engine, onRestart }: { engine: ReturnType<typeof useDoseDuelEngine>; onRestart: () => void }) {
  const total = engine.questions.length;
  const pct = Math.round((engine.correctCount / total) * 100);
  let grade = 'INTERN';
  let gradeColor = '#EF4444';
  let title = 'REVISE & RETRY';

  if (pct >= 90) { grade = 'CONSULTANT'; gradeColor = '#10B981'; title = 'PERFECT RUN'; }
  else if (pct >= 75) { grade = 'REGISTRAR'; gradeColor = '#22D3EE'; title = 'STRONG DUEL'; }
  else if (pct >= 60) { grade = 'SENIOR HOUSE OFFICER'; gradeColor = '#F59E0B'; title = 'DECENT ROUND'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-8 sm:py-12 text-center"
         style={{ background: '#080C18', fontFamily: "'DM Sans', sans-serif", color: '#E2E8F0' }}>
      <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{fontFamily:"'Space Mono',monospace"}}>{title}</h2>
      <div className="text-[clamp(48px,14vw,72px)] font-bold mb-1 leading-none"
           style={{ fontFamily: "'Space Mono', monospace", background: 'linear-gradient(135deg, #22D3EE, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {engine.score}
      </div>
      <p className="text-xs sm:text-sm text-[#475569] mb-3 sm:mb-4">out of ~{total * 16} max pts</p>

      <div className="text-[11px] sm:text-xs font-semibold px-4 sm:px-5 py-1.5 rounded-full border mb-4 sm:mb-6"
           style={{ color: gradeColor, borderColor: gradeColor }}>
        {grade} · {pct}%
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-4 sm:mb-6 px-2">
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-2 sm:p-3">
          <div className="text-xl sm:text-2xl font-bold text-[#10B981]" style={{fontFamily:"'Space Mono',monospace"}}>{engine.correctCount}</div>
          <div className="text-[10px] sm:text-[11px] text-[#475569]">Correct</div>
        </div>
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-2 sm:p-3">
          <div className="text-xl sm:text-2xl font-bold text-[#EF4444]" style={{fontFamily:"'Space Mono',monospace"}}>{engine.wrongCount}</div>
          <div className="text-[10px] sm:text-[11px] text-[#475569]">Wrong</div>
        </div>
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-2 sm:p-3">
          <div className="text-xl sm:text-2xl font-bold text-[#F59E0B]" style={{fontFamily:"'Space Mono',monospace"}}>{engine.timeoutCount}</div>
          <div className="text-[10px] sm:text-[11px] text-[#475569]">Timeout</div>
        </div>
      </div>

      {engine.maxStreak > 0 && (
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#F59E0B]">
          Best streak: {engine.maxStreak}🔥
        </div>
      )}

      {engine.missedQuestions.length > 0 && (
        <div className="w-full max-w-sm mb-4 sm:mb-6 px-2">
          <p className="text-[10px] sm:text-xs tracking-wider text-[#475569] uppercase text-left mb-2">
            Missed doses — study these ({engine.missedQuestions.length}):
          </p>
          <div className="flex flex-col gap-2 max-h-40 sm:max-h-48 overflow-y-auto pr-1 arcade-scroll">
            {engine.missedQuestions.map((q) => (
              <div key={q.id} className="bg-[#161E35] border-l-[3px] border-[#EF4444] rounded-lg p-2 sm:p-3 text-left text-[11px] sm:text-xs leading-relaxed">
                <strong className="text-[#E2E8F0] block mb-1" style={{fontFamily:"'Space Mono',monospace"}}>{q.drug}</strong>
                <span className="text-[#94A3B8]">{q.patient.diagnosis}</span>
                <br />
                <span className="text-[#10B981]" style={{fontFamily:"'Space Mono',monospace"}}>Answer: {q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {engine.missedQuestions.length === 0 && (
        <p className="text-xs sm:text-sm text-[#10B981] mb-4 sm:mb-6">No missed doses — clean sweep!</p>
      )}

      <button
        onClick={onRestart}
        className="px-8 sm:px-10 py-2.5 sm:py-3 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #0891B2, #6D28D9)' }}
      >
        <Target size={18} className="inline mr-2" />
        PLAY AGAIN
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DoseDuelPage() {
  const stats = useMemo(() => getGameStats('dose-duel'), []);
  const session = useArcadeSession({ gameId: 'dose-duel', totalQuestions: allQuestions.length });
  const engine = useDoseDuelEngine(allQuestions);

  // Initialize game when entering playing phase
  useEffect(() => {
    if (session.phase === 'playing') {
      engine.initGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase]);

  // Save results when game ends
  useEffect(() => {
    if (engine.isRevealed && engine.currentIndex + 1 >= engine.questions.length && engine.questions.length > 0) {
      // Delay to let user see final feedback
      const t = setTimeout(() => {
        const arcadeSession = session.endGame();
        const missed = engine.missedQuestions.map((q) => ({
          questionId: q.id,
          gameId: 'dose-duel' as const,
          text: `${q.drug} · ${q.patient.diagnosis}`,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          trap: q.trap,
          addedAt: new Date().toISOString(),
        }));
        updateGameStats('dose-duel', arcadeSession, missed);
      }, 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isRevealed, engine.currentIndex, engine.questions.length]);

  const handleRestart = useCallback(() => {
    session.startGame();
    engine.initGame();
  }, [session, engine]);

  return (
    <ArcadeShell gameId="dose-duel" themeClass="theme-dose-duel">
      <GoogleFontsLoader families={['Space+Mono:wght@400;700', 'DM+Sans:wght@300;400;500;600']} />
      <div className="relative w-full h-[100dvh]">
        <ArcadeScreen phase="splash" activePhase={session.phase}>
          <SplashScreen onStart={session.startGame} highScore={stats.highScore} />
        </ArcadeScreen>

        <ArcadeScreen phase="playing" activePhase={session.phase} className="game-layout">
          <GameScreen engine={engine} session={session} />
        </ArcadeScreen>

        <ArcadeScreen phase="results" activePhase={session.phase}>
          <ResultsScreen engine={engine} onRestart={handleRestart} />
        </ArcadeScreen>
      </div>
    </ArcadeShell>
  );
}
