import React, { useRef, useState } from 'react';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { playSound } from '../../utils/sounds';
import { ACCENTS } from '../../utils/constants';
import type { User } from '../../types';

const AVATAR_ICONS = [
  '🧑‍🚀',
  '🦊',
  '🦄',
  '🐼',
  '🦸',
  '🧙',
  '🧛',
  '🧝',
  '🧟',
  '🧞',
  '🧜',
  '🧚',
  '👩‍🎤',
  '🧑‍🏫',
  '🧑‍🍳',
  '🧑‍🌾',
  '🧑‍🏭',
  '🧑‍💻',
  '🧑‍💼',
  '🧑‍🔬',
  '🧑‍🎨',
  '🧑‍🚒',
  '👮',
  '🕵️',
  '💂',
  '👷',
  '🤴',
  '👳',
  '👲',
  '👽',
];

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
  avatar: string;
  setAvatar: (avatar: string) => void;
  handleSaveProfile: (newAvatar?: string) => void;
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
  avatar,
  setAvatar,
  handleSaveProfile,
  isLoading,
  accentColor,
  setAccentColor,
  fontFamily,
  setFontFamily,
  setShowLogoutConfirm,
  isDark,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Cropper State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = (croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  };

  const handleCropConfirm = () => {
    if (!selectedImage || !croppedAreaPixels) return;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 128;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          size,
          size
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setAvatar(dataUrl);
        handleSaveProfile(dataUrl);
        playSound('success');
        setIsEditingAvatar(false);
        setSelectedImage(null);
      }
    };
  };
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
              style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}
            >
              <div
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background:
                    avatar && avatar.startsWith('data:image')
                      ? `url(${avatar}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'white',
                  border: isDark
                    ? '3px solid rgba(255,255,255,0.15)'
                    : '3px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: isEditingAvatar ? 'scale(1.05)' : 'scale(1)',
                }}
                title="Change Avatar"
              >
                {!avatar || avatar.startsWith('data:image')
                  ? !avatar
                    ? (nickname || user?.email || 'U').charAt(0).toUpperCase()
                    : null
                  : avatar}
              </div>

              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) =>
                    setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  onBlur={() => handleSaveProfile()}
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
            </div>

            {isEditingAvatar && (
              <div
                className="animate-fade-in"
                style={{
                  padding: '16px',
                  background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  marginTop: '16px',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(255,255,255,0.5)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    }}
                  >
                    Choose an Icon
                  </h4>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSelectedImage(event.target?.result as string);
                        setZoom(1);
                        setCrop({ x: 0, y: 0 });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = ''; // Reset input
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    paddingRight: '8px',
                  }}
                >
                  {AVATAR_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => {
                        setAvatar(icon);
                        handleSaveProfile(icon);
                        playSound('pop');
                        setIsEditingAvatar(false);
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          avatar === icon
                            ? isDark
                              ? 'rgba(124,58,237,0.3)'
                              : 'rgba(124,58,237,0.2)'
                            : 'transparent',
                        border: avatar === icon ? '1px solid #7c3aed' : '1px solid transparent',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:bg-white/10 dark:hover:bg-black/20"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

      {/* CROPPER MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="animate-scale-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              background: isDark ? 'rgba(20,18,42,0.95)' : 'white',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              borderRadius: '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark
                ? '0 20px 60px rgba(0,0,0,0.5)'
                : '0 20px 60px rgba(80,60,180,0.15)',
            }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: isDark ? 'white' : 'black',
                  margin: 0,
                }}
              >
                Adjust Photo
              </h3>
            </div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '320px',
                background: isDark ? '#111' : '#f5f5f5',
              }}
            >
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '18px' }}>🔍</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#7c3aed' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(0,0,0,0.15)',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: isDark ? 'white' : 'black',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  className="hover:bg-white/10 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  className="hover:scale-105"
                >
                  Save Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
