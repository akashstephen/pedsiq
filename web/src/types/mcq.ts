/**
 * PedsIQ MCQ Learning Engine — TypeScript Schema
 * Version: 1.0.0
 *
 * All MCQ data must conform to this schema.
 * Build-time validation enforces structural correctness.
 */

// ─── Core Question Types ────────────────────────────────────────────────────

export type Topic = 'gastroenterology' | 'nephrology' | 'endocrinology';

export type System = 'GIT' | 'GU' | 'ENDO';

export type Difficulty = 1 | 2 | 3; // Easy | Moderate | Hard

export type QuestionType =
  | 'clinical_vignette'
  | 'conceptual'
  | 'application'
  | 'diagnostic';

export type BloomLevel = 'recall' | 'understand' | 'apply' | 'analyze';

export type ConfidenceLevel = 'sure' | 'unsure' | 'guess';

export type SessionMode =
  | 'unlimited'
  | 'custom'
  | 'weak_topics'
  | 'repeat_wrong'
  | 'quick_10';

export type MasteryLevel = 0 | 1 | 2 | 3; // None | Learning | Proficient | Mastered

export type SessionStatus = 'active' | 'paused' | 'completed';

// ─── MCQ Question ────────────────────────────────────────────────────────────

export interface McqQuestion {
  /** Unique identifier: topic_prefix + 3-digit serial */
  id: string;

  /** Question stem — clinical vignette, conceptual, or application */
  question: string;

  /** Exactly 4 options (A–D) */
  options: [string, string, string, string];

  /** Zero-based index of the correct option */
  correctIndex: 0 | 1 | 2 | 3;

  /** Rich explanation block */
  explanation: {
    /** Why the correct answer is right */
    correct: string;

    /** Parallel array — why EACH option is wrong (index-aligned) */
    distractors: [string, string, string, string];

    /** Common student misconception this question targets */
    misconception: string;

    /** One-line high-yield clinical pearl */
    takeaway: string;

    /** Optional: slug of related structured-answer topic for deep-linking */
    relatedTopic?: string;
  };

  /** Metadata for filtering, analytics, and validation */
  meta: {
    topic: Topic;
    subtopic: string;
    system: System;
    difficulty: Difficulty;
    type: QuestionType;
    bloomLevel: BloomLevel;
    /** Nelson Essentials chapter reference */
    nelsonRef: string;
    /** Tags for filtering and search */
    tags: string[];
    /** Original KUHS question reference, if adapted from PYQ */
    pyqRef?: string;
    /** Whether this question has passed validation */
    validated: boolean;
    /** 0.0–1.0 confidence from validation engine */
    confidenceScore: number;
  };
}

// ─── User Profile (persisted in localStorage) ────────────────────────────────

export interface TopicStats {
  answered: number;
  correct: number;
  /** Current consecutive correct streak */
  streak: number;
  maxStreak: number;
  lastSeen: string; // ISO date
  masteryLevel: MasteryLevel;
}

export interface QuestionHistory {
  attempts: number;
  correctAttempts: number;
  lastAttempt: string; // ISO date
  lastConfidence: ConfidenceLevel;
}

export interface QuizSettings {
  showExplanationsImmediately: boolean;
  soundEffects: boolean;
  reduceMotion: boolean;
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  questionCount: number;
  correctCount: number;
  accuracy: number;
  completedAt: string;
}

export interface UserProfile {
  /** Schema version for migration */
  version: 1;

  totalAnswered: number;
  totalCorrect: number;

  /** Per-topic performance statistics */
  topicStats: Record<string, TopicStats>;

  /** Per-question attempt history */
  questionHistory: Record<string, QuestionHistory>;

  /** Completed session summaries (last 50) */
  sessions: SessionRecord[];

  /** User preferences */
  settings: QuizSettings;

  /** Account creation timestamp */
  createdAt: string;

  /** Last persistence timestamp */
  lastSyncedAt: string;
}

// ─── Quiz Session (in-memory + localStorage backup) ──────────────────────────

export interface QuizResponse {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpentMs: number;
  confidence: ConfidenceLevel;
}

export interface QuizSession {
  id: string;
  mode: SessionMode;
  /** Ordered question IDs for this session */
  questionIds: string[];
  /** User responses so far */
  responses: QuizResponse[];
  /** Current question index (0-based) */
  currentIndex: number;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
}

// ─── Analytics / Weakness ────────────────────────────────────────────────────

export interface WeaknessReport {
  topic: string;
  score: number; // 0.0–1.0, higher = weaker
  accuracy: number;
  attempts: number;
  masteryLevel: MasteryLevel;
}

export interface SpacedRepetitionItem {
  questionId: string;
  nextReview: string; // ISO date
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isValidMcqQuestion(obj: unknown): obj is McqQuestion {
  if (!obj || typeof obj !== 'object') return false;
  const q = obj as Record<string, unknown>;

  return (
    typeof q.id === 'string' &&
    typeof q.question === 'string' &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === 'string') &&
    typeof q.correctIndex === 'number' &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3 &&
    typeof q.explanation === 'object' &&
    q.explanation !== null &&
    typeof (q.explanation as Record<string, unknown>).correct === 'string' &&
    Array.isArray((q.explanation as Record<string, unknown>).distractors) &&
    ((q.explanation as Record<string, unknown>).distractors as unknown[]).length === 4 &&
    typeof (q.explanation as Record<string, unknown>).misconception === 'string' &&
    typeof (q.explanation as Record<string, unknown>).takeaway === 'string' &&
    typeof q.meta === 'object' &&
    q.meta !== null &&
    typeof (q.meta as Record<string, unknown>).topic === 'string' &&
    typeof (q.meta as Record<string, unknown>).subtopic === 'string' &&
    typeof (q.meta as Record<string, unknown>).nelsonRef === 'string' &&
    typeof (q.meta as Record<string, unknown>).validated === 'boolean' &&
    typeof (q.meta as Record<string, unknown>).confidenceScore === 'number'
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TOPIC_LABELS: Record<Topic, string> = {
  gastroenterology: 'Gastroenterology & Hepatology',
  nephrology: 'Nephrology & Urology',
  endocrinology: 'Endocrinology',
};

export const SYSTEM_LABELS: Record<System, string> = {
  GIT: 'Gastrointestinal',
  GU: 'Genitourinary',
  ENDO: 'Endocrine',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Hard',
};

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: 'Not Started',
  1: 'Learning',
  2: 'Proficient',
  3: 'Mastered',
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: '#FF3B30',
  1: '#FF9500',
  2: '#007AFF',
  3: '#34C759',
};

export const STORAGE_KEYS = {
  USER_PROFILE: 'pedsiq_user_v1',
  ACTIVE_SESSION: 'pedsiq_session_v1',
  SPACED_REPETITION: 'pedsiq_sr_v1',
} as const;
