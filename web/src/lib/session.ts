/**
 * PedsIQ — Quiz Session Builder & State Machine
 * Generates sessions from MCQ bank based on mode, topics, and user history.
 */

import {
  type McqQuestion,
  type QuizSession,
  type QuizResponse,
  type SessionMode,
  type Topic,
  type Difficulty,
  type MasteryLevel,
} from '@/types/mcq';
import { loadProfile } from './storage';

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Weakness Score ──────────────────────────────────────────────────────────

/**
 * Computes weakness score for a topic.
 * Higher = weaker (needs more practice).
 * Factors: (1 - accuracy) × recency decay × effort penalty
 */
export function computeWeaknessScore(
  answered: number,
  correct: number,
  lastSeen: string | null
): number {
  if (answered === 0) return 1.0; // Unknown = weak
  const accuracy = correct / answered;
  const daysSince = lastSeen
    ? (Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24)
    : 30;
  const recencyDecay = Math.min(daysSince / 30, 2); // 0–2x multiplier
  const effortPenalty = answered > 10 && accuracy < 0.5 ? 1.5 : 1.0;
  return (1 - accuracy) * (1 + recencyDecay) * effortPenalty;
}

// ─── Session Builders ────────────────────────────────────────────────────────

export interface SessionConfig {
  mode: SessionMode;
  topics?: Topic[];
  difficulties?: Difficulty[];
  questionCount?: number;
  excludeIds?: string[];
}

function filterQuestions(
  mcqs: McqQuestion[],
  config: SessionConfig
): McqQuestion[] {
  return mcqs.filter((q) => {
    if (config.topics && !config.topics.includes(q.meta.topic)) return false;
    if (config.difficulties && !config.difficulties.includes(q.meta.difficulty))
      return false;
    if (config.excludeIds?.includes(q.id)) return false;
    return true;
  });
}

function buildUnlimitedSession(mcqs: McqQuestion[]): string[] {
  return shuffle(mcqs).map((q) => q.id);
}

function buildQuick10Session(mcqs: McqQuestion[]): string[] {
  return shuffle(mcqs).slice(0, 10).map((q) => q.id);
}

function buildCustomSession(
  mcqs: McqQuestion[],
  config: SessionConfig
): string[] {
  const filtered = filterQuestions(mcqs, config);
  const count = config.questionCount ?? 20;
  return shuffle(filtered).slice(0, count).map((q) => q.id);
}

function buildWeakTopicsSession(mcqs: McqQuestion[]): string[] {
  const profile = loadProfile();
  const topicScores = new Map<string, number>();

  // Gather all topics present in the bank
  const allTopics = new Set(mcqs.map((q) => q.meta.topic));

  for (const topic of allTopics) {
    const stats = profile.topicStats[topic];
    const score = computeWeaknessScore(
      stats?.answered ?? 0,
      stats?.correct ?? 0,
      stats?.lastSeen ?? null
    );
    topicScores.set(topic, score);
  }

  // Sort topics by weakness (descending)
  const weakTopics = Array.from(topicScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  // Pull questions from weak topics
  const pool = mcqs.filter((q) => weakTopics.includes(q.meta.topic));

  // Prioritize questions the user hasn't seen or got wrong
  const scored = pool.map((q) => {
    const hist = profile.questionHistory[q.id];
    let score = Math.random();
    if (!hist) score += 2; // Unseen = high priority
    else if (hist.correctAttempts === 0) score += 1.5; // Never correct
    else if (hist.attempts > 1 && hist.correctAttempts / hist.attempts < 0.5)
      score += 1; // Struggling
    return { id: q.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20).map((s) => s.id);
}

function buildRepeatWrongSession(mcqs: McqQuestion[]): string[] {
  const profile = loadProfile();
  const wrongIds = Object.entries(profile.questionHistory)
    .filter(([, h]) => h.attempts > 0 && h.correctAttempts === 0)
    .map(([id]) => id);

  // Also include questions with < 50% accuracy
  const strugglingIds = Object.entries(profile.questionHistory)
    .filter(([, h]) => h.attempts >= 2 && h.correctAttempts / h.attempts < 0.5)
    .map(([id]) => id);

  const combined = Array.from(new Set([...wrongIds, ...strugglingIds]));
  const validIds = combined.filter((id) => mcqs.some((q) => q.id === id));

  if (validIds.length === 0) {
    // Fallback: serve random questions
    return shuffle(mcqs).slice(0, 10).map((q) => q.id);
  }

  return shuffle(validIds);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function createSession(
  mcqs: McqQuestion[],
  config: SessionConfig
): QuizSession {
  let questionIds: string[];

  switch (config.mode) {
    case 'unlimited':
      questionIds = buildUnlimitedSession(mcqs);
      break;
    case 'quick_10':
      questionIds = buildQuick10Session(mcqs);
      break;
    case 'custom':
      questionIds = buildCustomSession(mcqs, config);
      break;
    case 'weak_topics':
      questionIds = buildWeakTopicsSession(mcqs);
      break;
    case 'repeat_wrong':
      questionIds = buildRepeatWrongSession(mcqs);
      break;
    default:
      questionIds = buildQuick10Session(mcqs);
  }

  return {
    id: crypto.randomUUID?.() ?? `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    mode: config.mode,
    questionIds,
    responses: [],
    currentIndex: 0,
    status: 'active',
    startedAt: nowIso(),
  };
}

export function recordResponse(
  session: QuizSession,
  response: QuizResponse
): QuizSession {
  return {
    ...session,
    responses: [...session.responses, response],
    currentIndex: session.currentIndex + 1,
  };
}

export function isSessionComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questionIds.length;
}

export function getSessionAccuracy(session: QuizSession): number {
  if (session.responses.length === 0) return 0;
  const correct = session.responses.filter((r) => r.correct).length;
  return correct / session.responses.length;
}

export function getSessionResults(session: QuizSession) {
  const total = session.responses.length;
  const correct = session.responses.filter((r) => r.correct).length;
  const incorrect = total - correct;
  const accuracy = total > 0 ? correct / total : 0;

  const byTopic: Record<string, { total: number; correct: number }> = {};
  // Note: topic aggregation requires question lookup, done at component level

  return {
    total,
    correct,
    incorrect,
    accuracy,
    timeSpentMs: session.responses.reduce((sum, r) => sum + r.timeSpentMs, 0),
    byTopic,
  };
}

// ─── Mastery Calculation ─────────────────────────────────────────────────────

export function computeMasteryLevel(
  answered: number,
  correct: number,
  streak: number
): MasteryLevel {
  if (answered < 3) return 0;
  const accuracy = correct / answered;
  if (answered >= 8 && accuracy >= 0.85 && streak >= 5) return 3;
  if (answered >= 5 && accuracy >= 0.7 && streak >= 3) return 2;
  return 1;
}
