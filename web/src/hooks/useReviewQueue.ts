'use client';

import { useCallback, useMemo, useState } from 'react';
import { getReviewQueue, getReviewQueueSummary, removeReviewItem } from '@/domain/review/storage';
import { type ReviewItem, type ReviewSource } from '@/domain/review/types';

export type ReviewFilter = ReviewSource | 'all' | 'traps';
export type ConfidenceFilter = 'all' | 'mismatch';

export function useReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>(() => getReviewQueue());
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const sourceMatches =
        filter === 'all' ||
        (filter === 'traps' ? Boolean(item.trap) : item.source === filter);
      const topicMatches = topicFilter === 'all' || item.topic === topicFilter;
      const confidenceMatches = confidenceFilter === 'all' || item.brainTarget === 'hypercorrection';
      return sourceMatches && topicMatches && confidenceMatches;
    });
  }, [confidenceFilter, filter, items, topicFilter]);

  const summary = useMemo(() => getReviewQueueSummary(items), [items]);
  const topics = useMemo(
    () => Array.from(new Set(items.map((item) => item.topic).filter(Boolean) as string[])).sort(),
    [items]
  );

  const refresh = useCallback(() => {
    setItems(getReviewQueue());
  }, []);

  const remove = useCallback((item: ReviewItem) => {
    removeReviewItem(item);
    setItems(getReviewQueue());
  }, []);

  return {
    items,
    visibleItems,
    summary,
    topics,
    filter,
    setFilter,
    topicFilter,
    setTopicFilter,
    confidenceFilter,
    setConfidenceFilter,
    refresh,
    remove,
  };
}
