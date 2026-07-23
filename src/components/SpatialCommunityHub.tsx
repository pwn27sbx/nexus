import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import type { SpatialCommunityHubProps, User } from '../types';

import { MOCK_CONTRIBUTORS } from '../utils/mockData';
import CreateDiscussionModal from './CreateDiscussionModal';
import CollectionModal from './CollectionModal';

// ── Avatar component ─────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: number;
  src?: string | null;
  badge?: string | null;
}
const Avatar: React.FC<AvatarProps> = ({ name, size = 40, src = null, badge = null }) => {
  const initials = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = [
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'linear-gradient(135deg,#f59e0b,#f97316)',
    'linear-gradient(135deg,#10b981,#14b8a6)',
  ];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: src ? 'transparent' : color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.4}px`,
          fontWeight: 700,
          color: 'white',
          border: '2.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 2px 8px rgba(80,60,160,0.15)',
          overflow: 'hidden',
        }}
      >
        {src ? (
          src.startsWith('data:image') || src.startsWith('http') ? (
            <img
              loading="lazy"
              decoding="async"
              src={src}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{src}</span>
          )
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {badge && (
        <span
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            fontSize: `${size * 0.35}px`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

// ── User Orb (floating bubble) ───────────────────────────────────────────────
interface UserOrbProps {
  contributor: any; // We could define a strict type, using any for brevity here as it comes from mock/API
  animClass: string;
  size?: number;
  isDark: boolean;
}
const UserOrb: React.FC<UserOrbProps> = ({ contributor, animClass, size = 160, isDark }) => {
  return (
    <div
      className={animClass}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: isDark ? 'rgba(25,22,52,0.72)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: isDark
          ? '1.5px solid rgba(255,255,255,0.12)'
          : '1.5px solid rgba(255,255,255,0.92)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 8px 32px rgba(80,60,160,0.15), inset 0 1px 0 rgba(255,255,255,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <Avatar
        name={contributor.name}
        size={contributor.isTop ? 52 : 42}
        src={contributor.avatarUrl}
        badge={contributor.isTop ? '🏆' : null}
      />
      <div>
        <div
          style={{
            fontSize: contributor.isTop ? '14px' : '12px',
            fontWeight: 700,
            color: isDark ? 'rgba(235,230,255,0.92)' : 'rgba(15,10,40,0.85)',
            lineHeight: 1.2,
          }}
        >
          {contributor.name}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: isDark ? 'rgba(180,165,240,0.6)' : 'rgba(100,80,160,0.6)',
            marginTop: '2px',
            fontWeight: 500,
          }}
        >
          Contribution of
          <br />
          {contributor.contribution} avatars
        </div>
      </div>
    </div>
  );
};

// ── Discussion Card ──────────────────────────────────────────────────────────
const DiscussionCard: React.FC<{ discussion: any; isDark: boolean }> = ({ discussion, isDark }) => (
  <a
    href={`/community/discussion/${discussion.id}`}
    style={{
      display: 'block',
      textDecoration: 'none',
      background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
      borderRadius: '16px',
      padding: '16px 18px',
      boxShadow: isDark
        ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5)'
        : 'inset 0 1px 1px rgba(255,255,255,0.7), 0 8px 32px rgba(0,0,0,0.12)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
    }}
  >
    <p
      style={{
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: isDark ? 'rgba(180,160,240,0.5)' : 'rgba(120,90,200,0.5)',
        marginBottom: '4px',
      }}
    >
      {discussion.category}
    </p>
    <h4
      style={{
        fontSize: '13.5px',
        fontWeight: 700,
        color: isDark ? 'rgba(235,230,255,0.92)' : 'rgba(15,10,40,0.88)',
        marginBottom: '6px',
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
      }}
    >
      {discussion.title}
    </h4>
    <p
      style={{
        fontSize: '12px',
        color: isDark ? 'rgba(180,165,235,0.55)' : 'rgba(100,80,160,0.55)',
        lineHeight: 1.5,
        marginBottom: '10px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {discussion.summary}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Avatar
          name={discussion.author?.nickname || 'User'}
          size={20}
          src={discussion.author?.avatar}
        />
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: isDark ? 'rgba(200,190,255,0.65)' : 'rgba(80,60,140,0.65)',
          }}
        >
          {discussion.author?.nickname || 'User'}
        </span>
      </div>
      <span
        style={{
          fontSize: '11px',
          color: isDark ? 'rgba(160,145,220,0.4)' : 'rgba(120,90,180,0.45)',
        }}
      >
        {new Date(discussion.createdAt || Date.now()).toLocaleDateString()}
      </span>
    </div>
  </a>
);

// ── Collection Card ──────────────────────────────────────────────────────────
const CollectionCard: React.FC<{ collection: any; isDark: boolean; onClick: () => void }> = ({
  collection,
  isDark,
  onClick,
}) => (
  <div
    onClick={onClick}
    style={{
      background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
      borderRadius: '16px',
      padding: '14px',
      boxShadow: isDark
        ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5)'
        : 'inset 0 1px 1px rgba(255,255,255,0.7), 0 8px 32px rgba(0,0,0,0.12)',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
    }}
  >
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <Avatar
        name={collection.author?.nickname || 'User'}
        size={24}
        src={collection.author?.avatar}
      />
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: isDark ? 'rgba(225,220,255,0.88)' : 'rgba(20,15,50,0.82)',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {collection.title}
      </span>
    </div>

    {/* Image grid */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {collection.tools?.slice(0, 3).map((tool: any, i: number) => (
        <div
          key={i}
          style={{
            paddingBottom: '75%',
            position: 'relative',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {tool.image ? (
            <img
              src={typeof tool.image === 'string' ? tool.image : tool.image.url}
              alt={tool.name}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '10px', opacity: 0.5 }}>{tool.name?.substring(0, 3)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ── Main Community Component ─────────────────────────────────────────────────
const SpatialCommunityHub: React.FC<SpatialCommunityHubProps> = ({
  isDark,

  setIsCommandPaletteOpen,
}) => {
  const { user } = useAuth();
  const setIsAuthModalOpen = isAuthModalOpen.set;
  const onRequireAuth = () => setIsAuthModalOpen(true);

  const [leaders, setLeaders] = useState<User[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateDiscussionOpen, setIsCreateDiscussionOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users?sort=-reputationScore,-approvedCount&limit=3`
        );
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.docs || []);
        }
      } catch (err) {
        console.error('SpatialCommunityHub: Network error fetching leaders:', err);
      }
    };
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/discussions?sort=-createdAt&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data.docs || []);
        }
      } catch (err) {
        console.error('Error fetching discussions:', err);
      }
    };
    const fetchCollections = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/community-collections?sort=-createdAt&limit=4`
        );
        if (res.ok) {
          const data = await res.json();
          setCollections(data.docs || []);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
      }
    };

    Promise.all([fetchLeaders(), fetchDiscussions(), fetchCollections()]).then(() => {
      setIsLoading(false);
    });
  }, []);

  // Map API leaders to display format, fall back to mock
  const displayContributors =
    leaders.length >= 3
      ? [
          {
            id: leaders[0].id,
            name: leaders[0].nickname || leaders[0].email?.split('@')[0] || 'Top Contributor',
            contribution: `${leaders[0].approvedCount || 23}k`,
            avatarUrl: leaders[0].avatar || null,
            isTop: true,
          },
          {
            id: leaders[1].id,
            name: leaders[1].nickname || leaders[1].email?.split('@')[0] || 'Maria Caroan',
            contribution: `${leaders[1].approvedCount || 10}k`,
            avatarUrl: leaders[1].avatar || null,
            isTop: false,
          },
          {
            id: leaders[2].id,
            name: leaders[2].nickname || leaders[2].email?.split('@')[0] || 'Marty Kenton',
            contribution: `${leaders[2].approvedCount || 142}k`,
            avatarUrl: leaders[2].avatar || null,
            isTop: false,
          },
        ]
      : MOCK_CONTRIBUTORS;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '40px',
      }}
    >
      {/* ── Header ── */}
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
          Spatial Community Hub
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
          Community and user interaction section for an immersive web directory.
        </p>

        {/* Search */}
        <div
          className="animate-fade-up"
          style={{ maxWidth: '540px', margin: '0 auto', animationDelay: '100ms' }}
        >
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
              border: isDark
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(80,60,160,0.1)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? 'rgba(180,160,255,0.45)' : 'rgba(100,80,180,0.45)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span
              style={{
                fontSize: '14px',
                color: isDark ? 'rgba(180,165,255,0.45)' : 'rgba(100,80,160,0.5)',
                fontWeight: 500,
              }}
            >
              Search for spatial experiences, tools, and resources...
            </span>
          </button>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.4fr)',
          gap: '28px',
          alignItems: 'start',
        }}
        className="community-grid"
      >
        {/* ── Wall of Fame ── */}
        <section>
          <h2
            className="font-display"
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(10,8,30,0.85)',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            Wall of Fame
          </h2>

          {/* Organic orb layout */}
          <div style={{ position: 'relative', height: '320px' }}>
            {/* Orb 1 — Top Contributor (largest, center-left) */}
            <div className="animate-orbit" style={{ position: 'absolute', left: '0', top: '60px' }}>
              <UserOrb
                contributor={displayContributors[0]}
                animClass=""
                size={160}
                isDark={isDark}
              />
            </div>
            {/* Orb 2 — Maria (top right) */}
            <div className="animate-orbit-2" style={{ position: 'absolute', right: '0', top: '0' }}>
              <UserOrb
                contributor={displayContributors[1]}
                animClass=""
                size={130}
                isDark={isDark}
              />
            </div>
            {/* Orb 3 — Marty (bottom right) */}
            <div
              className="animate-orbit-3"
              style={{ position: 'absolute', right: '10px', bottom: '0' }}
            >
              <UserOrb
                contributor={displayContributors[2]}
                animClass=""
                size={140}
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        {/* ── Latest Discussions ── */}
        <section>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(15,10,40,0.85)',
              marginBottom: '16px',
              letterSpacing: '-0.01em',
            }}
          >
            Latest Discussions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoading ? (
              <div style={{ opacity: 0.5, textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : discussions.length > 0 ? (
              discussions.map((d) => <DiscussionCard key={d.id} discussion={d} isDark={isDark} />)
            ) : (
              <div style={{ opacity: 0.5, textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                No discussions yet. Be the first to start one!
              </div>
            )}
          </div>
        </section>

        {/* ── User Collections ── */}
        <section>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(15,10,40,0.85)',
              marginBottom: '16px',
              letterSpacing: '-0.015em',
            }}
          >
            User Collections
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {isLoading ? (
              <div style={{ opacity: 0.5, padding: '20px' }}>Loading...</div>
            ) : collections.length > 0 ? (
              collections.map((c) => (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  isDark={isDark}
                  onClick={() => setSelectedCollection(c)}
                />
              ))
            ) : (
              <div style={{ opacity: 0.5, padding: '20px', fontSize: '13px' }}>
                No collections available.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Join CTA (bottom right floating) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '28px',
          zIndex: 100,
        }}
      >
        <div
          className="animate-pulse-glow"
          style={{
            position: 'absolute',
            inset: '-20px',
            background:
              'radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(236,72,153,0.3) 40%, rgba(168,85,247,0) 70%)',
            filter: 'blur(20px)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
        <button
          onClick={() => (user ? setIsCreateDiscussionOpen(true) : onRequireAuth())}
          style={{
            padding: '14px 22px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #f4a27e, #f08c7b)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(240,140,123,0.45)',
            transition: 'all 0.25s ease',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
        >
          Join the Conversation
        </button>
      </div>

      {isCreateDiscussionOpen && (
        <CreateDiscussionModal
          isOpen={isCreateDiscussionOpen}
          onClose={() => setIsCreateDiscussionOpen(false)}
          isDark={isDark}
          user={user!}
        />
      )}

      {selectedCollection && (
        <CollectionModal
          isOpen={true}
          onClose={() => setSelectedCollection(null)}
          collection={selectedCollection}
          isDark={isDark}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .community-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SpatialCommunityHub;
