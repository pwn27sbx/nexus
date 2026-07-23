import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import type { SpatialCommunityHubProps, User } from '../types';

import { MOCK_CONTRIBUTORS } from '../utils/mockData';
// Modals
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
          typeof src === 'string' && (src.startsWith('data:image') || src.startsWith('http')) ? (
            <img
              loading="lazy"
              decoding="async"
              src={src}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{typeof src === 'string' ? src : 'U'}</span>
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

// ── Contributor Pill (Wall of Fame) ───────────────────────────────────────────
interface ContributorPillProps {
  contributor: any;
  isDark: boolean;
  delay?: number;
}
const ContributorPill: React.FC<ContributorPillProps> = ({ contributor, isDark, delay = 0 }) => {
  return (
    <div
      className="animate-fade-up relative flex items-center p-2 pr-6 rounded-[50px] mb-6"
      style={{
        animationDelay: `${delay}ms`,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(168,85,247,0.2)'
          : '0 8px 32px rgba(168,85,247,0.15), 0 0 20px rgba(255,255,255,0.6)',
        maxWidth: '320px',
      }}
    >
      {/* Outer Glow Ring for Avatar */}
      <div
        className="relative flex-shrink-0 rounded-full p-[3px]"
        style={{
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          boxShadow: '0 0 15px rgba(79,172,254,0.6)',
        }}
      >
        <Avatar name={contributor.name} size={70} src={contributor.avatarUrl} />
      </div>

      <div className="ml-4 flex-1">
        {contributor.isTop && (
          <div
            className="font-bold text-[13px] mb-0.5"
            style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
          >
            Top Contributor
          </div>
        )}
        <div
          className="font-bold font-display"
          style={{
            fontSize: '18px',
            color: isDark ? 'white' : 'black',
            lineHeight: 1.1,
          }}
        >
          {contributor.name}
        </div>
        <div
          className="text-[12px] mt-1"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
        >
          Contribution: {contributor.contribution}
        </div>
      </div>

      {/* Ribbon Badge */}
      <div
        className="absolute -right-4 -bottom-3 w-12 h-12 flex items-center justify-center rounded-full"
        style={{
          background: contributor.isTop
            ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
            : 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '2px solid white',
          zIndex: 10,
        }}
      >
        <span className="text-xl">🌟</span>
      </div>
    </div>
  );
};

// ── Discussion Card ──────────────────────────────────────────────────────────
const DiscussionCard: React.FC<{ discussion: any; isDark: boolean }> = ({ discussion, isDark }) => (
  <a
    href={`/community/discussion/${discussion.id}`}
    className="group"
    style={{
      display: 'block',
      textDecoration: 'none',
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
    }}
  >
    <h4
      style={{
        fontSize: '18px',
        fontWeight: 800,
        fontFamily: 'Instrument Serif, serif',
        color: isDark ? 'white' : 'black',
        marginBottom: '10px',
        lineHeight: 1.2,
      }}
    >
      {discussion.title}
    </h4>
    <p
      style={{
        fontSize: '13px',
        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
        lineHeight: 1.5,
        marginBottom: '20px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {discussion.summary}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Avatar
          name={discussion.author?.nickname || 'User'}
          size={24}
          src={discussion.author?.avatar}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          }}
        >
          {discussion.author?.nickname || 'User'}
          <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '4px' }}>
            · {new Date(discussion.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </span>
      </div>
      <div
        className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ color: isDark ? 'white' : 'black', fontSize: '13px', fontWeight: 600 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Reply
      </div>
    </div>
  </a>
);

// ── Collection Stack (Deck design) ─────────────────────────────────────────
const CollectionCard: React.FC<{ collection: any; isDark: boolean; onClick: () => void }> = ({
  collection,
  isDark,
  onClick,
}) => (
  <div onClick={onClick} className="group relative cursor-pointer" style={{ height: '240px' }}>
    {/* Background stacked cards */}
    <div
      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[85%] h-full rounded-[24px] transition-transform duration-300 group-hover:-translate-y-4"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 1,
      }}
    />
    <div
      className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[92%] h-full rounded-[24px] transition-transform duration-300 group-hover:-translate-y-2"
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(15px)',
        zIndex: 2,
      }}
    />

    {/* Main front card */}
    <div
      className="absolute top-4 left-0 w-full h-full rounded-[24px] p-4 flex flex-col transition-transform duration-300"
      style={{
        background: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        zIndex: 3,
      }}
    >
      {/* Image grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '12px',
          flex: 1,
        }}
      >
        {collection.tools?.slice(0, 3).map((tool: any, i: number) => (
          <div
            key={i}
            className={`${i === 0 ? 'col-span-3 row-span-2' : 'col-span-1'} relative rounded-xl overflow-hidden`}
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {tool.image && (
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
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col">
        <h4
          className="font-bold text-[15px] mb-2 font-display"
          style={{ color: isDark ? 'white' : 'black' }}
        >
          User Collections
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              name={collection.author?.nickname || 'User'}
              size={20}
              src={collection.author?.avatar}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
              }}
            >
              {collection.author?.nickname || 'User'}
            </span>
          </div>
          <div
            className="flex items-center gap-1"
            style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'white' : 'black' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Save
          </div>
        </div>
      </div>
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
            contribution: (leaders[0].reputationScore || 0) + (leaders[0].approvedCount || 0),
            avatarUrl: leaders[0].avatar || null,
            isTop: true,
          },
          {
            id: leaders[1].id,
            name: leaders[1].nickname || leaders[1].email?.split('@')[0] || 'Maria Caroan',
            contribution: (leaders[1].reputationScore || 0) + (leaders[1].approvedCount || 0),
            avatarUrl: leaders[1].avatar || null,
            isTop: false,
          },
          {
            id: leaders[2].id,
            name: leaders[2].nickname || leaders[2].email?.split('@')[0] || 'Marty Kenton',
            contribution: (leaders[2].reputationScore || 0) + (leaders[2].approvedCount || 0),
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
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)',
          gap: '40px',
          alignItems: 'start',
          marginTop: '20px',
        }}
        className="community-grid"
      >
        {/* ── Wall of Fame ── */}
        <section>
          <h2
            className="font-display"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: isDark ? 'white' : 'black',
              letterSpacing: '-0.02em',
            }}
          >
            Wall of Fame
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              marginBottom: '24px',
            }}
          >
            Glassmorphirtate achievement badges
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayContributors.map((contributor, idx) => (
              <ContributorPill
                key={contributor.id}
                contributor={contributor}
                isDark={isDark}
                delay={idx * 100}
              />
            ))}
          </div>
        </section>

        {/* ── Latest Discussions ── */}
        <section>
          <h2
            className="font-display"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: isDark ? 'white' : 'black',
              letterSpacing: '-0.02em',
            }}
          >
            Latest Discussions
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              marginBottom: '24px',
            }}
          >
            Latest rated communicatime cards
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        {/* ── Trending Collections ── */}
        <section>
          <h2
            className="font-display"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: isDark ? 'white' : 'black',
              letterSpacing: '-0.02em',
            }}
          >
            Trending Collections
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              marginBottom: '24px',
            }}
          >
            User-curated site bundles in decks
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
