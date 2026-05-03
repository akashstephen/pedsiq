/**
 * PedsIQ — Analytics & Personalization Engine
 * Computes weakness reports, mastery levels, spaced repetition queues,
 * and generates actionable insights from user performance data.
 */

'use client';

import {
  type UserProfile,
  type McqQuestion,
  type WeaknessReport,
  type SpacedRepetitionItem,
  type MasteryLevel,
  type QuizResponse,
} from '@/types/mcq';
import { loadProfile, saveProfile, loadSpacedRepetition, saveSpacedRepetition } from './storage';
import { computeMasteryLevel, computeWeaknessScore } from './session';

// ─── Weakness Report ─────────────────────────────────────────────────────────

export function generateWeaknessReport(
  profile: UserProfile,
  allQuestions: McqQuestion[]
): WeaknessReport[] {
  const topics = new Set(allQuestions.map((q) => q.meta.topic));

  return Array.from(topics)
    .map((topic) => {
      const stats = profile.topicStats[topic];
      const answered = stats?.answered ?? 0;
      const correct = stats?.correct ?? 0;
      const accuracy = answered > 0 ? correct / answered : 0;

      return {
        topic,
        score: computeWeaknessScore(answered, correct, stats?.lastSeen ?? null),
        accuracy,
        attempts: answered,
        masteryLevel: stats?.masteryLevel ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Performance Update (after each question) ────────────────────────────────

export function updatePerformance(
  question: McqQuestion,
  response: QuizResponse
): UserProfile {
  const profile = loadProfile();
  const topic = question.meta.topic;
  const qid = question.id;

  // Update totals
  profile.totalAnswered += 1;
  if (response.correct) profile.totalCorrect += 1;

  // Update topic stats
  if (!profile.topicStats[topic]) {
    profile.topicStats[topic] = {
      answered: 0,
      correct: 0,
      streak: 0,
      maxStreak: 0,
      lastSeen: new Date().toISOString(),
      masteryLevel: 0,
    };
  }

  const tStats = profile.topicStats[topic];
  tStats.answered += 1;
  if (response.correct) {
    tStats.correct += 1;
    tStats.streak += 1;
    if (tStats.streak > tStats.maxStreak) tStats.maxStreak = tStats.streak;
  } else {
    tStats.streak = 0;
  }
  tStats.lastSeen = new Date().toISOString();
  tStats.masteryLevel = computeMasteryLevel(
    tStats.answered,
    tStats.correct,
    tStats.streak
  );

  // Update question history
  if (!profile.questionHistory[qid]) {
    profile.questionHistory[qid] = {
      attempts: 0,
      correctAttempts: 0,
      lastAttempt: new Date().toISOString(),
      lastConfidence: response.confidence,
    };
  }

  const qHist = profile.questionHistory[qid];
  qHist.attempts += 1;
  if (response.correct) qHist.correctAttempts += 1;
  qHist.lastAttempt = new Date().toISOString();
  qHist.lastConfidence = response.confidence;

  saveProfile(profile);
  return profile;
}

// ─── Session Finalization ────────────────────────────────────────────────────

export function finalizeSession(
  sessionId: string,
  correctCount: number,
  questionCount: number
): void {
  const profile = loadProfile();
  profile.sessions.push({
    id: sessionId,
    mode: 'custom', // Will be updated by caller if needed
    questionCount,
    correctCount,
    accuracy: questionCount > 0 ? correctCount / questionCount : 0,
    completedAt: new Date().toISOString(),
  });

  // Keep only last 50 sessions
  if (profile.sessions.length > 50) {
    profile.sessions = profile.sessions.slice(-50);
  }

  saveProfile(profile);
}

// ─── Spaced Repetition (Simplified SM-2) ─────────────────────────────────────

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

export function updateSpacedRepetition(
  questionId: string,
  correct: boolean,
  confidence: 'sure' | 'unsure' | 'guess'
): void {
  const items = loadSpacedRepetition();
  let item = items.find((i) => i.questionId === questionId);

  if (!item) {
    item = {
      questionId,
      nextReview: new Date().toISOString(),
      intervalDays: 0,
      easeFactor: DEFAULT_EASE,
      repetitions: 0,
    };
    items.push(item);
  }

  // Quality score: sure+correct=5, unsure+correct=4, guess+correct=3,
  // sure+wrong=2, unsure+wrong=1, guess+wrong=0
  let quality = 0;
  if (correct) {
    quality = confidence === 'sure' ? 5 : confidence === 'unsure' ? 4 : 3;
  } else {
    quality = confidence === 'sure' ? 2 : confidence === 'unsure' ? 1 : 0;
  }

  if (quality >= 3) {
    // Correct answer
    item.repetitions += 1;
    if (item.repetitions === 1) item.intervalDays = 1;
    else if (item.repetitions === 2) item.intervalDays = 3;
    else item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
  } else {
    // Wrong answer — reset
    item.repetitions = 0;
    item.intervalDays = 1;
  }

  // Update ease factor
  item.easeFactor = Math.max(
    MIN_EASE,
    item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Set next review date
  const next = new Date();
  next.setDate(next.getDate() + item.intervalDays);
  item.nextReview = next.toISOString();

  saveSpacedRepetition(items);
}

export function getDueReviewQuestions(
  allQuestions: McqQuestion[],
  maxCount: number = 20
): string[] {
  const items = loadSpacedRepetition();
  const now = new Date();

  const due = items
    .filter((i) => new Date(i.nextReview) <= now)
    .filter((i) => allQuestions.some((q) => q.id === i.questionId))
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
    .slice(0, maxCount)
    .map((i) => i.questionId);

  return due;
}

// ─── Insights ────────────────────────────────────────────────────────────────

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'trend' | 'milestone';
  topic?: string;
  message: string;
}

export function generateInsights(
  profile: UserProfile,
  allQuestions: McqQuestion[]
): LearningInsight[] {
  const insights: LearningInsight[] = [];

  // Strengths
  for (const [topic, stats] of Object.entries(profile.topicStats)) {
    if (stats.masteryLevel >= 3) {
      insights.push({
        type: 'strength',
        topic,
        message: `You've mastered ${topic} — ${stats.correct}/${stats.answered} correct!`,
      });
    }
  }

  // Weaknesses
  const report = generateWeaknessReport(profile, allQuestions);
  for (const item of report.slice(0, 2)) {
    if (item.attempts >= 3 && item.accuracy < 0.5) {
      insights.push({
        type: 'weakness',
        topic: item.topic,
        message: `${item.topic} needs attention — ${Math.round(item.accuracy * 100)}% accuracy`,
      });
    }
  }

  // Milestones
  if (profile.totalAnswered >= 50 && profile.totalAnswered < 55) {
    insights.push({
      type: 'milestone',
      message: '🎯 Milestone: 50 questions answered!',
    });
  }
  if (profile.totalAnswered >= 100 && profile.totalAnswered < 105) {
    insights.push({
      type: 'milestone',
      message: '🎯 Milestone: 100 questions answered!',
    });
  }

  // Trend
  const recentSessions = profile.sessions.slice(-5);
  if (recentSessions.length >= 3) {
    const accuracies = recentSessions.map((s) => s.accuracy);
    const improving =
      accuracies[accuracies.length - 1] > accuracies[0];
    if (improving) {
      insights.push({
        type: 'trend',
        message: '📈 Your accuracy is improving! Keep it up.',
      });
    }
  }

  return insights.slice(0, 5);
}
