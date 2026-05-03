/**
 * PedsIQ — Client-side Storage Layer
 * localStorage CRUD with schema migration, corruption recovery, and quota management.
 */

'use client';

import {
  type UserProfile,
  type QuizSession,
  type SpacedRepetitionItem,
  type QuizSettings,
  STORAGE_KEYS,
} from '@/types/mcq';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function tryParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ─── Default Factory ─────────────────────────────────────────────────────────

export function createDefaultProfile(): UserProfile {
  return {
    version: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    topicStats: {},
    questionHistory: {},
    sessions: [],
    settings: {
      showExplanationsImmediately: true,
      soundEffects: false,
      reduceMotion: false,
    },
    createdAt: nowIso(),
    lastSyncedAt: nowIso(),
  };
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  const parsed = tryParse<UserProfile>(raw);

  if (!parsed || parsed.version !== 1) {
    // Schema mismatch or corruption — reset with defaults
    const fresh = createDefaultProfile();
    saveProfile(fresh);
    return fresh;
  }

  return parsed;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  profile.lastSyncedAt = nowIso();
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    // Quota exceeded — prune old sessions
    if (profile.sessions.length > 10) {
      profile.sessions = profile.sessions.slice(-10);
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      } catch {
        console.warn('PedsIQ: localStorage quota exceeded even after pruning');
      }
    }
  }
}

export function updateProfile(partial: Partial<UserProfile>): UserProfile {
  const current = loadProfile();
  const updated = { ...current, ...partial };
  saveProfile(updated);
  return updated;
}

export function updateSettings(settings: Partial<QuizSettings>): QuizSettings {
  const profile = loadProfile();
  profile.settings = { ...profile.settings, ...settings };
  saveProfile(profile);
  return profile.settings;
}

// ─── Quiz Session ────────────────────────────────────────────────────────────

export function loadActiveSession(): QuizSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  return tryParse<QuizSession>(raw);
}

export function saveActiveSession(session: QuizSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

// ─── Spaced Repetition ───────────────────────────────────────────────────────

export function loadSpacedRepetition(): SpacedRepetitionItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SPACED_REPETITION);
  return tryParse<SpacedRepetitionItem[]>(raw) ?? [];
}

export function saveSpacedRepetition(items: SpacedRepetitionItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SPACED_REPETITION, JSON.stringify(items));
}

// ─── Statistics Helpers ──────────────────────────────────────────────────────

export function getTopicAccuracy(profile: UserProfile, topic: string): number {
  const stats = profile.topicStats[topic];
  if (!stats || stats.answered === 0) return 0;
  return stats.correct / stats.answered;
}

export function getOverallAccuracy(profile: UserProfile): number {
  if (profile.totalAnswered === 0) return 0;
  return profile.totalCorrect / profile.totalAnswered;
}

export function getStreak(profile: UserProfile, topic: string): number {
  return profile.topicStats[topic]?.streak ?? 0;
}
