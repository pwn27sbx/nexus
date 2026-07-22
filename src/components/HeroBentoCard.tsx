import React, { useState } from 'react';
import type { HeroBentoCardProps } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import { Heart } from 'lucide-react';

const CATEGORY_COLORS_HERO: Record<string, { bg: string; text: string; border: string }> = {
  Design: {
    bg: 'rgba(124,58,237,0.12)',
    text: 'var(--color-primary)',
    border: 'rgba(124,58,237,0.2)',
  },
  Development: { bg: 'rgba(37,99,235,0.12)', text: '#3b82f6', border: 'rgba(37,99,235,0.2)' },
  'AI Tools': { bg: 'rgba(5,150,105,0.12)', text: '#10b981', border: 'rgba(5,150,105,0.2)' },
  Productivity: { bg: 'rgba(217,119,6,0.12)', text: '#f59e0b', border: 'rgba(217,119,6,0.2)' },
};

const HeroBentoCard: React.FC<HeroBentoCardProps> = ({
  tool,
  isFocused,
  onSaveRequest,
  isDark,
}) => {
  const { user } = useAuth();
  const setIsAuthModalOpen = isAuthModalOpen.set;
  const onRequireAuth = () => setIsAuthModalOpen(true);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const numericToolId = Number(tool.id);
  const colors = CATEGORY_COLORS_HERO[tool.category] || {
    bg: 'rgba(148,163,184,0.12)',
    text: '#94a3b8',
    border: 'rgba(148,163,184,0.2)',
  };
  const isSaved = user?.bookmarks?.some(
    (b) => (typeof b === 'object' ? b.id : b) === numericToolId
  );

  return (
    <div
      onClick={() => window.open(tool.url, '_blank')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      tabIndex={0}
      aria-label={`Visit ${tool.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.open(tool.url, '_blank');
        }
      }}
      style={{
        height: '100%',
        minHeight: '360px',
        background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
        border: isFocused
          ? '1px solid rgba(124,58,237,0.6)'
          : isDark
            ? '1px solid rgba(255,255,255,0.09)'
            : '1px solid rgba(255,255,255,0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '2rem',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
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
      {/* Screenshot */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
          minHeight: '200px',
          borderRadius: '1.25rem',
        }}
      >
        {/* Browser chrome overlay on image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            background: isDark ? 'rgba(15,12,32,0.75)' : 'rgba(245,244,252,0.85)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(200,192,240,0.25)',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff5f57',
                opacity: 0.85,
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#febc2e',
                opacity: 0.85,
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#28c840',
                opacity: 0.85,
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              height: '20px',
              borderRadius: '5px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.45)',
                fontFamily: 'monospace',
              }}
            >
              {tool.url?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
            </span>
          </div>
        </div>

        {/* Play button center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '52px',
            height: '52px',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            zIndex: 12,
            transition: 'all 0.2s ease',
            opacity: isHovered ? 1 : 0.85,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderLeft: '12px solid white',
              borderBottom: '7px solid transparent',
              marginLeft: '2px',
            }}
          />
        </div>

        {!imageError && (
          <>
            <img
              src={tool.imageUrl}
              alt={`Screenshot of ${tool.name}`}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0 }} />
            )}
          </>
        )}
        {imageError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}88)`,
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
              style={{ width: '56px', height: '56px', objectFit: 'contain', opacity: 0.3 }}
              aria-hidden="true"
            />
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div
          className="hero-card-overlay"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />
      </div>

      {/* Floating action menu */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          zIndex: 100,
          display: 'flex',
          gap: '8px',
          padding: '6px',
          background: isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,200,220,0.5)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: '24px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (user) {
              const rect = e.currentTarget.getBoundingClientRect();
              onSaveRequest({ tool, rect });
            } else onRequireAuth();
          }}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: isSaved
              ? 'linear-gradient(135deg,#f43f5e,#ec4899)'
              : isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.5)',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.7)',
            color: isSaved ? 'white' : '#f43f5e',
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
          aria-label={isSaved ? 'Remove from saved' : 'Save tool'}
        >
          <Heart
            size={18}
            fill={isSaved ? 'currentColor' : 'none'}
            strokeWidth={isSaved ? 0 : 2.5}
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
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.7)',
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
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 14px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 500,
              background: isDark ? colors.bg : 'rgba(255,255,255,0.55)',
              color: isDark ? colors.text : 'rgba(80,70,120,0.8)',
              border: isDark ? `1px solid ${colors.border}` : '1px solid rgba(255,255,255,0.55)',
              boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {tool.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,100,140,0.45)',
              }}
            >
              {((numericToolId % 500) + 1).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBentoCard;
