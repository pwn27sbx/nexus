import React, { useState, useEffect, useMemo, useRef } from 'react';
import algoliasearch from 'algoliasearch/lite';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import LeaderboardModal from './LeaderboardModal';

const searchClient = algoliasearch("P34W7YOD99", "0d8c3e7f27ab2d9f69f63b96b064a2a4");
const index = searchClient.initIndex('tools');

let audioCtx = null;
const playSound = (type) => {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'pop') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.6, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'woosh') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'snap') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    }
  } catch (e) {}
};

const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const UserIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const GlobeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86868b]"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>);
const HeartIcon = ({ isSaved }) => (<svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "var(--accent)" : "none"} stroke={isSaved ? "var(--accent)" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 hover:scale-110"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const GridIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>);
const ListIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const DescIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#86868b]"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>);
const TypeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>);
const ArrowUpRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>);

const getDomain = (url) => { try { return new URL(url).hostname.replace('www.', ''); } catch(e) { return ''; } };

const availableFonts = [
  { id: 'system', name: 'System Apple', value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'inter', name: 'Inter (UI)', value: "'Inter', sans-serif" },
  { id: 'outfit', name: 'Outfit (Modern)', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist Mono', value: "'Geist Mono', monospace" },
  { id: 'monaspace', name: 'Monaspace', value: "'Monaspace Neon', monospace" },
  { id: 'cascadia', name: 'Cascadia', value: "'Cascadia Code', monospace" },
  { id: 'fira', name: 'Fira Code', value: "'Fira Code', monospace" }
];

const FontPickerModal = ({ isOpen, onClose, currentFont, setFontFamily }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/20 dark:bg-black/50 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 dark:border-white/5 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-400" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">Typography</h2>
            <p className="text-[14px] text-[#86868b] mt-1 font-medium">Personalize your UI font experience.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableFonts.map(font => {
              const isActive = currentFont === font.value;
              return (
                <button
                  key={font.id}
                  onClick={() => { setFontFamily(font.value); playSound('snap'); }}
                  className={`relative p-5 rounded-[20px] flex items-center justify-center text-center transition-all duration-300 group ${isActive ? 'bg-accent text-white shadow-[0_8px_20px_var(--accent-muted)] scale-105' : 'bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 hover:shadow-lg hover:-translate-y-1'}`}
                  style={{ fontFamily: font.value }}
                >
                  <span className={`text-[14px] font-bold ${isActive ? 'text-white' : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-accent'}`}>
                    {font.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CommandPalette = ({ isOpen, onClose, query, setQuery, tools, user, onAction }) => {
  const inputRef = useRef(null);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [isOpen, onClose]);

  if (!isOpen) return null;
  const commands = [
    { id: 'suggest', title: 'Suggest a Tool', category: 'Actions', action: () => onAction('suggest') },
    { id: 'leaderboard', title: 'View Leaderboard', category: 'Actions', action: () => onAction('leaderboard') },
    { id: 'fonts', title: 'Change Typography', category: 'Settings', action: () => onAction('fonts') },
    ...(user ? [{ id: 'profile', title: 'My Profile', category: 'Account', action: () => onAction('profile') }] : []),
    { id: 'auth', title: user ? 'Sign Out' : 'Sign In', category: 'Account', action: () => onAction(user ? 'logout' : 'auth') },
  ];
  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/20 dark:bg-black/60 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl w-full max-w-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-6 py-6 border-b border-black/5 dark:border-white/5">
          <SearchIcon />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for tools or commands..." className="flex-1 bg-transparent border-none outline-none text-[#1d1d1f] dark:text-[#f5f5f7] px-5 text-2xl font-bold placeholder:text-[#86868b]" />
          <kbd className="hidden sm:inline-block text-[11px] font-bold px-3 py-1.5 rounded-[10px] bg-black/5 dark:bg-white/10 text-[#86868b]">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4 no-scrollbar">
          {query && filteredTools.length > 0 && (
            <div className="mb-6">
              <div className="px-4 py-2 text-[12px] font-bold text-[#86868b] uppercase tracking-widest">Tools</div>
              {filteredTools.map(tool => (
                <button key={tool.id} onClick={() => { window.open(tool.url, '_blank'); onClose(); }} className="w-full text-left px-5 py-4 rounded-[20px] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between group transition-all duration-200">
                  <span className="text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold group-hover:text-accent transition-colors">{tool.name}</span><span className="text-[12px] font-bold text-[#86868b] opacity-0 group-hover:opacity-100 group-hover:text-accent transition-opacity">Visit ↵</span>
                </button>
              ))}
            </div>
          )}
          {(query ? filteredCommands : commands).length > 0 && (
            <div>
              <div className="px-4 py-2 text-[12px] font-bold text-[#86868b] uppercase tracking-widest">Commands</div>
              {(query ? filteredCommands : commands).map(cmd => (
                <button key={cmd.id} onClick={() => { cmd.action(); onClose(); }} className="w-full text-left px-5 py-4 rounded-[20px] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between group transition-all duration-200">
                  <span className="text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold group-hover:text-accent transition-colors">{cmd.title}</span><span className="text-[12px] font-bold text-[#86868b] opacity-0 group-hover:opacity-100 group-hover:text-accent transition-opacity">Execute ↵</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- WOW EFFECT: MASONRY CARD ULTRA-PREMIUM (TEXTO "VISIT" Y CRISTAL MEJORADO) ---
const MasonryCard = ({ tool, user, onRequireAuth, isFocused }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const [isSaved, setIsSaved] = useState(() => user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) || false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (isFocused && cardRef.current) cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [isFocused]);

  const handleToggleSave = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!user) return onRequireAuth();
    if (!isSaved) playSound('pop');
    setIsSaving(true);
    const token = localStorage.getItem('payload-token');
    let newBookmarks = user.bookmarks ? user.bookmarks.map(b => typeof b === 'object' ? b.id : b) : [];
    if (isSaved) { newBookmarks = newBookmarks.filter(id => id !== numericToolId); } else { newBookmarks.push(numericToolId); }
    try {
      const res = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` }, body: JSON.stringify({ bookmarks: newBookmarks }) });
      if (res.ok) { setIsSaved(!isSaved); user.bookmarks = newBookmarks; }
    } catch (err) {} finally { setIsSaving(false); }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (isFocused && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); handleToggleSave(e); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFocused, isSaved, user]);

  return (
    <div
      ref={cardRef}
      onClick={() => window.open(tool.url, '_blank')}
      className={`break-inside-avoid mb-6 group relative flex flex-col ${tool.heightClass} rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 transform-gpu shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] ${isFocused ? 'ring-[3px] ring-accent ring-offset-4 ring-offset-[#f5f5f7] dark:ring-offset-black scale-[1.02] z-10' : 'border border-black/5 dark:border-white/5'}`}
    >
      <button onClick={handleToggleSave} disabled={isSaving} className={`absolute top-5 right-5 z-30 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-2xl transition-all duration-300 outline-none ${isSaved ? 'bg-white/90 text-accent shadow-sm dark:bg-[#2c2c2e]/90 opacity-100' : 'bg-black/20 text-white dark:bg-white/20 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-[#1d1d1f] dark:hover:bg-[#2c2c2e] dark:hover:text-white'}`}>
        {isSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
      </button>

      {/* Imagen Full-Bleed con zoom Ultra-Suave */}
      <img src={tool.imageUrl} alt={tool.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.04]" loading="lazy" />

      {/* Sombreo para asegurar contraste */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 to-transparent pointer-events-none z-10" />

      {/* BLOQUE INSET DE CRISTAL (Hyper-Realistic Glassmorphism) */}
      <div className="absolute inset-x-3 bottom-3 z-20 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-3xl border-t border-white/50 dark:border-white/10 p-4 rounded-[24px] flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:-translate-y-1">
         <div className="flex flex-col truncate pr-3">
           <span className="text-[10px] font-extrabold text-[#86868b] dark:text-[#aeaeb2] uppercase tracking-widest mb-0.5">{tool.category}</span>
           <h3 className="text-[#1d1d1f] dark:text-[#f5f5f7] text-[16px] font-extrabold tracking-tight truncate">{tool.name}</h3>
         </div>

         {/* BOTÓN VISIT (Con flecha integrada) */}
         <button className="px-4 py-2 rounded-full font-bold text-[11px] tracking-wide bg-[#1d1d1f] text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all duration-300 shadow-sm shrink-0 flex items-center gap-1.5">
           VISIT <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
         </button>
      </div>
    </div>
  );
};

const ListCard = ({ tool, user, onRequireAuth, isFocused, indexNumber }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const [isSaved, setIsSaved] = useState(() => user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) || false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (isFocused && cardRef.current) cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [isFocused]);

  const handleToggleSave = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!user) return onRequireAuth();
    if (!isSaved) playSound('pop');
    setIsSaving(true);
    const token = localStorage.getItem('payload-token');
    let newBookmarks = user.bookmarks ? user.bookmarks.map(b => typeof b === 'object' ? b.id : b) : [];
    if (isSaved) { newBookmarks = newBookmarks.filter(id => id !== numericToolId); } else { newBookmarks.push(numericToolId); }
    try {
      const res = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` }, body: JSON.stringify({ bookmarks: newBookmarks }) });
      if (res.ok) { setIsSaved(!isSaved); user.bookmarks = newBookmarks; }
    } catch (err) {} finally { setIsSaving(false); }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (isFocused && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); handleToggleSave(e); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFocused, isSaved, user]);

  return (
    <div
      ref={cardRef}
      className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_2.5fr_1fr_1.5fr_80px] gap-4 items-center p-5 border-b border-black/5 dark:border-white/5 transition-all duration-200 cursor-pointer bg-white dark:bg-[#1c1c1e] ${isFocused ? 'bg-[#f5f5f7] dark:bg-[#2c2c2e]' : 'hover:bg-[#f5f5f7]/50 dark:hover:bg-[#2c2c2e]/50'}`}
      onClick={() => window.open(tool.url, '_blank')}
    >
      <div className="flex items-center justify-center w-8" onClick={(e) => { e.stopPropagation(); }}>
        <button onClick={handleToggleSave} disabled={isSaving} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSaved ? 'text-accent bg-accent/10 opacity-100 scale-110' : isFocused ? 'text-accent opacity-100' : 'text-[#86868b] opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-accent/10 hover:scale-110'}`}>
          {isSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
        </button>
        <span className={`text-[12px] font-bold w-8 text-center absolute pointer-events-none transition-opacity ${isSaved || isFocused ? 'opacity-0 group-hover:opacity-0' : 'opacity-100 group-hover:opacity-0 text-[#86868b]'}`}>
          {(indexNumber + 1).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col truncate justify-center">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm shrink-0">
             <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-4 h-4 object-contain rounded-sm" />
          </div>
          <span className={`text-[16px] font-bold tracking-tight truncate transition-colors ${isFocused ? 'text-accent' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>{tool.name}</span>
        </div>
        <span className="text-[13px] text-[#86868b] truncate mt-1.5 ml-[46px]">{tool.description}</span>
      </div>

      <div className="hidden md:flex items-center">
        <span className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] uppercase tracking-widest">{tool.category}</span>
      </div>

      <div className="hidden md:flex flex-col items-end justify-center pr-4">
        <span className="truncate text-[14px] text-[#86868b] font-medium">{getDomain(tool.url)}</span>
        <div className="text-[11px] font-bold text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex items-center gap-1">
          {isFocused ? <span className="text-accent flex items-center gap-1">ENTER <ArrowUpRight /></span> : <span className="flex items-center gap-1">VISIT <ArrowUpRight /></span>}
        </div>
      </div>

      <div className="hidden md:flex justify-end">
        <div className="w-[80px] h-[45px] rounded-[10px] overflow-hidden border border-black/5 dark:border-white/5 shadow-sm relative transition-all duration-400 group-hover:shadow-md">
          <img src={tool.imageUrl} alt={tool.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

const AutoCaptureModal = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Design');
  const [description, setDescription] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle');

  if (!isOpen) return null;

  const handleCapture = async (e) => {
    e.preventDefault(); setSubmitStatus('loading');
    try {
      const res = await fetch('https://nexus-production-8dca.up.railway.app/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, category, description, submittedBy: user ? user.id : null }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setTimeout(() => { onClose(); setName(''); setUrl(''); setDescription(''); setCategory('Design'); setSubmitStatus('idle'); }, 3000);
      } else setSubmitStatus('error');
    } catch (err) { setSubmitStatus('error'); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-xl transition-opacity p-4">
      <div className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/20 dark:border-white/5 w-full max-w-md rounded-[36px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-2">Suggest a Tool</h2><p className="text-[14px] text-[#86868b] mb-8 font-medium">Submissions will be reviewed before appearing on the directory.</p>
        {submitStatus === 'success' ? ( <div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300"><div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_var(--accent-muted)] mb-5"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><h3 className="text-[#1d1d1f] dark:text-white font-bold text-xl mb-1 tracking-tight">Tool Submitted!</h3><p className="text-[14px] text-[#86868b]">Waiting for review.</p></div>
        ) : (
          <form onSubmit={handleCapture}>
            <div className="flex flex-col gap-4 mb-8">
              <input type="text" required placeholder="Tool Name (e.g. Figma)" value={name} onChange={(e) => setName(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 ring-accent transition-all text-[15px] font-bold text-[#1d1d1f] dark:text-white placeholder:text-[#86868b]" />
              <div className="flex items-center gap-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all"><GlobeIcon /><input type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#1d1d1f] dark:text-white placeholder:text-[#86868b]" /></div>
              <div className="flex items-start gap-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                <div className="mt-0.5"><DescIcon /></div>
                <input type="text" required maxLength={100} placeholder="Short description (Max 100 chars)" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#1d1d1f] dark:text-white placeholder:text-[#86868b]" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 focus:ring-accent transition-all text-[15px] font-bold text-[#1d1d1f] dark:text-white appearance-none"><option value="Design">Design</option><option value="Development">Development</option><option value="AI Tools">AI Tools</option><option value="Productivity">Productivity</option></select>
            </div>
            {submitStatus === 'error' && <p className="text-[#ff3b30] text-[13px] font-bold mb-4 text-center">Server error.</p>}
            <button type="submit" disabled={submitStatus === 'loading'} className="w-full bg-accent shadow-[0_8px_20px_var(--accent-muted)] text-white text-[16px] font-bold py-4 rounded-[16px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">{submitStatus === 'loading' ? "Sending..." : "Submit to Directory"}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-accent') || '#3b82f6';
    return '#3b82f6';
  });

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-view') || 'grid';
    return 'grid';
  });

  const [fontFamily, setFontFamily] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-font-family') || "'Inter', sans-serif";
    return "'Inter', sans-serif";
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const loadFont = (id, url) => {
        if (!document.getElementById(id)) {
          const link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; link.href = url; document.head.appendChild(link);
        }
      };
      loadFont('google-fonts-expanded', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Anonymous+Pro:wght@400;700&family=Fira+Code:wght@400;500;700&family=Geist+Mono:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700;800&family=Roboto+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&family=Ubuntu+Mono:wght@400;700&display=swap');
      loadFont('cascadia-font', 'https://cdn.jsdelivr.net/npm/@fontsource/cascadia-code@5.0.8/index.css');
      loadFont('monaspace-font', 'https://cdn.jsdelivr.net/npm/@fontsource/monaspace-neon@5.0.8/index.css');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus-accent', accentColor);
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('nexus-view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('nexus-font-family', fontFamily);
    document.documentElement.style.setProperty('--global-font', fontFamily);
    if (typeof document !== 'undefined') { document.body.style.setProperty('font-family', fontFamily, 'important'); }
  }, [fontFamily]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => { setFocusedIndex(-1); }, [searchQuery, activeCategory, viewMode]);

  useEffect(() => {
    if (isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen || isCommandPaletteOpen || isFontModalOpen) return;
    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (tools.length === 0) return;
      const currentTools = tools.filter(t => activeCategory === "All" || t.category === activeCategory);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(prev => prev < currentTools.length - 1 ? prev + 1 : 0); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(prev => prev > 0 ? prev - 1 : currentTools.length - 1); }
      else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); window.open(currentTools[focusedIndex].url, '_blank'); }
      else if (e.key === 'Escape') { setFocusedIndex(-1); }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedIndex, tools, activeCategory, isModalOpen, isAuthModalOpen, isProfileOpen, isLeaderboardOpen, isCommandPaletteOpen, isFontModalOpen]);

  useEffect(() => {
    const handleCmdK = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => { if (!prev) playSound('woosh'); return !prev; });
      }
    };
    document.addEventListener('keydown', handleCmdK); return () => document.removeEventListener('keydown', handleCmdK);
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('payload-token');
      if (!token) return;
      try { const res = await fetch('https://nexus-production-8dca.up.railway.app/api/users/me', { headers: { 'Authorization': `JWT ${token}` } }); if (res.ok) { const data = await res.json(); setUser(data.user); } else { localStorage.removeItem('payload-token'); } } catch (err) {}
    }; checkUserSession();
  }, [isAuthModalOpen]);

  const handleLogout = () => { localStorage.removeItem('payload-token'); setUser(null); setIsProfileOpen(false); };

  const handlePaletteAction = (action) => {
    switch(action) {
      case 'suggest': setIsModalOpen(true); break;
      case 'leaderboard': setIsLeaderboardOpen(true); break;
      case 'profile': setIsProfileOpen(true); break;
      case 'fonts': setIsFontModalOpen(true); break;
      case 'auth': setIsAuthModalOpen(true); break;
      case 'logout': handleLogout(); break;
      default: break;
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => document.documentElement.classList.toggle('dark', e.matches);
    document.documentElement.classList.toggle('dark', mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const { hits } = await index.search(searchQuery);
        const fetchedTools = hits.map((tool, index) => {
          const heights = ["h-[220px]", "h-[260px]", "h-[240px]", "h-[280px]", "h-[300px]"];
          const assignedHeight = tool.gridHeight === 'tall' ? (index % 2 === 0 ? "h-[450px]" : "h-[500px]") : heights[index % heights.length];

          return {
            id: tool.objectID, name: tool.name, category: tool.category, url: tool.url,
            imageUrl: tool.screenshotUrl || "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop",
            heightClass: assignedHeight, actionText: "Visit", description: tool.description || "High-performance platform for creators."
          };
        });
        setTools(fetchedTools);
      } catch (error) {} finally { setIsLoading(false); }
    };
    fetchTools();
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [searchQuery]);

  const filteredTools = useMemo(() => tools.filter(tool => activeCategory === "All" || tool.category === activeCategory), [activeCategory, tools]);

  return (
    <div className="relative min-h-screen bg-[#f5f5f7] dark:bg-[#000000] transition-colors duration-500 selection:bg-zinc-300 dark:selection:bg-zinc-700 pb-32 overflow-x-hidden">

      <style>{`
        :root {
          --accent: ${accentColor};
          --accent-muted: color-mix(in srgb, var(--accent) 20%, transparent);
          --global-font: ${fontFamily};
        }
        * { font-family: var(--global-font) !important; }
        ::selection { background-color: var(--accent); color: #fff; }
        .text-accent { color: var(--accent) !important; }
        .bg-accent { background-color: var(--accent) !important; color: #fff !important; }
        .bg-accent-muted { background-color: var(--accent-muted) !important; }
        .border-accent { border-color: var(--accent) !important; }
        .ring-accent { --tw-ring-color: var(--accent) !important; }
        .hover-accent-text:hover { color: var(--accent) !important; }
        .hover-bg-accent:hover { background-color: var(--accent) !important; color: white !important; }
        .hover-bg-accent-muted:hover { background-color: var(--accent-muted) !important; }
        .shadow-accent { box-shadow: 0 8px 30px var(--accent-muted) !important; }
      `}</style>

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-[40px] border border-white/20 dark:border-white/5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between p-2 transition-all">
        <div className="flex items-center gap-2 pl-5 pr-2">
          <div className="w-5 h-5 rounded-[6px] bg-[#1d1d1f] dark:bg-white flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white dark:bg-[#1d1d1f] rounded-full"></div></div>
        </div>

        <button onClick={() => { playSound('woosh'); setIsCommandPaletteOpen(true); }} className="flex-1 flex items-center px-4 py-2.5 mx-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all group focus:outline-none focus:ring-2 ring-accent">
          <SearchIcon />
          <span className="ml-3 text-[#86868b] text-[14px] font-bold text-left flex-1 group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-colors truncate">{searchQuery ? searchQuery : "Search tools or command..."}</span>
          <kbd className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 text-[#86868b] shadow-sm">⌘K</kbd>
        </button>

        <div className="flex gap-1 pr-1">
          <button onClick={() => { playSound('woosh'); setIsFontModalOpen(true); }} className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95" title="Typography">
            <TypeIcon />
          </button>
          <button onClick={() => { playSound('snap'); setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); }} className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 focus:outline-none focus:ring-2 ring-accent" title={`Switch View`}>
            {viewMode === 'grid' ? <ListIcon /> : <GridIcon />}
          </button>
          <button onClick={() => setIsLeaderboardOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95" title="Leaderboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          </button>
          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="px-4 h-10 ml-1 rounded-full bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm hover:shadow-md border border-black/5 dark:border-white/5 text-[13px] font-bold transition-all active:scale-95 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: accentColor }}></div>{user.nickname ? `@${user.nickname}` : user.email.split('@')[0]}
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="w-10 h-10 ml-1 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"><UserIcon /></button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 rounded-full bg-accent shadow-[0_4px_15px_var(--accent-muted)] text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-all active:scale-95 ml-2"><PlusIcon /></button>
        </div>
      </nav>

      {/* FILTROS IOS STYLE */}
      <div className="pt-32 pb-10 flex justify-center w-full z-30 sticky top-0 bg-gradient-to-b from-[#f5f5f7] dark:from-[#000000] via-[#f5f5f7]/90 dark:via-[#000000]/90 to-transparent pointer-events-none">
        <div className="flex gap-2 p-1.5 rounded-full bg-[#e5e5ea]/50 dark:bg-[#1c1c1e]/50 backdrop-blur-2xl pointer-events-auto overflow-x-auto max-w-[95%] no-scrollbar border border-white/20 dark:border-white/5 shadow-sm">
          {["All", "Design", "Development", "AI Tools", "Productivity"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'text-[#1d1d1f] dark:text-white shadow-sm bg-white dark:bg-[#2c2c2e]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <main className={`relative z-10 max-w-[1600px] mx-auto mt-2 ${viewMode === 'list' ? 'w-full px-4 lg:w-[900px]' : 'w-[95%]'}`}>
        {isLoading ? ( <div className="flex justify-center items-center py-20 text-[#86868b]"><svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg></div>
        ) : filteredTools.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {filteredTools.map((tool, index) => <MasonryCard key={tool.id} tool={tool} user={user} onRequireAuth={() => setIsAuthModalOpen(true)} isFocused={focusedIndex === index} />)}
            </div>
          ) : (
            <div className="flex flex-col bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              {filteredTools.map((tool, index) => <ListCard key={tool.id} tool={tool} user={user} onRequireAuth={() => setIsAuthModalOpen(true)} isFocused={focusedIndex === index} indexNumber={index} />)}
            </div>
          )
        ) : ( <div className="flex flex-col items-center justify-center py-20 text-[#86868b]"><SearchIcon /><p className="mt-4 text-[15px] font-bold">No tools found.</p></div> )}
      </main>

      <FontPickerModal isOpen={isFontModalOpen} onClose={() => setIsFontModalOpen(false)} currentFont={fontFamily} setFontFamily={setFontFamily} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} query={searchQuery} setQuery={setSearchQuery} tools={tools} user={user} onAction={handlePaletteAction} />
      <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} accentColor={accentColor} setAccentColor={setAccentColor} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}
