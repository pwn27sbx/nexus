// @ts-nocheck
import React, { useRef, useEffect, memo, useState } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain } from '../utils/helpers';
import ShareButton from './ShareButton';

// ─── Category → Badge Colors ────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Design:        { bg: 'rgba(124,58,237,0.12)', text: '#9333ea', border: 'rgba(124,58,237,0.2)' },
  Development:   { bg: 'rgba(37,99,235,0.12)',  text: '#3b82f6', border: 'rgba(37,99,235,0.2)' },
  'AI Tools':    { bg: 'rgba(5,150,105,0.12)',  text: '#10b981', border: 'rgba(5,150,105,0.2)' },
  Productivity:  { bg: 'rgba(217,119,6,0.12)',  text: '#f59e0b', border: 'rgba(217,119,6,0.2)' },
  Medicine:      { bg: 'rgba(219,39,119,0.12)', text: '#ec4899', border: 'rgba(219,39,119,0.2)' },
  Accounting:    { bg: 'rgba(99,102,241,0.12)', text: '#818cf8', border: 'rgba(99,102,241,0.2)' },
  Engineering:   { bg: 'rgba(20,184,166,0.12)', text: '#2dd4bf', border: 'rgba(20,184,166,0.2)' },
  Entertainment: { bg: 'rgba(234,88,12,0.12)',  text: '#fb923c', border: 'rgba(234,88,12,0.2)' },
  Finance:       { bg: 'rgba(22,163,74,0.12)',  text: '#4ade80', border: 'rgba(22,163,74,0.2)' },
  Education:     { bg: 'rgba(147,51,234,0.12)', text: '#c084fc', border: 'rgba(147,51,234,0.2)' },
  Marketing:     { bg: 'rgba(14,165,233,0.12)', text: '#38bdf8', border: 'rgba(14,165,233,0.2)' },
  Utilities:     { bg: 'rgba(100,116,139,0.12)',text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
  Crypto:        { bg: 'rgba(234,179,8,0.12)',  text: '#fde047', border: 'rgba(234,179,8,0.2)' },
  Security:      { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.2)' },
  'Open Source': { bg: 'rgba(132,204,22,0.12)', text: '#bef264', border: 'rgba(132,204,22,0.2)' },
};

const FALLBACK_COLORS = { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' };

// ─── BentoCard ───────────────────────────────────────────────────────────────
const BentoCard = memo(({ tool, user, onRequireAuth, isFocused, index, total, onSaveRequest, isDark }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const domain = getDomain(tool.url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const colors = CATEGORY_COLORS[tool.category] || FALLBACK_COLORS;

  const isSavedAnywhere =
    user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) ||
    user?.collections?.some(c => c.tools?.some(t => (typeof t === 'object' ? t.id : t) === numericToolId));

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
          if (btn) { const rect = btn.getBoundingClientRect(); onSaveRequest({ tool, rect }); }
        } else onRequireAuth();
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
      role="article"
      aria-label={`${tool.name} - ${tool.category}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); window.open(tool.url, '_blank'); } }}
      style={{
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
        transform: isHovered ? 'translateY(-4px) scale(1.008)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? isDark
            ? '0 16px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.15)'
            : '0 16px 48px rgba(80,60,180,0.12), 0 0 0 1px rgba(255,255,255,0.3)'
          : isDark
            ? '0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25)'
            : '0 8px 30px rgba(0,0,0,0.04)',
        padding: '10px',
      }}
    >
      {/* ── Browser Chrome Bar ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: isDark ? 'rgba(15,12,32,0.85)' : 'rgba(248,246,255,0.9)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,190,240,0.25)',
          borderRadius: '1.25rem 1.25rem 0 0',
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff5f57', opacity: 0.8 }} />
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            height: '18px',
            borderRadius: '4px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '8px',
            overflow: 'hidden',
          }}
        >
          <span style={{
            fontSize: '9px',
            color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {domain || tool.url}
          </span>
        </div>

        {/* Action buttons — top right, on hover */}
        <div style={{
          display: 'flex',
          gap: '4px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0.85)',
          transition: 'all 0.2s ease',
        }}>
          {/* Share */}
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,190,240,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <ShareButton url={tool.url} name={tool.name} />
          </div>

          {/* Save / Heart */}
          <button
            data-save-btn
            onClick={e => {
              e.stopPropagation();
              if (user) { const rect = e.currentTarget.getBoundingClientRect(); onSaveRequest({ tool, rect }); }
              else onRequireAuth();
            }}
            style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: isSavedAnywhere
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
              border: isSavedAnywhere
                ? '1px solid rgba(124,58,237,0.5)'
                : isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,190,240,0.5)',
              color: isSavedAnywhere ? 'white' : isDark ? 'rgba(200,180,255,0.7)' : 'rgba(100,80,180,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
          >
            <HeartIcon isSaved={isSavedAnywhere} size={10} />
          </button>
        </div>
      </div>

      {/* ── Screenshot Preview ──────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', overflow: 'hidden', borderRadius: '0 0 1.25rem 1.25rem' }}>
        {/* Image */}
        {!imageError && (
          <>
            <img
              src={tool.imageUrl}
              alt={`Screenshot of ${tool.name}`}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div
                className="skeleton-pulse"
                style={{ position: 'absolute', inset: 0 }}
              />
            )}
          </>
        )}

        {/* Fallback */}
        {imageError && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}88 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
              alt=""
              style={{ width: '40px', height: '40px', objectFit: 'contain', opacity: 0.35 }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Bottom fade */}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '40px',
            background: isDark
              ? 'linear-gradient(to bottom, transparent, rgba(15,12,32,0.6))'
              : 'linear-gradient(to bottom, transparent, rgba(248,246,255,0.5))',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Card Info ───────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 14px' }}>
        {/* Row 1: favicon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px', overflow: 'hidden',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <img
              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
              alt=""
              loading="lazy"
              style={{ width: '14px', height: '14px', objectFit: 'contain' }}
              aria-hidden="true"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h3
            style={{
              flex: 1,
              fontSize: '13.5px',
              fontWeight: 700,
              color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              letterSpacing: '-0.01em',
            }}
          >
            {tool.name}
          </h3>
        </div>

        {/* Row 2: category badge + arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '100px',
              fontSize: '10.5px',
              fontWeight: 500,
              background: isDark ? colors.bg : 'rgba(255,255,255,0.55)',
              color: isDark ? colors.text : 'rgba(80,70,120,0.8)',
              border: isDark ? `1px solid ${colors.border}` : '1px solid rgba(255,255,255,0.55)',
              boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
              letterSpacing: '0.01em',
              flexShrink: 0,
            }}
          >
            {tool.category}
          </span>

          {/* Views / arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Eye icon + fake view count */}
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span style={{
              fontSize: '10.5px', fontWeight: 500,
              color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)',
            }}>
              {((numericToolId % 500) + 1).toFixed(1)}k
            </span>
            <span style={{
              color: isHovered
                ? isDark ? '#c084fc' : '#7c3aed'
                : isDark ? 'rgba(180,160,255,0.3)' : 'rgba(100,80,180,0.35)',
              transition: 'all 0.25s ease',
              transform: isHovered ? 'translate(1px,-1px)' : 'none',
              display: 'inline-flex',
            }}>
              <ArrowUpRight size={11} />
            </span>
          </div>
        </div>
      </div>

      {/* Focus ring */}
      {isFocused && (
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '2rem',
            boxShadow: 'inset 0 0 0 2px rgba(124,58,237,0.5)',
            pointerEvents: 'none',
            zIndex: 30,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
export default BentoCard;
