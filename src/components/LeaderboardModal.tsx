// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { API_BASE_URL, SCORE_THRESHOLDS } from '../utils/constants';
import { SpinnerIcon } from '../utils/icons';

const BADGES = [
  { name: 'Platinum', icon: '👑', minApproved: 30, color: 'text-slate-300 bg-slate-100 dark:bg-slate-800' },
  { name: 'Gold', icon: '🥇', minApproved: 15, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
  { name: 'Silver', icon: '🥈', minApproved: 5, color: 'text-gray-400 bg-gray-100 dark:bg-gray-800' },
  { name: 'Bronze', icon: '🥉', minApproved: 3, color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30' },
];

const getBadge = (approvedCount) => {
  for (const badge of BADGES) {
    if (approvedCount >= badge.minApproved) return badge;
  }
  return { name: 'Rising Star', icon: '⭐', color: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800' };
};

const LEVEL_COLORS = {
  Explorer: 'from-zinc-500 to-zinc-600',
  Contributor: 'from-blue-500 to-blue-600',
  'Expert Curator': 'from-purple-500 to-purple-600',
  'Master Curator': 'from-yellow-500 to-amber-600',
};

const LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('all');

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      <div
        className="w-full max-w-4xl h-full max-h-[850px] bg-[#f5f5f7] dark:bg-[#050505] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#111]">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter text-black dark:text-white flex items-center gap-3">
              🏆 Hall of Fame
            </h2>
            <p className="text-[15px] font-medium text-zinc-500 mt-2">
              Top contributors shaping the directory.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <SpinnerIcon className="text-black dark:text-white" size={40} />
            </div>
          ) : leaders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* Podium for Top 3 */}
              {leaders.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* 2nd Place */}
                  {leaders[1] && (
                    <LeaderPodiumCard
                      leader={leaders[1]}
                      rank={2}
                      badge={getBadge(leaders[1].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[1].level] || LEVEL_COLORS.Explorer}
                    />
                  )}
                  {/* 1st Place */}
                  {leaders[0] && (
                    <LeaderPodiumCard
                      leader={leaders[0]}
                      rank={1}
                      badge={getBadge(leaders[0].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[0].level] || LEVEL_COLORS.Explorer}
                      isFirst
                    />
                  )}
                  {/* 3rd Place */}
                  {leaders[2] && (
                    <LeaderPodiumCard
                      leader={leaders[2]}
                      rank={3}
                      badge={getBadge(leaders[2].approvedCount || 0)}
                      levelColor={LEVEL_COLORS[leaders[2].level] || LEVEL_COLORS.Explorer}
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
                    className="flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 hover:shadow-md transition-all"
                  >
                    <span className="w-8 text-center font-extrabold text-lg text-zinc-400">
                      #{index + 4}
                    </span>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner bg-black/5 dark:bg-white/10">
                      {(leader.nickname || leader.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-bold text-black dark:text-white truncate">
                          {leader.nickname ? `@${leader.nickname}` : leader.email.split('@')[0]}
                        </h3>
                        <span className="text-sm" role="img" aria-label={badge.name}>
                          {badge.icon}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                          {leader.level || 'Explorer'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {leader.approvedCount || 0} approved
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-black dark:text-white">
                        {leader.approvedCount || 0}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                        Approved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-4xl">
                {'🏆'}
              </div>
              <p className="text-zinc-500 font-bold text-[20px]">No champions yet.</p>
              <p className="text-zinc-400 text-[14px] mt-2 max-w-md">
                Submit tools, get them approved, and earn points to climb the ranks!
              </p>
            </div>
          )}
        </div>

        {/* Footer with badge legend */}
        <div className="px-10 py-4 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#111]/50 flex flex-wrap gap-4 justify-center">
          {BADGES.map((badge) => (
            <div key={badge.name} className="flex items-center gap-1.5">
              <span className="text-sm">{badge.icon}</span>
              <span className="text-[11px] font-bold text-zinc-500">{badge.name} ({badge.minApproved}+ approved)</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{'⭐'}</span>
            <span className="text-[11px] font-bold text-zinc-500">Rising Star</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Podium Card Component for Top 3
const LeaderPodiumCard = ({ leader, rank, badge, levelColor, isFirst }) => {
  const initials = (leader.nickname || leader.email || 'U').charAt(0).toUpperCase();
  const name = leader.nickname ? `@${leader.nickname}` : leader.email.split('@')[0];
  const height = rank === 1 ? 'h-full' : rank === 2 ? 'h-[80%]' : 'h-[60%]';
  const crown = rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉';

  return (
    <div className={`flex flex-col items-center ${isFirst ? 'md:-mt-8' : ''}`}>
      <div className="text-2xl mb-1">{crown}</div>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2 bg-gradient-to-br ${levelColor} text-white`}>
        {initials}
      </div>
      <span className="text-[14px] font-bold text-black dark:text-white text-center truncate max-w-full">
        {name}
      </span>
      <span className="text-[11px] text-zinc-500 font-medium truncate max-w-full">
        {leader.level || 'Explorer'}
      </span>
      <div className="flex items-center gap-1 mt-1">                      <span className="text-lg font-extrabold text-black dark:text-white">{leader.approvedCount || 0}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">approved</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-lg">{badge.icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{badge.name}</span>
      </div>
    </div>
  );
};

export default LeaderboardModal;
