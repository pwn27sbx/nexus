import React from 'react';
import { playSound } from '../../utils/sounds';
import { ACCENTS } from '../../utils/constants';
import type { User } from '../../types';

const availableFonts = [
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'system', name: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist Mono', value: "'Geist Mono', monospace" },
];

interface UserSettingsProps {
  user: User | null;
  nickname: string;
  setNickname: (name: string) => void;
  handleSaveNickname: () => void;
  isLoading: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  setShowLogoutConfirm: (show: boolean) => void;
  isDark: boolean;
}

const UserSettings: React.FC<UserSettingsProps> = ({
  user,
  nickname,
  setNickname,
  handleSaveNickname,
  isLoading,
  accentColor,
  setAccentColor,
  fontFamily,
  setFontFamily,
  setShowLogoutConfirm,
  isDark,
}) => {
  const glassCard = {
    background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: '2rem',
    boxShadow: isDark
      ? '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 8px 30px rgba(80,60,180,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
  };

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '18px' }}
      className="profile-row-1"
    >
      {/* IDENTITY */}
      <div style={{ ...glassCard, padding: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: `radial-gradient(circle, ${accentColor}22, transparent)`,
            borderBottomLeftRadius: '100%',
            pointerEvents: 'none',
          }}
        />

        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
            }}
          >
            <svg
              className="animate-spin"
              style={{ width: '28px', height: '28px', color: isDark ? '#c084fc' : '#7c3aed' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '20px',
                border: isDark
                  ? '3px solid rgba(255,255,255,0.15)'
                  : '3px solid rgba(255,255,255,0.95)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              }}
            >
              {(nickname || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onBlur={handleSaveNickname}
              placeholder="Set nickname..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
              }}
            />
            <p
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
                marginTop: '6px',
              }}
            >
              {user?.email}
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              background: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: isDark ? '#c084fc' : '#7c3aed',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {user?.level || 'Explorer'}
          </span>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* APPEARANCE */}
      <div style={{ ...glassCard, padding: '32px' }}>
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
            marginBottom: '20px',
          }}
        >
          Aesthetics
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '28px',
          }}
          className="font-grid"
        >
          {availableFonts.map((font) => {
            const isActive = fontFamily === font.value;
            return (
              <button
                key={font.id}
                onClick={() => {
                  setFontFamily(font.value);
                  playSound('snap');
                }}
                style={{
                  padding: '16px 12px',
                  borderRadius: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isActive
                    ? '1.5px solid rgba(124,58,237,0.5)'
                    : isDark
                      ? '1px solid rgba(255,255,255,0.07)'
                      : '1px solid rgba(255,255,255,0.7)',
                  background: isActive
                    ? isDark
                      ? 'rgba(124,58,237,0.2)'
                      : 'rgba(124,58,237,0.1)'
                    : isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.5)',
                  color: isActive
                    ? isDark
                      ? '#c084fc'
                      : '#7c3aed'
                    : isDark
                      ? 'rgba(240,235,255,0.85)'
                      : 'rgba(15,10,40,0.8)',
                  fontFamily: font.value,
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.02)' : 'none',
                  boxShadow: isActive ? '0 4px 16px rgba(124,58,237,0.2)' : 'none',
                }}
                aria-label={`Font: ${font.name}`}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {font.name}
                </span>
              </button>
            );
          })}
        </div>

        <h3
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
            marginBottom: '14px',
          }}
        >
          Accent Color
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {ACCENTS.map((color) => {
            const isActive = accentColor === color.hex || accentColor === color.darkHex;
            return (
              <button
                key={color.name}
                onClick={() => {
                  setAccentColor(isDark ? color.darkHex : color.hex);
                  playSound('pop');
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? color.darkHex : color.hex,
                  border: isActive
                    ? `3px solid ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)'}`
                    : color.hex === '#000000'
                      ? '1px solid #333'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.2)' : 'none',
                  boxShadow: isActive
                    ? `0 4px 16px ${isDark ? color.darkHex : color.hex}55`
                    : 'none',
                }}
                aria-label={`Accent: ${color.name}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
