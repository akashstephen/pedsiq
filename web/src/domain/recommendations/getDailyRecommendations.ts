'use client';

import { getGameStats } from '@/lib/arcade-storage';
import { getReviewQueueSummary } from '@/domain/review/storage';
import { loadProfile } from '@/lib/storage';
import { type BrainTarget } from '@/domain/topics/types';
import { type ArcadeGameId } from '@/types/arcade';

export type RecommendationIcon = 'brain' | 'flask' | 'shield' | 'clipboard' | 'book' | 'notebook';

export interface DailyRecommendation {
  href: string;
  title: string;
  description: string;
  icon: RecommendationIcon;
  target: BrainTarget;
  meta?: string;
  priority: number;
}

const arcadeGames: ArcadeGameId[] = [
  'dose-duel',
  'dose-sniper',
  'feature-wars',
  'protocol-builder',
  'trap-defuser',
];

function getArcadeSessionCount() {
  return arcadeGames.reduce((sum, gameId) => sum + getGameStats(gameId).totalSessions, 0);
}

export function getDailyRecommendations(): DailyRecommendation[] {
  const profile = loadProfile();
  const review = getReviewQueueSummary();
  const arcadeSessions = getArcadeSessionCount();

  const recommendations: DailyRecommendation[] = [];

  if (review.total > 0) {
    recommendations.push({
      href: '/notebook/',
      title: 'Review Notebook',
      description: 'Correct active misses before adding more new material.',
      icon: 'notebook',
      target: review.traps > 0 ? 'hypercorrection' : 'retrieval',
      meta: `${review.total} due`,
      priority: 100 + review.total,
    });
  }

  recommendations.push({
    href: profile.totalAnswered < 30 ? '/quiz/session/?mode=quick_10' : '/quiz/session/?mode=weak_topics',
    title: profile.totalAnswered < 30 ? 'Quick Retrieval' : 'Weak-System Drill',
    description: profile.totalAnswered < 30
      ? 'Ten focused MCQs to build an initial retrieval signal.'
      : 'Use prior attempts to bias practice toward weaker MCQ systems.',
    icon: 'brain',
    target: 'retrieval',
    meta: profile.totalAnswered < 30 ? '~8 min' : 'adaptive',
    priority: profile.totalAnswered < 30 ? 90 : 70,
  });

  recommendations.push({
    href: arcadeSessions < 3 ? '/arcade/protocol-builder/' : '/arcade/trap-defuser/',
    title: arcadeSessions < 3 ? 'Protocol Builder' : 'Trap Defuser',
    description: arcadeSessions < 3
      ? 'Rebuild a pediatric management algorithm from ordered clinical steps.'
      : 'Turn confident mistakes and examiner traps into durable corrections.',
    icon: arcadeSessions < 3 ? 'flask' : 'shield',
    target: arcadeSessions < 3 ? 'sequencing' : 'hypercorrection',
    meta: arcadeSessions < 3 ? '~6 min' : '~5 min',
    priority: 60,
  });

  recommendations.push({
    href: '/structured-answers/',
    title: 'Answer Studio',
    description: 'Generate a structured long-answer skeleton before reading the model answer.',
    icon: 'clipboard',
    target: 'generation',
    meta: 'print-ready',
    priority: 40,
  });

  recommendations.push({
    href: '/learn/',
    title: 'Learn Atlas',
    description: 'Re-enter the pediatric topic map and connect concepts to practice routes.',
    icon: 'book',
    target: 'consolidation',
    meta: '12 paths',
    priority: 30,
  });

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}
