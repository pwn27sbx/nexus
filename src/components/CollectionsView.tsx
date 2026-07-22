
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';
import { playSound } from '../utils/sounds';

// ── Mock featured collections ────────────────────────────────────────────────
const FEATURED_COLLECTIONS = [
  {
    id: '1',
    name: '3D Design Essentials',
    author: 'stitchuser',
    toolCount: 12,
    coverImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&q=80',
      'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=300&q=80',
    ],
    tags: ['Design', 'AI Tools'],
    views: 13700,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Mobile & Web Design Patterns',
    author: 'mobbin',
    toolCount: 8,
    coverImages: [
      'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&q=80',
      'https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=300&q=80',
    ],
    tags: ['Design Tools'],
    views: 508000,
    isFeatured: false,
  },
  {
    id: '3',
    name: 'Behance 3D Inspiration',
    author: 'behance',
    toolCount: 5,
    coverImages: [
      'https://images.unsplash.com/photo-1580894908361-967195033215?w=600&q=80',
    ],
    tags: ['Inspiration'],
    views: 12700,
    isFeatured: false,
  },
  {
    id: '4',
    name: 'Spline 3D Tools',
    author: 'spline_team',
    toolCount: 7,
    coverImages: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
    ],
    tags: ['Development'],
    views: 17300,
    isFeatured: false,
  },
  {
    id: '5',
    name: 'Interactive Prototyping',
    author: 'framer',
    toolCount: 9,
    coverImages: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    ],
    tags: ['Development'],
    views: 57000,
    isFeatured: false,
  },
  {
    id: '6',
    name: 'Award-winning Immersive Sites',
    author: 'awwwards',
    toolCount: 15,
    coverImages: [
      'https://images.unsplash.com/photo-1617042375876-a13e36732a04?w=600&q=80',
    ],
    tags: ['Development'],
    views: 153000,
    isFeatured: false,
  },
];

const formatViews = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

// ── Large Hero Collection Card ────────────────────────────────────────────────
const HeroCollectionCard = ({ collection, isDark }: { collection: any; isDark: boolean }) => {
  const { user } = useAuth();
  const { setIsAuthModalOpen } = useModals();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        gridRow: '1 / 3',
        background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '2rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: isHovered
          ? isDark
            ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.15)'
            : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)'
          : isDark
          ? '0 4px 20px rgba(0,0,0,0.35)'
          : '0 8px 30px rgba(0,0,0,0.04)',
        padding: '12px',
      }}
    >
      {/* Browser chrome */}
      <div
        className="browser-chrome"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff5f57', opacity: 0.8 }} />
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#febc2e', opacity: 0.8 }} />
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#28c840', opacity: 0.8 }} />
        </div>
        <div style={{
          flex: 1, height: '18px', borderRadius: '4px',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', paddingLeft: '8px',
        }}>
          <span style={{ fontSize: '9px', color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)', fontFamily: 'monospace' }}>
            {collection.author}
          </span>
        </div>

        {/* Action buttons on hover */}
        <div style={{ display: 'flex', gap: '6px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
          <button
            onClick={e => { e.stopPropagation(); if (user) {} else setIsAuthModalOpen(true); }}
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#f43f5e,#ec4899)',
              border: 'none', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '12px',
            }}
          >
            ♥
          </button>
          <button
            onClick={e => { e.stopPropagation(); window.open(`#collection-${collection.id}`, '_blank'); }}
            style={{
              padding: '4px 10px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(200,190,240,0.5)',
              color: 'rgba(40,30,70,0.85)',
              fontSize: '11px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Visit
          </button>
        </div>
      </div>

      {/* Main image */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '65%', overflow: 'hidden', borderRadius: '1.25rem' }}>
        <img
          src={collection.coverImages[0]}
          alt={collection.name}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Bottom overlay */}
        <div className="hero-card-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
            marginBottom: '6px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}
        >
          {collection.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '100px',
              fontSize: '10.5px',
              fontWeight: 700,
              background: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)',
              color: isDark ? '#c084fc' : '#7c3aed',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            {collection.tags[0]}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)' }}>
              {formatViews(collection.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Small Collection Card ─────────────────────────────────────────────────────
const SmallCollectionCard = ({ collection, isDark }: { collection: any; isDark: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => playSound('pop')}
      style={{
        background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '2rem',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: isHovered ? 'translateY(-3px) scale(1.008)' : 'none',
        boxShadow: isHovered
          ? isDark
            ? '0 12px 32px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(80,60,180,0.12)'
          : isDark
          ? '0 4px 16px rgba(0,0,0,0.3)'
          : '0 8px 24px rgba(0,0,0,0.04)',
        padding: '10px',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '58%', overflow: 'hidden', borderRadius: '1.25rem' }}>
        <img
          src={collection.coverImages[0]}
          alt={collection.name}
          loading="lazy"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.12) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(15,10,40,0.86)',
            lineHeight: 1.35,
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            letterSpacing: '-0.01em',
          }}
        >
          {collection.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isDark ? 'rgba(180,160,255,0.55)' : 'rgba(120,90,200,0.55)',
            }}
          >
            {collection.tags[0]}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 600, color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.4)' }}>
              {formatViews(collection.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main CollectionsView ──────────────────────────────────────────────────────
export default function CollectionsView({ isDark, setIsCommandPaletteOpen }: any) {
  const [heroCollection] = useState(FEATURED_COLLECTIONS[0]);
  const rest = FEATURED_COLLECTIONS.slice(1);

  return (
    <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Header */}
      <section style={{ textAlign: 'center', width: '100%', padding: '40px 24px 28px' }}>
        <h1
          className="font-display animate-fade-up"
          style={{
            fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 800,
            color: isDark ? 'rgba(240,235,255,0.97)' : 'rgba(10,8,30,0.88)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          Ultimate Spatial Gallery Directory
        </h1>
        <p
          className="animate-fade-up"
          style={{
            fontSize: '15px',
            color: isDark ? 'rgba(180,165,235,0.65)' : 'rgba(80,60,140,0.6)',
            marginBottom: '24px',
            animationDelay: '60ms',
          }}
        >
          Next-generation immersive web directory &amp; resource library.
        </p>

        {/* Search */}
        <div className="animate-fade-up" style={{ maxWidth: '540px', margin: '0 auto', animationDelay: '100ms' }}>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '13px 18px',
              borderRadius: '16px',
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(80,60,160,0.1)',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(180,160,255,0.45)' : 'rgba(100,80,180,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: '14px', color: isDark ? 'rgba(180,165,255,0.45)' : 'rgba(100,80,160,0.5)', fontWeight: 500 }}>
              Search for spatial experiences, tools, and resources...
            </span>
          </button>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '0 24px 40px',
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '16px',
        }}
        className="collections-grid"
      >
        {/* Hero card */}
        <HeroCollectionCard
          collection={heroCollection}
          isDark={isDark}
        />
        {/* Small cards */}
        {rest.map((c, i) => (
          <div
            key={c.id}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <SmallCollectionCard collection={c} isDark={isDark} />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .collections-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .collections-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
