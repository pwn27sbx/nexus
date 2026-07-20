// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import algoliasearch from 'algoliasearch/lite';
import BentoCard from './BentoCard';
import ListCard from './ListCard';
import SavePopover from './SavePopover';
import SkeletonCard from './SkeletonCard';
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
  SunIcon,
  MoonIcon,
  LayersIcon,
} from '../utils/icons';
import {
  ALL_CATEGORIES,
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

// Sidebar categories — "All Tools" + all categories
const SIDEBAR_CATEGORIES = ['All Tools', ...ALL_CATEGORIES];

// ==============================================
// MAIN APP COMPONENT
// ==============================================
export default function App() {
  // --- Hydration guard ---
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // --- Theme State ---
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
    debounce((q) => { setDebouncedQuery(q); }, APP_CONFIG.DEBOUNCE_MS)
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

  // --- Sort / Filter tabs ---
  const [activeTab, setActiveTab] = useState<'newest' | 'popular' | 'category'>('newest');
  const [sortBy, setSortBy] = useState('default');

  // --- Active Category ---
  const [activeCategory, setActiveCategory] = useState('All Tools');

  // --- Tags State ---
  const [activeTags, setActiveTags] = useState([]);

  // --- Pagination State ---
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- Modal State ---
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

  // --- Mobile sidebar toggle ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Reset focus on filter changes ---
  useEffect(() => {
    setFocusedIndex(-1);
  }, [debouncedQuery, activeCategory, sortBy, viewMode]);

  // --- Global keyboard navigation ---
  useEffect(() => {
    if (isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen ||
      isCommandPaletteOpen || isCategoryModalOpen || savePopoverConfig) return;

    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const currentTools = tools.filter(
        (t) => activeCategory === 'All Tools' || t.category === activeCategory
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

  // --- Sorting & Filtering ---
  const filteredTools = useMemo(() => {
    let result = tools.filter((tool) => {
      if (activeCategory !== 'All Tools' && tool.category !== activeCategory) return false;
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

  // --- Category icon map ---
  const categoryIcons: Record<string, string> = {
    'All Tools': '⊞',
    'Design': '🎨',
    'Development': '⌨️',
    'AI Tools': '✦',
    'Productivity': '⚡',
    'Medicine': '🩺',
    'Accounting': '📊',
    'Engineering': '🔧',
    'Entertainment': '🎬',
    'Finance': '💰',
    'Education': '📚',
    'Marketing': '📣',
    'Utilities': '🛠',
    'Crypto': '₿',
    'Security': '🔒',
    'Open Source': '🌐',
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-x-hidden">

        <style>{`
          :root { --global-font: ${fontFamily}; }
          body, .nexus-app, button, input, select, textarea { font-family: var(--global-font); }
        `}</style>

        {/* ============ SIDEBAR ============ */}
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed top-0 left-0 z-40 h-full w-[200px] bg-white dark:bg-[#111] border-r border-black/[0.06] dark:border-white/[0.06]
            flex flex-col pt-[72px] pb-6
            transition-transform duration-300 ease-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pt-4">
            {SIDEBAR_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsSidebarOpen(false);
                    playSound('pop');
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold mb-0.5 transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white'
                    }
                  `}
                  aria-label={`Category: ${cat}`}
                >
                  <span className="text-base leading-none">{categoryIcons[cat] || '•'}</span>
                  <span className="truncate">{cat}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ============ HEADER ============ */}
        <header className="fixed top-0 inset-x-0 z-30 h-[72px] bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-3 px-4 md:px-6 lg:pl-[216px]">

          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all"
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <div
            className="w-9 h-9 rounded-[10px] bg-black dark:bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer shrink-0"
            aria-label="Nexus Home"
          >
            <div className="w-2.5 h-2.5 bg-white dark:bg-black rounded-full" />
          </div>

          {/* Search Bar — centered, grows to fill space */}
          <div className="flex-1 max-w-[600px] mx-auto">
            <button
              onClick={() => {
                playSound('woosh');
                setIsCommandPaletteOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] border border-black/[0.07] dark:border-white/[0.07] transition-all text-zinc-400 group"
              aria-label="Open search"
              id="header-search-btn"
            >
              <SearchIcon size={16} />
              <span className="flex-1 text-left text-[14px] font-medium text-zinc-400">
                Search resources...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md border border-black/[0.09] dark:border-white/[0.1] text-zinc-400 bg-white/60 dark:bg-white/[0.04]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white transition-all"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white transition-all"
              aria-label="Leaderboard"
            >
              <TrophyIcon size={17} />
            </button>

            {/* View Toggle */}
            <button
              onClick={() => {
                playSound('snap');
                setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white transition-all hidden sm:flex"
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <ListIcon size={17} /> : <GridIcon size={17} />}
            </button>

            {/* Suggest a Site — primary CTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13.5px] font-semibold hover:shadow-lg hover:scale-[1.03] transition-all ml-1"
              id="suggest-site-btn"
            >
              Suggest a Site
            </button>

            {/* User */}
            {user ? (
              <>
                {(user as User).role === 'admin' && (
                  <button
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white transition-all"
                    aria-label="Admin panel"
                    title="Admin Panel"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="ml-1 px-3 h-9 rounded-full border border-black/10 dark:border-white/10 text-[13px] font-semibold text-black dark:text-white hover:border-black dark:hover:border-white transition-all flex items-center gap-2"
                  aria-label="Open profile"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="hidden sm:inline">
                    {user.nickname || user.email.split('@')[0]}
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="ml-1 w-9 h-9 flex items-center justify-center rounded-full text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white transition-all"
                aria-label="Sign in"
              >
                <UserIcon size={17} />
              </button>
            )}
          </div>
        </header>

        {/* ============ MAIN CONTENT ============ */}
        <main className="lg:pl-[200px] pt-[72px] min-h-screen">
          <div className={`mx-auto ${viewMode === 'list' ? 'max-w-[860px] px-4 lg:px-8' : 'max-w-[1400px] px-4 lg:px-8'} py-6`}>

            {/* ---- Filter tabs + count row ---- */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              {/* Tabs: Newest | Popular | Category */}
              <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full p-1">
                {(['newest', 'popular', 'category'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'popular') setSortBy('name');
                      else if (tab === 'newest') setSortBy('default');
                      playSound('pop');
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-black dark:hover:text-white'
                    }`}
                    aria-label={`Sort by ${tab}`}
                  >
                    {tab === 'newest' ? 'Newest' : tab === 'popular' ? 'Popular' : 'Category ↓'}
                  </button>
                ))}
              </div>

              {/* Count */}
              <p className="text-[13px] text-zinc-400 font-medium">
                {isLoading ? 'Loading...' : `${totalItems} tools`}
              </p>
            </div>

            {/* ---- Grid / List ---- */}
            {isLoading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} spanClass="" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[72px] bg-black/[0.04] dark:bg-white/[0.04] rounded-xl animate-pulse" />
                  ))}
                </div>
              )
            ) : filteredTools.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTools.map((tool, i) => (
                    <div
                      key={tool.id}
                      className="animate-in fade-in duration-500"
                      style={{ animationDelay: `${(i % 12) * 40}ms` }}
                    >
                      <BentoCard
                        tool={tool}
                        user={user}
                        onRequireAuth={() => setIsAuthModalOpen(true)}
                        isFocused={focusedIndex === i}
                        index={i}
                        total={filteredTools.length}
                        onSaveRequest={setSavePopoverConfig}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTools.map((tool, i) => (
                    <div
                      key={tool.id}
                      className="animate-in fade-in slide-in-from-top-4 duration-300"
                      style={{ animationDelay: `${(i % 10) * 25}ms` }}
                    >
                      <ListCard
                        tool={tool}
                        user={user}
                        onRequireAuth={() => setIsAuthModalOpen(true)}
                        isFocused={focusedIndex === i}
                        indexNumber={i}
                        onSaveRequest={setSavePopoverConfig}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-full bg-black/[0.05] dark:bg-white/[0.06] flex items-center justify-center mb-5">
                  <SearchIcon className="text-zinc-400" size={28} />
                </div>
                <p className="text-[20px] font-bold text-black dark:text-white tracking-tight mb-2">
                  {debouncedQuery
                    ? `No tools found for "${debouncedQuery}"`
                    : 'No tools in this category'}
                </p>
                <p className="text-[14px] text-zinc-500 font-medium mb-7 max-w-sm">
                  {debouncedQuery
                    ? 'Try a different search term or browse all categories.'
                    : 'Be the first to suggest a tool in this category.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveCategory('All Tools')}
                    className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-[13.5px] hover:scale-[1.03] transition-transform"
                  >
                    Browse All
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-[13.5px] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all"
                  >
                    Suggest Tool
                  </button>
                </div>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            {!isLoading && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    <span className="text-[13px] font-medium">Loading more...</span>
                  </div>
                ) : hasMore ? (
                  <p className="text-[12px] text-zinc-400 font-medium">Scroll for more</p>
                ) : tools.length > 0 ? (
                  <p className="text-[12px] text-zinc-400 font-medium">
                    You've seen all {tools.length} tools
                  </p>
                ) : null}
              </div>
            )}
          </div>
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
