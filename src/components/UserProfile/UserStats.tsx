import React from 'react';

interface UserStatsProps {
  arsenalCount: number;
  collectionsCount: number;
  approvedCount: number;
  submittedCount: number;
  isDark: boolean;
}

const UserStats: React.FC<UserStatsProps> = ({
  arsenalCount,
  collectionsCount,
  approvedCount,
  submittedCount,
  isDark,
}) => {
  const statCard = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '22px',
    padding: '22px',
    transition: 'all 0.2s ease',
  };

  const stats = [
    { value: arsenalCount, label: 'Saved Tools', isAccent: false },
    { value: collectionsCount, label: 'Collections', isAccent: false },
    { value: approvedCount, label: 'Approved', isAccent: true },
    { value: submittedCount, label: 'Submitted', isAccent: false },
  ];

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}
      className="stats-grid"
    >
      {stats.map((stat, i) => (
        <div key={i} style={statCard}>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: stat.isAccent
                ? isDark
                  ? '#c084fc'
                  : '#7c3aed'
                : isDark
                  ? 'rgba(240,235,255,0.95)'
                  : 'rgba(10,8,30,0.88)',
              letterSpacing: '-0.02em',
            }}
          >
            {stat.value}
          </p>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isDark ? 'rgba(180,165,235,0.55)' : 'rgba(80,60,140,0.5)',
              marginTop: '4px',
            }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UserStats;
