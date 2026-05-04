/**
 * PedsIQ Arcade — Client-side Storage Layer
 * Separate from MCQ storage. Manages arcade profile, high scores, and study lists.
 */

'use client';

import {
  type ArcadeProfile,
  type ArcadeGameId,
  type GameStats,
  type ArcadeSession,
  type StudyListItem,
} from '@/types/arcade';

const STORAGE_KEY = 'pedsiq_arcade_v1';
const MAX_STUDY_LIST = 100;

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

function createDefaultGameStats(): GameStats {
  return {
    highScore: 0,
    totalSessions: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
    bestCombo: 0,
    bestAccuracy: 0,
    lastPlayedAt: nowIso(),
    studyList: [],
  };
}

function createDefaultProfile(): ArcadeProfile {
  const now = nowIso();
  return {
    version: 1,
    games: {
      'dose-duel': createDefaultGameStats(),
      'dose-sniper': createDefaultGameStats(),
      'feature-wars': createDefaultGameStats(),
    },
    createdAt: now,
    lastPlayedAt: now,
  };
}

export function loadArcadeProfile(): ArcadeProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = tryParse<ArcadeProfile>(raw);

  if (!parsed || parsed.version !== 1) {
    const fresh = createDefaultProfile();
    saveArcadeProfile(fresh);
    return fresh;
  }

  // Ensure all game keys exist (migration safety)
  const defaults = createDefaultProfile();
  for (const key of Object.keys(defaults.games) as ArcadeGameId[]) {
    if (!parsed.games[key]) {
      parsed.games[key] = createDefaultGameStats();
    }
  }

  return parsed;
}

export function saveArcadeProfile(profile: ArcadeProfile): void {
  if (typeof window === 'undefined') return;
  profile.lastPlayedAt = nowIso();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    console.warn('PedsIQ Arcade: localStorage quota exceeded');
  }
}

export function updateGameStats(
  gameId: ArcadeGameId,
  session: ArcadeSession,
  missed: StudyListItem[]
): void {
  const profile = loadArcadeProfile();
  const stats = profile.games[gameId];

  stats.totalSessions += 1;
  stats.totalQuestionsAnswered += session.totalQuestions;
  stats.totalCorrect += session.correctCount;
  if (session.score > stats.highScore) stats.highScore = session.score;
  if (session.accuracyPct > stats.bestAccuracy) stats.bestAccuracy = session.accuracyPct;

  // Update game-specific bests
  if (gameId === 'dose-duel') {
    // bestStreak tracked separately by caller if needed
  }
  if (gameId === 'dose-sniper') {
    // bestCombo tracked separately
  }

  stats.lastPlayedAt = nowIso();

  // Merge study list
  const existingIds = new Set(stats.studyList.map((s) => s.questionId));
  for (const item of missed) {
    if (!existingIds.has(item.questionId)) {
      stats.studyList.push(item);
      existingIds.add(item.questionId);
    }
  }
  if (stats.studyList.length > MAX_STUDY_LIST) {
    stats.studyList = stats.studyList.slice(-MAX_STUDY_LIST);
  }

  saveArcadeProfile(profile);
}

export function getGameStats(gameId: ArcadeGameId): GameStats {
  return loadArcadeProfile().games[gameId];
}

export function getStudyList(gameId?: ArcadeGameId): StudyListItem[] {
  const profile = loadArcadeProfile();
  if (gameId) {
    return profile.games[gameId].studyList;
  }
  return Object.values(profile.games).flatMap((g) => g.studyList);
}

export function clearStudyList(gameId?: ArcadeGameId): void {
  const profile = loadArcadeProfile();
  if (gameId) {
    profile.games[gameId].studyList = [];
  } else {
    for (const key of Object.keys(profile.games) as ArcadeGameId[]) {
      profile.games[key].studyList = [];
    }
  }
  saveArcadeProfile(profile);
}

export function removeFromStudyList(gameId: ArcadeGameId, questionId: string): void {
  const profile = loadArcadeProfile();
  const stats = profile.games[gameId];
  stats.studyList = stats.studyList.filter((s) => s.questionId !== questionId);
  saveArcadeProfile(profile);
}
