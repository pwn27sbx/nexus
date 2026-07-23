import React, { useState, useEffect } from 'react';
import { ALL_CATEGORIES } from '../utils/constants';
import { playSound } from '../utils/sounds';
import BorderGlow from './BorderGlow';
import Strands from './Strands';
import { SearchIcon } from 'lucide-react';

// Category metadata — icons 3D-style with emoji + blurred screenshot backgrounds
const CATEGORY_DATA: Record<string, { emoji: string; gradient: string; desc: string }> = {
  Design: {
    emoji: '🎨',
    gradient: 'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
    desc: 'Design Inspiration',
  },
  Development: {
    emoji: '⌨️',
    gradient: 'linear-gradient(135deg,#bfdbfe,#93c5fd)',
    desc: 'Development Resources',
  },
  'AI Tools': {
    emoji: '🤖',
    gradient: 'linear-gradient(135deg,#d1fae5,#6ee7b7)',
    desc: 'Artificial Intelligence',
  },
  Productivity: {
    emoji: '⚡',
    gradient: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    desc: 'Productivity Tools',
  },
  Medicine: {
    emoji: '🩺',
    gradient: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    desc: 'Medical Resources',
  },
  Accounting: {
    emoji: '📊',
    gradient: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
    desc: 'Accounting & Finance',
  },
  Engineering: {
    emoji: '🔧',
    gradient: 'linear-gradient(135deg,#ccfbf1,#99f6e4)',
    desc: 'Engineering Tools',
  },
  Entertainment: {
    emoji: '🎬',
    gradient: 'linear-gradient(135deg,#fee2e2,#fca5a5)',
    desc: 'Entertainment',
  },
  Finance: {
    emoji: '💰',
    gradient: 'linear-gradient(135deg,#dcfce7,#86efac)',
    desc: 'Finance & Growth',
  },
  Education: {
    emoji: '📚',
    gradient: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
    desc: 'Education & Learning',
  },
  Marketing: {
    emoji: '📣',
    gradient: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
    desc: 'Marketing & Growth',
  },
  Utilities: {
    emoji: '🛠',
    gradient: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
    desc: 'Utilities & Tools',
  },
  Crypto: {
    emoji: '₿',
    gradient: 'linear-gradient(135deg,#fefce8,#fef08a)',
    desc: 'Crypto & Web3',
  },
  Security: {
    emoji: '🔒',
    gradient: 'linear-gradient(135deg,#fef2f2,#fecaca)',
    desc: 'Security & Privacy',
  },
  'Open Source': {
    emoji: '🌐',
    gradient: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
    desc: 'Open Source',
  },
};

// Stitch category-style icon component
const CategoryIcon = ({
  category,
  isActive,
  isDark,
}: {
  category: string;
  isActive: boolean;
  isDark: boolean;
}) => {
  const data = CATEGORY_DATA[category] || {
    emoji: '📁',
    gradient: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
    desc: category,
  };
  return (
    <div
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.2))'
          : isDark
            ? 'rgba(255,255,255,0.08)'
            : data.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        boxShadow: isActive
          ? '0 4px 20px rgba(124,58,237,0.25)'
          : isDark
            ? '0 2px 12px rgba(0,0,0,0.3)'
            : '0 4px 16px rgba(80,60,160,0.12)',
        border: isActive
          ? '1.5px solid rgba(124,58,237,0.45)'
          : isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(255,255,255,0.9)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}
    >
      <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{data.emoji}</span>
    </div>
  );
};

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  isDark?: boolean;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  isDark = false,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = ALL_CATEGORIES.filter((cat) => cat.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Explore categories"
    >
      {/* ── Close pill — top right ── */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
        style={{
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
          border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.95)',
          color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
          backdropFilter: 'blur(16px)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
        }}
        aria-label="Close categories"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Close
      </button>

      {/* ── Main panel ── */}
      <div
        className="relative w-full flex flex-col items-center animate-scale-in"
        style={{ maxWidth: '1100px', padding: '0 24px', maxHeight: '100vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          className="font-display text-center mb-2 animate-fade-up"
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: isDark ? 'rgba(240,235,255,0.97)' : 'rgba(10,8,30,0.90)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginTop: '48px',
          }}
        >
          Ultimate Spatial Gallery Directory
        </h2>
        <p
          className="text-center mb-6 animate-fade-up"
          style={{
            fontSize: '15px',
            color: isDark ? 'rgba(180,170,230,0.65)' : 'rgba(80,60,140,0.6)',
            animationDelay: '60ms',
          }}
        >
          Next-generation immersive web directory &amp; resource library.
        </p>

        {/* Search */}
        <div className="px-6 pb-6 pt-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
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
              <div className="flex flex-row w-full h-full relative">
                <div className="hidden sm:flex items-center pl-2 shrink-0">
                  <button
                    disabled
                    className="flex items-center justify-center w-[90px] h-[64px] rounded-[16px] bg-transparent opacity-90 cursor-not-allowed"
                  >
                    <div style={{ width: '80px', height: '60px', position: 'relative' }}>
                      <Strands
                        colors={['#c5bdf0', '#96bbef', '#823fef']}
                        count={4}
                        speed={0.5}
                        amplitude={0.9}
                        waviness={1.4}
                        thickness={0.9}
                        glow={1.7}
                        taper={3}
                        spread={1}
                        intensity={0.5}
                        saturation={2}
                        opacity={1}
                        scale={1.8}
                        glass={false}
                        refraction={1}
                        dispersion={1}
                        glassSize={1}
                        hueShift={0}
                      />
                    </div>
                  </button>
                  <div className="h-10 w-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.06)] mx-1" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 px-4 py-4 transition-all bg-transparent">
                  <SearchIcon
                    size={18}
                    className="shrink-0 text-[rgba(100,80,160,0.5)] dark:text-[rgba(180,160,255,0.5)]"
                  />
                  <input
                    type="text"
                    placeholder="Search for spatial experiences, tools, and resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[14px] sm:text-[15px] font-medium outline-none text-[rgba(100,80,160,0.7)] dark:text-[rgba(180,160,255,0.6)]"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>

        {/* ── Category Grid ── */}
        <div
          className="w-full grid gap-4 pb-12 animate-fade-up categories-grid"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            animationDelay: '140ms',
          }}
        >
          {filtered.map((cat, i) => {
            const isActive = activeCategory === cat;
            const data = CATEGORY_DATA[cat] || { desc: cat };
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  playSound('pop');
                  onClose();
                }}
                className="category-card-bg flex flex-col items-center gap-4 p-6 rounded-[22px] transition-all duration-250 hover:scale-[1.03] hover:-translate-y-0.5"
                style={{
                  background: isActive
                    ? isDark
                      ? 'rgba(124,58,237,0.25)'
                      : 'rgba(124,58,237,0.1)'
                    : isDark
                      ? 'rgba(20,18,42,0.72)'
                      : 'rgba(255,255,255,0.68)',
                  border: isActive
                    ? '1.5px solid rgba(124,58,237,0.5)'
                    : isDark
                      ? '1px solid rgba(255,255,255,0.08)'
                      : '1px solid rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                  boxShadow: isActive
                    ? '0 6px 24px rgba(124,58,237,0.2)'
                    : isDark
                      ? '0 4px 16px rgba(0,0,0,0.3)'
                      : '0 4px 16px rgba(80,60,160,0.07)',
                  animationDelay: `${i * 25}ms`,
                  transform: isActive ? 'scale(1.02)' : undefined,
                  cursor: 'pointer',
                }}
                aria-label={`Category: ${cat}${isActive ? ' (active)' : ''}`}
                aria-pressed={isActive}
              >
                <CategoryIcon category={cat} isActive={isActive} isDark={isDark} />
                <div className="text-center">
                  <span
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: isActive
                        ? isDark
                          ? '#c084fc'
                          : '#7c3aed'
                        : isDark
                          ? 'rgba(230,225,255,0.9)'
                          : 'rgba(20,15,50,0.85)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {data.desc || cat}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Responsive grid styles
const CategoriesModalStyles = () => (
  <style>{`
    @media (max-width: 900px) {
      .categories-grid {
        grid-template-columns: repeat(3, 1fr) !important;
      }
    }
    @media (max-width: 600px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
  `}</style>
);

export default function CategoriesModalWrapper(props: CategoriesModalProps) {
  return (
    <>
      <CategoriesModalStyles />
      <CategoriesModal {...props} />
    </>
  );
}
