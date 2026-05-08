'use client';

import mcqs from '@/data/mcqs.json';
import { getStudyList, removeFromStudyList } from '@/lib/arcade-storage';
import { loadProfile } from '@/lib/storage';
import { type ArcadeGameId } from '@/types/arcade';
import { type BrainTarget } from '@/domain/topics/types';
import { type McqQuestion } from '@/types/mcq';
import { type ReviewItem, type ReviewQueueSummary, type ReviewSource } from './types';

const sourceLabels: Record<ReviewSource, string> = {
  mcq: 'MCQ Practice',
  arcade: 'Retrieval Lab',
};

const gameLabels: Record<ArcadeGameId, string> = {
  'dose-duel': 'Dose Duel',
  'dose-sniper': 'Dose Sniper',
  'feature-wars': 'Feature Wars',
  'protocol-builder': 'Protocol Builder',
  'trap-defuser': 'Trap Defuser',
};

const gameHrefs: Record<ArcadeGameId, string> = {
  'dose-duel': '/arcade/dose-duel/',
  'dose-sniper': '/arcade/dose-sniper/',
  'feature-wars': '/arcade/feature-wars/',
  'protocol-builder': '/arcade/protocol-builder/',
  'trap-defuser': '/arcade/trap-defuser/',
};

const mcqBank = mcqs as McqQuestion[];

function normalizeDate(value?: string): string {
  return value ?? new Date(0).toISOString();
}

function getMcqReviewItems(): ReviewItem[] {
  const profile = loadProfile();

  return Object.entries(profile.questionHistory)
    .filter(([, history]) => history.attempts > 0 && history.correctAttempts < history.attempts)
    .map(([questionId, history]) => {
      const question = mcqBank.find((item) => item.id === questionId);
      if (!question) return null;

      const reviewItem: ReviewItem = {
        id: `mcq:${questionId}`,
        source: 'mcq' as const,
        sourceLabel: sourceLabels.mcq,
        sourceId: questionId,
        topic: question.explanation.relatedTopic ?? question.meta.topic,
        title: question.meta.subtopic,
        prompt: question.question,
        answer: question.options[question.correctIndex],
        explanation: question.explanation.takeaway || question.explanation.correct,
        trap: question.explanation.misconception,
        brainTarget: (history.lastConfidence !== 'sure' ? 'retrieval' : 'hypercorrection') satisfies BrainTarget,
        addedAt: history.lastAttempt,
        attempts: history.attempts,
        correctAttempts: history.correctAttempts,
        href: '/quiz/session/?mode=repeat_wrong',
        status: 'due' as const,
      };

      return reviewItem;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function getArcadeReviewItems(): ReviewItem[] {
  return getStudyList().map((item) => ({
    id: `arcade:${item.gameId}:${item.questionId}`,
    source: 'arcade' as const,
    sourceLabel: gameLabels[item.gameId],
    sourceId: item.questionId,
    title: gameLabels[item.gameId],
    prompt: item.text,
    answer: item.correctAnswer,
    explanation: item.explanation,
    trap: item.trap,
    brainTarget: item.trap ? 'hypercorrection' : 'retrieval',
    addedAt: item.addedAt,
    href: gameHrefs[item.gameId],
    status: 'due' as const,
  }));
}

export function getReviewQueue(): ReviewItem[] {
  return [...getArcadeReviewItems(), ...getMcqReviewItems()].sort(
    (a, b) => new Date(normalizeDate(b.addedAt)).getTime() - new Date(normalizeDate(a.addedAt)).getTime()
  );
}

export function getReviewQueueSummary(items = getReviewQueue()): ReviewQueueSummary {
  return {
    total: items.length,
    arcade: items.filter((item) => item.source === 'arcade').length,
    mcq: items.filter((item) => item.source === 'mcq').length,
    traps: items.filter((item) => Boolean(item.trap)).length,
  };
}

export function removeReviewItem(item: ReviewItem): void {
  if (item.source !== 'arcade') return;
  const [, gameId, questionId] = item.id.split(':') as [string, ArcadeGameId, string];
  removeFromStudyList(gameId, questionId);
}
