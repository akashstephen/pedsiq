'use client';

import { useCallback, useMemo, useState } from 'react';
import { getReviewQueue, getReviewQueueSummary, removeReviewItem } from '@/domain/review/storage';
import { type ReviewItem, type ReviewSource } from '@/domain/review/types';

export type ReviewFilter = ReviewSource | 'all' | 'traps';

export function useReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>(() => getReviewQueue());
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const visibleItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'traps') return items.filter((item) => Boolean(item.trap));
    return items.filter((item) => item.source === filter);
  }, [filter, items]);

  const summary = useMemo(() => getReviewQueueSummary(items), [items]);

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
    filter,
    setFilter,
    refresh,
    remove,
  };
}
