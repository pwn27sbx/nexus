// @ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain } from '../utils/helpers';
import ShareButton from './ShareButton';

// ─── Category → Badge Colors ────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Design:        { bg: '#EDE9FE', text: '#7C3AED' },
  Development:   { bg: '#DBEAFE', text: '#1D4ED8' },
  'AI Tools':    { bg: '#D1FAE5', text: '#065F46' },
  Productivity:  { bg: '#FEF3C7', text: '#92400E' },
  Medicine:      { bg: '#FCE7F3', text: '#9D174D' },
  Accounting:    { bg: '#E0E7FF', text: '#3730A3' },
  Engineering:   { bg: '#CCFBF1', text: '#115E59' },
  Entertainment: { bg: '#FFEDD5', text: '#9A3412' },
  Finance:       { bg: '#DCFCE7', text: '#166534' },
  Education:     { bg: '#F3E8FF', text: '#6B21A8' },
  Marketing:     { bg: '#E0F2FE', text: '#0C4A6E' },
  Utilities:     { bg: '#F5F5F4', text: '#57534E' },
  Crypto:        { bg: '#FEF9C3', text: '#854D0E' },
  Security:      { bg: '#FEE2E2', text: '#991B1B' },
  'Open Source': { bg: '#ECFCCB', text: '#365314' },
};

// Dark mode variants
const CATEGORY_COLORS_DARK: Record<string, { bg: string; text: string }> = {
  Design:        { bg: '#3B1F7B33', text: '#A78BFA' },
  Development:   { bg: '#1E3A8A33', text: '#60A5FA' },
  'AI Tools':    { bg: '#06402033', text: '#34D399' },
  Productivity:  { bg: '#78350F33', text: '#FCD34D' },
  Medicine:      { bg: '#83144233', text: '#F472B6' },
  Accounting:    { bg: '#312E8133', text: '#818CF8' },
  Engineering:   { bg: '#13433733', text: '#2DD4BF' },
  Entertainment: { bg: '#7C2D1233', text: '#FB923C' },
  Finance:       { bg: '#14532D33', text: '#4ADE80' },
  Education:     { bg: '#581C8733', text: '#C084FC' },
  Marketing:     { bg: '#0C4A6E33', text: '#38BDF8' },
  Utilities:     { bg: '#29272533', text: '#A8A29E' },
  Crypto:        { bg: '#71341433', text: '#FDE047' },
  Security:      { bg: '#7F1D1D33', text: '#FCA5A5' },
  'Open Source': { bg: '#1A2E0533', text: '#BEF264' },
};

const FALLBACK_COLORS = { bg: '#F4F4F5', text: '#52525B' };
const FALLBACK_COLORS_DARK = { bg: '#27272A33', text: '#A1A1AA' };

// ─── BentoCard Component ────────────────────────────────────────────────
const BentoCard = memo(({ tool, user, onRequireAuth, isFocused, index, total, onSaveRequest }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const domain = getDomain(tool.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const colors = isDark
    ? (CATEGORY_COLORS_DARK[tool.category] || FALLBACK_COLORS_DARK)
    : (CATEGORY_COLORS[tool.category] || FALLBACK_COLORS);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden cursor-pointer
        bg-white dark:bg-[#161616]
        border border-black/[0.07] dark:border-white/[0.07]
        rounded-2xl
        transition-all duration-300 ease-out
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
        hover:-translate-y-0.5
        ${isFocused ? 'ring-2 ring-black/30 dark:ring-white/30' : ''}
      `}
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
      {/* ─── Image Preview (top 55%) ──────────────────────────── */}
      <div className="relative w-full" style={{ paddingBottom: '58%', overflow: 'hidden' }}>
        {/* Action buttons — appear on hover, top-right */}
        <div className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 transition-all duration-250 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
        }`}>
          <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-sm border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center hover:scale-110 transition-transform">
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
            className={`w-8 h-8 rounded-full backdrop-blur-md shadow-sm border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center transition-all duration-250 outline-none hover:scale-110 ${
              isSavedAnywhere
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white/90 dark:bg-black/80 text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
            aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
          >
            <HeartIcon isSaved={isSavedAnywhere} size={14} />
          </button>
        </div>

        {/* Image */}
        {!imageError && (
          <>
            <img
              src={tool.imageUrl}
              alt={`Screenshot of ${tool.name}`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                isHovered ? 'scale-[1.04]' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse skeleton-pulse" />
            )}
          </>
        )}

        {/* Fallback gradient */}
        {imageError && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}99 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
              alt=""
              className="w-12 h-12 object-contain opacity-40"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Subtle bottom gradient for image blending into card */}
        <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.04))' }}
        />
      </div>

      {/* ─── Card Info (bottom section) ──────────────────────── */}
      <div className="px-4 py-3.5">
        {/* Row 1: favicon + name + category badge */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
              alt=""
              loading="lazy"
              className="w-4 h-4 object-contain"
              aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h3 className="flex-1 text-[14px] font-bold text-black dark:text-white leading-tight truncate">
            {tool.name}
          </h3>
          <span
            className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {tool.category}
          </span>
        </div>

        {/* Row 2: description */}
        {tool.description && (
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-2">
            {tool.description}
          </p>
        )}

        {/* Row 3: domain URL */}
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] text-zinc-400 dark:text-zinc-500 font-medium truncate">
            {domain || tool.url}
          </span>
          <span className={`text-zinc-400 dark:text-zinc-500 transition-all duration-300 ${isHovered ? 'translate-x-0.5 -translate-y-0.5 text-black dark:text-white' : ''}`}>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>

      {/* ─── Focus ring ──────────────────────────────────────── */}
      {isFocused && (
        <div
          className="absolute inset-0 ring-2 ring-black/20 dark:ring-white/20 rounded-2xl z-30 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
