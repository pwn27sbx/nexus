import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModals } from '@/contexts/ModalContext';
import { AppProvider } from '@/contexts/AppProvider';
import { useToolsSearch } from '@/hooks/useToolsSearch';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
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
import SpatialCommunityHub from './SpatialCommunityHub';
import CollectionsView from './CollectionsView';
import HeroBentoCard from './HeroBentoCard';
import { SearchIcon, UserIcon, PlusIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

// ── VIRTUALIZATION WRAPPERS ──
const VirtualBentoWrapper = ({
  tool,
  index,
  total,
  focusedIndex,
  isDark,
  gridStyle,
  onSaveRequest,
}: any) => {
  const { ref, inView } = useInView({ rootMargin: '400px', triggerOnce: false });
  return (
    <div
      ref={ref}
      className="animate-fade-up"
      style={{ ...gridStyle, animationDelay: `${(index % 12) * 40}ms`, minHeight: '180px' }}
    >
      {inView ? (
        <BentoCard
          tool={tool}
          isFocused={focusedIndex === index}
          index={index}
          total={total}
          onSaveRequest={onSaveRequest}
          isDark={isDark}
        />
      ) : null}
    </div>
  );
};

const VirtualListWrapper = ({ tool, index, focusedIndex, onSaveRequest }: any) => {
  const { ref, inView } = useInView({ rootMargin: '400px', triggerOnce: false });
  return (
    <div ref={ref} style={{ minHeight: '72px' }}>
      {inView ? (
        <ListCard
          tool={tool}
          isFocused={focusedIndex === index}
          indexNumber={index}
          onSaveRequest={onSaveRequest}
          delay={`${(index % 10) * 25}ms`}
        />
      ) : null}
    </div>
  );
};

import { GridIcon, ListIcon, TrophyIcon, SunIcon, MoonIcon } from '@/utils/icons';
import { ALL_CATEGORIES } from '@/utils/constants';
import { playSound } from '@/utils/sounds';

import type { SavePopoverConfig } from '@/types';

// Nav items for bottom dock
const NAV_ITEMS = [
  {
    id: 'discover',
    label: 'Discover',
    icon: (active: boolean) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon
          points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
          fill={active ? 'currentColor' : 'none'}
        />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: (active: boolean) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'} />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'collections',
    label: 'Collections',
    icon: (active: boolean) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18M3 12h18M3 18h18" />
        <rect x="3" y="4" width="4" height="4" rx="1" fill={active ? 'currentColor' : 'none'} />
        <rect x="3" y="10" width="4" height="4" rx="1" fill={active ? 'currentColor' : 'none'} />
        <rect x="3" y="16" width="4" height="4" rx="1" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'community',
    label: 'Community',
    icon: (active: boolean) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'submit',
    label: 'Submit',
    icon: (active: boolean) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  'All Tools': '✦',
  Design: '🎨',
  Development: '⌨️',
  'AI Tools': '✦',
  Productivity: '⚡',
  Medicine: '🩺',
  Accounting: '📊',
  Engineering: '🔧',
  Entertainment: '🎬',
  Finance: '💰',
  Education: '📚',
  Marketing: '📣',
  Utilities: '🛠',
  Crypto: '₿',
  Security: '🔒',
  'Open Source': '🌐',
};

const SIDEBAR_CATEGORIES = ['All Tools', ...ALL_CATEGORIES];

const DirectoryContent: React.FC = () => {
  // ── Hydration ──
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // ── Scroll State ──
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    // Initial check
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Theme ──
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-theme');
    if (saved) setIsDark(saved === 'dark');
    else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', isDark);
    // Update body gradient class
    document.body.style.background = isDark
      ? 'linear-gradient(135deg, #0d0d1a 0%, #111128 50%, #16102e 100%)'
      : 'linear-gradient(135deg, #c7d7f5 0%, #d5c8f0 50%, #e8d5f5 100%)';
    localStorage.setItem('nexus-theme', isDark ? 'dark' : 'light');
  }, [isDark, hydrated]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
    playSound('snap');
  }, []);

  // ── Accent / Font ──
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");

  useEffect(() => {
    if (!hydrated) return;
    const savedAccent = localStorage.getItem('nexus-accent');
    if (savedAccent) setAccentColor(savedAccent);
    const savedFont = localStorage.getItem('nexus-font-family');
    if (savedFont) setFontFamily(savedFont);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-accent', accentColor);
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-font-family', fontFamily);
    document.documentElement.style.setProperty('--global-font', fontFamily);
    document.body.style.setProperty('font-family', fontFamily, 'important');
  }, [fontFamily, hydrated]);

  // ── Load fonts ──
  useEffect(() => {
    const id = 'google-fonts-expanded';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // ── View / Sort ──
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState<'newest' | 'popular' | 'category'>('newest');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem('nexus-view');
    if (saved) setViewMode(saved);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexus-view', viewMode);
  }, [viewMode, hydrated]);

  // ── Category / Tags ──
  const [activeCategory, setActiveCategory] = useState('All Tools');
  const [activeTags] = useState<string[]>([]);

  // ── Search & Pagination (Custom Hooks) ──
  const {
    searchQuery,
    debouncedQuery,
    handleSearchChange,
    tools,
    filteredTools,
    totalItems,
    isLoading,
    isLoadingMore,
    fetchError,
    hasMore,
    loadMore,
  } = useToolsSearch({ activeCategory, activeTags, sortBy });

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoading,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  // ── Modals ──
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSubmitModalOpen: isModalOpen,
    setIsSubmitModalOpen: setIsModalOpen,
    isProfileOpen,
    setIsProfileOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    setIsAdminPanelOpen,
  } = useModals();

  const [savePopoverConfig, setSavePopoverConfig] = useState<SavePopoverConfig | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { user } = useAuth();

  // ── Nav / sidebar ──
  const [activeNav, setActiveNav] = useState('discover');

  // ── Keyboard navigation ──
  useEffect(() => {
    setFocusedIndex(-1);
  }, [debouncedQuery, activeCategory, sortBy, viewMode]);

  useEffect(() => {
    if (
      isModalOpen ||
      isAuthModalOpen ||
      isProfileOpen ||
      isLeaderboardOpen ||
      isCommandPaletteOpen ||
      isCategoryModalOpen ||
      savePopoverConfig
    )
      return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      )
        return;
      const currentTools = tools.filter(
        (t) => activeCategory === 'All Tools' || t.category === activeCategory
      );
      if (!currentTools.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < currentTools.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : currentTools.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        window.open(currentTools[focusedIndex].url, '_blank');
      } else if (e.key === 'Escape') setFocusedIndex(-1);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    focusedIndex,
    tools,
    activeCategory,
    isModalOpen,
    isAuthModalOpen,
    isProfileOpen,
    isLeaderboardOpen,
    isCommandPaletteOpen,
    isCategoryModalOpen,
    savePopoverConfig,
  ]);

  // ── Cmd+K ──
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
        if (!isCommandPaletteOpen) playSound('woosh');
      }
    };
    document.addEventListener('keydown', handleCmdK);
    return () => document.removeEventListener('keydown', handleCmdK);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: fontFamily }}>
        <style>{`
          :root { --global-font: ${fontFamily}; }
          body, button, input, select, textarea { font-family: var(--global-font); }
        `}</style>

        {/* ══ ATMOSPHERIC ORBS ══════════════════════════════ */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="orb w-[800px] h-[800px] -top-32 -left-32 opacity-70"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(99,102,241,0.12) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, transparent 80%)',
              animation: 'float 12s ease-in-out infinite',
            }}
          />
          <div
            className="orb w-[700px] h-[700px] top-1/4 -right-24 opacity-60"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(147,51,234,0.30) 0%, rgba(124,58,237,0.08) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, transparent 80%)',
              animation: 'float2 16s ease-in-out infinite 2s',
            }}
          />
          <div
            className="orb w-[900px] h-[900px] -bottom-32 left-1/4 opacity-70"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, rgba(99,102,241,0.06) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, transparent 80%)',
              animation: 'float 18s ease-in-out infinite 4s',
            }}
          />
        </div>

        {/* ══ TOP HEADER BAR ════════════════════════════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-8 transition-all duration-300 ${
            isScrolled
              ? 'pt-3 pb-3 pointer-events-auto bg-[rgba(220,228,248,0.55)] dark:bg-[rgba(13,13,26,0.6)] backdrop-blur-[20px] backdrop-saturate-[1.8] border-b border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.07)] shadow-[0_4px_24px_rgba(80,60,180,0.1)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
              : 'pt-4 pb-2 pointer-events-none bg-transparent border-b border-transparent shadow-none'
          }`}
        >
          {/* Left group: Logo + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2.5 mr-1 sm:mr-3">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-[0_4px_14px_rgba(124,58,237,0.4)]">
                <div className="w-2 h-2 bg-white rounded-full opacity-90" />
              </div>
              <span className="text-[15px] font-bold tracking-tight hidden sm:block text-[rgba(15,15,35,0.85)] dark:text-[rgba(240,240,255,0.9)]">
                Nexus
              </span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,25,50,0.6)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(80,60,140,0.8)] dark:text-[rgba(200,190,255,0.8)] shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,25,50,0.6)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(80,60,140,0.8)] dark:text-[rgba(200,190,255,0.8)] shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              aria-label="Leaderboard"
            >
              <TrophyIcon size={14} />
            </button>

            {/* View toggle */}
            <button
              onClick={() => {
                playSound('snap');
                setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
              }}
              className="w-8 h-8 rounded-full items-center justify-center transition-all hover:scale-110 hidden sm:flex backdrop-blur-md bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,25,50,0.6)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(80,60,140,0.8)] dark:text-[rgba(200,190,255,0.8)] shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <ListIcon size={14} /> : <GridIcon size={14} />}
            </button>

            {/* User / Auth */}
            {user ? (
              <>
                {(user.role === 'admin' || user.email?.includes('@admin')) && (
                  <button
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(168,85,247,0.2)] border border-[rgba(124,58,237,0.4)] text-[#a855f7] shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                    aria-label="Admin panel"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="px-3 md:px-4 h-8 rounded-full text-[12px] font-semibold transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-md"
                  style={{
                    background: isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.1)',
                    border: isDark
                      ? '1px solid rgba(124,58,237,0.4)'
                      : '1px solid rgba(124,58,237,0.3)',
                    color: isDark ? '#d8b4fe' : '#7c3aed',
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(124,58,237,0.1)',
                  }}
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
                className="px-3 md:px-4 h-8 rounded-full text-[12px] font-semibold transition-all hover:scale-105 flex items-center gap-1.5 backdrop-blur-md"
                style={{
                  background: isDark ? 'rgba(30,25,50,0.6)' : 'rgba(255,255,255,0.8)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(255,255,255,0.9)',
                  color: isDark ? '#d8b4fe' : '#7c3aed',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0,0,0,0.2)'
                    : '0 4px 12px rgba(80,60,160,0.06)',
                }}
                aria-label="Sign in"
              >
                <UserIcon size={12} />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>

          {/* Right group: Sort tabs */}
          <div className="hidden md:flex items-center gap-1 rounded-full p-1 backdrop-blur-md pointer-events-auto bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,25,50,0.6)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            {(['newest', 'popular'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSortBy(tab === 'popular' ? 'name' : 'default');
                  playSound('pop');
                }}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(124,58,237,0.35)] text-[#7c3aed] dark:text-[#c084fc] shadow-[0_2px_8px_rgba(124,58,237,0.2)]'
                    : 'bg-transparent text-[rgba(80,60,140,0.6)] dark:text-[rgba(200,200,240,0.6)] shadow-none'
                }`}
              >
                {tab === 'newest' ? '✦ Newest' : '↑ Popular'}
              </button>
            ))}
          </div>
        </header>

        {/* ══ MAIN CONTENT ══════════════════════════════════ */}
        <main
          className="relative z-10 flex flex-col items-center"
          style={{ paddingTop: '80px', paddingBottom: '120px' }}
        >
          {/* ── COMMUNITY VIEW ── */}
          {activeNav === 'community' && (
            <SpatialCommunityHub
              isDark={isDark}
              searchQuery={searchQuery}
              setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            />
          )}

          {/* ── COLLECTIONS VIEW ── */}
          {activeNav === 'collections' && (
            <CollectionsView isDark={isDark} setIsCommandPaletteOpen={setIsCommandPaletteOpen} />
          )}

          {/* ── DISCOVER / CATEGORIES / SUBMIT VIEWS ── */}
          {(activeNav === 'discover' || activeNav === 'categories' || activeNav === 'submit') && (
            <>
              {/* ── HERO SECTION ── */}
              <section className="w-full flex flex-col items-center text-center px-4 pt-10 pb-8">
                <h1 className="font-display text-[32px] sm:text-[42px] md:text-[50px] lg:text-[56px] font-black tracking-tight leading-[1.1] mb-3 animate-fade-up text-[rgba(10,8,30,0.90)] dark:text-[rgba(240,240,255,0.97)] tracking-[-0.025em]">
                  Ultimate Spatial Gallery Directory
                </h1>

                <p
                  className="text-[15px] sm:text-[17px] font-medium mb-8 animate-fade-up max-w-md text-[rgba(80,60,140,0.65)] dark:text-[rgba(180,170,230,0.7)]"
                  style={{ animationDelay: '80ms' }}
                >
                  Next-generation immersive web directory &amp; resource library.
                </p>

                {/* Search bar */}
                <div
                  className="w-full max-w-[580px] animate-fade-up"
                  style={{ animationDelay: '140ms' }}
                >
                  <div className="search-glow-container group cursor-pointer">
                    <button
                      onClick={() => setIsCommandPaletteOpen(true)}
                      className="w-full flex items-center gap-3 px-5 py-3 transition-all rounded-full bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.05)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]"
                      id="hero-search-btn"
                      aria-label="Open search"
                    >
                      <SearchIcon
                        size={16}
                        className="text-[rgba(100,80,160,0.6)] dark:text-[rgba(180,160,255,0.5)]"
                      />
                      <span className="flex-1 text-left text-[14.5px] font-medium text-[rgba(100,80,160,0.7)] dark:text-[rgba(180,160,255,0.45)]">
                        Search for spatial experiences, tools, and resources...
                      </span>
                      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md border-[rgba(200,190,240,0.6)] dark:border-[rgba(255,255,255,0.12)] border text-[rgba(120,90,200,0.5)] dark:text-[rgba(180,160,255,0.45)] bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.04)]">
                        ⌘K
                      </kbd>
                    </button>
                  </div>
                </div>

                {/* Category pills */}
                <div
                  className="flex items-center gap-2 mt-5 flex-wrap justify-center max-w-[700px] animate-fade-up"
                  style={{ animationDelay: '200ms' }}
                >
                  {SIDEBAR_CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        playSound('pop');
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105 backdrop-blur-md ${
                        activeCategory === cat
                          ? 'bg-[rgba(124,58,237,0.12)] dark:bg-[rgba(124,58,237,0.35)] border border-[rgba(124,58,237,0.5)] text-[#7c3aed] dark:text-[#c084fc]'
                          : 'bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.1)] text-[rgba(80,60,140,0.55)] dark:text-[rgba(190,180,240,0.6)]'
                      }`}
                    >
                      <span className="text-[11px] leading-none">{CATEGORY_ICONS[cat] || '•'}</span>
                      {cat}
                    </button>
                  ))}
                  {activeCategory !== 'All Tools' &&
                    SIDEBAR_CATEGORIES.indexOf(activeCategory) >= 8 && (
                      <span className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[rgba(124,58,237,0.35)] border border-[rgba(124,58,237,0.5)] text-[#7c3aed] dark:text-[#c084fc]">
                        {activeCategory}
                      </span>
                    )}
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105 bg-[rgba(255,255,255,0.55)] dark:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.8)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(120,100,180,0.45)] dark:text-[rgba(180,160,255,0.4)]"
                  >
                    More...
                  </button>
                </div>
              </section>

              {/* ── GALLERY GRID ── */}
              <section className="w-full max-w-[1300px] px-4 md:px-6">
                {/* Count row */}
                <div className="flex items-center justify-between mb-5 px-1">
                  <p className="text-[12.5px] font-medium text-[rgba(100,80,180,0.45)] dark:text-[rgba(180,160,255,0.4)]">
                    {isLoading ? 'Loading...' : `${totalItems} resources`}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all hover:scale-[1.04] bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white shadow-[0_2px_16px_rgba(124,58,237,0.35)]"
                    id="suggest-site-btn"
                  >
                    <PlusIcon size={12} />
                    Suggest a Site
                  </button>
                </div>

                {/* Grid / List content */}
                {fetchError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] text-[#ef4444] flex items-center justify-center mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <h3 className="text-[20px] font-bold text-[rgba(10,8,30,0.88)] dark:text-[rgba(240,235,255,0.95)] mb-2">
                      Something went wrong
                    </h3>
                    <p className="text-[14px] text-[rgba(80,60,140,0.6)] dark:text-[rgba(180,165,235,0.7)] max-w-[400px]">
                      {fetchError}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-5 px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold text-[14px]"
                    >
                      Try Again
                    </button>
                  </div>
                ) : isLoading ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} spanClass="" isDark={isDark} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[72px] rounded-2xl skeleton-pulse bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.04)]"
                        />
                      ))}
                    </div>
                  )
                ) : filteredTools.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div
                      className="bento-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gridAutoRows: 'minmax(180px, auto)',
                        gridAutoFlow: 'dense',
                        gap: '14px',
                      }}
                    >
                      {/* Hero card — spans 2 cols x 2 rows */}
                      {filteredTools[0] && (
                        <div
                          className="animate-fade-up"
                          style={{ gridColumn: 'span 2', gridRow: 'span 2', animationDelay: '0ms' }}
                        >
                          <HeroBentoCard
                            tool={filteredTools[0]}
                            isFocused={focusedIndex === 0}
                            onSaveRequest={setSavePopoverConfig}
                            isDark={isDark}
                          />
                        </div>
                      )}
                      {/* Cards with varied sizes */}
                      {filteredTools.slice(1).map((tool, i) => {
                        const patternIndex = i % 8;
                        let gridStyle: any = {};
                        if (patternIndex === 2) {
                          gridStyle = { gridRow: 'span 2' };
                        } else if (patternIndex === 5) {
                          gridStyle = { gridColumn: 'span 2' };
                        }

                        return (
                          <VirtualBentoWrapper
                            key={tool.id}
                            tool={tool}
                            index={i + 1}
                            total={filteredTools.length}
                            focusedIndex={focusedIndex}
                            isDark={isDark}
                            gridStyle={gridStyle}
                            onSaveRequest={setSavePopoverConfig}
                          />
                        );
                      })}
                      <style>{`
                    .bento-grid > div > div,
                    .bento-grid > div > [role="article"] {
                      height: 100%;
                    }
                    @media (max-width: 900px) {
                      .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    }
                    @media (max-width: 640px) {
                      .bento-grid { grid-template-columns: 1fr !important; }
                      .bento-grid > div { grid-column: span 1 !important; }
                    }
                  `}</style>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-w-[860px] mx-auto">
                      {filteredTools.map((tool, i) => (
                        <VirtualListWrapper
                          key={tool.id}
                          tool={tool}
                          index={i}
                          focusedIndex={focusedIndex}
                          onSaveRequest={setSavePopoverConfig}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-28 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[rgba(124,58,237,0.08)] dark:bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.2)]">
                      <SearchIcon size={26} className="text-[#7c3aed] dark:text-[#a855f7]" />
                    </div>
                    <p className="text-[20px] font-bold mb-2 text-[rgba(15,10,40,0.85)] dark:text-[rgba(240,235,255,0.9)]">
                      {debouncedQuery
                        ? `No tools found for "${debouncedQuery}"`
                        : 'No tools in this category'}
                    </p>
                    <p className="text-[14px] font-medium mb-7 max-w-sm text-[rgba(100,80,160,0.55)] dark:text-[rgba(180,160,255,0.5)]">
                      {debouncedQuery
                        ? 'Try a different search term or browse all categories.'
                        : 'Be the first to suggest a tool in this category.'}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveCategory('All Tools')}
                        className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all hover:scale-[1.03] bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white shadow-[0_2px_16px_rgba(124,58,237,0.35)]"
                      >
                        Browse All
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all hover:scale-[1.03] bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.1)] text-[rgba(80,60,140,0.8)] dark:text-[rgba(200,190,255,0.8)]"
                      >
                        Suggest Tool
                      </button>
                    </div>
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                {!isLoading && (
                  <div ref={loadMoreRef} className="flex justify-center py-10">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2.5 text-[rgba(120,90,200,0.45)] dark:text-[rgba(180,160,255,0.4)]">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            strokeDasharray="40"
                            strokeDashoffset="10"
                          />
                        </svg>
                        <span className="text-[13px] font-medium">Loading more...</span>
                      </div>
                    ) : hasMore ? (
                      <p className="text-[12px] font-medium text-[rgba(120,90,200,0.35)] dark:text-[rgba(180,160,255,0.3)]">
                        Scroll for more
                      </p>
                    ) : tools.length > 0 ? (
                      <p className="text-[12px] font-medium text-[rgba(120,90,200,0.35)] dark:text-[rgba(180,160,255,0.3)]">
                        You've seen all {tools.length} resources ✦
                      </p>
                    ) : null}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* ══ BOTTOM NAVIGATION DOCK (Floating Pill — Stitch Style) ════ */}
        <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-center pb-6 pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-2 rounded-2xl max-w-full overflow-x-auto no-scrollbar bg-[rgba(255,255,255,0.50)] dark:bg-[rgba(18,16,40,0.55)] backdrop-blur-[28px] backdrop-saturate-[2] border border-[rgba(255,255,255,0.72)] dark:border-[rgba(255,255,255,0.10)] shadow-[0_20px_40px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    playSound('pop');
                    if (item.id === 'submit') setIsModalOpen(true);
                    else if (item.id === 'categories') setIsCategoryModalOpen(true);
                  }}
                  className={`flex flex-col items-center gap-1 px-2 sm:px-4 py-2 rounded-xl transition-all hover:scale-105 flex-shrink-0 min-w-[60px] sm:min-w-[70px] ${
                    isActive
                      ? 'bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(255,255,255,0.15)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.12)] text-[#111111] dark:text-[#e2e0ff]'
                      : 'bg-transparent shadow-none border border-transparent text-[rgba(100,100,120,0.55)] dark:text-[rgba(180,160,255,0.4)]'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative flex items-center justify-center w-5 h-5 transition-all">
                    {item.icon(isActive)}
                  </span>
                  <span
                    className="text-[10.5px] font-semibold leading-none"
                    style={{
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ══ MODALS ════════════════════════════════════════ */}
        <SavePopover config={savePopoverConfig} onClose={() => setSavePopoverConfig(null)} />
        <CategoriesModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            if (activeNav === 'categories') setActiveNav('discover');
          }}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isDark={isDark}
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
          onClose={() => {
            setIsModalOpen(false);
            if (activeNav === 'submit') setActiveNav('discover');
          }}
        />
        <AuthModal />
        <UserProfile
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
        />
        <LeaderboardModal />
        <AdminPanel />
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <DirectoryContent />
  </AppProvider>
);

export default App;
