/**
 * Dose Duel Page — Full animations version
 */

'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { useDoseDuelEngine, TIMER_SEC } from './hooks/useDoseDuelEngine';
import questionsData from './data/questions.json';
import { type DoseDuelQuestion } from '@/types/arcade';
import { getGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import { FlashOverlay } from '@/components/ArcadeEffects';
import { Gamepad2, Zap, Target, Trophy } from 'lucide-react';

const allQuestions = questionsData as DoseDuelQuestion[];

// ─── Flash Overlay State ─────────────────────────────────────────────────────

function useFlash() {
  const [flash, setFlash] = React.useState<{color:'green'|'red'|'amber',key:number}|null>(null);
  const trigger = React.useCallback((color:'green'|'red'|'amber') => {
    setFlash({ color, key: Date.now() });
  }, []);
  return { flash, trigger };
}

// ─── Splash ──────────────────────────────────────────────────────────────────

function SplashScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: 'linear-gradient(180deg, #080C18 0%, #0F1628 100%)', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-2">
        <Gamepad2 size={48} className="text-[#22D3EE] mx-auto mb-4" />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight"
          style={{ fontFamily: "'Space Mono', monospace", background: 'linear-gradient(135deg, #22D3EE, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        DOSE DUEL
      </h1>
      <p className="text-xs tracking-[0.25em] text-[#94A3B8] uppercase mb-6">Pediatric Dosing Arcade · PedsIQ</p>
      <div className="w-12 h-0.5 bg-gradient-to-r from-[#22D3EE] to-[#818CF8] rounded-full mb-6 mx-auto" />

      <div className="bg-[#161E35] border border-[#2D4A6E] rounded-lg p-4 max-w-sm mx-auto mb-6 text-left">
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          <strong className="text-[#22D3EE] font-semibold">Why this works:</strong> Generation effect + norepinephrine arousal.
          Time pressure forces genuine <em>retrieval</em> (not recognition) and activates
          the LC-NE system, tagging these doses as important. Doses recalled under
          mild stress are retained ~40% longer.
        </p>
      </div>

      <div className="flex gap-8 mb-8 text-xs text-[#475569]">
        <div><span className="text-[#22D3EE] text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>{allQuestions.length}</span>Questions</div>
        <div><span className="text-[#22D3EE] text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>12s</span>Per dose</div>
        <div><span className="text-[#22D3EE] text-xl font-bold block" style={{fontFamily:"'Space Mono',monospace"}}>∞</span>Topics</div>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-[#F59E0B]">
          <Trophy size={16} />
          <span>Best: {highScore} pts</span>
        </div>
      )}

      <button
        onClick={onStart}
        className="px-12 py-4 rounded-xl text-white font-semibold text-lg tracking-wide cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #0891B2, #6D28D9)', boxShadow: '0 0 32px rgba(34,211,238,.25)' }}
      >
        <Zap size={20} className="inline mr-2" />
        START DUEL
      </button>

      <p className="mt-6 text-sm text-[#94A3B8] max-w-xs">
        APSGN · NS · Rickets · DKA · Diarrhea · HUS · Hypothyroidism & more
      </p>
    </div>
  );
}

// ─── Game ────────────────────────────────────────────────────────────────────

function GameScreen({
  state,
  currentQuestion,
  onSelect,
  onSubmit,
  onNext,
  flash,
}: {
  state: ReturnType<typeof useDoseDuelEngine>['state'];
  currentQuestion: DoseDuelQuestion | null;
  onSelect: (opt: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  flash: ReturnType<typeof useFlash>;
}) {
  if (!currentQuestion) return null;

  const timerPct = Math.max(0, (state.timeLeft / TIMER_SEC) * 100);
  const timerColor = timerPct < 30 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'linear-gradient(90deg, #22D3EE, #818CF8)';
  const q = currentQuestion;

  const prevRevealedRef = useRef(false);

  useEffect(() => {
    if (state.isRevealed && !prevRevealedRef.current) {
      if (state.selectedOption === null) {
        flash.trigger('amber');
      }
    }
    prevRevealedRef.current = state.isRevealed;
  }, [state.isRevealed, state.selectedOption, flash]);

  const handleSelect = (opt: string) => {
    if (state.isRevealed) return;
    onSelect(opt);
  };

  const handleSubmit = () => {
    onSubmit();
    if (state.selectedOption === q.correctAnswer) {
      flash.trigger('green');
    } else {
      flash.trigger('red');
    }
  };

  // Determine feedback type
  const feedbackType = state.isRevealed
    ? state.selectedOption === q.correctAnswer
      ? 'correct'
      : state.selectedOption === null
      ? 'timeout'
      : 'wrong'
    : null;

  return (
    <div className="flex flex-col h-full px-4 py-4 max-w-xl mx-auto overflow-y-auto"
         style={{ background: '#080C18', fontFamily: "'DM Sans', sans-serif", color: '#E2E8F0' }}>
      {/* Flash overlay */}
      {flash.flash && <FlashOverlay key={flash.flash.key} color={flash.flash.color} />}

      {/* HUD */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xl font-bold text-[#22D3EE]" style={{fontFamily:"'Space Mono',monospace"}}>{state.score}</div>
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Score</div>
        </div>
        <div className="text-center text-xs text-[#475569]" style={{fontFamily:"'Space Mono',monospace"}}>
          Q {state.currentIndex + 1} / {state.questions.length}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#F59E0B]" style={{fontFamily:"'Space Mono',monospace"}}>{state.streak}🔥</div>
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Streak</div>
        </div>
      </div>

      {/* Timer */}
      <div className="w-full h-[5px] bg-[#1D2847] rounded-[3px] overflow-hidden mb-4">
        <div className="h-full rounded-[3px] transition-[width] duration-100"
             style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      {/* Patient Card */}
      <div className="bg-[#161E35] border border-[#2D4A6E] rounded-xl p-4 mb-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Age</div>
          <div className="text-sm font-medium">{q.patient.age}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-wider text-[#475569] uppercase">Weight</div>
          <div className="text-lg font-bold text-[#22D3EE]" style={{fontFamily:"'Space Mono',monospace"}}>
            {q.patient.weightKg} <span className="text-xs text-[#475569] font-normal" style={{fontFamily:"'DM Sans',sans-serif"}}>kg</span>
          </div>
        </div>
        <div className="col-span-2 bg-[#1D2847] rounded-lg p-3 mt-1">
          <div className="text-[10px] tracking-wider text-[#475569] uppercase mb-1">Clinical Context</div>
          <div className="text-sm leading-relaxed">{q.patient.diagnosis}</div>
        </div>
      </div>

      {/* Drug Box */}
      <div className="bg-[#0F1628] border border-[#1E3A5F] rounded-xl p-4 mb-3 text-center">
        <div className="text-sm font-bold text-[#818CF8] mb-1" style={{fontFamily:"'Space Mono',monospace"}}>{q.drug}</div>
        <div className="text-xs text-[#475569]">{q.route}</div>
        <div className="text-sm text-[#94A3B8] mt-2">Select the correct dose / answer:</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {q.options.map((opt) => {
          const isSelected = state.selectedOption === opt;
          const isCorrect = opt === q.correctAnswer;
          const showCorrect = state.isRevealed && isCorrect;
          const showWrong = state.isRevealed && isSelected && !isCorrect;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={state.isRevealed}
              className={`rounded-xl p-3 text-center text-xs font-bold cursor-pointer min-h-[56px] flex items-center justify-center leading-tight
                ${showCorrect ? 'bg-[#052E16] border border-[#10B981] text-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.2)]' : ''}
                ${showWrong ? 'bg-[#2A0A0A] border border-[#EF4444] text-[#EF4444]' : ''}
                ${!state.isRevealed && isSelected ? 'bg-[#007AFF]/10 border border-[#007AFF]/40 text-white' : ''}
                ${!state.isRevealed && !isSelected ? 'bg-[#161E35] border border-[#2D4A6E] text-[#E2E8F0] hover:bg-[#1D2847] hover:border-[#1E3A5F]' : ''}
                ${state.isRevealed && !isSelected && !isCorrect ? 'bg-[#161E35] border border-[#2D4A6E] text-[#475569] opacity-60' : ''}
              `}
              style={{
                fontFamily: "'Space Mono', monospace",
                animation: showWrong ? 'dd-shake 0.3s ease' : undefined,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!state.isRevealed && !isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedbackType && (
        <div className={`rounded-xl p-4 mb-3
          ${feedbackType === 'correct' ? 'bg-[#052E16] border border-[#10B981]' :
            feedbackType === 'timeout' ? 'bg-[#1A1000] border border-[#F59E0B]' :
            'bg-[#1A0A0A] border border-[#EF4444]'}`}
             style={{ animation: 'dd-fadeUp 0.2s ease' }}>
          <div className={`text-xs font-bold tracking-wider uppercase mb-2
            ${feedbackType === 'correct' ? 'text-[#10B981]' :
              feedbackType === 'timeout' ? 'text-[#F59E0B]' :
              'text-[#EF4444]'}`}>
            {feedbackType === 'correct'
              ? `✓ CORRECT +${10 + Math.ceil(state.timeLeft)} pts`
              : feedbackType === 'timeout'
              ? `⏱ TIME'S UP · Answer: ${q.correctAnswer}`
              : `✗ WRONG · Correct: ${q.correctAnswer}`}
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">{q.explanation}</p>
          {q.trap && (
            <div className="mt-2 p-2 bg-[rgba(245,158,11,0.08)] border-l-[3px] border-[#F59E0B] rounded text-xs text-[#F59E0B] leading-relaxed">
              <strong>⚠ TRAP:</strong> {q.trap}
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {!state.isRevealed ? (
        <button
          onClick={handleSubmit}
          disabled={!state.selectedOption}
          className={`w-full py-3 rounded-xl font-semibold transition-all
            ${state.selectedOption ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90' : 'bg-white/[0.06] text-white/30 cursor-not-allowed'}`}
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl font-semibold bg-[#007AFF] text-white hover:bg-[#007AFF]/90 transition-all"
        >
          {state.currentIndex + 1 >= state.questions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsScreen({ state, onRestart }: { state: ReturnType<typeof useDoseDuelEngine>['state']; onRestart: () => void }) {
  const total = state.questions.length;
  const pct = Math.round((state.correctCount / total) * 100);
  let grade = 'INTERN';
  let gradeColor = '#EF4444';
  let title = 'REVISE & RETRY';

  if (pct >= 90) { grade = 'CONSULTANT'; gradeColor = '#10B981'; title = 'PERFECT RUN'; }
  else if (pct >= 75) { grade = 'REGISTRAR'; gradeColor = '#22D3EE'; title = 'STRONG DUEL'; }
  else if (pct >= 60) { grade = 'SENIOR HOUSE OFFICER'; gradeColor = '#F59E0B'; title = 'DECENT ROUND'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
         style={{ background: '#080C18', fontFamily: "'DM Sans', sans-serif", color: '#E2E8F0' }}>
      <h2 className="text-2xl font-bold mb-2" style={{fontFamily:"'Space Mono',monospace"}}>{title}</h2>
      <div className="text-7xl font-bold mb-1 leading-none"
           style={{ fontFamily: "'Space Mono', monospace", background: 'linear-gradient(135deg, #22D3EE, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {state.score}
      </div>
      <p className="text-sm text-[#475569] mb-4">out of ~{total * 16} max pts</p>

      <div className="text-xs font-semibold px-5 py-1.5 rounded-full border mb-6"
           style={{ color: gradeColor, borderColor: gradeColor }}>
        {grade} · {pct}%
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6">
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-2xl font-bold text-[#10B981]" style={{fontFamily:"'Space Mono',monospace"}}>{state.correctCount}</div>
          <div className="text-[11px] text-[#475569]">Correct</div>
        </div>
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-2xl font-bold text-[#EF4444]" style={{fontFamily:"'Space Mono',monospace"}}>{state.wrongCount}</div>
          <div className="text-[11px] text-[#475569]">Wrong</div>
        </div>
        <div className="bg-[#161E35] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-2xl font-bold text-[#F59E0B]" style={{fontFamily:"'Space Mono',monospace"}}>{state.timeoutCount}</div>
          <div className="text-[11px] text-[#475569]">Timeout</div>
        </div>
      </div>

      {state.maxStreak > 0 && (
        <div className="mb-4 text-sm text-[#F59E0B]">
          Best streak: {state.maxStreak}🔥
        </div>
      )}

      {state.missedQuestions.length > 0 && (
        <div className="w-full max-w-sm mb-6">
          <p className="text-xs tracking-wider text-[#475569] uppercase text-left mb-2">
            Missed doses — study these ({state.missedQuestions.length}):
          </p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 arcade-scroll">
            {state.missedQuestions.map((q) => (
              <div key={q.id} className="bg-[#161E35] border-l-[3px] border-[#EF4444] rounded-lg p-3 text-left text-xs leading-relaxed">
                <strong className="text-[#E2E8F0] block mb-1" style={{fontFamily:"'Space Mono',monospace"}}>{q.drug}</strong>
                <span className="text-[#94A3B8]">{q.patient.diagnosis}</span>
                <br />
                <span className="text-[#10B981]" style={{fontFamily:"'Space Mono',monospace"}}>Answer: {q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.missedQuestions.length === 0 && (
        <p className="text-sm text-[#10B981] mb-6">No missed doses — clean sweep!</p>
      )}

      <button
        onClick={onRestart}
        className="px-10 py-3 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5"
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
  const { state, currentQuestion, startGame, selectOption, submitAnswer, nextQuestion } = useDoseDuelEngine(allQuestions);
  const stats = useMemo(() => getGameStats('dose-duel'), []);
  const flash = useFlash();

  return (
    <ArcadeShell gameId="dose-duel" themeClass="theme-dose-duel">
      <GoogleFontsLoader families={['Space+Mono:wght@400;700', 'DM+Sans:wght@300;400;500;600']} />
      <div className="relative w-full h-[100dvh]">
        <div className={`arcade-screen ${state.phase === 'splash' ? '' : 'hidden-down'}`}>
          <SplashScreen onStart={startGame} highScore={stats.highScore} />
        </div>
        <div className={`arcade-screen ${state.phase === 'playing' ? '' : 'hidden-down'}`} style={{justifyContent:'flex-start'}}>
          <GameScreen
            state={state}
            currentQuestion={currentQuestion}
            onSelect={selectOption}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            flash={flash}
          />
        </div>
        <div className={`arcade-screen ${state.phase === 'results' ? '' : 'hidden-down'}`}>
          <ResultsScreen state={state} onRestart={startGame} />
        </div>
      </div>
    </ArcadeShell>
  );
}
