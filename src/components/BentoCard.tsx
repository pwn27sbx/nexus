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

  return (
    <div
      ref={cardRef}
      onClick={() => window.open(tool.url, '_blank')}
      className={`group relative overflow-hidden rounded-[32px] cursor-pointer transition-all duration-700 ease-out shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] ${spanClass} ${
        isFocused
          ? 'ring-4 ring-accent ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02] z-10'
          : 'hover:-translate-y-2 hover:scale-[1.01]'
      }`}
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
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
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
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            background: `linear-gradient(145deg, ${accentColor} 0%, ${accentColor}33 100%)`,
          }}
        />
      )}

      {/* ─── Subtle Grid Pattern Overlay ───────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: isBig ? '60px 60px' : '40px 40px',
        }}
      />

      {/* ─── Multi-layer Gradient Overlay for readability ─── */}
      {/* Deep bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-700"
      />
      {/* Top subtle gradient */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />

      {/* ─── Category Accent Border (bottom) ───────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] z-20 transition-all duration-500 group-hover:h-[4px]"
        style={{ backgroundColor: accentColor }}
      />

      {/* ─── Action Buttons (Top-Right, always visible) ────── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="translate-y-0 opacity-100 transition-all duration-300 hover:scale-110">
          <div className="w-9 h-9 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
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
          className={`w-9 h-9 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 outline-none hover:scale-110 ${
            isSavedAnywhere
              ? 'bg-white text-accent dark:bg-black shadow-lg scale-110'
              : 'bg-white/10 text-white hover:bg-white/30'
          }`}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={16} />
        </button>
      </div>

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-end h-full w-full p-5 md:p-7">
        {/* Tool Name + Favicon Row (at bottom) */}
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 rounded-xl bg-white/15 backdrop-blur-md shadow-lg ring-1 ring-white/20 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-3deg] ${
              isBig ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8'
            }`}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
              alt=""
              loading="lazy"
              className={`object-contain ${
                isBig ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4'
              }`}
              aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h3
            className={`
              text-white font-extrabold leading-tight tracking-tight
              transition-all duration-300 drop-shadow-lg
              ${isBig ? 'text-2xl md:text-4xl md:leading-[1.1]' : 'text-lg md:text-xl'}
            `}
          >
            {tool.name}
          </h3>
        </div>

        {/* Bottom row: Domain + Category */}
        <div className="flex items-center justify-between mt-1.5 md:mt-2">
          <span className="text-[10px] md:text-[11px] font-medium text-white/50 truncate max-w-[60%] drop-shadow">
            {domain || tool.url}
          </span>
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur-sm text-white/80 ring-1 ring-white/10"
          >
            {tool.category}
          </span>
        </div>
      </div>

      {/* ─── Hover Reveal Panel (glass slide-up) ───────────── */}
      <div
        className="
          absolute inset-x-0 bottom-0 z-20
          translate-y-full group-hover:translate-y-0
          transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        "
      >
        <div className="backdrop-blur-2xl bg-black/70 border-t border-white/10 p-5 md:p-7">
          {/* Description */}
          {tool.description && (
            <p className="text-white/80 text-[12px] md:text-[14px] font-medium leading-relaxed mb-3 line-clamp-2">
              {tool.description}
            </p>
          )}

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tool.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="
                    inline-block px-2 py-0.5 rounded-full
                    bg-white/10 text-white/70
                    text-[9px] font-bold uppercase tracking-wider
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Visit Button */}
          <div className="flex items-center gap-2 text-white/70 text-[12px] font-bold group/link hover:text-white transition-colors">
            <span>Visit site</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* ─── Focus ring ────────────────────────────────────── */}
      {isFocused && (
        <div
          className="absolute inset-0 rounded-[32px] ring-2 ring-white/40 z-30 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
