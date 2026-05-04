/**
 * useSniperEngine v2 — Refactored falling-card game engine
 * Uses refs + direct DOM for 60fps. No React state for card positions.
 * Session management (phases, score, stats) handled by useArcadeSession.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { type SniperQuestion } from '@/types/arcade';

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
  laneIndex: number;
}

export function useSniperEngine(allQuestions: SniperQuestion[]) {
  const [questions, setQuestions] = useState<SniperQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'bad' | 'tmout'; q: SniperQuestion } | null>(null);

  const cardsRef = useRef<CardRef[]>([]);
  const animIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const answeredRef = useRef(false);
  const speedRef = useRef(BASE_SPEED);
  const comboRef = useRef(0);
  const loadRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  const stopLoop = useCallback(() => {
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }
  }, []);

  const purgeCards = useCallback(() => {
    const zone = zoneRef.current;
    if (zone) {
      zone.querySelectorAll('.dose-card').forEach((c) => c.remove());
    }
    cardsRef.current = [];
  }, []);

  const computeCardWidth = useCallback(() => {
    const zw = zoneRef.current?.offsetWidth ?? 360;
    return Math.min(Math.max(Math.floor(zw * 0.27), 90), 150);
  }, []);

  const onHit = useCallback(
    (card: CardRef) => {
      if (answeredRef.current || !card.alive) return;
      answeredRef.current = true;
      stopLoop();
      const q = questions[currentRound];
      if (!q) return;

      if (card.isOk) {
        if (card.el) {
          card.el.style.transform = '';
          card.el.classList.add('hit-ok');
        }
        const mult = CMULT[Math.min(comboRef.current, CMULT.length - 1)];
        const pts = Math.round(100 * mult);
        setCombo((c) => {
          const nc = c + 1;
          comboRef.current = nc;
          setMaxCombo((m) => Math.max(m, nc));
          return nc;
        });
        setSpeed((s) => {
          const ns = Math.min(MAX_SPEED, s + SPEED_INC);
          speedRef.current = ns;
          return ns;
        });
        setFeedback({ type: 'ok', q });
      } else {
        if (card.el) {
          card.el.style.transform = '';
          card.el.classList.add('hit-bad');
        }
        cardsRef.current.forEach((c) => {
          if (c.isOk && c.el) {
            c.el.style.transform = '';
            c.el.classList.add('reveal');
          }
        });
        setCombo(0);
        comboRef.current = 0;
        setFeedback({ type: 'bad', q });
      }
    },
    [questions, currentRound, stopLoop]
  );

  const makeCards = useCallback(
    (q: SniperQuestion) => {
      const zone = zoneRef.current;
      if (!zone) return;
      purgeCards();

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
        const spVar = 0.8 + ln * 0.13 + (Math.random() - 0.5) * 0.06;
        const card: CardRef = {
          id: `card_${i}`,
          text: dose,
          isOk,
          x: baseX,
          y: -(60 + ln * 22),
          speed: speedRef.current * spVar,
          phase: Math.random() * Math.PI * 2,
          rotBase: (Math.random() - 0.5) * 3.5,
          alive: true,
          el: null,
          laneIndex: ln,
        };

        const el = document.createElement('div');
        el.className = 'dose-card';
        el.style.cssText = `width:${cw}px;left:${baseX}px;`;
        el.setAttribute('role', 'button');
        el.setAttribute('tabIndex', '0');
        el.setAttribute('aria-label', `Dose option: ${dose}`);
        el.innerHTML = `<div style="position:absolute;top:7px;right:9px;font-size:14px;opacity:0.3">${icons[i]}</div><div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:clamp(11px,3.2vw,14px);color:#D8E8F8;line-height:1.2">${dose}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#1E3A5A;text-transform:uppercase;letter-spacing:0.06em">tap if correct</div>`;

        const hitHandler = () => onHit(card);
        const keyHandler = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            hitHandler();
          }
        };
        el.addEventListener('click', hitHandler);
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          hitHandler();
        }, { passive: false });
        el.addEventListener('keydown', keyHandler);
        zone.appendChild(el);
        card.el = el;
        newCards.push(card);
      });

      cardsRef.current = newCards;

      // Setup resize handler for this round
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
      }
      resizeHandlerRef.current = () => {
        const newZw = zone.offsetWidth;
        const newCw = computeCardWidth();
        cardsRef.current.forEach((c) => {
          if (!c.alive || !c.el) return;
          c.x = Math.round(LANES[c.laneIndex] * newZw - newCw / 2);
          c.el.style.left = c.x + 'px';
          c.el.style.width = newCw + 'px';
        });
      };
      window.addEventListener('resize', resizeHandlerRef.current);
    },
    [computeCardWidth, onHit, purgeCards]
  );

  const loop = useCallback(
    (ts: number) => {
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
          if (pct > 0.68) {
            c.el.classList.add('danger');
          } else {
            c.el.classList.remove('danger');
          }
        }
        if (c.y > zh + 5) {
          c.alive = false;
          if (c.el) c.el.style.opacity = '0';
        }
        if (c.isOk && c.y > zh + 5) anyFloor = true;
      });

      if (!answeredRef.current && anyFloor) {
        answeredRef.current = true;
        setCombo(0);
        comboRef.current = 0;
        const q = questions[currentRound];
        if (q) {
          setFeedback({ type: 'tmout', q });
        }
        stopLoop();
        return;
      }
      if (!answeredRef.current) {
        animIdRef.current = requestAnimationFrame(loop);
      }
    },
    [questions, currentRound, stopLoop]
  );

  const startLoop = useCallback(() => {
    if (animIdRef.current) return;
    lastTimeRef.current = performance.now();
    animIdRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const loadRound = useCallback(() => {
    answeredRef.current = false;
    setFeedback(null);
    const q = questions[currentRound];
    if (!q) return;
    if (loadRoundTimeoutRef.current) clearTimeout(loadRoundTimeoutRef.current);
    loadRoundTimeoutRef.current = setTimeout(() => {
      makeCards(q);
      startLoop();
    }, 50);
  }, [questions, currentRound, makeCards, startLoop]);

  const nextRound = useCallback(() => {
    setFeedback(null);
    setCurrentRound((prev) => prev + 1);
  }, []);

  const initGame = useCallback(() => {
    const shuffled = shuffle(allQuestions);
    setQuestions(shuffled);
    setCurrentRound(0);
    setCombo(0);
    setMaxCombo(0);
    setSpeed(BASE_SPEED);
    speedRef.current = BASE_SPEED;
    comboRef.current = 0;
    answeredRef.current = false;
    setFeedback(null);
  }, [allQuestions]);

  // Load round when currentRound changes
  useEffect(() => {
    if (questions.length > 0) {
      loadRound();
    }
    return () => stopLoop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, questions.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopLoop();
      purgeCards();
      if (loadRoundTimeoutRef.current) clearTimeout(loadRoundTimeoutRef.current);
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
      }
    };
  }, [stopLoop, purgeCards]);

  const q = questions[currentRound] ?? null;

  return {
    questions,
    currentRound,
    q,
    combo,
    maxCombo,
    speed,
    feedback,
    zoneRef,
    initGame,
    nextRound,
    loadRound,
  };
}
