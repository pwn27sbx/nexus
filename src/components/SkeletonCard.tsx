// @ts-nocheck
import React from 'react';

interface SkeletonCardProps {
  spanClass?: string;
  isDark?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ isDark }) => (
  <div
    style={{
      borderRadius: '16px',
      overflow: 'hidden',
      background: isDark ? 'rgba(18,16,40,0.65)' : 'rgba(255,255,255,0.65)',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
    }}
  >
    {/* Browser chrome skeleton */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 12px',
      background: isDark ? 'rgba(12,10,28,0.8)' : 'rgba(248,246,255,0.85)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(200,190,240,0.3)',
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {['#ff5f5766', '#febc2e66', '#28c84066'].map(c => (
          <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c }} />
        ))}
      </div>
      <div className="skeleton-pulse" style={{
        flex: 1, height: '14px', borderRadius: '4px',
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      }} />
    </div>

    {/* Image skeleton */}
    <div className="skeleton-pulse" style={{ width: '100%', paddingBottom: '60%', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }} />
    </div>

    {/* Info skeleton */}
    <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="skeleton-pulse" style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0 }} />
        <div className="skeleton-pulse" style={{ flex: 1, height: '13px', borderRadius: '6px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div className="skeleton-pulse" style={{ width: '64px', height: '18px', borderRadius: '100px' }} />
        <div className="skeleton-pulse" style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
