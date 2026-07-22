import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { debounce } from '../utils/helpers';
import { APP_CONFIG, ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY } from '../utils/constants';
import type { Tool } from '../types';

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = searchClient.initIndex('tools');

interface UseToolsSearchProps {
  activeCategory: string;
  activeTags: string[];
  sortBy: string;
}

export function useToolsSearch({ activeCategory, activeTags, sortBy }: UseToolsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Debounce search query
  const debouncedSetQuery = useRef(
    debounce((q: string) => {
      setDebouncedQuery(q);
    }, APP_CONFIG.DEBOUNCE_MS)
  ).current;

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearchQuery(val);
      debouncedSetQuery(val);
    },
    [debouncedSetQuery]
  );

  const [prevQuery, setPrevQuery] = useState(debouncedQuery);

  if (prevQuery !== debouncedQuery) {
    setPrevQuery(debouncedQuery);
    setTools([]);
    setPage(0);
    setHasMore(true);
  }

  // Fetch tools from Algolia
  useEffect(() => {
    const fetchTools = async () => {
      if (page === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const { hits, nbPages } = await index.search(debouncedQuery, {
          page,
          hitsPerPage: APP_CONFIG.ALGOLIA_HITS_PER_PAGE,
        });

        const fetchedTools: Tool[] = hits.map((tool: any) => ({
          id: tool.objectID,
          name: tool.name,
          category: tool.category,
          url: tool.url,
          imageUrl:
            tool.screenshotUrl ||
            'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop',
          description: tool.description || 'High-performance platform.',
          tags: tool.tags || [],
        }));

        setTools((prev) => (page === 0 ? fetchedTools : [...prev, ...fetchedTools]));
        setHasMore(page + 1 < nbPages);
        setFetchError('');
      } catch (err: any) {
        console.warn('Failed to fetch tools:', err);
        setFetchError(err.message || 'Failed to load tools. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchTools();
  }, [debouncedQuery, page]);

  // Apply frontend filtering and sorting
  const filteredTools = useMemo(() => {
    let result = tools.filter((tool) => {
      if (activeCategory !== 'All Tools' && tool.category !== activeCategory) return false;
      if (activeTags.length > 0) {
        const toolTags = tool.tags || [];
        return activeTags.every((tag) => toolTags.includes(tag));
      }
      return true;
    });

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [activeCategory, activeTags, tools, sortBy]);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    handleSearchChange,
    tools,
    filteredTools,
    totalItems: filteredTools.length,
    isLoading,
    isLoadingMore,
    fetchError,
    hasMore,
    loadMore,
  };
}
