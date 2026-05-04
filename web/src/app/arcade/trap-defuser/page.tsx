/**
 * Trap Defuser — Swipe to judge clinical traps vs correct facts
 * Learning mechanism: Hypercorrection effect
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ArcadeShell } from '@/components/ArcadeShell';
import { getGameStats, updateGameStats } from '@/lib/arcade-storage';
import { GoogleFontsLoader } from '@/components/GoogleFontsLoader';
import cardsData from './data/cards.json';
import { type TrapDefuserCard } from '@/types/arcade';
import { Bomb, Trophy, RotateCcw } from 'lucide-react';

const CARDS = cardsData as TrapDefuserCard[];

const TOPIC_COLORS: Record<string, { c: string; b: string }> = {
  'AGN / PSGN':           { c: '#FFB020', b: 'rgba(255,176,32,.2)' },
  'Nephrotic Syndrome':   { c: '#22D3EE', b: 'rgba(34,211,238,.2)' },
  'DKA':                  { c: '#F87171', b: 'rgba(248,113,113,.2)' },
  'Dehydration':          { c: '#34D399', b: 'rgba(52,211,153,.2)' },
  'Rickets':              { c: '#A78BFA', b: 'rgba(167,139,250,.2)' },
  'HUS':                  { c: '#FB923C', b: 'rgba(251,146,60,.2)' },
  'Congenital Hypothyroidism': { c: '#F472B6', b: 'rgba(244,114,182,.2)' },
  'Testicular Torsion':   { c: '#60A5FA', b: 'rgba(96,165,250,.2)' },
  'Haematuria / Labs':    { c: '#E879F9', b: 'rgba(232,121,249,.2)' },
  'Portal Hypertension':  { c: '#FBBF24', b: 'rgba(251,191,36,.2)' },
  'Biliary Atresia':      { c: '#6EE7B7', b: 'rgba(110,231,183,.2)' },
};

const TIMER_S = 8;

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
         style={{ background: '#050810', fontFamily: "'Space Grotesk', sans-serif", color: '#D6E6F5' }}>
      <div className="font-black leading-[0.9] tracking-wide mb-1"
           style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(64px, 16vw, 100px)', letterSpacing: '0.04em',
                    background: 'linear-gradient(180deg, #FF4D1A 0%, #FFB020 50%, #00D97E 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        TRAP<br />DEFUSER
      </div>
      <div className="text-[10px] tracking-[0.2em] uppercase mb-3"
           style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>
        PedsIQ · Examiner Trap Intelligence · 48 cards
      </div>
      <div className="w-12 h-0.5 rounded-sm mx-auto mb-3"
           style={{ background: 'linear-gradient(90deg, #FF4D1A, #00D97E)' }} />

      <div className="bg-[#0B1525] border border-[#1A2E48] rounded-xl p-3 sm:p-4 max-w-[330px] mx-auto mb-4 text-left w-full text-xs leading-relaxed"
           style={{ color: '#5A7A9A' }}>
        <strong style={{ color: '#FFB020' }}>Hypercorrection effect:</strong> You are statistically more likely
        to remember a fact you confidently got wrong than one you passively read.
        Confident mistakes are the engine of durable memory.
      </div>

      <div className="flex gap-3 max-w-[330px] w-full mb-4">
        <div className="flex-1 rounded-lg py-2.5 px-2 text-center text-[13px] font-semibold"
             style={{ background: 'rgba(255,77,26,.1)', border: '1.5px solid rgba(255,77,26,.3)', color: '#FF4D1A' }}>
          ⚡ TRAP<small className="block text-[10px] font-normal opacity-70 mt-0.5">swipe left or tap</small>
        </div>
        <div className="flex-1 rounded-lg py-2.5 px-2 text-center text-[13px] font-semibold"
             style={{ background: 'rgba(0,217,126,.1)', border: '1.5px solid rgba(0,217,126,.3)', color: '#00D97E' }}>
          ✓ CORRECT<small className="block text-[10px] font-normal opacity-70 mt-0.5">swipe right or tap</small>
        </div>
      </div>

      <div className="flex gap-6 mb-5 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>
        <div><span className="block text-[26px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FFB020' }}>48</span>Cards</div>
        <div><span className="block text-[26px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FFB020' }}>8s</span>Per card</div>
        <div><span className="block text-[26px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FFB020' }}>9</span>Topics</div>
      </div>

      {highScore > 0 && (
        <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#FFB020' }}>
          <Trophy size={16} />
          <span>Best: {highScore.toLocaleString()} pts</span>
        </div>
      )}

      <button onClick={onStart}
              className="px-14 py-3.5 rounded-md text-[#050810] font-bold text-xl tracking-widest cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", background: 'linear-gradient(135deg, #FF4D1A, #FFB020)', boxShadow: '0 0 32px rgba(255,77,26,.3)' }}>
        DEFUSE NOW
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════
// GAME
// ══════════════════════════════════════════════════
function GameScreen({ deck, onComplete }: { deck: TrapDefuserCard[]; onComplete: (score: number, correct: number, wrong: number, maxStreak: number, missed: TrapDefuserCard[], topicStats: Record<string, { c: number; w: number }>) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState<TrapDefuserCard[]>([]);
  const [topicStats, setTopicStats] = useState<Record<string, { c: number; w: number }>>({});
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_S);
  const [cardAnim, setCardAnim] = useState<'enter' | 'exit-trap' | 'exit-ok' | 'exit-timeout' | 'shake' | ''>('enter');
  const [feedback, setFeedback] = useState<{ correct: boolean; card: TrapDefuserCard; pts: number; timeout?: boolean } | null>(null);
  const [flashColor, setFlashColor] = useState('');
  const [scorePops, setScorePops] = useState<{ id: number; text: string }[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const card = deck[idx];
  const tc = card ? (TOPIC_COLORS[card.topic] || { c: '#FFB020', b: 'rgba(255,176,32,.2)' }) : { c: '#FFB020', b: 'rgba(255,176,32,.2)' };

  // Timer
  useEffect(() => {
    if (!card || answered) return;
    setTimeLeft(TIMER_S);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, card]);

  const handleTimeout = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setStreak(0);
    setWrong(w => w + 1);
    setMissed(m => [...m, card]);
    setTopicStats(prev => {
      const s = prev[card.topic] || { c: 0, w: 0 };
      return { ...prev, [card.topic]: { ...s, w: s.w + 1 } };
    });
    setFlashColor('rgba(255,176,32,.1)');
    setTimeout(() => setFlashColor(''), 150);
    setCardAnim('exit-timeout');
    setFeedback({ correct: false, card, pts: 0, timeout: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, card]);

  const judge = useCallback((calledTrap: boolean) => {
    if (answered || !card) return;
    setAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = calledTrap === card.isTrap;
    setTopicStats(prev => {
      const s = prev[card.topic] || { c: 0, w: 0 };
      return { ...prev, [card.topic]: { ...s, [isCorrect ? 'c' : 'w']: s[isCorrect ? 'c' : 'w'] + 1 } };
    });

    if (isCorrect) {
      const pts = 10 + Math.ceil(timeLeft * 1.5);
      setScore(s => s + pts);
      setStreak(s => {
        const ns = s + 1;
        setMaxStreak(m => Math.max(m, ns));
        return ns;
      });
      setCorrect(c => c + 1);
      setFlashColor(card.isTrap ? 'rgba(255,77,26,.08)' : 'rgba(0,217,126,.08)');
      setTimeout(() => setFlashColor(''), 150);
      setCardAnim(calledTrap ? 'exit-trap' : 'exit-ok');
      const id = Date.now();
      setScorePops(sp => [...sp, { id, text: '+' + pts }]);
      setTimeout(() => setScorePops(sp => sp.filter(s => s.id !== id)), 800);
      setFeedback({ correct: true, card, pts });
    } else {
      setStreak(0);
      setWrong(w => w + 1);
      setMissed(m => [...m, card]);
      setFlashColor('rgba(255,77,26,.12)');
      setTimeout(() => setFlashColor(''), 150);
      setCardAnim('shake');
      setTimeout(() => setCardAnim(''), 350);
      setFeedback({ correct: false, card, pts: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, card, timeLeft]);

  const nextCard = useCallback(() => {
    const ni = idx + 1;
    if (ni >= deck.length) {
      onComplete(score, correct, wrong, maxStreak, missed, topicStats);
      return;
    }
    setIdx(ni);
    setAnswered(false);
    setFeedback(null);
    setCardAnim('enter');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, deck.length, onComplete, score, correct, wrong, maxStreak, missed, topicStats]);

  // Touch handlers for swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (answered) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isDragging.current = true;
  }, [answered]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || answered || !cardRef.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dy) > Math.abs(dx) + 20) return;
    const rot = dx * 0.08;
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.transition = 'none';
    cardRef.current.classList.remove('dragging-trap', 'dragging-ok');
    if (dx < -30) cardRef.current.classList.add('dragging-trap');
    if (dx > 30) cardRef.current.classList.add('dragging-ok');
  }, [answered]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || answered || !cardRef.current) return;
    isDragging.current = false;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    cardRef.current.style.transition = '';
    cardRef.current.classList.remove('dragging-trap', 'dragging-ok');
    if (Math.abs(dx) > 90) {
      judge(dx < 0);
    } else {
      cardRef.current.style.transform = '';
    }
  }, [answered, judge]);

  const timerPct = Math.max(0, (timeLeft / TIMER_S) * 100);

  if (!card) return null;

  return (
    <div className="flex flex-col h-full w-full relative"
         style={{ background: '#050810', fontFamily: "'Space Grotesk', sans-serif", color: '#D6E6F5' }}>
      {/* Flash overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-150"
           style={{ background: flashColor, opacity: flashColor ? 1 : 0 }} />

      {/* Score pops */}
      {scorePops.map(sp => (
        <div key={sp.id} className="fixed pointer-events-none z-60 text-2xl font-black"
             style={{ left: '50%', top: '40%', transform: 'translateX(-50%)', color: '#FFB020', fontFamily: "'Bebas Neue', sans-serif",
                      animation: 'spopA 0.75s ease forwards' }}>
          {sp.text}
        </div>
      ))}

      {/* HUD */}
      <div className="w-full shrink-0 flex items-center justify-between px-3.5 py-2 z-20"
           style={{ background: 'rgba(5,8,16,.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #142236' }}>
        <div>
          <div className="text-[26px] leading-none font-black tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FFB020' }}>{score.toLocaleString()}</div>
          <div className="text-[9px] -mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450', letterSpacing: '0.12em' }}>SCORE</div>
        </div>
        <div className="text-center">
          <div className="text-[13px] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D6E6F5' }}>
            {String(idx + 1).padStart(2, '0')} / {deck.length}
          </div>
          <div className="text-[9px] mt-px" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>
            {correct} correct · {wrong} wrong
          </div>
        </div>
        <div className="text-right">
          <div className="text-[26px] leading-none font-black tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#9B72F8' }}>
            {streak}🔥
          </div>
          <div className="text-[9px] -mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450', letterSpacing: '0.12em' }}>STREAK</div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1 shrink-0 overflow-hidden" style={{ background: '#13243C' }}>
        <div className="h-full transition-all duration-100"
             style={{ width: `${timerPct}%`, background: timerPct < 30 ? 'linear-gradient(90deg, #FF4D1A, #FFB020)' : 'linear-gradient(90deg, #00D97E, #FFB020)' }} />
      </div>

      {/* Card area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-3 pt-2.5 pb-1.5 relative overflow-hidden">
        <div
          ref={cardRef}
          className={`w-full max-w-[440px] relative ${
            cardAnim === 'enter' ? 'animate-[cardInAnim_0.35s_cubic-bezier(0.175,0.885,0.32,1.1)_forwards]' : ''
          } ${cardAnim === 'exit-trap' ? 'animate-[cardOutTrap_0.35s_ease_forwards]' : ''} ${
            cardAnim === 'exit-ok' ? 'animate-[cardOutOk_0.35s_ease_forwards]' : ''
          } ${cardAnim === 'exit-timeout' ? 'animate-[cardOutTimeout_0.3s_ease_forwards]' : ''} ${
            cardAnim === 'shake' ? 'animate-[cardShakeAnim_0.35s_ease]' : ''
          }`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="rounded-2xl p-[18px] pb-4 relative overflow-hidden"
               style={{ background: 'linear-gradient(145deg, #0B1525, #0F1C30)', border: '1.5px solid #1A2E48' }}>
            <div className="absolute inset-0 rounded-[15px] pointer-events-none"
                 style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.025), transparent)' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-[3px] rounded-full border"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: tc.c, borderColor: tc.b, background: tc.b }}>
                  {card.topic}
                </span>
              </div>
              <div className="font-medium leading-snug" style={{ fontSize: 'clamp(14px, 3.8vw, 17px)' }}
                   dangerouslySetInnerHTML={{ __html: card.q }} />
            </div>
            {/* Swipe hints */}
            <div className="absolute top-3 right-3.5 text-[28px] font-black tracking-wide pointer-events-none transition-opacity duration-150"
                 style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF4D1A', opacity: 0 }}>
              ⚡ TRAP
            </div>
            <div className="absolute top-3 right-3.5 text-[28px] font-black tracking-wide pointer-events-none transition-opacity duration-150"
                 style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#00D97E', opacity: 0 }}>
              ✓ CORRECT
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className={`w-full max-w-[440px] mt-2.5 shrink-0 transition-all duration-250 ${feedback ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'} pointer-events-none`}>
          {feedback && (
            <div className={`rounded-xl px-4 py-3 pointer-events-auto ${
              feedback.correct ? 'bg-[#001A0E]' : 'bg-[#1A0800]'
            }`} style={{ border: feedback.correct ? '1.5px solid #00D97E' : '1.5px solid #FF4D1A' }}>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
                   style={{ fontFamily: "'JetBrains Mono', monospace", color: feedback.correct ? '#00D97E' : '#FF4D1A' }}>
                {feedback.timeout ? "⏱ TIME'S UP" : feedback.correct ? '✓ DEFUSED' : card.isTrap ? '⚡ THAT WAS A TRAP' : '✗ THAT WAS CORRECT'}
              </div>
              <div className="text-xs font-semibold mb-1" style={{ color: '#D6E6F5' }}>{card.truth}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#5A7A9A' }}>{card.exp}</div>
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-[3px] rounded-full"
                    style={{ fontFamily: "'JetBrains Mono', monospace",
                             background: feedback.correct ? 'rgba(0,217,126,.12)' : 'rgba(255,77,26,.12)',
                             color: feedback.correct ? '#00D97E' : '#FF4D1A' }}>
                {card.marks}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-[440px] flex gap-2.5 px-3 pb-2 shrink-0 mx-auto">
        {answered ? (
          <button onClick={nextCard}
                  className="flex-1 rounded-xl py-4 cursor-pointer transition-all active:scale-[0.96] hover:-translate-y-0.5"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.1em', color: '#050810',
                           background: 'linear-gradient(135deg, #FF4D1A, #FFB020)', boxShadow: '0 0 24px rgba(255,77,26,.25)' }}>
            NEXT →
          </button>
        ) : (
          <>
            <button onClick={() => judge(true)}
                    className="flex-1 rounded-xl py-4 flex flex-col items-center gap-[3px] cursor-pointer transition-all active:scale-[0.96]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.1em', color: '#FF4D1A',
                             background: 'linear-gradient(135deg, #1A0500, #2A0A00)', border: '1.5px solid rgba(255,77,26,.4)' }}>
              ⚡ TRAP<small className="text-[8px] font-normal not-italic uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>swipe left</small>
            </button>
            <button onClick={() => judge(false)}
                    className="flex-1 rounded-xl py-4 flex flex-col items-center gap-[3px] cursor-pointer transition-all active:scale-[0.96]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.1em', color: '#00D97E',
                             background: 'linear-gradient(135deg, #001A0A, #002A12)', border: '1.5px solid rgba(0,217,126,.4)' }}>
              ✓ CORRECT<small className="text-[8px] font-normal not-italic uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>swipe right</small>
            </button>
          </>
        )}
      </div>

      <div className="text-[9px] text-center pb-1.5 shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450', letterSpacing: '0.12em' }}>
        {answered ? 'tap NEXT when ready to continue' : 'swipe or tap to judge each clinical decision'}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════════
function ResultsScreen({
  score, correct, wrong, maxStreak, missed, topicStats, onRestart
}: {
  score: number; correct: number; wrong: number; maxStreak: number;
  missed: TrapDefuserCard[]; topicStats: Record<string, { c: number; w: number }>;
  onRestart: () => void;
}) {
  const total = correct + wrong;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  let title: string, gradeTxt: string, gradeCol: string;
  if (pct >= 90) { title = 'TRAP IMMUNE'; gradeTxt = 'Examiner cannot catch you · ' + pct + '%'; gradeCol = '#00D97E'; }
  else if (pct >= 75) { title = 'SHARP EYE'; gradeTxt = 'Solid performance · ' + pct + '%'; gradeCol = '#22D3EE'; }
  else if (pct >= 55) { title = 'GETTING THERE'; gradeTxt = 'Review your weak topics · ' + pct + '%'; gradeCol = '#FFB020'; }
  else { title = 'TRAPPED'; gradeTxt = 'Significant revision needed · ' + pct + '%'; gradeCol = '#FF4D1A'; }

  const topics = Object.keys(topicStats).sort((a, b) => {
    const sa = topicStats[a];
    const sb = topicStats[b];
    const pa = sa.c / (sa.c + sa.w || 1);
    const pb = sb.c / (sb.c + sb.w || 1);
    return pa - pb;
  });

  // dedupe missed
  const seen = new Set<string>();
  const uniqueMissed = missed.filter(c => {
    if (seen.has(c.q)) return false;
    seen.add(c.q);
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto"
         style={{ background: '#050810', fontFamily: "'Space Grotesk', sans-serif", color: '#D6E6F5' }}>
      <div className="w-full shrink-0 px-4 py-3.5" style={{ background: '#08101C', borderBottom: '1px solid #142236' }}>
        <div className="font-black leading-none tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 7vw, 42px)' }}>
          {title}
        </div>
        <div className="inline-block text-[11px] font-semibold px-3.5 py-1 rounded-full border-[1.5px] mt-1"
             style={{ fontFamily: "'JetBrains Mono', monospace", color: gradeCol, borderColor: gradeCol }}>
          {gradeTxt}
        </div>
      </div>

      <div className="w-full px-4 py-3.5 flex flex-col gap-3.5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0B1525] border border-[#142236] rounded-lg px-1.5 py-2.5 text-center">
            <div className="text-[28px] leading-none font-black tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#00D97E' }}>{correct}</div>
            <div className="text-[9px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>CORRECT</div>
          </div>
          <div className="bg-[#0B1525] border border-[#142236] rounded-lg px-1.5 py-2.5 text-center">
            <div className="text-[28px] leading-none font-black tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF4D1A' }}>{wrong}</div>
            <div className="text-[9px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>WRONG</div>
          </div>
          <div className="bg-[#0B1525] border border-[#142236] rounded-lg px-1.5 py-2.5 text-center">
            <div className="text-[28px] leading-none font-black tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#9B72F8' }}>{maxStreak}</div>
            <div className="text-[9px] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>BEST STREAK</div>
          </div>
        </div>

        {/* Topic profile */}
        {topics.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] mb-2"
                 style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>
              Your Trap Profile — accuracy by topic
            </div>
            <div className="flex flex-col gap-1.5">
              {topics.map(t => {
                const s = topicStats[t];
                const p = Math.round((s.c / (s.c + s.w || 1)) * 100);
                const tc = TOPIC_COLORS[t] || { c: '#FFB020' };
                return (
                  <div key={t} className="flex items-center gap-2.5">
                    <div className="text-xs font-semibold min-w-[130px]" style={{ color: '#D6E6F5' }}>{t}</div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#13243C' }}>
                      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${p}%`, background: tc.c }} />
                    </div>
                    <div className="text-[10px] min-w-[32px] text-right" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#5A7A9A' }}>{p}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missed */}
        {uniqueMissed.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] mb-2"
                 style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1E3450' }}>
              Caught you {uniqueMissed.length} times — review:
            </div>
            <div className="flex flex-col gap-1.5">
              {uniqueMissed.map((card, i) => (
                <div key={i} className="bg-[#0B1525] rounded-md px-3 py-2 text-xs leading-relaxed"
                     style={{ borderLeft: '3px solid #FF4D1A' }}>
                  <strong className="block text-[10px] mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D6E6F5', letterSpacing: '0.06em' }}>
                    {card.topic} — {card.isTrap ? '⚡ TRAP' : '✓ CORRECT'}
                  </strong>
                  <span style={{ color: '#00D97E', fontWeight: 600 }}>{card.truth}</span>
                  <br />
                  <span style={{ color: '#5A7A9A', fontWeight: 400 }}>{card.exp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onRestart}
                className="w-full py-3.5 rounded-lg text-[#050810] font-bold text-xl tracking-widest cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "'Bebas Neue', sans-serif", background: 'linear-gradient(135deg, #FF4D1A, #FFB020)', boxShadow: '0 0 24px rgba(255,77,26,.25)' }}>
          <RotateCcw size={16} className="inline mr-2" />
          DEFUSE AGAIN
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════
export default function TrapDefuserPage() {
  const stats = useMemo(() => getGameStats('trap-defuser'), []);

  const [phase, setPhase] = useState<'splash' | 'playing' | 'results'>('splash');
  const [deck, setDeck] = useState<TrapDefuserCard[]>([]);
  const [resultData, setResultData] = useState<{
    score: number; correct: number; wrong: number; maxStreak: number;
    missed: TrapDefuserCard[]; topicStats: Record<string, { c: number; w: number }>;
  } | null>(null);

  const startGame = useCallback(() => {
    setDeck(shuf([...CARDS]));
    setResultData(null);
    setPhase('playing');
  }, []);

  const handleComplete = useCallback((score: number, correct: number, wrong: number, maxStreak: number, missed: TrapDefuserCard[], topicStats: Record<string, { c: number; w: number }>) => {
    setResultData({ score, correct, wrong, maxStreak, missed, topicStats });
    const session = {
      id: 'td_' + Date.now().toString(36),
      gameId: 'trap-defuser' as const,
      score,
      correctCount: correct,
      wrongCount: wrong,
      totalQuestions: CARDS.length,
      accuracyPct: Math.round((correct / (correct + wrong || 1)) * 100),
      durationMs: 0,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    const studyList = missed.map((c, i) => ({
      questionId: 'td_' + i,
      gameId: 'trap-defuser' as const,
      text: `${c.topic} · ${c.truth}`,
      correctAnswer: c.isTrap ? 'TRAP' : 'CORRECT',
      explanation: c.exp,
      trap: c.marks,
      addedAt: new Date().toISOString(),
    }));
    updateGameStats('trap-defuser', session, studyList);
    setPhase('results');
  }, []);

  return (
    <ArcadeShell gameId="trap-defuser" themeClass="theme-trap-defuser">
      <GoogleFontsLoader families={['Bebas+Neue', 'JetBrains+Mono:wght@400;600;700', 'Space+Grotesk:wght@300;400;500;600;700']} />
      <div className="relative w-full h-[100dvh]">
        <div className={`arcade-screen ${phase === 'splash' ? '' : 'hidden-down'}`}>
          <SplashScreen onStart={startGame} highScore={stats.highScore} />
        </div>

        <div className={`arcade-screen game-layout ${phase === 'playing' ? '' : 'hidden-down'}`}>
          {phase === 'playing' && deck.length > 0 && (
            <GameScreen deck={deck} onComplete={handleComplete} />
          )}
        </div>

        <div className={`arcade-screen game-layout ${phase === 'results' && resultData ? '' : 'hidden-down'}`}>
          {resultData && (
            <ResultsScreen {...resultData} onRestart={startGame} />
          )}
        </div>
      </div>
    </ArcadeShell>
  );
}
