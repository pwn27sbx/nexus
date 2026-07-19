import React, { useRef, useEffect, memo } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain, getBentoSpan } from '../utils/helpers';
import ShareButton from './ShareButton';

// ─── Category → Gradient Map ──────────────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  Design:          ['#8B5CF6', '#3B0764'],
  Development:     ['#3B82F6', '#1E3A5F'],
  'AI Tools':      ['#10B981', '#064E3B'],
  Productivity:    ['#F59E0B', '#78350F'],
  Medicine:        ['#EC4899', '#831843'],
  Accounting:      ['#6366F1', '#1E1B4B'],
  Engineering:     ['#14B8A6', '#0F766E'],
  Entertainment:   ['#F97316', '#7C2D12'],
  Finance:         ['#22C55E', '#14532D'],
  Education:       ['#A855F7', '#4C1D95'],
  Marketing:       ['#0EA5E9', '#0C4A6E'],
  Utilities:       ['#78716C', '#292524'],
  Crypto:          ['#EAB308', '#713F12'],
  Security:        ['#EF4444', '#450A0A'],
  'Open Source':   ['#84CC16', '#3F6212'],
};

const FALLBACK_GRADIENT: [string, string] = ['#6B7280', '#111827'];

function getGradient(category: string): [string, string] {
  return CATEGORY_GRADIENTS[category] || FALLBACK_GRADIENT;
}

// ─── Component ────────────────────────────────────────────────────────────
const BentoCard = memo(({ tool, user, onRequireAuth, isFocused, index, total, onSaveRequest }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const spanClass = getBentoSpan(index, total);
  const [c1, c2] = getGradient(tool.category);
  const domain = getDomain(tool.url);

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

  const isBig = spanClass.includes('row-span-2');

  return (
    <div
      ref={cardRef}
      onClick={() => window.open(tool.url, '_blank')}
      className={`group relative overflow-hidden rounded-[28px] cursor-pointer transition-all duration-500 ease-out border border-white/10 shadow-sm hover:shadow-2xl ${spanClass} ${
        isFocused
          ? 'ring-4 ring-accent ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02] z-10'
          : 'hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]'
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
      {/* ─── Gradient Background ─────────────────────────────── */}
      <div          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{
          background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
        }}
      />

      {/* ─── Animated Shine Overlay ──────────────────────────── */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* ─── Subtle Grid Pattern ─────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ─── Ambient Radial Glow ─────────────────────────────── */}
      <div
        className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-700"
        style={{ backgroundColor: c1 }}
      />

      {/* ─── Action Buttons (Top-Right, Hover Reveal) ────────── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
          <ShareButton url={tool.url} name={tool.name} />
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
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 outline-none translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
            isSavedAnywhere
              ? 'bg-white text-accent dark:bg-black shadow-lg scale-110 delay-0'
              : 'bg-white/20 text-white hover:bg-white hover:text-black shadow-lg delay-100'
          }`}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={18} />
        </button>
      </div>

      {/* ─── Main Content ────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-6 md:p-8">
        {/* Favicon */}
        <div
          className={`
            flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md
            shadow-lg ring-1 ring-white/20 mb-4 transition-all duration-500
            group-hover:bg-white/20 group-hover:scale-110 group-hover:rotate-[-2deg]
            ${isBig ? 'w-20 h-20 md:w-24 md:h-24' : 'w-14 h-14 md:w-16 md:h-16'}
          `}
        >
          <img
            src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
            alt=""
            loading="lazy"
            className={`transition-transform duration-500 object-contain ${
              isBig ? 'w-10 h-10 md:w-12 md:h-12' : 'w-7 h-7 md:w-8 md:h-8'
            }`}
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Tool Name */}
        <h3
          className={`
            text-white font-extrabold text-center leading-tight px-2
            transition-all duration-300
            ${isBig ? 'text-3xl md:text-4xl md:leading-tight' : 'text-xl md:text-2xl'}
          `}
        >
          {tool.name}
        </h3>

        {/* Category Badge + New Badge (always visible) */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="
              inline-block px-3 py-1 rounded-full text-[10px] font-bold
              uppercase tracking-widest bg-white/15 backdrop-blur-sm
              text-white/90 ring-1 ring-white/10
              transition-all duration-300 group-hover:bg-white/25
            "
          >
            {tool.category}
          </span>
        </div>

        {/* Domain (always visible at bottom) */}
        <div className="absolute bottom-5 left-0 w-full px-6 md:px-8 flex items-center justify-center">
          <span className="text-[11px] font-medium text-white/50 truncate max-w-[80%]">
            {domain || tool.url}
          </span>
        </div>
      </div>

      {/* ─── Hover Reveal Panel (slides up from bottom) ─────── */}
      <div
        className="
          absolute inset-x-0 bottom-0 z-20
          translate-y-full group-hover:translate-y-0
          transition-transform duration-400 ease-out
        "
      >
        {/* Glass Panel */}
        <div className="backdrop-blur-2xl bg-black/60 border-t border-white/10 p-5 md:p-6">
          {/* Description */}
          {tool.description && (
            <p className="text-white/80 text-[13px] md:text-[14px] font-medium leading-relaxed mb-3 line-clamp-2">
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
          <div className="flex items-center gap-2 text-white/60 text-[12px] font-bold group/link">
            <span>Visit site</span>
            <ArrowUpRight />
          </div>
        </div>
      </div>

      {/* ─── Focus ring placeholder ──────────────────────────── */}
      {isFocused && (
        <div
          className="absolute inset-0 rounded-[28px] ring-2 ring-white/30 z-30 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
