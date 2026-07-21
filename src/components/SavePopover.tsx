// @ts-nocheck
import React, { useState } from 'react';
import { HeartIcon, LayersIcon, SpinnerIcon } from '../utils/icons';
import { API_BASE_URL } from '../utils/constants';
import { playSound } from '../utils/sounds';

const SavePopover = ({ config, onClose, user, setUser }) => {
  const [isSaving, setIsSaving] = useState(false);
  if (!config || !user) return null;
  const { tool, rect } = config;
  const numericToolId = Number(tool.id);
  const collections = user.collections || [];
  const isInArsenal = user.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId);
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  const popoverWidth = 240;
  let left = rect.left;
  if (left + popoverWidth > window.innerWidth) left = rect.right - popoverWidth;
  left = Math.max(16, left);
  let top = rect.bottom + 12;
  if (top + 280 > window.innerHeight) top = rect.top - 280 - 12;

  const handleToggleFolder = async (folderIndex) => {
    setIsSaving(true);
    const token = localStorage.getItem('payload-token');
    const updatedUser = JSON.parse(JSON.stringify(user));
    if (folderIndex === -1) {
      let currentBookmarks = updatedUser.bookmarks ? updatedUser.bookmarks.map(b => typeof b === 'object' ? b.id : b) : [];
      if (isInArsenal) currentBookmarks = currentBookmarks.filter(id => id !== numericToolId);
      else { currentBookmarks.push(numericToolId); playSound('pop'); }
      updatedUser.bookmarks = currentBookmarks;
    } else {
      const folder = updatedUser.collections[folderIndex];
      let toolsInFolder = folder.tools ? folder.tools.map(t => typeof t === 'object' ? t.id : t) : [];
      const isInFolder = toolsInFolder.includes(numericToolId);
      if (isInFolder) toolsInFolder = toolsInFolder.filter(id => id !== numericToolId);
      else { toolsInFolder.push(numericToolId); playSound('pop'); }
      updatedUser.collections[folderIndex].tools = toolsInFolder;
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/users/' + user.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'JWT ' + token },
        body: JSON.stringify(updatedUser),
      });
      if (res.ok) setUser(updatedUser);
    } catch (err) {}
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[500]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Save tool to collection">
      <div
        className="absolute animate-scale-in"
        style={{
          top,
          left,
          width: popoverWidth,
          background: isDark ? 'rgba(18,16,40,0.82)' : 'rgba(255,255,255,0.52)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.72)',
          borderRadius: '22px',
          boxShadow: isDark
            ? '0 20px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 20px 56px rgba(80,60,180,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
          padding: '6px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            padding: '10px 14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
            }}
          >
            Save to...
          </span>
          {isSaving && <SpinnerIcon style={{ color: isDark ? '#c084fc' : '#7c3aed' }} size={12} />}
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', maxHeight: '240px', overflowY: 'auto', gap: '2px' }}>
          <button
            disabled={isSaving}
            onClick={() => handleToggleFolder(-1)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '14px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            aria-label={isInArsenal ? 'Remove from Arsenal' : 'Save to Arsenal'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  background: isInArsenal
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
                  border: isInArsenal
                    ? 'none'
                    : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)',
                  color: isInArsenal ? 'white' : isDark ? 'rgba(200,190,255,0.7)' : 'rgba(80,60,140,0.7)',
                  boxShadow: isInArsenal ? '0 2px 10px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                <HeartIcon isSaved={isInArsenal} size={14} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>General Arsenal</span>
            </div>
          </button>
          {collections.map((folder, idx) => {
            const toolsInFolder = folder.tools ? folder.tools.map(t => typeof t === 'object' ? t.id : t) : [];
            const isInFolder = toolsInFolder.includes(numericToolId);
            return (
              <button
                key={idx}
                disabled={isSaving}
                onClick={() => handleToggleFolder(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                aria-label={isInFolder ? 'Remove from ' + folder.name : 'Save to ' + folder.name}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      background: isInFolder
                        ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                        : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
                      border: isInFolder
                        ? 'none'
                        : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)',
                      color: isInFolder ? 'white' : isDark ? 'rgba(200,190,255,0.7)' : 'rgba(80,60,140,0.7)',
                      boxShadow: isInFolder ? '0 2px 10px rgba(124,58,237,0.35)' : 'none',
                    }}
                  >
                    <LayersIcon size={14} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {folder.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavePopover;
