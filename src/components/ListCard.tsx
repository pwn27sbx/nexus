// @ts-nocheck
import React, { memo, useState } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain } from '../utils/helpers';

const ListCard = memo(({ tool, user, onRequireAuth, isFocused, indexNumber, onSaveRequest, delay }) => {
  const numericToolId = Number(tool.id);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const isSavedAnywhere =
    user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) ||
    user?.collections?.some(c => c.tools?.some(t => (typeof t === 'object' ? t.id : t) === numericToolId));

  return (
    <div
      className="animate-fade-up"
      onClick={() => window.open(tool.url, '_blank')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${tool.name} - ${tool.category}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); window.open(tool.url, '_blank'); } }}
      style={{
        animationDelay: delay || '0ms',
        position: 'relative',
        zIndex: isHovered ? 50 : 1,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '16px',
        alignItems: 'center',
        padding: '14px 18px',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        background: isHovered || isFocused
          ? isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.07)'
          : isDark ? 'rgba(18,16,40,0.55)' : 'rgba(255,255,255,0.6)',
        border: isFocused
          ? '1px solid rgba(124,58,237,0.5)'
          : isHovered
          ? isDark ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(124,58,237,0.2)'
          : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isHovered
          ? isDark
            ? '0 6px 28px rgba(0,0,0,0.4), 0 0 0 0 rgba(124,58,237,0.1)'
            : '0 6px 28px rgba(80,60,180,0.12)'
          : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Index / Save button */}
      <div style={{ position: 'relative', width: '32px', height: '32px' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={e => {
            e.stopPropagation();
            if (user) { const rect = e.currentTarget.getBoundingClientRect(); onSaveRequest({ tool, rect }); }
            else onRequireAuth();
          }}
          style={{
            position: 'absolute', inset: 0,
            width: '32px', height: '32px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isSavedAnywhere
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : 'transparent',
            color: isSavedAnywhere
              ? 'white'
              : isDark ? 'rgba(180,160,255,0.45)' : 'rgba(100,80,180,0.45)',
            opacity: isSavedAnywhere ? 1 : isHovered ? 1 : 0,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: isSavedAnywhere ? 'none' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,180,255,0.3)',
          }}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={14} />
        </button>
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700,
          color: isDark ? 'rgba(180,160,255,0.3)' : 'rgba(100,80,180,0.35)',
          opacity: (isSavedAnywhere || isHovered) ? 0 : 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}>
          {(indexNumber + 1).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=32`}
            alt="" loading="lazy"
            style={{ width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0 }}
            aria-hidden="true"
          />
          <span style={{
            fontSize: '15px', fontWeight: 700, letterSpacing: '-0.015em',
            color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tool.name}
          </span>
          <span style={{
            flexShrink: 0,
            padding: '1.5px 7px',
            borderRadius: '100px',
            fontSize: '10px', fontWeight: 700,
            background: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)',
            color: isDark ? '#c084fc' : '#7c3aed',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
            {tool.category}
          </span>
        </div>
        {tool.description && (
          <span style={{
            fontSize: '12.5px',
            color: isDark ? 'rgba(180,160,255,0.45)' : 'rgba(100,80,180,0.5)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tool.description}
          </span>
        )}
      </div>

      {/* Right: domain + arrow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: isHovered
          ? isDark ? '#c084fc' : '#7c3aed'
          : isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)',
        transition: 'color 0.2s ease',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>
          {getDomain(tool.url)}
        </span>
        <span style={{ transform: isHovered ? 'translate(1px,-1px)' : 'none', transition: 'transform 0.2s ease' }}>
          <ArrowUpRight size={13} />
        </span>
      </div>

      {/* Hover preview */}
      <div style={{
        position: 'absolute', right: '80px', top: '50%',
        transform: isHovered ? 'translate(0,-50%) scale(1) rotate(0deg)' : 'translate(0,-50%) scale(0.85) rotate(2deg)',
        opacity: isHovered ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 100,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '300px', height: '190px',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.9)',
          boxShadow: isDark
            ? '0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)'
            : '0 20px 48px rgba(80,60,180,0.25)',
        }}>
          {/* Mac Browser Chrome */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: isDark ? 'rgba(15,12,32,0.95)' : 'rgba(248,246,255,0.95)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,190,240,0.25)',
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff5f57', opacity: 0.8 }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
            </div>
            {/* URL bar */}
            <div
              style={{
                flex: 1, height: '16px', borderRadius: '4px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', paddingLeft: '8px', overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: '8px', color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)',
                fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {getDomain(tool.url) || tool.url}
              </span>
            </div>
          </div>
          
          {/* Screenshot */}
          <div style={{ flex: 1, position: 'relative' }}>
            <img src={tool.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
});

ListCard.displayName = 'ListCard';
export default ListCard;
