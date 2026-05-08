import { type BrainTarget } from '@/domain/topics/types';

export type ReviewSource = 'mcq' | 'arcade';

export type ReviewStatus = 'due' | 'seen' | 'cleared';

export interface ReviewItem {
  id: string;
  source: ReviewSource;
  sourceLabel: string;
  sourceId: string;
  topic?: string;
  title: string;
  prompt: string;
  answer: string;
  explanation?: string;
  trap?: string;
  brainTarget: BrainTarget;
  addedAt: string;
  attempts?: number;
  correctAttempts?: number;
  href?: string;
  status: ReviewStatus;
}

export interface ReviewQueueSummary {
  total: number;
  arcade: number;
  mcq: number;
  traps: number;
}
