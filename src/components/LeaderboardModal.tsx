import React, { useState, useEffect } from 'react';
import { useModals } from '../contexts/ModalContext';
import { API_BASE_URL, SCORE_THRESHOLDS } from '../utils/constants';
import { SpinnerIcon } from '../utils/icons';
import type { User } from '../types';

const BADGES = [
  { name: 'Platinum', icon: '👑', minApproved: 30, color: 'text-slate-300 bg-slate-100 dark:bg-slate-800' },
  { name: 'Gold', icon: '🥇', minApproved: 15, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
  { name: 'Silver', icon: '🥈', minApproved: 5, color: 'text-gray-400 bg-gray-100 dark:bg-gray-800' },
  { name: 'Bronze', icon: '🥉', minApproved: 3, color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30' },
];

const getBadge = (approvedCount: number) => {
  for (const badge of BADGES) {
    if (approvedCount >= badge.minApproved) return badge;
  }
  return { name: 'Rising Star', icon: '⭐', color: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800' };
};

const LEVEL_COLORS: Record<string, string> = {
  Explorer: 'linear-gradient(135deg,#71717a,#52525b)',
  Contributor: 'linear-gradient(135deg,#3b82f6,#6366f1)',
  'Expert Curator': 'linear-gradient(135deg,#7c3aed,#a855f7)',
  'Master Curator': 'linear-gradient(135deg,#f59e0b,#f97316)',
};

const LeaderboardModal = () => {
  const { isLeaderboardOpen: isOpen, setIsLeaderboardOpen } = useModals();
  const onClose = () => setIsLeaderboardOpen(false);
  const [leaders, setLeaders] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeaders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/users?sort=-approvedCount&limit=20`);
        const data = await res.json();
        setLeaders(data.docs || []);
      } catch (error) {
        console.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaders();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-10"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      {/* Close pill */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
        style={{
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
          border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.95)',
          color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
          backdropFilter: 'blur(16px)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
          zIndex: 10,
        }}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Close
      </button>

      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '85vh',
          background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '2rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark
            ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)'
            : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '28px 32px 20px',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: isDark ? 'rgba(240,235,255,0.97)' : 'rgba(10,8,30,0.90)',
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            🏆 Hall of Fame
          </h2>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
              marginTop: '6px',
            }}
          >
            Top contributors shaping the directory.
          </p>
        </div>

        {/* Content */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <SpinnerIcon style={{ color: isDark ? '#c084fc' : '#7c3aed' }} size={36} />
            </div>
          ) : leaders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Podium for Top 3 */}
              {leaders.slice(0, 3).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                  {/* 2nd Place */}
                  {leaders[1] && (
                    <LeaderPodiumCard
                      leader={leaders[1]}
                      rank={2}
                      badge={getBadge(leaders[1].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[1].level || 'Explorer'] || LEVEL_COLORS.Explorer}
                      isDark={isDark}
                      isFirst={false}
                    />
                  )}
                  {/* 1st Place */}
                  {leaders[0] && (
                    <LeaderPodiumCard
                      leader={leaders[0]}
                      rank={1}
                      badge={getBadge(leaders[0].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[0].level || 'Explorer'] || LEVEL_COLORS.Explorer}
                      isDark={isDark}
                      isFirst
                    />
                  )}
                  {/* 3rd Place */}
                  {leaders[2] && (
                    <LeaderPodiumCard
                      leader={leaders[2]}
                      rank={3}
                      badge={getBadge(leaders[2].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[2].level || 'Explorer'] || LEVEL_COLORS.Explorer}
                      isDark={isDark}
                      isFirst={false}
                    />
                  )}
                </div>
              )}

              {/* Rest of leaderboard */}
              {leaders.slice(3).map((leader, index) => {
                const badge = getBadge(leader.approvedCount || 0);
                return (
                  <div
                    key={leader.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
                      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '28px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.4)',
                      }}
                    >
                      #{index + 4}
                    </span>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'white',
                        background: LEVEL_COLORS[leader.level || 'Explorer'] || LEVEL_COLORS.Explorer,
                        border: isDark ? '2px solid rgba(255,255,255,0.12)' : '2px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 2px 8px rgba(80,60,160,0.2)',
                        flexShrink: 0,
                      }}
                    >
                      {(leader.nickname || leader.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {leader.nickname ? `@${leader.nickname}` : leader.email.split('@')[0]}
                        </h3>
                        <span style={{ fontSize: '14px' }} role="img" aria-label={badge.name}>
                          {badge.icon}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
                          }}
                        >
                          {leader.level || 'Explorer'}
                        </span>
                        <span style={{ fontSize: '10px', color: isDark ? 'rgba(160,145,220,0.4)' : 'rgba(120,90,180,0.4)' }}>
                          {leader.approvedCount || 0} approved
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: 800,
                          color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                        }}
                      >
                        {leader.approvedCount || 0}
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.4)',
                        }}
                      >
                        Approved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  fontSize: '28px',
                }}
              >
                🏆
              </div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)', marginBottom: '6px' }}>
                No champions yet.
              </p>
              <p style={{ fontSize: '13px', color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)', maxWidth: '320px' }}>
                Submit tools, get them approved, and earn points to climb the ranks!
              </p>
            </div>
          )}
        </div>

        {/* Footer with badge legend */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            justifyContent: 'center',
          }}
        >
          {BADGES.map((badge) => (
            <div key={badge.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px' }}>{badge.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)' }}>
                {badge.name} ({badge.minApproved}+)
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '13px' }}>⭐</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)' }}>
              Rising Star
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LeaderRowProps {
  leader: User;
  rank: number;
  badge: { name: string; icon: string; color: string; minApproved?: number };
  levelColor: string;
  isFirst?: boolean;
  isDark: boolean;
}

const LeaderPodiumCard: React.FC<LeaderRowProps> = ({ leader, rank, badge, levelColor, isFirst, isDark }) => {
  const initials = (leader.nickname || leader.email || 'U').charAt(0).toUpperCase();
  const name = leader.nickname ? `@${leader.nickname}` : leader.email.split('@')[0];
  const crown = rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉';
  const size = isFirst ? 60 : 50;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 12px',
        borderRadius: '22px',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        marginTop: isFirst ? '0' : '20px',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{crown}</div>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.4}px`,
          fontWeight: 700,
          color: 'white',
          background: levelColor,
          border: isDark ? '2.5px solid rgba(255,255,255,0.15)' : '2.5px solid rgba(255,255,255,0.95)',
          boxShadow: '0 4px 16px rgba(80,60,160,0.25)',
          marginBottom: '8px',
        }}
      >
        {initials}
      </div>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: isDark ? 'rgba(180,165,235,0.55)' : 'rgba(80,60,140,0.55)',
          marginTop: '2px',
        }}
      >
        {leader.level || 'Explorer'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
          }}
        >
          {leader.approvedCount || 0}
        </span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.4)',
          }}
        >
          approved
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
        <span style={{ fontSize: '15px' }}>{badge.icon}</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.4)',
          }}
        >
          {badge.name}
        </span>
      </div>
    </div>
  );
};

export default LeaderboardModal;
