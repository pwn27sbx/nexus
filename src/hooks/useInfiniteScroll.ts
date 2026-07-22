import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  threshold?: number;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  isLoadingMore,
  threshold = 0.1,
  onLoadMore,
}: UseInfiniteScrollOptions): MutableRefObject<HTMLDivElement | null> {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, threshold, onLoadMore]);

  return loadMoreRef;
}
