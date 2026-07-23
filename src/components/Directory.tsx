import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@nanostores/react';
import {
  isAuthModalOpen,
  isCategoryModalOpen,
  isCommandPaletteOpen,
  isSubmitModalOpen,
  isProfileOpen,
  isLeaderboardOpen,
  isAdminPanelOpen,
} from '@/stores/modals';
import { AppProvider } from '@/contexts/AppProvider';
import { useToolsSearch } from '@/hooks/useToolsSearch';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import BentoCard from './BentoCard';
import ListCard from './ListCard';
import SavePopover from './SavePopover';
import SkeletonCard from './SkeletonCard';
import VoiceAssistantOverlay from './VoiceAssistantOverlay';
import ErrorBoundary from './ErrorBoundary';
import HeroBentoCard from './HeroBentoCard';
import { SearchIcon, UserIcon, PlusIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import BlurText from './BlurText';
import Magnet from './Magnet';
import StarBorder from './StarBorder';
import BorderGlow from './BorderGlow';
import GooeyToggle from './GooeyToggle';
import OptionWheel from './OptionWheel';

const CategoriesModal = React.lazy(() => import('./CategoriesModal'));
const CommandPalette = React.lazy(() => import('./CommandPalette'));
const AutoCaptureModal = React.lazy(() => import('./AutoCaptureModal'));
const AuthModal = React.lazy(() => import('./AuthModal'));
const UserProfile = React.lazy(() => import('./UserProfile'));
const LeaderboardModal = React.lazy(() => import('./LeaderboardModal'));
const AdminPanel = React.lazy(() => import('./AdminPanel'));
const LiquidEther = React.lazy(() => import('./LiquidEther'));
const SpatialCommunityHub = React.lazy(() => import('./SpatialCommunityHub'));
const CollectionsView = React.lazy(() => import('./CollectionsView'));

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
    id: 'assistant',
    label: 'AI Search',
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
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
  },
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

const LIQUID_ETHER_COLORS = ['#9bbded', '#FF9FFC', '#c5bdf0', '#c5bdf0'];

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
  const [isOptionWheelOpen, setIsOptionWheelOpen] = useState(false);

  // ── Categories Wheel Position ──
  const categoriesBtnRef = useRef<HTMLButtonElement>(null);

  // --- Voice Assistant State ---
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceCommand();
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);

  useEffect(() => {
    // If voice error, maybe show toast (omitted for brevity, handled in UI)
    if (voiceError) {
      console.warn('Voice error:', voiceError);
    }
  }, [voiceError]);

  // Effect to process the transcript when listening stops and we have text
  useEffect(() => {
    const processVoiceSearch = async () => {
      if (!isListening && transcript && transcript.length > 3 && !isVoiceProcessing) {
        setIsVoiceProcessing(true);
        try {
          const response = await fetch('/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to process voice search');
          }

          const data = await response.json();
          // Put the AI keywords into the search bar
          handleSearchChange(data.keywords);

          // Switch to discover if we were somewhere else
          if (activeNav !== 'discover') {
            setActiveNav('discover');
          }
        } catch (error) {
          console.error('Error processing voice command:', error);
        } finally {
          setIsVoiceProcessing(false);
          // Small delay before clearing transcript logic is usually handled by the hook
        }
      }
    };

    processVoiceSearch();
  }, [isListening, transcript]);

  const [wheelPos, setWheelPos] = useState({ top: 0, left: 0, bottom: 0, right: 0 });

  const handleCategoriesClick = () => {
    if (categoriesBtnRef.current) {
      const rect = categoriesBtnRef.current.getBoundingClientRect();
      setWheelPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 16,
        bottom: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOptionWheelOpen(!isOptionWheelOpen);
  };

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
  const isAuthModalOpenVal = useStore(isAuthModalOpen);
  const setIsAuthModalOpen = isAuthModalOpen.set;
  const isCategoryModalOpenVal = useStore(isCategoryModalOpen);
  const setIsCategoryModalOpen = isCategoryModalOpen.set;
  const isCommandPaletteOpenVal = useStore(isCommandPaletteOpen);
  const setIsCommandPaletteOpen = isCommandPaletteOpen.set;
  const isModalOpen = useStore(isSubmitModalOpen);
  const setIsModalOpen = isSubmitModalOpen.set;
  const isProfileOpenVal = useStore(isProfileOpen);
  const setIsProfileOpen = isProfileOpen.set;
  const isLeaderboardOpenVal = useStore(isLeaderboardOpen);
  const setIsLeaderboardOpen = isLeaderboardOpen.set;
  const setIsAdminPanelOpen = isAdminPanelOpen.set;

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
      isAuthModalOpenVal ||
      isProfileOpenVal ||
      isLeaderboardOpenVal ||
      isCommandPaletteOpenVal ||
      isCategoryModalOpenVal ||
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

        {/* ══ LIQUID ETHER BACKGROUND ══════════════════════════════ */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            style={{
              width: '100vw',
              height: '100vh',
              position: 'relative',
              opacity: isDark ? 0.3 : 0.6,
            }}
          >
            <React.Suspense fallback={null}>
              <LiquidEther
                mouseForce={23}
                cursorSize={120}
                isViscous={true}
                viscous={70}
                colors={LIQUID_ETHER_COLORS}
                autoDemo
                autoSpeed={0.7}
                autoIntensity={2.5}
                isBounce={false}
                resolution={0.5}
              />
            </React.Suspense>
          </div>
        </div>

        {/* ══ TOP HEADER BAR ════════════════════════════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-8 transition-all duration-300 ${
            isScrolled
              ? 'pt-3 pb-3 pointer-events-auto bg-[rgba(220,228,248,0.55)] dark:bg-[rgba(13,13,26,0.6)] backdrop-blur-[20px] backdrop-saturate-[1.8] border-b border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.07)] shadow-[0_4px_24px_rgba(80,60,180,0.1)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
              : 'pt-4 pb-2 pointer-events-none bg-transparent border-b border-transparent shadow-none'
          }`}
        >
          {/* Left: Logo / Brand */}
          <div className="flex items-center gap-2.5 pointer-events-auto flex-1 justify-start">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-[0_4px_14px_rgba(124,58,237,0.4)]">
              <div className="w-2 h-2 bg-white rounded-full opacity-90" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-[rgba(15,15,35,0.85)] dark:text-[rgba(240,240,255,0.9)]">
              Nexus
            </span>
          </div>

          {/* Center: Sort tabs Redesigned with StarBorder and Framer Motion */}
          <div className="hidden md:flex justify-center pointer-events-auto">
            <div className="flex items-center gap-1 rounded-[19.5px] p-1 bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(20,15,40,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_4px_16px_rgba(80,60,160,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <GooeyToggle
                items={[
                  { label: 'Newest', value: 'newest', icon: '✦' },
                  { label: 'Popular', value: 'popular', icon: '↑' },
                ]}
                initialActiveIndex={activeTab === 'newest' ? 0 : 1}
                onItemClick={(index, value) => {
                  const tab = value as 'newest' | 'popular';
                  setActiveTab(tab);
                  setSortBy(tab === 'popular' ? 'name' : 'default');
                  playSound('pop');
                }}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pointer-events-auto flex-1">
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
                  className="px-3 md:px-4 h-8 rounded-[17.5px] text-[12px] font-semibold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-[rgba(124,58,237,0.3)] dark:border-[rgba(124,58,237,0.4)]"
                  style={{
                    background: isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.1)',
                    color: isDark ? '#d8b4fe' : '#7c3aed',
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
                className="px-3 md:px-4 h-8 rounded-[17.5px] text-[12px] font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 shadow-[0_4px_12px_rgba(80,60,160,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.08)]"
                style={{
                  background: isDark ? 'rgba(30,25,50,0.6)' : 'rgba(255,255,255,0.8)',
                  color: isDark ? '#d8b4fe' : '#7c3aed',
                }}
                aria-label="Sign in"
              >
                <UserIcon size={12} />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </header>

        {/* ══ MAIN CONTENT ══════════════════════════════════ */}
        <main
          className="relative z-10 flex flex-col items-center"
          style={{ paddingTop: '80px', paddingBottom: '120px' }}
        >
          {/* ── COMMUNITY VIEW ── */}
          {activeNav === 'community' && (
            <React.Suspense fallback={null}>
              <SpatialCommunityHub
                isDark={isDark}
                searchQuery={searchQuery}
                setIsCommandPaletteOpen={setIsCommandPaletteOpen}
              />
            </React.Suspense>
          )}

          {/* ── COLLECTIONS VIEW ── */}
          {activeNav === 'collections' && (
            <React.Suspense fallback={null}>
              <CollectionsView isDark={isDark} setIsCommandPaletteOpen={setIsCommandPaletteOpen} />
            </React.Suspense>
          )}

          {/* ── DISCOVER / CATEGORIES / SUBMIT VIEWS ── */}
          {(activeNav === 'discover' || activeNav === 'categories' || activeNav === 'submit') && (
            <>
              {/* ── HERO SECTION ── */}
              <section className="w-full flex flex-col items-center text-center px-4 pt-8 pb-4 overflow-visible">
                <h1 className="font-display text-[32px] sm:text-[42px] md:text-[50px] lg:text-[56px] font-black tracking-tight leading-[1.1] mb-2 text-[rgba(10,8,30,0.90)] dark:text-[rgba(240,240,255,0.97)] tracking-[-0.025em]">
                  <BlurText
                    text="Ultimate Spatial Gallery Directory"
                    delay={100}
                    animateBy="words"
                    direction="top"
                  />
                </h1>

                <p
                  className="text-[15px] sm:text-[16px] font-medium mb-6 animate-fade-up max-w-md text-[rgba(80,60,140,0.65)] dark:text-[rgba(180,170,230,0.7)]"
                  style={{ animationDelay: '80ms' }}
                >
                  Next-generation immersive web directory &amp; resource library.
                </p>

                {/* UNIFIED CONTROL CENTER (Search + Categories) */}
                <div
                  className="w-full max-w-[640px] animate-fade-up mt-1 mb-4 relative"
                  style={{ animationDelay: '140ms' }}
                >
                  <BorderGlow
                    edgeSensitivity={40}
                    glowColor="252 48 74"
                    backgroundColor="transparent"
                    borderRadius={24}
                    glowRadius={35}
                    glowIntensity={1}
                    coneSpread={27}
                    animated={false}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full shadow-[0_8px_32px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                  >
                    <div className="w-full flex flex-col bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(18,16,40,0.25)] backdrop-blur-[32px] rounded-[21.5px] border border-[rgba(255,255,255,0.45)] dark:border-[rgba(255,255,255,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden">
                      {/* Search Input Area */}
                      <div className="flex flex-row w-full h-full relative">
                        <button
                          onClick={() => setIsCommandPaletteOpen(true)}
                          className="flex-1 flex items-center gap-3 px-5 py-4 transition-all bg-transparent hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"
                          id="hero-search-btn"
                          aria-label="Open search"
                        >
                          <SearchIcon
                            size={18}
                            className="text-[rgba(100,80,160,0.5)] dark:text-[rgba(180,160,255,0.5)]"
                          />
                          <span className="flex-1 text-left text-[15px] font-medium text-[rgba(100,80,160,0.7)] dark:text-[rgba(180,160,255,0.6)] truncate">
                            Search for spatial experiences, tools, and resources...
                          </span>
                          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-md border-[rgba(200,190,240,0.6)] dark:border-[rgba(255,255,255,0.15)] border text-[rgba(120,90,200,0.6)] dark:text-[rgba(180,160,255,0.6)] bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.04)]">
                            ⌘K
                          </kbd>
                        </button>

                        <div className="w-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)]" />

                        <button
                          ref={categoriesBtnRef}
                          onClick={handleCategoriesClick}
                          className="px-6 py-4 transition-all bg-transparent hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] flex items-center justify-center gap-2 text-[14px] font-bold text-[rgba(100,80,160,0.9)] dark:text-[rgba(180,160,255,0.9)] rounded-r-[21.5px]"
                        >
                          Categories
                        </button>
                      </div>
                    </div>
                  </BorderGlow>
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
          <div
            className="pointer-events-auto flex items-center p-1.5 sm:p-2 rounded-[32px] max-w-full overflow-x-auto no-scrollbar"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(30,25,50,0.25) 0%, rgba(10,5,20,0.05) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(48px) saturate(250%)',
              WebkitBackdropFilter: 'blur(48px) saturate(250%)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(255,255,255,0.4)',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 4px 12px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.4), 0 20px 40px -8px rgba(0,0,0,0.8)'
                : 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 4px 16px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.05), 0 20px 40px -8px rgba(80,60,180,0.15)',
            }}
          >
            <GooeyToggle
              items={NAV_ITEMS.filter((item) => item.id !== 'categories').map((item) => ({
                label: item.label,
                value: item.id,
                icon: item.icon(false),
              }))}
              initialActiveIndex={Math.max(
                0,
                NAV_ITEMS.filter((item) => item.id !== 'categories').findIndex(
                  (i) => i.id === activeNav
                )
              )}
              onItemClick={(index, value) => {
                if (value === 'assistant') {
                  if (isListening) stopListening();
                  else startListening();
                  return; // Don't change active nav to assistant, it's just an action
                }
                setActiveNav(value);
                playSound('pop');
                if (value === 'submit') setIsModalOpen(true);
              }}
              animationTime={500}
              particleCount={18}
              variant="vertical"
            />
          </div>
        </nav>

        {/* ══ VOICE ASSISTANT OVERLAY ════════════════════════ */}
        <VoiceAssistantOverlay
          isListening={isListening}
          transcript={transcript}
          onStop={stopListening}
          isProcessing={isVoiceProcessing}
        />

        {/* ══ MODALS ════════════════════════════════════════ */}
        {isOptionWheelOpen && (
          <div className="fixed inset-0 z-[9999]">
            {/* Blurred overlay */}
            <div
              className="absolute inset-0 bg-[rgba(255,255,255,0.02)] dark:bg-[rgba(0,0,0,0.2)] backdrop-blur-[8px] transition-all duration-300"
              onClick={() => setIsOptionWheelOpen(false)}
            />
            {/* Desktop Wheel */}
            <div
              className="absolute hidden md:block w-[240px] h-[400px] bg-transparent -translate-y-1/2"
              style={{ top: wheelPos.top, left: wheelPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <OptionWheel
                items={SIDEBAR_CATEGORIES}
                defaultSelected={
                  SIDEBAR_CATEGORIES.indexOf(activeCategory) !== -1
                    ? SIDEBAR_CATEGORIES.indexOf(activeCategory)
                    : 0
                }
                onChange={(index, item) => {
                  setActiveCategory(item);
                }}
                textColor={isDark ? 'rgba(180,160,255,0.6)' : '#8070b0'}
                activeColor={isDark ? '#ffffff' : '#000000'}
                side="left"
                fontSize={1.6}
                spacing={1.5}
                curve={0.8}
                tilt={5}
                blur={1.5}
                fade={0.4}
                smoothing={400}
                inset={24}
                loop={true}
                draggable
              />
            </div>
            {/* Mobile Wheel */}
            <div
              className="absolute md:hidden w-[240px] h-[340px] bg-transparent"
              style={{ top: wheelPos.bottom, right: wheelPos.right }}
              onClick={(e) => e.stopPropagation()}
            >
              <OptionWheel
                items={SIDEBAR_CATEGORIES}
                defaultSelected={
                  SIDEBAR_CATEGORIES.indexOf(activeCategory) !== -1
                    ? SIDEBAR_CATEGORIES.indexOf(activeCategory)
                    : 0
                }
                onChange={(index, item) => {
                  setActiveCategory(item);
                }}
                textColor={isDark ? 'rgba(180,160,255,0.6)' : '#8070b0'}
                activeColor={isDark ? '#ffffff' : '#000000'}
                side="left"
                fontSize={1.6}
                spacing={1.5}
                curve={0.8}
                tilt={5}
                blur={1.5}
                fade={0.4}
                smoothing={400}
                inset={24}
                loop={true}
                draggable
              />
            </div>
          </div>
        )}

        <SavePopover config={savePopoverConfig} onClose={() => setSavePopoverConfig(null)} />
        <React.Suspense fallback={null}>
          <CategoriesModal
            isOpen={isCategoryModalOpenVal}
            onClose={() => {
              setIsCategoryModalOpen(false);
              if (activeNav === 'categories') setActiveNav('discover');
            }}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isDark={isDark}
          />
          <CommandPalette
            isOpen={isCommandPaletteOpenVal}
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
        </React.Suspense>
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
