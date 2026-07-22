import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';
import { API_BASE_URL, ACCENTS } from '../utils/constants';
import { playSound } from '../utils/sounds';
import type { Tool, UserCollection } from '../types';

const availableFonts = [
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'system', name: 'System', value: "system-ui, -apple-system, sans-serif" },
  { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist Mono', value: "'Geist Mono', monospace" },
];

const UserProfile = ({
  accentColor,
  setAccentColor,
  fontFamily,
  setFontFamily,
}: {
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
}) => {
  const { user, logout: onLogout, setUser } = useAuth();
  const { isProfileOpen: isOpen, setIsProfileOpen } = useModals();
  const onClose = () => setIsProfileOpen(false);
  const [arsenal, setArsenal] = useState<(Tool | number)[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [submissions, setSubmissions] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState<UserCollection | 'all' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (!isOpen || !user) return;
    setNickname(user.nickname || '');
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('payload-token');
      try {
        const [userRes, subRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${user.id}`, {
            headers: { Authorization: `JWT ${token}` },
          }),
          fetch(
            `${API_BASE_URL}/api/tools?where[submittedBy][equals]=${user.id}`,
            { headers: { Authorization: `JWT ${token}` } }
          ),
        ]);
        const userData = await userRes.json();
        setArsenal(userData.bookmarks || []);
        setCollections(userData.collections || []);
        const subData = await subRes.json();
        setSubmissions(subData.docs || []);
      } catch (error) {
        console.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [isOpen, user]);

  const handleSaveNickname = async () => {
    if (!user || nickname === user.nickname || nickname.length < 3) return;
    const token = localStorage.getItem('payload-token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });
      if (response.ok && user) user.nickname = nickname;
    } catch (error) {
      // Silently fail
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;
    const token = localStorage.getItem('payload-token');
    const updatedCollections = [
      ...collections,
      { name: newFolderName, tools: [] },
    ];
    setCollections(updatedCollections);
    setNewFolderName('');
    setIsCreatingFolder(false);
    playSound('pop');
    try {
      await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ collections: updatedCollections }),
      });
    } catch (error) {
      console.error('Failed to save folder');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter((t) => t.status === 'approved').length;

  // Glass card style helper
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

  const statCard = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '22px',
    padding: '22px',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      className="fixed inset-0 z-[300] overflow-y-auto pb-32"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0d0d1a 0%, #111128 50%, #16102e 100%)'
          : 'linear-gradient(135deg, #c7d7f5 0%, #d5c8f0 50%, #e8d5f5 100%)',
      }}
    >
      {/* Atmospheric orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div
          className="orb"
          style={{
            width: '500px', height: '500px',
            top: '-80px', left: '-80px',
            opacity: 0.5,
            background: isDark
              ? 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(99,102,241,0.1) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(199,215,245,0.85) 0%, rgba(213,200,240,0.5) 70%, transparent 100%)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <div
          className="orb"
          style={{
            width: '400px', height: '400px',
            bottom: '0', right: '-50px',
            opacity: 0.4,
            background: isDark
              ? 'radial-gradient(circle, rgba(147,51,234,0.25) 0%, rgba(124,58,237,0.06) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(232,213,245,0.9) 0%, rgba(213,200,240,0.4) 70%, transparent 100%)',
            animation: 'float2 16s ease-in-out infinite 2s',
          }}
        />
      </div>

      <div className="relative z-10" style={{ maxWidth: '1300px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              color: isDark ? 'rgba(240,235,255,0.97)' : 'rgba(10,8,30,0.90)',
              letterSpacing: '-0.025em',
            }}
          >
            Command Center
          </h1>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
              border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.95)',
              color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
              backdropFilter: 'blur(16px)',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
            }}
            aria-label="Close profile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }} className="profile-grid">
          {/* Row 1: Identity + Appearance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '18px' }} className="profile-row-1">
            {/* IDENTITY */}
            <div style={{ ...glassCard, padding: '32px', position: 'relative', overflow: 'hidden' }}>
              {/* Accent glow */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${accentColor}22, transparent)`, borderBottomLeftRadius: '100%', pointerEvents: 'none' }} />

              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                  <svg className="animate-spin" style={{ width: '28px', height: '28px', color: isDark ? '#c084fc' : '#7c3aed' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      border: isDark ? '3px solid rgba(255,255,255,0.15)' : '3px solid rgba(255,255,255,0.95)',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                    }}
                  >
                    {(nickname || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) =>
                      setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
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
                  <p style={{ fontSize: '13px', fontWeight: 500, color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)', marginTop: '6px' }}>
                    {user?.email}
                  </p>
                </div>
              )}

              <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }} className="font-grid">
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
                          : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.7)',
                        background: isActive
                          ? isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)'
                          : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                        color: isActive
                          ? isDark ? '#c084fc' : '#7c3aed'
                          : isDark ? 'rgba(240,235,255,0.85)' : 'rgba(15,10,40,0.8)',
                        fontFamily: font.value,
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'scale(1.02)' : 'none',
                        boxShadow: isActive ? '0 4px 16px rgba(124,58,237,0.2)' : 'none',
                      }}
                      aria-label={`Font: ${font.name}`}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>{font.name}</span>
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
                          : color.hex === '#000000' ? '1px solid #333' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'scale(1.2)' : 'none',
                        boxShadow: isActive ? `0 4px 16px ${isDark ? color.darkHex : color.hex}55` : 'none',
                      }}
                      aria-label={`Accent: ${color.name}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="stats-grid">
            {[
              { value: arsenal.length, label: 'Saved Tools', isAccent: false },
              { value: collections.length, label: 'Collections', isAccent: false },
              { value: approvedSubmissions, label: 'Approved', isAccent: true },
              { value: totalSubmissions, label: 'Submitted', isAccent: false },
            ].map((stat, i) => (
              <div key={i} style={statCard}>
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: stat.isAccent
                      ? isDark ? '#c084fc' : '#7c3aed'
                      : isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
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

          {/* LIBRARY MANAGER */}
          <div style={{ ...glassCard, padding: '32px', minHeight: '360px' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <svg className="animate-spin" style={{ width: '32px', height: '32px', color: isDark ? '#c084fc' : '#7c3aed' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
              </div>
            ) : !activeFolder ? (
              <div className="animate-fade-up">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <h3
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
                    }}
                  >
                    My Library
                  </h3>
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 16px rgba(124,58,237,0.35)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Folder
                  </button>
                </div>

                {isCreatingFolder && (
                  <form
                    onSubmit={handleCreateFolder}
                    className="animate-fade-up"
                    style={{
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.7)',
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        outline: 'none',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingFolder(false)}
                      style={{
                        padding: '8px 14px',
                        background: 'none',
                        border: 'none',
                        color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.6)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 18px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
                      }}
                    >
                      Create
                    </button>
                  </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '18px' }} className="library-grid">
                  <div
                    onClick={() => setActiveFolder('all')}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '22px',
                        padding: '8px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        gap: '6px',
                        marginBottom: '10px',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.7)',
                        transition: 'transform 0.25s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                      {arsenal.slice(0, 4).map((tool: any, i) => (
                        <img
                          key={i}
                          src={`https://www.google.com/s2/favicons?domain=${tool.url || ''}&sz=64`}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)' }}>All Saved</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)' }}>{arsenal.length} items</span>
                  </div>

                  {collections.map((folder, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFolder(folder)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '22px',
                          padding: '8px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gridTemplateRows: '1fr 1fr',
                          gap: '6px',
                          marginBottom: '10px',
                          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.7)',
                          transition: 'transform 0.25s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                      >
                        {folder.tools && folder.tools.length > 0
                          ? folder.tools.slice(0, 4).map((tool: any, i) => (
                              <img
                                key={i}
                                src={`https://www.google.com/s2/favicons?domain=${tool.url || ''}&sz=64`}
                                alt=""
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                                }}
                              />
                            ))
                          : Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  borderRadius: '8px',
                                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)',
                                }}
                              />
                            ))}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)' }}>{folder.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)' }}>
                        {folder.tools ? folder.tools.length : 0} items
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-up">
                <button
                  onClick={() => setActiveFolder(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.6)',
                    fontWeight: 700,
                    marginBottom: '20px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Library
                </button>

                <h3
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
                    marginBottom: '24px',
                  }}
                >
                  {activeFolder === 'all' ? 'All Saved Tools' : (activeFolder as UserCollection)?.name}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="tools-grid">
                  {(() => {
                    const toolsToShow =
                      activeFolder === 'all' ? arsenal : (activeFolder as UserCollection)?.tools || [];
                    if (toolsToShow.length === 0)
                      return (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0' }}>
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                              border: '1px solid rgba(124,58,237,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 14px',
                            }}
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#a855f7' : '#7c3aed'} strokeWidth="1.5">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <p style={{ fontSize: '16px', fontWeight: 700, color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)' }}>This folder is empty.</p>
                          <p style={{ fontSize: '13px', color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)', marginTop: '6px' }}>
                            Save tools from the directory to see them here.
                          </p>
                        </div>
                      );

                    return toolsToShow.map((tool: any) => (
                      <a
                        key={tool.id}
                        href={tool.url || ''}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 16px',
                          borderRadius: '18px',
                          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.7)',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.07)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                          alt=""
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <h4
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {tool.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
                            }}
                          >
                            {tool.category}
                          </span>
                        </div>
                      </a>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="animate-scale-in"
            style={{
              maxWidth: '380px',
              width: '100%',
              background: isDark ? 'rgba(18,16,40,0.82)' : 'rgba(255,255,255,0.52)',
              border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '2rem',
              padding: '32px',
              boxShadow: isDark
                ? '0 20px 56px rgba(0,0,0,0.55)'
                : '0 20px 56px rgba(80,60,180,0.14)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(244,63,94,0.15))',
                border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '26px',
              }}
            >
              🚪
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
                marginBottom: '6px',
              }}
            >
              Sign Out?
            </h3>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
                marginBottom: '24px',
              }}
            >
              You will need to sign in again to save and submit tools.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                  color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onLogout(); onClose(); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .profile-row-1 { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .font-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .library-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .tools-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .library-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
