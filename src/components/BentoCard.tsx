// @ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain, getBentoSpan } from '../utils/helpers';
import ShareButton from './ShareButton';

// ─── Category → Accent Colors ───────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Design:        '#8B5CF6',
  Development:   '#3B82F6',
  'AI Tools':    '#10B981',
  Productivity:  '#F59E0B',
  Medicine:      '#EC4899',
  Accounting:    '#6366F1',
  Engineering:   '#14B8A6',
  Entertainment: '#F97316',
  Finance:       '#22C55E',
  Education:     '#A855F7',
  Marketing:     '#0EA5E9',
  Utilities:     '#78716C',
  Crypto:        '#EAB308',
  Security:      '#EF4444',
  'Open Source': '#84CC16',
};

const FALLBACK_COLOR = '#6B7280';

function getAccentColor(category: string): string {
  return CATEGORY_COLORS[category] || FALLBACK_COLOR;
}

// ─── BentoCard Component ────────────────────────────────────────────────
const BentoCard = memo(({ tool, user, onRequireAuth, isFocused, index, total, onSaveRequest }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const spanClass = getBentoSpan(index, total);
  const accentColor = getAccentColor(tool.category);
  const domain = getDomain(tool.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSavedAnywhere =
    user?.bookmarks?.some((b) => (typeof b === 'object' ? b.id : b) === numericToolId) ||
    user?.collections?.some((c) =>
      c.tools?.some((t) => (typeof t === 'object' ? t.id : t) === numericToolId)
    );

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFocused]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (isFocused && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (user && cardRef.current) {
          const btn = cardRef.current.querySelector('[data-save-btn]');
          if (btn) {
            const rect = btn.getBoundingClientRect();
            onSaveRequest({ tool, rect });
          }
        } else {
          onRequireAuth();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFocused, user, tool, onSaveRequest, onRequireAuth]);

  const isBig = spanClass.includes('row-span-2') || spanClass.includes('col-span-2');
  const isHero = spanClass.includes('row-span-2') && spanClass.includes('col-span-2');

  return (
    <div
      ref={cardRef}
      onClick={() => window.open(tool.url, '_blank')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out ${spanClass} ${
        isFocused
          ? 'ring-2 ring-white/40 dark:ring-white/20 z-10'
          : ''
      }`}
      style={{
        borderRadius: isHero ? '28px' : isBig ? '24px' : '20px',
      }}
      role="article"
      aria-label={`${tool.name} - ${tool.category}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.open(tool.url, '_blank');
        }
      }}
    >
      {/* ─── Background Image (full-bleed) ──────────────────── */}
      {!imageError && (
        <>
          <img
            src={tool.imageUrl}
            alt={`Screenshot of ${tool.name}`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {/* Shimmer loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse skeleton-pulse" />
          )}
        </>
      )}

      {/* ─── Fallback gradient if no image ─────────────────── */}
      {imageError && (
        <div
          className="absolute inset-0 transition-transform duration-700"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}66 50%, ${accentColor}33 100%)`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      )}

      {/* ─── Dark Overlay Gradient (bottom-heavy for text) ──── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isHero
            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)'
            : isBig
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 80%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
        }}
      />

      {/* ─── Accent Glow on Hover ───────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${accentColor}33 0%, transparent 60%)`,
        }}
      />

      {/* ─── Category Accent Bar (left side) ────────────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] z-20 transition-all duration-500 group-hover:w-[4px]"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}88)`,
        }}
      />

      {/* ─── Action Buttons (Top-Right) ─────────────────────── */}
      <div className={`absolute top-4 right-4 z-30 flex items-center gap-2 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <div className="hover:scale-110 transition-transform">
          <div className="w-9 h-9 rounded-full backdrop-blur-xl bg-black/30 border border-white/10 flex items-center justify-center hover:bg-black/50 transition-all">
            <ShareButton url={tool.url} name={tool.name} />
          </div>
        </div>
        <button
          data-save-btn
          onClick={(e) => {
            e.stopPropagation();
            if (user) {
              const rect = e.currentTarget.getBoundingClientRect();
              onSaveRequest({ tool, rect });
            } else {
              onRequireAuth();
            }
          }}
          className={`w-9 h-9 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 outline-none hover:scale-110 ${
            isSavedAnywhere
              ? 'bg-white text-black dark:bg-white shadow-lg'
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={16} />
        </button>
      </div>

      {/* ─── Main Content (Bottom) ──────────────────────────── */}
      <div className={`relative z-10 flex flex-col justify-end h-full w-full ${
        isHero ? 'p-6 md:p-8' : isBig ? 'p-5 md:p-7' : 'p-4 md:p-5'
      }`}>
        {/* Tool Name + Favicon Row */}
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20 ${
              isHero ? 'w-12 h-12 md:w-14 md:h-14' : isBig ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'
            }`}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
              alt=""
              loading="lazy"
              className={`object-contain ${
                isHero ? 'w-6 h-6 md:w-7 md:h-7' : isBig ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4 md:w-5 md:h-5'
              }`}
              aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-white font-bold leading-tight tracking-tight drop-shadow-lg ${
                isHero ? 'text-2xl md:text-3xl' : isBig ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
              }`}
            >
              {tool.name}
            </h3>
          </div>
        </div>

        {/* Bottom row: Domain + Category */}
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <span className="text-[10px] md:text-[11px] font-medium text-white/50 truncate max-w-[60%]">
            {domain || tool.url}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm"
            style={{
              backgroundColor: `${accentColor}33`,
              color: accentColor,
              border: `1px solid ${accentColor}44`,
            }}
          >
            {tool.category}
          </span>
        </div>
      </div>

      {/* ─── Hover Reveal Panel (glass slide-up) ───────────── */}
      <div
        className={`
          absolute inset-x-0 bottom-0 z-20
          transition-all duration-500 ease-out
          ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
      >
        <div className="backdrop-blur-2xl bg-black/80 border-t border-white/10 p-5 md:p-7">
          {/* Description */}
          {tool.description && (
            <p className="text-white/90 text-[13px] md:text-[14px] font-medium leading-relaxed mb-3 line-clamp-2">
              {tool.description}
            </p>
          )}

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tool.tags.slice(0, isBig ? 4 : 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Visit Button */}
          <div className="flex items-center gap-2 text-white/80 text-[12px] font-bold group/link hover:text-white transition-colors">
            <span>Visit site</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* ─── Focus ring ────────────────────────────────────── */}
      {isFocused && (
        <div
          className="absolute inset-0 ring-2 ring-white/40 z-30 pointer-events-none"
          style={{ borderRadius: 'inherit' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
