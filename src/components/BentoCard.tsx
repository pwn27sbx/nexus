import React, { useRef, useEffect, memo } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain, getBentoSpan } from '../utils/helpers';
import ShareButton from './ShareButton';

const FALLBACK_COLORS = [
  ['#2563eb', '#1e3a5f'],
  ['#059669', '#064e3b'],
  ['#ea580c', '#7c2d12'],
  ['#7c3aed', '#4c1d95'],
  ['#0891b2', '#164e63'],
  ['#e11d48', '#881337'],
  ['#7c3aed', '#3b0764'],
  ['#d97706', '#78350f'],
];

const BentoCard = memo(({ tool, user, onRequireAuth, isFocused, index, total, onSaveRequest }) => {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const numericToolId = Number(tool.id);
  const spanClass = getBentoSpan(index, total);
  const [c1, c2] = FALLBACK_COLORS[(numericToolId || index) % FALLBACK_COLORS.length];

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

  return (
    <div
      ref={cardRef}
      onClick={() => window.open(tool.url, '_blank')}
      className={`group relative overflow-hidden rounded-[24px] cursor-pointer transition-all duration-500 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-2xl ${spanClass} ${
        isFocused
          ? 'ring-4 ring-accent ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02] z-10'
          : 'hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]'
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
      // FALLBACK BACKGROUND (inline style - always works!)
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      {/* IMAGE - covers the fallback gradient if it loads */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={tool.imageUrl}
          alt={`${tool.name} screenshot`}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]"
          loading="lazy"
          onError={() => { if (imgRef.current) imgRef.current.style.opacity = '0'; }}
        />
      </div>

      {/* TOP RIGHT BUTTONS */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 outline-none ${
            isSavedAnywhere
              ? 'bg-white text-accent dark:bg-black opacity-100 shadow-lg'
              : 'bg-black/30 text-white dark:bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black'
          }`}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={18} />
        </button>
      </div>

      {/* GRADIENT OVERLAY - for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />

      {/* CONTENT */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-50">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="inline-block text-accent text-[11px] font-extrabold uppercase tracking-widest mb-1 opacity-0 -translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-75">
          {tool.category}
        </span>
        <div className="flex items-end justify-between">
          <div className="overflow-hidden flex-1 min-w-0">
            <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tighter leading-none mb-1 truncate">
              {tool.name}
            </h3>
            <p className="text-white/60 text-[14px] font-medium tracking-tight truncate max-w-[85%] opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-150">
              {getDomain(tool.url)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-black opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 shrink-0 ml-3 shadow-lg">
            <ArrowUpRight />
          </div>
        </div>
      </div>
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
