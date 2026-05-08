'use client';

import { getGameStats } from '@/lib/arcade-storage';
import { loadProfile, getOverallAccuracy } from '@/lib/storage';
import { getReviewQueueSummary } from '@/domain/review/storage';
import { type ArcadeGameId } from '@/types/arcade';

const arcadeGames: ArcadeGameId[] = [
  'dose-duel',
  'dose-sniper',
  'feature-wars',
  'protocol-builder',
  'trap-defuser',
];

export interface TopicCoverageRow {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
  lastSeen?: string;
}

export interface CoverageSummary {
  mcqAnswered: number;
  mcqAccuracy: number | null;
  topicsTouched: number;
  totalTrackedTopics: number;
  arcadeSessions: number;
  arcadeQuestions: number;
  reviewDue: number;
  trapItems: number;
  recentSessions: number;
  topicRows: TopicCoverageRow[];
}

function isWithinDays(value: string, days: number): boolean {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= days * 24 * 60 * 60 * 1000;
}

export function getCoverageSummary(): CoverageSummary {
  const profile = loadProfile();
  const review = getReviewQueueSummary();
  const arcadeStats = arcadeGames.map((gameId) => getGameStats(gameId));
  const topicRows = Object.entries(profile.topicStats)
    .map(([topic, stats]) => ({
      topic,
      attempts: stats.answered,
      correct: stats.correct,
      accuracy: stats.answered > 0 ? stats.correct / stats.answered : null,
      lastSeen: stats.lastSeen,
    }))
    .sort((a, b) => b.attempts - a.attempts);

  return {
    mcqAnswered: profile.totalAnswered,
    mcqAccuracy: profile.totalAnswered > 0 ? getOverallAccuracy(profile) : null,
    topicsTouched: topicRows.filter((row) => row.attempts > 0).length,
    totalTrackedTopics: 3,
    arcadeSessions: arcadeStats.reduce((sum, stats) => sum + stats.totalSessions, 0),
    arcadeQuestions: arcadeStats.reduce((sum, stats) => sum + stats.totalQuestionsAnswered, 0),
    reviewDue: review.total,
    trapItems: review.traps,
    recentSessions: profile.sessions.filter((session) => isWithinDays(session.completedAt, 7)).length,
    topicRows,
  };
}
