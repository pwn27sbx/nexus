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
      <div className="absolute bg-white/80 dark:bg-[#151515]/80 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 animate-in fade-in zoom-in-95 duration-200" style={{ top, left, width: popoverWidth }} onClick={e => e.stopPropagation()}>
        <div className="px-3 pt-3 pb-2 text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
          <span>Save to...</span>
          {isSaving && <SpinnerIcon className="text-accent" size={12} />}
        </div>
        <div className="flex flex-col max-h-[240px] overflow-y-auto no-scrollbar gap-1">
          <button disabled={isSaving} onClick={() => handleToggleFolder(-1)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white" aria-label={isInArsenal ? 'Remove from Arsenal' : 'Save to Arsenal'}>
            <div className="flex items-center gap-3">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center transition-colors ' + (isInArsenal ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/10 text-black dark:text-white')}>
                <HeartIcon isSaved={isInArsenal} size={14} />
              </div>
              <span className="font-bold text-[14px]">General Arsenal</span>
            </div>
          </button>
          {collections.map((folder, idx) => {
            const toolsInFolder = folder.tools ? folder.tools.map(t => typeof t === 'object' ? t.id : t) : [];
            const isInFolder = toolsInFolder.includes(numericToolId);
            return (
              <button key={idx} disabled={isSaving} onClick={() => handleToggleFolder(idx)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black dark:text-white" aria-label={isInFolder ? 'Remove from ' + folder.name : 'Save to ' + folder.name}>
                <div className="flex items-center gap-3">
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center transition-colors ' + (isInFolder ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/10 text-black dark:text-white')}>
                    <LayersIcon size={14} />
                  </div>
                  <span className="font-bold text-[14px] truncate max-w-[110px] text-left">{folder.name}</span>
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
