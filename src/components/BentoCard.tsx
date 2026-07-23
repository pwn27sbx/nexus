import React, { useRef, useEffect, memo, useState } from 'react';
import { ArrowUpRight } from '../utils/icons';
import { getDomain } from '../utils/helpers';

import { useAuth } from '@/contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import { m } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { BentoCardProps } from '../types';

import { CATEGORY_COLORS, FALLBACK_COLORS } from '../data/categories';

// ─── BentoCard ───────────────────────────────────────────────────────────────
const BentoCard: React.FC<BentoCardProps> = memo(
  ({ tool, isFocused, index, onSaveRequest, isDark }) => {
    const { user } = useAuth();
    const setIsAuthModalOpen = isAuthModalOpen.set;
    const onRequireAuth = () => setIsAuthModalOpen(true);

    const cardRef = useRef<HTMLDivElement>(null);
    const numericToolId = Number(tool.id);
    const domain = getDomain(tool.url);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const colors = CATEGORY_COLORS[tool.category] || FALLBACK_COLORS;

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
      const handleKey = (e: KeyboardEvent) => {
        if (
          (e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA'
        )
          return;
        if (isFocused && (e.key === 'f' || e.key === 'F')) {
          e.preventDefault();
          if (user && cardRef.current) {
            const btn = cardRef.current.querySelector('[data-save-btn]');
            if (btn) {
              const rect = btn.getBoundingClientRect();
              if (onSaveRequest) {
                onSaveRequest({ tool, rect });
              }
            }
          } else onRequireAuth();
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }, [isFocused, user, tool, onSaveRequest, onRequireAuth]);

    return (
      <m.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={() => (window.location.href = `/tool/${tool.slug || tool.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`${tool.name} - ${tool.category}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            window.location.href = `/tool/${tool.slug || tool.id}`;
          }
        }}
        style={{
          background: isDark ? 'rgba(30,28,45,0.15)' : 'rgba(255,255,255,0.15)',
          border: isFocused
            ? '1px solid rgba(124,58,237,0.8)'
            : isDark
              ? '1px solid rgba(255,255,255,0.15)'
              : '1px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderRadius: '2rem',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered
            ? isDark
              ? 'inset 0 1px 1px rgba(255,255,255,0.15), 0 16px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.15)'
              : 'inset 0 1px 1px rgba(255,255,255,0.6), 0 16px 48px rgba(80,60,180,0.12), 0 0 0 1px rgba(255,255,255,0.3)'
            : isDark
              ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25)'
              : 'inset 0 1px 1px rgba(255,255,255,0.5), 0 8px 30px rgba(0,0,0,0.04)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(200,190,240,0.25)',
            borderRadius: '1.25rem 1.25rem 0 0',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ff5f57',
                opacity: 0.8,
              }}
            />
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#febc2e',
                opacity: 0.8,
              }}
            />
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#28c840',
                opacity: 0.8,
              }}
            />
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
            <span
              style={{
                fontSize: '9px',
                color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {domain || tool.url}
            </span>
          </div>

          {/* Action buttons removed from here */}
        </div>

        {/* ── Screenshot Preview ──────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            flex: 1,
            minHeight: '120px',
            overflow: 'hidden',
            borderRadius: '0 0 1.25rem 1.25rem',
          }}
        >
          {/* Image */}
          {!imageError && (
            <>
              <img
                src={tool.imageUrl}
                alt={`Screenshot of ${tool.name}`}
                loading="lazy"
                style={
                  {
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    opacity: imageLoaded ? 1 : 0,
                    viewTransitionName: `tool-image-${tool.id}`,
                  } as any
                }
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {!imageLoaded && (
                <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0 }} />
              )}
            </>
          )}

          {/* Fallback */}
          {imageError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}88 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                loading="lazy"
                decoding="async"
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
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '40px',
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
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                overflow: 'hidden',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                alt=""
                loading="lazy"
                style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
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
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)',
                }}
              >
                {(tool.clicks || 0) > 1000
                  ? ((tool.clicks || 0) / 1000).toFixed(1) + 'k'
                  : tool.clicks || 0}
              </span>
              <span
                style={{
                  color: isHovered
                    ? isDark
                      ? '#c084fc'
                      : '#7c3aed'
                    : isDark
                      ? 'rgba(180,160,255,0.3)'
                      : 'rgba(100,80,180,0.35)',
                  transition: 'all 0.25s ease',
                  transform: isHovered ? 'translate(1px,-1px)' : 'none',
                  display: 'inline-flex',
                }}
              >
                <ArrowUpRight size={11} />
              </span>
            </div>
          </div>
        </div>

        {/* Focus ring */}
        {isFocused && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '2rem',
              boxShadow: 'inset 0 0 0 2px rgba(124,58,237,0.5)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
            aria-hidden="true"
          />
        )}

        {/* Floating action menu — overlapping top right, on hover */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            zIndex: 100,
            display: 'flex',
            gap: '8px',
            padding: '6px',
            background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.09)'
              : '1px solid rgba(255,255,255,0.62)',
            boxShadow: isDark
              ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5)'
              : 'inset 0 1px 1px rgba(255,255,255,0.7), 0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: '24px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
        >
          <button
            data-save-btn
            onClick={(e) => {
              e.stopPropagation();
              if (user) {
                if (onSaveRequest) {
                  onSaveRequest({
                    tool,
                    rect: e.currentTarget.getBoundingClientRect(),
                  });
                }
              } else onRequireAuth();
            }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: isSavedAnywhere
                ? 'linear-gradient(135deg,#f43f5e,#ec4899)'
                : isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.5)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.05)'
                : '1px solid rgba(255,255,255,0.7)',
              color: isSavedAnywhere ? 'white' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.2)'
                : 'inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
            aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
          >
            <Heart
              size={18}
              fill={isSavedAnywhere ? 'currentColor' : 'none'}
              strokeWidth={isSavedAnywhere ? 0 : 2.5}
              stroke={isSavedAnywhere ? 'none' : 'currentColor'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.url, '_blank');
            }}
            style={{
              padding: '0 20px',
              height: '38px',
              borderRadius: '9999px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
              border: isDark
                ? '1px solid rgba(255,255,255,0.05)'
                : '1px solid rgba(255,255,255,0.7)',
              color: isDark ? 'rgba(240,240,255,0.95)' : '#1f2937',
              fontSize: '15px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark
                ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.2)'
                : 'inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
          >
            Visit
          </button>
        </div>
      </m.div>
    );
  }
);

BentoCard.displayName = 'BentoCard';
export default BentoCard;
