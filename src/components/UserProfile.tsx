import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '@nanostores/react';
import { isProfileOpen } from '../stores/modals';
import { API_BASE_URL } from '../utils/constants';
import { playSound } from '../utils/sounds';
import type { Tool, UserCollection } from '../types';

import UserStats from './UserProfile/UserStats';
import UserSettings from './UserProfile/UserSettings';
import UserLibrary from './UserProfile/UserLibrary';

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
  const { user, logout: onLogout } = useAuth();
  const isOpen = useStore(isProfileOpen);
  const setIsProfileOpen = isProfileOpen.set;
  const onClose = () => setIsProfileOpen(false);
  const [arsenal, setArsenal] = useState<(Tool | number)[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [submissions, setSubmissions] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState<UserCollection | 'all' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isDark =
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (!isOpen || !user) return;
    setNickname(user.nickname || '');
    setAvatar(user.avatar || '');
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('payload-token');
      try {
        const [userRes, subRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${user.id}`, {
            headers: { Authorization: `JWT ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/tools?where[submittedBy][equals]=${user.id}`, {
            headers: { Authorization: `JWT ${token}` },
          }),
        ]);
        const userData = await userRes.json();
        setArsenal(userData.bookmarks || []);
        setCollections(userData.collections || []);
        const subData = await subRes.json();
        setSubmissions(subData.docs || []);
      } catch {
        console.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [isOpen, user]);

  const handleSaveProfile = async (newAvatar?: string) => {
    if (!user) return;

    const avatarToSave = newAvatar !== undefined ? newAvatar : avatar;
    const isNicknameChanged = nickname !== user.nickname && nickname.length >= 3;
    const isAvatarChanged = avatarToSave !== user.avatar;

    if (!isNicknameChanged && !isAvatarChanged) return;

    const token = localStorage.getItem('payload-token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          ...(isNicknameChanged && { nickname }),
          ...(isAvatarChanged && { avatar: avatarToSave }),
        }),
      });
      if (response.ok && user) {
        if (isNicknameChanged) user.nickname = nickname;
        if (isAvatarChanged) user.avatar = avatarToSave;
      }
    } catch {
      // Silently fail
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;
    const token = localStorage.getItem('payload-token');
    const updatedCollections = [...collections, { name: newFolderName, tools: [] }];
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
    } catch {
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
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          className="orb"
          style={{
            width: '500px',
            height: '500px',
            top: '-80px',
            left: '-80px',
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
            width: '400px',
            height: '400px',
            bottom: '0',
            right: '-50px',
            opacity: 0.4,
            background: isDark
              ? 'radial-gradient(circle, rgba(147,51,234,0.25) 0%, rgba(124,58,237,0.06) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(232,213,245,0.9) 0%, rgba(213,200,240,0.4) 70%, transparent 100%)',
            animation: 'float2 16s ease-in-out infinite 2s',
          }}
        />
      </div>

      <div
        className="relative z-10"
        style={{ maxWidth: '1300px', margin: '0 auto', padding: '36px 24px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '36px',
          }}
        >
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
              border: isDark
                ? '1px solid rgba(255,255,255,0.18)'
                : '1px solid rgba(255,255,255,0.95)',
              color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
              backdropFilter: 'blur(16px)',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
            }}
            aria-label="Close profile"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}
          className="profile-grid"
        >
          <UserSettings
            user={user}
            nickname={nickname}
            setNickname={setNickname}
            avatar={avatar}
            setAvatar={setAvatar}
            handleSaveProfile={handleSaveProfile}
            isLoading={isLoading}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            setShowLogoutConfirm={setShowLogoutConfirm}
            isDark={isDark}
          />
          <UserStats
            arsenalCount={arsenal.length}
            collectionsCount={collections.length}
            approvedCount={approvedSubmissions}
            submittedCount={totalSubmissions}
            isDark={isDark}
          />
          <UserLibrary
            arsenal={arsenal}
            collections={collections}
            activeFolder={activeFolder}
            setActiveFolder={setActiveFolder}
            isCreatingFolder={isCreatingFolder}
            setIsCreatingFolder={setIsCreatingFolder}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleCreateFolder={handleCreateFolder}
            isLoading={isLoading}
            isDark={isDark}
          />
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
              border: isDark
                ? '1px solid rgba(255,255,255,0.09)'
                : '1px solid rgba(255,255,255,0.62)',
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
                onClick={() => {
                  onLogout();
                  onClose();
                }}
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
