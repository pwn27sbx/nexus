// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import algoliasearch from 'algoliasearch/lite';
import BentoCard from './BentoCard';
import ListCard from './ListCard';
import SavePopover from './SavePopover';
import SkeletonCard from './SkeletonCard';
import SortDropdown from './SortDropdown';
import CategoriesModal from './CategoriesModal';
import CommandPalette from './CommandPalette';
import AutoCaptureModal from './AutoCaptureModal';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import LeaderboardModal from './LeaderboardModal';
import AdminPanel from './AdminPanel';
import ErrorBoundary from './ErrorBoundary';
import {
  SearchIcon,
  UserIcon,
  PlusIcon,
  GridIcon,
  ListIcon,
  TrophyIcon,
  LayersIcon,
  SunIcon,
  MoonIcon,
} from '../utils/icons';
import {
  TOP_CATEGORIES,
  API_BASE_URL,
  ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_KEY,
  APP_CONFIG,
} from '../utils/constants';
import { debounce } from '../utils/helpers';
import { playSound } from '../utils/sounds';

import type { Tool, User, SavePopoverConfig } from '../types';

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = searchClient.initIndex('tools');

// ==============================================
// MAIN APP COMPONENT
// ==============================================
export default function App() {
  // --- Hydration guard ---
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // --- Theme State (default safe values, load from localStorage after hydration) ---
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('nexus-theme', isDark ? 'dark' : 'light');
  }, [isDark, hydrated]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
    playSound('snap');
  }, []);

  // --- Accent Color ---
  const [accentColor, setAccentColor] = useState('#000000');

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-accent');
    if (saved) setAccentColor(saved);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-accent', accentColor);
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor, hydrated]);

  // --- Font Family ---
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-font-family');
    if (saved) setFontFamily(saved);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-font-family', fontFamily);
    document.documentElement.style.setProperty('--global-font', fontFamily);
    document.body.style.setProperty('font-family', fontFamily, 'important');
  }, [fontFamily, hydrated]);

  // --- Load fonts ---
  useEffect(() => {
    const loadFont = (id, url) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
      }
    };
    loadFont(
      'google-fonts-expanded',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&family=Geist+Mono:wght@400;500;700&display=swap'
    );
  }, []);

  // --- Search with Debounce ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useRef(
    debounce((q) => {
      setDebouncedQuery(q);
    }, APP_CONFIG.DEBOUNCE_MS)
  ).current;

  const handleSearchChange = useCallback(
    (val) => {
      setSearchQuery(val);
      debouncedSetQuery(val);
    },
    [debouncedSetQuery]
  );

  // --- View Mode ---
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-view');
    if (saved) setViewMode(saved);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-view', viewMode);
  }, [viewMode, hydrated]);

  // --- Tags State ---
  const [activeTags, setActiveTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);

  // --- Pagination State ---
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [savePopoverConfig, setSavePopoverConfig] = useState<SavePopoverConfig | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [user, setUser] = useState<User | null>(null);

  // --- Reset focus on filter changes ---
  useEffect(() => {
    setFocusedIndex(-1);
  }, [debouncedQuery, activeCategory, sortBy, viewMode]);

  // --- Global keyboard navigation ---
  useEffect(() => {
    if (
      isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen ||
      isCommandPaletteOpen || isCategoryModalOpen || savePopoverConfig
    )
      return;

    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const currentTools = tools.filter(
        (t) => activeCategory === 'All' || t.category === activeCategory
      );
      if (currentTools.length === 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < currentTools.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : currentTools.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        window.open(currentTools[focusedIndex].url, '_blank');
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedIndex, tools, activeCategory, isModalOpen, isAuthModalOpen, isProfileOpen,
      isLeaderboardOpen, isCommandPaletteOpen, isCategoryModalOpen, savePopoverConfig]);

  // --- Cmd+K shortcut ---
  useEffect(() => {
    const handleCmdK = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => {
          if (!prev) playSound('woosh');
          return !prev;
        });
      }
    };
    document.addEventListener('keydown', handleCmdK);
    return () => document.removeEventListener('keydown', handleCmdK);
  }, []);

  // --- Auth session check ---
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('payload-token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `JWT ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('payload-token');
        }
      } catch (err) {
        // Silently fail
      }
    };
    checkUserSession();
  }, [isAuthModalOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('payload-token');
    setUser(null);
    setIsProfileOpen(false);
  }, []);

  // --- IntersectionObserver for Infinite Scroll ---
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, tools]);

  // --- Collect all tags from tools ---
  useEffect(() => {
    const allTags = new Set();
    tools.forEach((t) => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach((tag) => allTags.add(tag));
      }
    });
    setTagSuggestions(Array.from(allTags).slice(0, 20));
  }, [tools]);

  // --- Fetch tools from Algolia with Pagination ---
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('nexus-theme')) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    const fetchTools = async () => {
      if (page === 0) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const { hits, nbPages } = await index.search(debouncedQuery, {
          page,
          hitsPerPage: APP_CONFIG.ALGOLIA_HITS_PER_PAGE,
        });
        const fetchedTools = hits.map((tool) => ({
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
      } catch (error) {
        console.warn('Failed to fetch tools:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchTools();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [debouncedQuery, page]);

  // Reset page when search or category changes
  useEffect(() => {
    setTools([]);
    setPage(0);
    setHasMore(true);
  }, [debouncedQuery, activeCategory, activeTags]);

  // --- Tag toggle ---
  const toggleTag = useCallback((tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    playSound('snap');
  }, []);

  // --- Sorting & Filtering ---
  const filteredTools = useMemo(() => {
    let result = tools.filter((tool) => {
      // Category filter
      if (activeCategory !== 'All' && tool.category !== activeCategory) return false;
      // Tags filter
      if (activeTags.length > 0) {
        const toolTags = tool.tags || [];
        return activeTags.every((tag) => toolTags.includes(tag));
      }
      return true;
    });

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return result;
  }, [activeCategory, activeTags, tools, sortBy]);

  const totalItems = filteredTools.length;

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#fcfcfc] dark:bg-[#050505] transition-colors duration-500 selection:bg-accent selection:text-white pb-40 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-accent/10 dark:bg-accent/20 rounded-[100%] blur-[160px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
      </div>

      <style>{`
        :root { --global-font: ${fontFamily}; }
        body, .nexus-app, button, input, select, textarea { font-family: var(--global-font); }
      `}</style>

      {/* ============ HEADER ============ */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 h-[72px] flex items-center justify-between px-4 md:px-8 transition-colors duration-500">
        <div className="flex items-center gap-6">
          <div
            className="w-10 h-10 rounded-[12px] bg-black dark:bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
            aria-label="Nexus Home"
          >
            <div className="w-3 h-3 bg-white dark:bg-black rounded-full" />
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  playSound('pop');
                }}
                className={`px-4 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                    : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                }`}
                aria-label={`Category: ${cat}`}
              >
                {cat}
              </button>
            ))}
            <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-2" />
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 rounded-full text-[14px] font-bold text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all flex items-center gap-1.5"
              aria-label="More categories"
            >
              More <LayersIcon size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <button
            onClick={() => {
              playSound('woosh');
              setIsCommandPaletteOpen(true);
            }}
            className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-zinc-500 hover:text-black dark:hover:text-white group"
            aria-label="Open search"
          >
            <SearchIcon size={18} />
            <span className="hidden md:block text-[14px] font-bold tracking-tight">
              Search...
            </span>
            <kbd className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 text-zinc-400">
              {'\u2318'}K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
            aria-label="Leaderboard"
          >
            <TrophyIcon size={18} />
          </button>

          {/* View Toggle */}
          <button
            onClick={() => {
              playSound('snap');
              setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <ListIcon size={18} /> : <GridIcon size={18} />}
          </button>

          {/* Suggest Tool */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[14px] font-bold hover:shadow-lg hover:scale-105 transition-all ml-1"
          >
            Suggest <PlusIcon size={14} />
          </button>

          {/* User */}
          {user ? (
            <>
              {(user as User).role === 'admin' && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
                  aria-label="Admin panel"
                  title="Admin Panel"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="ml-1 px-4 h-10 rounded-full border-2 border-black/10 dark:border-white/10 text-[14px] font-bold text-black dark:text-white hover:border-black dark:hover:border-white transition-all flex items-center gap-2"
                aria-label="Open profile"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="hidden sm:inline">
                  {user.nickname || user.email.split('@')[0]}
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="ml-1 w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"
              aria-label="Sign in"
            >
              <UserIcon size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main
        className={`relative z-10 max-w-[1600px] mx-auto pt-[120px] ${
          viewMode === 'list' ? 'w-full px-4 lg:w-[1000px]' : 'px-4 md:px-8'
        }`}
      >
        {/* Mobile Category Button */}
        <div className="flex lg:hidden justify-center mb-6">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[14px] font-bold shadow-lg flex items-center gap-2"
          >
            Explore Categories <LayersIcon size={14} />
          </button>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] text-zinc-500 font-medium">
            {isLoading ? 'Loading...' : `${totalItems} tools`}
            {activeTags.length > 0 && ` (${activeTags.length} tags)`}
          </p>
          <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Tags Section - Selection & Active */}
        {tagSuggestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Tags</span>
              {activeTags.length > 0 && (
                <button
                  onClick={() => setActiveTags([])}
                  className="text-[11px] text-accent font-bold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tagSuggestions.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20'
                    }`}
                    aria-label={isActive ? `Remove ${tag} filter` : `Filter by ${tag}`}
                  >
                    {tag}
                    {isActive && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[260px] gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard
                  key={i}
                  spanClass={
                    i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-[16px] animate-pulse" />
              ))}
            </div>
          )
        ) : filteredTools.length > 0 ? (
          viewMode === 'grid' ? (
            /* Bento Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[260px] gap-4 md:gap-6">
              {filteredTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="animate-in fade-in duration-700"
                  style={{ animationDelay: `${(index % 12) * 60}ms` }}
                >
                  <BentoCard
                    tool={tool}
                    user={user}
                    onRequireAuth={() => setIsAuthModalOpen(true)}
                    isFocused={focusedIndex === index}
                    index={index}
                    total={filteredTools.length}
                    onSaveRequest={setSavePopoverConfig}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-4">
              {filteredTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="animate-in fade-in slide-in-from-top-4 duration-300"
                  style={{ animationDelay: `${(index % 10) * 30}ms` }}
                >
                  <ListCard
                    tool={tool}
                    user={user}
                    onRequireAuth={() => setIsAuthModalOpen(true)}
                    isFocused={focusedIndex === index}
                    indexNumber={index}
                    onSaveRequest={setSavePopoverConfig}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
              <SearchIcon className="text-zinc-400" size={32} />
            </div>
            <p className="text-[22px] font-extrabold text-black dark:text-white tracking-tight mb-2">
              {debouncedQuery
                ? `No tools found for "${debouncedQuery}"`
                : 'No tools in this category'}
            </p>
            <p className="text-[15px] text-zinc-500 font-medium mb-8 max-w-md">
              {debouncedQuery
                ? 'Try a different search term or browse all categories.'
                : 'Be the first to suggest a tool in this category.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveCategory('All')}
                className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-[14px] hover:scale-105 transition-transform"
              >
                Browse All
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-full border-2 border-black/10 dark:border-white/10 text-black dark:text-white font-bold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Suggest Tool
              </button>
            </div>
          </div>
        )}

        {/* Load More / Infinite Scroll Sentinel */}
        {!isLoading && (
          <div ref={loadMoreRef} className="flex justify-center py-10">
            {isLoadingMore ? (
              <div className="flex items-center gap-3 text-zinc-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
                <span className="text-[14px] font-bold">Loading more...</span>
              </div>
            ) : hasMore ? (
              <p className="text-[13px] text-zinc-400 font-medium">Scroll for more</p>
            ) : tools.length > 0 ? (
              <p className="text-[13px] text-zinc-400 font-medium">
                You've seen all {tools.length} tools
              </p>
            ) : null}
          </div>
        )}
      </main>

      {/* ============ MODALS ============ */}
      <SavePopover
        config={savePopoverConfig}
        onClose={() => setSavePopoverConfig(null)}
        user={user}
        setUser={setUser}
      />
      <CategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        query={searchQuery}
        setQuery={handleSearchChange}
        tools={tools}
      />
      <AutoCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        user={user}
      />
      </div>
    </ErrorBoundary>
  );
}
