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
import SpatialCommunityHub from './SpatialCommunityHub';
import CollectionsView from './CollectionsView';
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

// Nav items for bottom dock
const NAV_ITEMS = [
  {
    id: 'discover',
    label: 'Discover',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  'All Tools':     '✦',
  'Design':        '🎨',
  'Development':   '⌨️',
  'AI Tools':      '✦',
  'Productivity':  '⚡',
  'Medicine':      '🩺',
  'Accounting':    '📊',
  'Engineering':   '🔧',
  'Entertainment': '🎬',
  'Finance':       '💰',
  'Education':     '📚',
  'Marketing':     '📣',
  'Utilities':     '🛠',
  'Crypto':        '₿',
  'Security':      '🔒',
  'Open Source':   '🌐',
};

const SIDEBAR_CATEGORIES = ['All Tools', ...ALL_CATEGORIES];

// ═══════════════════════════════════════════════════
// HERO BENTO CARD (large, spans 2 rows — Stitch layout)
// ═══════════════════════════════════════════════════
const CATEGORY_COLORS_HERO: Record<string, { bg: string; text: string; border: string }> = {
  Design:        { bg: 'rgba(124,58,237,0.12)', text: '#9333ea', border: 'rgba(124,58,237,0.2)' },
  Development:   { bg: 'rgba(37,99,235,0.12)',  text: '#3b82f6', border: 'rgba(37,99,235,0.2)' },
  'AI Tools':    { bg: 'rgba(5,150,105,0.12)',  text: '#10b981', border: 'rgba(5,150,105,0.2)' },
  Productivity:  { bg: 'rgba(217,119,6,0.12)',  text: '#f59e0b', border: 'rgba(217,119,6,0.2)' },
};

function HeroBentoCard({ tool, user, onRequireAuth, isFocused, onSaveRequest, isDark }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const numericToolId = Number(tool.id);
  const colors = CATEGORY_COLORS_HERO[tool.category] || { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' };
  const isSaved = user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId);

  return (
    <div
      onClick={() => window.open(tool.url, '_blank')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); window.open(tool.url, '_blank'); } }}
      style={{
        height: '100%',
        minHeight: '360px',
        background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
        border: isFocused
          ? '1px solid rgba(124,58,237,0.6)'
          : isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '2rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: isHovered
          ? isDark
            ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.15)'
            : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)'
          : isDark
          ? '0 4px 24px rgba(0,0,0,0.35)'
          : '0 8px 30px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
      }}
    >
      {/* Screenshot — fills remaining height, inside rounded container */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', minHeight: '200px', borderRadius: '1.25rem' }}>
        {/* Browser chrome overlay on image */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px',
            background: isDark ? 'rgba(15,12,32,0.75)' : 'rgba(245,244,252,0.85)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,192,240,0.25)',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840', opacity: 0.85 }} />
          </div>
          <div style={{
            flex: 1, height: '20px', borderRadius: '5px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', paddingLeft: '10px',
          }}>
            <span style={{ fontSize: '10px', color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.45)', fontFamily: 'monospace' }}>
              {tool.url?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
            </span>
          </div>
        </div>

        {/* Always-visible action buttons — top right */}
        <div style={{
          position: 'absolute', top: '48px', right: '12px', zIndex: 15,
          display: 'flex', gap: '6px',
          transition: 'all 0.2s ease',
        }}>
          <button
            onClick={e => {
              e.stopPropagation();
              if (user) { const rect = e.currentTarget.getBoundingClientRect(); onSaveRequest({ tool, rect }); }
              else onRequireAuth();
            }}
            style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: isSaved ? 'linear-gradient(135deg,#f43f5e,#ec4899)' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.72)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              color: isSaved ? 'white' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Save"
          >
            ♥
          </button>
          <button
            onClick={e => { e.stopPropagation(); window.open(tool.url, '_blank'); }}
            style={{
              padding: '8px 18px', borderRadius: '14px',
              background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.72)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              color: isDark ? 'rgba(240,240,255,0.9)' : 'rgba(40,30,70,0.85)',
              fontSize: '13px', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            Visit
          </button>
        </div>

        {/* Play button center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '52px', height: '52px',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 12,
          transition: 'all 0.2s ease',
          opacity: isHovered ? 1 : 0.85,
        }}>
          <div style={{
            width: 0, height: 0,
            borderTop: '7px solid transparent',
            borderLeft: '12px solid white',
            borderBottom: '7px solid transparent',
            marginLeft: '2px',
          }} />
        </div>

        {!imageError && (
          <>
            <img
              src={tool.imageUrl}
              alt={`Screenshot of ${tool.name}`}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0 }} />}
          </>
        )}
        {imageError && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`} alt="" style={{ width: '56px', height: '56px', objectFit: 'contain', opacity: 0.3 }} aria-hidden="true" />
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div className="hero-card-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 8px 6px', flexShrink: 0 }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(30,28,50,0.88)',
            marginBottom: '12px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tool.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 14px', borderRadius: '100px',
              fontSize: '12px', fontWeight: 500,
              background: isDark ? colors.bg : 'rgba(255,255,255,0.55)',
              color: isDark ? colors.text : 'rgba(80,70,120,0.8)',
              border: isDark ? `1px solid ${colors.border}` : '1px solid rgba(255,255,255,0.55)',
              boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {tool.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)' }}>
              {((numericToolId % 500) + 1).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  // ── Hydration ──
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

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
    setIsDark(prev => !prev);
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
      link.id = id; link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debouncedSetQuery = useRef(debounce((q) => { setDebouncedQuery(q); }, APP_CONFIG.DEBOUNCE_MS)).current;
  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    debouncedSetQuery(val);
  }, [debouncedSetQuery]);

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
  const [activeTags, setActiveTags] = useState([]);

  // ── Pagination ──
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ── Modals ──
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

  // ── Nav / sidebar ──
  const [activeNav, setActiveNav] = useState('discover');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Keyboard navigation ──
  useEffect(() => { setFocusedIndex(-1); }, [debouncedQuery, activeCategory, sortBy, viewMode]);

  useEffect(() => {
    if (isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen ||
      isCommandPaletteOpen || isCategoryModalOpen || savePopoverConfig) return;

    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const currentTools = tools.filter(t => activeCategory === 'All Tools' || t.category === activeCategory);
      if (!currentTools.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => prev < currentTools.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : currentTools.length - 1);
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        window.open(currentTools[focusedIndex].url, '_blank');
      } else if (e.key === 'Escape') setFocusedIndex(-1);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedIndex, tools, activeCategory, isModalOpen, isAuthModalOpen, isProfileOpen,
    isLeaderboardOpen, isCommandPaletteOpen, isCategoryModalOpen, savePopoverConfig]);

  // ── Cmd+K ──
  useEffect(() => {
    const handleCmdK = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => { if (!prev) playSound('woosh'); return !prev; });
      }
    };
    document.addEventListener('keydown', handleCmdK);
    return () => document.removeEventListener('keydown', handleCmdK);
  }, []);

  // ── Auth ──
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('payload-token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, { headers: { Authorization: `JWT ${token}` } });
        if (res.ok) { const data = await res.json(); setUser(data.user); }
        else localStorage.removeItem('payload-token');
      } catch {}
    };
    checkUserSession();
  }, [isAuthModalOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('payload-token');
    setUser(null);
    setIsProfileOpen(false);
  }, []);

  // ── Infinite scroll ──
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) setPage(prev => prev + 1);
    }, { threshold: 0.1 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, tools]);

  // ── Fetch ──
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => { if (!localStorage.getItem('nexus-theme')) setIsDark(e.matches); };
    mediaQuery.addEventListener('change', handleChange);

    const fetchTools = async () => {
      if (page === 0) setIsLoading(true); else setIsLoadingMore(true);
      try {
        const { hits, nbPages } = await index.search(debouncedQuery, { page, hitsPerPage: APP_CONFIG.ALGOLIA_HITS_PER_PAGE });
        const fetchedTools = hits.map(tool => ({
          id: tool.objectID,
          name: tool.name,
          category: tool.category,
          url: tool.url,
          imageUrl: tool.screenshotUrl || 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop',
          description: tool.description || 'High-performance platform.',
          tags: tool.tags || [],
        }));
        setTools(prev => page === 0 ? fetchedTools : [...prev, ...fetchedTools]);
        setHasMore(page + 1 < nbPages);
      } catch (err) { console.warn('Failed to fetch tools:', err); }
      finally { setIsLoading(false); setIsLoadingMore(false); }
    };
    fetchTools();
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [debouncedQuery, page]);

  useEffect(() => { setTools([]); setPage(0); setHasMore(true); }, [debouncedQuery, activeCategory, activeTags]);

  // ── Filter / sort ──
  const filteredTools = useMemo(() => {
    let result = tools.filter(tool => {
      if (activeCategory !== 'All Tools' && tool.category !== activeCategory) return false;
      if (activeTags.length > 0) {
        const toolTags = tool.tags || [];
        return activeTags.every(tag => toolTags.includes(tag));
      }
      return true;
    });
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    return result;
  }, [activeCategory, activeTags, tools, sortBy]);

  const totalItems = filteredTools.length;

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ fontFamily: fontFamily }}
      >
        <style>{`
          :root { --global-font: ${fontFamily}; }
          body, button, input, select, textarea { font-family: var(--global-font); }
        `}</style>

        {/* ══ ATMOSPHERIC ORBS ══════════════════════════════ */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="orb w-[600px] h-[600px] -top-32 -left-32 opacity-60"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(99,102,241,0.12) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(199,215,245,0.9) 0%, rgba(213,200,240,0.6) 70%, transparent 100%)',
              animation: 'float 12s ease-in-out infinite',
            }}
          />
          <div className="orb w-[500px] h-[500px] top-1/3 -right-24 opacity-50"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(147,51,234,0.30) 0%, rgba(124,58,237,0.08) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(232,213,245,0.95) 0%, rgba(213,200,240,0.5) 70%, transparent 100%)',
              animation: 'float2 16s ease-in-out infinite 2s',
            }}
          />
          <div className="orb w-[400px] h-[400px] bottom-0 left-1/3 opacity-40"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, rgba(99,102,241,0.06) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(199,215,245,0.7) 0%, rgba(232,213,245,0.4) 70%, transparent 100%)',
              animation: 'float 18s ease-in-out infinite 4s',
            }}
          />
        </div>

        {/* ══ TOP HEADER BAR ════════════════════════════════ */}
        <header
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-8"
          style={{
            height: '60px',
            background: isDark ? 'rgba(13,13,26,0.6)' : 'rgba(220,228,248,0.55)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.7)',
          }}
        >
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full opacity-90" />
            </div>
            <span
              className="text-[15px] font-bold tracking-tight hidden sm:block"
              style={{ color: isDark ? 'rgba(240,240,255,0.9)' : 'rgba(15,15,35,0.85)' }}
            >
              Nexus
            </span>
          </div>

          {/* Center: mini sort tabs */}
          <div
            className="hidden md:flex items-center gap-1 rounded-full p-1"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
            }}
          >
            {(['newest', 'popular'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSortBy(tab === 'popular' ? 'name' : 'default');
                  playSound('pop');
                }}
                className="px-4 py-1.5 rounded-full text-[12.5px] font-semibold capitalize transition-all duration-200"
                style={{
                  background: activeTab === tab
                    ? isDark ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.9)'
                    : 'transparent',
                  color: activeTab === tab
                    ? isDark ? '#c084fc' : '#7c3aed'
                    : isDark ? 'rgba(200,200,240,0.6)' : 'rgba(80,60,140,0.6)',
                  boxShadow: activeTab === tab ? '0 1px 6px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {tab === 'newest' ? '✦ Newest' : '↑ Popular'}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
                color: isDark ? 'rgba(200,190,255,0.8)' : 'rgba(80,60,140,0.8)',
              }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
                color: isDark ? 'rgba(200,190,255,0.8)' : 'rgba(80,60,140,0.8)',
              }}
              aria-label="Leaderboard"
            >
              <TrophyIcon size={14} />
            </button>

            {/* View toggle */}
            <button
              onClick={() => { playSound('snap'); setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hidden sm:flex"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
                color: isDark ? 'rgba(200,190,255,0.8)' : 'rgba(80,60,140,0.8)',
              }}
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <ListIcon size={14} /> : <GridIcon size={14} />}
            </button>

            {/* User / Auth */}
            {user ? (
              <>
                {(user as User).role === 'admin' && (
                  <button
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed22, #a855f722)',
                      border: '1px solid rgba(124,58,237,0.4)',
                      color: '#a855f7',
                    }}
                    aria-label="Admin panel"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="px-3 h-8 rounded-full text-[12px] font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  style={{
                    background: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    color: isDark ? '#c084fc' : '#7c3aed',
                  }}
                  aria-label="Open profile"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="hidden sm:inline">{user.nickname || user.email.split('@')[0]}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 h-8 rounded-full text-[12px] font-semibold transition-all hover:scale-105 flex items-center gap-1.5"
                style={{
                  background: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.8)',
                  border: isDark ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.9)',
                  color: isDark ? '#c084fc' : '#7c3aed',
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
          style={{ paddingTop: '60px', paddingBottom: '120px' }}
        >
          {/* ── COMMUNITY VIEW ── */}
          {activeNav === 'community' && (
            <SpatialCommunityHub
              isDark={isDark}
              onRequireAuth={() => setIsAuthModalOpen(true)}
              user={user}
              searchQuery={searchQuery}
              setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            />
          )}

          {/* ── COLLECTIONS VIEW ── */}
          {activeNav === 'collections' && (
            <CollectionsView
              isDark={isDark}
              onRequireAuth={() => setIsAuthModalOpen(true)}
              user={user}
              setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            />
          )}

          {/* ── DISCOVER / CATEGORIES / SUBMIT VIEWS ── */}
          {(activeNav === 'discover' || activeNav === 'categories' || activeNav === 'submit') && (<>
          {/* ── HERO SECTION ── */}
          <section className="w-full flex flex-col items-center text-center px-4 pt-10 pb-8">
            <h1
              className="font-display text-[32px] sm:text-[42px] md:text-[50px] lg:text-[56px] font-black tracking-tight leading-[1.1] mb-3 animate-fade-up"
              style={{
                color: isDark ? 'rgba(240,240,255,0.97)' : 'rgba(10,8,30,0.90)',
                letterSpacing: '-0.025em',
              }}
            >
              Ultimate Spatial Gallery Directory
            </h1>

            <p
              className="text-[15px] sm:text-[17px] font-medium mb-8 animate-fade-up max-w-md"
              style={{ color: isDark ? 'rgba(180,170,230,0.7)' : 'rgba(80,60,140,0.65)', animationDelay: '80ms' }}
            >
              Next-generation immersive web directory &amp; resource library.
            </p>

            {/* Search bar */}
            <div className="w-full max-w-[580px] animate-fade-up" style={{ animationDelay: '140ms' }}>
              <button
                onClick={() => { playSound('woosh'); setIsCommandPaletteOpen(true); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all hover:scale-[1.01] group"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)',
                  border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(24px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                  boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 24px rgba(100,80,200,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
                id="hero-search-btn"
                aria-label="Open search"
              >
                <SearchIcon size={16} className="" style={{ color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(124,58,237,0.4)' }} />
                <span
                  className="flex-1 text-left text-[14.5px] font-medium"
                  style={{ color: isDark ? 'rgba(180,160,255,0.45)' : 'rgba(100,80,160,0.5)' }}
                >
                  Search for spatial experiences, tools, and resources...
                </span>
                <kbd
                  className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,190,240,0.6)',
                    color: isDark ? 'rgba(180,160,255,0.45)' : 'rgba(120,90,200,0.5)',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 mt-5 flex-wrap justify-center max-w-[700px] animate-fade-up" style={{ animationDelay: '200ms' }}>
              {SIDEBAR_CATEGORIES.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); playSound('pop'); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105"
                  style={{
                    background: activeCategory === cat
                      ? isDark ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.12)'
                      : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
                    border: activeCategory === cat
                      ? '1px solid rgba(124,58,237,0.5)'
                      : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)',
                    color: activeCategory === cat
                      ? isDark ? '#c084fc' : '#7c3aed'
                      : isDark ? 'rgba(190,180,240,0.6)' : 'rgba(80,60,140,0.55)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  <span className="text-[11px] leading-none">{CATEGORY_ICONS[cat] || '•'}</span>
                  {cat}
                </button>
              ))}
              {activeCategory !== 'All Tools' && SIDEBAR_CATEGORIES.indexOf(activeCategory) >= 8 && (
                <span
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold"
                  style={{
                    background: 'rgba(124,58,237,0.35)',
                    border: '1px solid rgba(124,58,237,0.5)',
                    color: isDark ? '#c084fc' : '#7c3aed',
                  }}
                >
                  {activeCategory}
                </span>
              )}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
                  color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,100,180,0.45)',
                }}
              >
                More...
              </button>
            </div>
          </section>

          {/* ── GALLERY GRID ── */}
          <section className="w-full max-w-[1300px] px-4 md:px-6">
            {/* Count row */}
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-[12.5px] font-medium" style={{ color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(100,80,180,0.45)' }}>
                {isLoading ? 'Loading...' : `${totalItems} resources`}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all hover:scale-[1.04]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  color: 'white',
                  boxShadow: '0 2px 16px rgba(124,58,237,0.35)',
                }}
                id="suggest-site-btn"
              >
                <PlusIcon size={12} />
                Suggest a Site
              </button>
            </div>

            {/* Grid / List content */}
            {isLoading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} spanClass="" isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}
                      className="h-[72px] rounded-2xl skeleton-pulse"
                      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)' }}
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
                        user={user}
                        onRequireAuth={() => setIsAuthModalOpen(true)}
                        isFocused={focusedIndex === 0}
                        onSaveRequest={setSavePopoverConfig}
                        isDark={isDark}
                      />
                    </div>
                  )}
                  {/* Cards with varied sizes */}
                  {filteredTools.slice(1).map((tool, i) => {
                    // Bento 2.0 pattern: cycle through size variations
                    const patternIndex = i % 8;
                    let gridStyle = {};
                    if (patternIndex === 2) {
                      // Tall card
                      gridStyle = { gridRow: 'span 2' };
                    } else if (patternIndex === 5) {
                      // Wide card
                      gridStyle = { gridColumn: 'span 2' };
                    }
                    // All others are 1x1

                    return (
                      <div
                        key={tool.id}
                        className="animate-fade-up"
                        style={{ ...gridStyle, animationDelay: `${(i % 12) * 40}ms` }}
                      >
                        <BentoCard
                          tool={tool}
                          user={user}
                          onRequireAuth={() => setIsAuthModalOpen(true)}
                          isFocused={focusedIndex === i + 1}
                          index={i + 1}
                          total={filteredTools.length}
                          onSaveRequest={setSavePopoverConfig}
                          isDark={isDark}
                        />
                      </div>
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
                    <div
                      key={tool.id}
                      className="animate-fade-up"
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
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}
                >
                  <SearchIcon size={26} style={{ color: isDark ? '#a855f7' : '#7c3aed' }} />
                </div>
                <p className="text-[20px] font-bold mb-2" style={{ color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)' }}>
                  {debouncedQuery ? `No tools found for "${debouncedQuery}"` : 'No tools in this category'}
                </p>
                <p className="text-[14px] font-medium mb-7 max-w-sm" style={{ color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(100,80,160,0.55)' }}>
                  {debouncedQuery ? 'Try a different search term or browse all categories.' : 'Be the first to suggest a tool in this category.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveCategory('All Tools')}
                    className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all hover:scale-[1.03]"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 2px 16px rgba(124,58,237,0.35)' }}
                  >
                    Browse All
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all hover:scale-[1.03]"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.7)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
                      color: isDark ? 'rgba(200,190,255,0.8)' : 'rgba(80,60,140,0.8)',
                    }}
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
                  <div className="flex items-center gap-2.5" style={{ color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.45)' }}>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    <span className="text-[13px] font-medium">Loading more...</span>
                  </div>
                ) : hasMore ? (
                  <p className="text-[12px] font-medium" style={{ color: isDark ? 'rgba(180,160,255,0.3)' : 'rgba(120,90,200,0.35)' }}>
                    Scroll for more
                  </p>
                ) : tools.length > 0 ? (
                  <p className="text-[12px] font-medium" style={{ color: isDark ? 'rgba(180,160,255,0.3)' : 'rgba(120,90,200,0.35)' }}>
                    You've seen all {tools.length} resources ✦
                  </p>
                ) : null}
              </div>
            )}
          </section>
          </>)}
        </main>

        {/* ══ BOTTOM NAVIGATION DOCK (Floating Pill — Stitch Style) ════ */}
        <nav
          className="fixed bottom-0 inset-x-0 z-50 flex justify-center pb-6 pointer-events-none"
          style={{ paddingLeft: '16px', paddingRight: '16px' }}
        >
          <div
            className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-2xl"
            style={{
              background: isDark
                ? 'rgba(18,16,40,0.55)'
                : 'rgba(255,255,255,0.50)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.72)',
              boxShadow: isDark
                ? '0 20px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 20px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            {NAV_ITEMS.map(item => {
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
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: isActive
                      ? isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.92)'
                      : 'transparent',
                    boxShadow: isActive
                      ? isDark
                        ? '0 2px 8px rgba(0,0,0,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.08)'
                      : 'none',
                    border: isActive
                      ? isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.04)'
                      : '1px solid transparent',
                    color: isActive
                      ? isDark ? '#e2e0ff' : '#111111'
                      : isDark ? 'rgba(180,160,255,0.4)' : 'rgba(100,100,120,0.55)',
                    minWidth: '70px',
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className="relative flex items-center justify-center w-5 h-5 transition-all"
                  >
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
        <SavePopover config={savePopoverConfig} onClose={() => setSavePopoverConfig(null)} user={user} setUser={setUser} />
        <CategoriesModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} activeCategory={activeCategory} setActiveCategory={setActiveCategory} isDark={isDark} />
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} query={searchQuery} setQuery={handleSearchChange} tools={tools} />
        <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} accentColor={accentColor} setAccentColor={setAccentColor} fontFamily={fontFamily} setFontFamily={setFontFamily} />
        <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} user={user} />
      </div>
    </ErrorBoundary>
  );
}
