/**
 * useSniperEngine — Falling-card game engine for Dose Sniper
 * Uses requestAnimationFrame with ref-based DOM updates for 60fps.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type SniperQuestion,
  type SniperState,
  type SniperPhase,
  type ArcadeSession,
  type StudyListItem,
} from '@/types/arcade';
import { updateGameStats } from '@/lib/arcade-storage';

export const BASE_SPEED = 72;
export const MAX_SPEED = 280;
const SPEED_INC = 9;
const CMULT = [1, 1, 1.5, 2, 2.5, 3, 4];
const LANES = [0.17, 0.50, 0.83];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSessionId(): string {
  return 'sn_' + Date.now().toString(36);
}

interface CardRef {
  id: string;
  text: string;
  isOk: boolean;
  x: number;
  y: number;
  speed: number;
  phase: number;
  rotBase: number;
  alive: boolean;
  el: HTMLDivElement | null;
}

export function useSniperEngine(allQuestions: SniperQuestion[]) {
  const [phase, setPhase] = useState<SniperPhase>('splash');
  const [questions, setQuestions] = useState<SniperQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{type:'ok'|'bad'|'tmout', q:SniperQuestion} | null>(null);
  const [missedQuestions, setMissedQuestions] = useState<SniperQuestion[]>([]);
  const [countdown, setCountdown] = useState(3);

  const cardsRef = useRef<CardRef[]>([]);
  const animIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const missedRef = useRef<SniperQuestion[]>([]);
  const startTimeRef = useRef(0);

  const stopLoop = useCallback(() => {
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }
  }, []);

  const computeCardWidth = useCallback(() => {
    const zw = zoneRef.current?.offsetWidth ?? 360;
    return Math.min(Math.max(Math.floor(zw * 0.27), 120), 162);
  }, []);

  const makeCards = useCallback((q: SniperQuestion) => {
    const zone = zoneRef.current;
    if (!zone) return;
    zone.querySelectorAll('.dose-card').forEach((c) => c.remove());

    const zw = zone.offsetWidth;
    const cw = computeCardWidth();
    const opts = shuffle([q.correctAnswer, ...q.wrongAnswers]);
    const laneOrder = shuffle([0, 1, 2]);
    const icons = ['💊', '🔬', '⚗️'];

    const newCards: CardRef[] = [];
    opts.forEach((dose, i) => {
      const ln = laneOrder[i];
      const isOk = dose === q.correctAnswer;
      const baseX = Math.round(LANES[ln] * zw - cw / 2);
      const spVar = 0.80 + ln * 0.13 + (Math.random() - 0.5) * 0.06;
      const card: CardRef = {
        id: `card_${i}`,
        text: dose,
        isOk,
        x: baseX,
        y: -(60 + ln * 22),
        speed: speed * spVar,
        phase: Math.random() * Math.PI * 2,
        rotBase: (Math.random() - 0.5) * 3.5,
        alive: true,
        el: null,
      };

      const el = document.createElement('div');
      el.className = 'dose-card absolute';
      el.style.cssText = `width:${cw}px;background:linear-gradient(145deg,#0A1428,#0D1835);border:1.5px solid #1A2E4A;border-radius:10px;padding:11px 13px;cursor:pointer;user-select:none;display:flex;flex-direction:column;gap:3px;`;
      el.innerHTML = `<div style="position:absolute;top:7px;right:9px;font-size:14px;opacity:0.3">${icons[i]}</div><div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px;color:#D8E8F8;line-height:1.2">${dose}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#1E3A5A;text-transform:uppercase;letter-spacing:0.06em">tap if correct</div>`;
      el.addEventListener('click', () => onHit(card));
      el.addEventListener('touchend', (e) => { e.preventDefault(); onHit(card); }, { passive: false });
      zone.appendChild(el);
      card.el = el;
      newCards.push(card);
    });

    cardsRef.current = newCards;
  }, [speed, computeCardWidth]);

  const onHit = useCallback((card: CardRef) => {
    if (answered || !card.alive) return;
    setAnswered(true);
    stopLoop();
    const q = questions[currentRound];
    if (!q) return;

    if (card.isOk) {
      card.el?.classList.add('hit-ok');
      const mult = CMULT[Math.min(combo, CMULT.length - 1)];
      const pts = Math.round(100 * mult);
      setScore((s) => s + pts);
      setCombo((c) => {
        const nc = c + 1;
        setMaxCombo((m) => Math.max(m, nc));
        return nc;
      });
      setHits((h) => h + 1);
      setSpeed((s) => Math.min(MAX_SPEED, s + SPEED_INC));
      setFeedback({ type: 'ok', q });
    } else {
      card.el?.classList.add('hit-bad');
      cardsRef.current.forEach((c) => {
        if (c.isOk && c.el) c.el.classList.add('reveal');
      });
      setCombo(0);
      setMisses((m) => m + 1);
      missedRef.current.push(q);
      setMissedQuestions((prev) => [...prev, q]);
      setFeedback({ type: 'bad', q });
    }
  }, [answered, questions, currentRound, combo, stopLoop]);

  const loop = useCallback((ts: number) => {
    const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = ts;
    const zone = zoneRef.current;
    if (!zone) return;
    const zh = zone.offsetHeight;
    const t = ts / 1000;
    let anyFloor = false;

    cardsRef.current.forEach((c) => {
      if (!c.alive) return;
      c.y += c.speed * dt;
      const drift = Math.sin(t * 0.75 + c.phase) * 4.5;
      const rot = c.rotBase + Math.sin(t * 0.4 + c.phase) * 1.1;
      if (c.el) {
        c.el.style.left = c.x + 'px';
        c.el.style.transform = `translateY(${c.y}px) translateX(${drift}px) rotate(${rot}deg)`;
        const pct = c.y / zh;
        if (pct > 0.68) c.el.style.borderColor = 'rgba(255,59,59,0.55)';
      }
      if (c.y > zh + 5) { c.alive = false; if (c.el) c.el.style.opacity = '0'; }
      if (c.isOk && c.y > zh + 5) anyFloor = true;
    });

    if (!answered && anyFloor) {
      setAnswered(true);
      setCombo(0);
      setMisses((m) => m + 1);
      const q = questions[currentRound];
      if (q) {
        missedRef.current.push(q);
        setMissedQuestions((prev) => [...prev, q]);
        setFeedback({ type: 'tmout', q });
      }
      stopLoop();
      return;
    }
    if (!answered) {
      animIdRef.current = requestAnimationFrame(loop);
    }
  }, [answered, questions, currentRound, stopLoop]);

  const startLoop = useCallback(() => {
    lastTimeRef.current = performance.now();
    animIdRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const loadRound = useCallback(() => {
    setAnswered(false);
    setFeedback(null);
    const q = questions[currentRound];
    if (!q) return;
    setTimeout(() => {
      makeCards(q);
      startLoop();
    }, 50);
  }, [questions, currentRound, makeCards, startLoop]);

  const nextRound = useCallback(() => {
    setFeedback(null);
    const next = currentRound + 1;
    if (next >= questions.length) {
      // Game over
      const session: ArcadeSession = {
        id: generateSessionId(),
        gameId: 'dose-sniper',
        score,
        correctCount: hits,
        wrongCount: misses,
        totalQuestions: questions.length,
        accuracyPct: Math.round((hits / questions.length) * 100),
        durationMs: Date.now() - startTimeRef.current,
        startedAt: new Date(startTimeRef.current).toISOString(),
        completedAt: new Date().toISOString(),
      };
      const missed: StudyListItem[] = missedRef.current.map((q) => ({
        questionId: q.id,
        gameId: 'dose-sniper',
        text: `${q.drug} · ${q.context}`,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        trap: q.trap,
        addedAt: new Date().toISOString(),
      }));
      updateGameStats('dose-sniper', session, missed);
      setPhase('results');
      return;
    }
    setCurrentRound(next);
  }, [currentRound, questions.length, score, hits, misses]);

  // Load round when currentRound changes
  useEffect(() => {
    if (phase === 'playing') {
      loadRound();
    }
    return () => stopLoop();
  }, [currentRound, phase, loadRound, stopLoop]);

  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    let v = 3;
    const t = setInterval(() => {
      v--;
      if (v <= 0) {
        clearInterval(t);
        setCountdown(0);
        setTimeout(() => {
          setPhase('playing');
          startTimeRef.current = Date.now();
        }, 450);
      } else {
        setCountdown(v);
      }
    }, 800);
  }, []);

  const startGame = useCallback(() => {
    const shuffled = shuffle(allQuestions);
    setQuestions(shuffled);
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setSpeed(BASE_SPEED);
    setAnswered(false);
    setFeedback(null);
    setMissedQuestions([]);
    missedRef.current = [];
    startCountdown();
  }, [allQuestions, startCountdown]);

  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return {
    phase,
    questions,
    currentRound,
    score,
    combo,
    maxCombo,
    hits,
    misses,
    speed,
    answered,
    feedback,
    countdown,
    missedQuestions,
    zoneRef,
    cardsRef,
    onHit,
    startGame,
    nextRound,
  };
}
