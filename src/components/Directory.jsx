import React, { useState, useEffect, useMemo, useRef } from 'react';
import algoliasearch from 'algoliasearch/lite';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import LeaderboardModal from './LeaderboardModal';

const searchClient = algoliasearch(
  "P34W7YOD99",
  "0d8c3e7f27ab2d9f69f63b96b064a2a4"
);
const index = searchClient.initIndex('tools');

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// Corazón que reacciona a la variable CSS del Acento
const HeartIcon = ({ isSaved }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "var(--accent)" : "none"} stroke={isSaved ? "var(--accent)" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CommandPalette = ({ isOpen, onClose, query, setQuery, tools, user, onAction }) => {
  const inputRef = useRef(null);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'suggest', title: 'Suggest a Tool', category: 'Actions', action: () => onAction('suggest') },
    { id: 'leaderboard', title: 'View Leaderboard', category: 'Actions', action: () => onAction('leaderboard') },
    ...(user ? [{ id: 'profile', title: 'My Profile', category: 'Account', action: () => onAction('profile') }] : []),
    { id: 'auth', title: user ? 'Sign Out' : 'Sign In', category: 'Account', action: () => onAction(user ? 'logout' : 'auth') },
  ];

  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/20 dark:bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0f0f11] w-full max-w-2xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-5 py-5 border-b border-black/5 dark:border-white/5">
          <SearchIcon />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tools or type a command..." className="flex-1 bg-transparent border-none outline-none text-black dark:text-white px-4 text-xl font-medium placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
          <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-black/5 dark:border-white/5">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-3 no-scrollbar">
          {query && filteredTools.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Tools</div>
              {filteredTools.map(tool => (
                <button key={tool.id} onClick={() => { window.open(tool.url, '_blank'); onClose(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                  <span className="text-[15px] text-zinc-900 dark:text-white font-semibold">{tool.name}</span><span className="text-[12px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">Visit ↵</span>
                </button>
              ))}
            </div>
          )}
          {(query ? filteredCommands : commands).length > 0 && (
            <div>
              <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Commands</div>
              {(query ? filteredCommands : commands).map(cmd => (
                <button key={cmd.id} onClick={() => { cmd.action(); onClose(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                  <span className="text-[15px] text-zinc-900 dark:text-white font-medium">{cmd.title}</span><span className="text-[12px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">Execute ↵</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MasonryCard = ({ tool, user, onRequireAuth, isFocused }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const [isSaved, setIsSaved] = useState(() => {
    if (!user || !user.bookmarks) return false;
    return user.bookmarks.some(b => (typeof b === 'object' ? b.id : b) === numericToolId);
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (isFocused && cardRef.current) cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [isFocused]);

  const handleToggleSave = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!user) return onRequireAuth();
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
    <div ref={cardRef} className={`break-inside-avoid mb-4 group relative flex flex-col gap-1.5 bg-white dark:bg-[#0a0a0a] border p-1.5 rounded-[22px] shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu ${isFocused ? 'border-black dark:border-white ring-4 ring-black/10 dark:ring-white/10 scale-[1.02] shadow-2xl z-10' : 'border-black/5 dark:border-white/5 hover:-translate-y-1'}`}>

      {/* Botón flotante que hereda el Acento usando CSS */}
      <button onClick={handleToggleSave} disabled={isSaving} className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 outline-none hover-accent-text ${
        isSaved ? 'bg-white border-black/5 shadow-sm dark:bg-[#111] dark:border-white/10 opacity-100'
        : isFocused ? 'bg-black text-white dark:bg-white dark:text-black border-transparent opacity-100'
        : 'bg-white/80 text-zinc-400 border-black/5 dark:bg-black/50 dark:text-zinc-500 dark:border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-[#111]'
      }`}>
        {isSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
      </button>

      <div className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/80 dark:bg-white/80 backdrop-blur-md text-white dark:text-black text-[10px] font-bold tracking-widest uppercase transition-opacity duration-300 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0'}`}>
        Press <kbd className="font-mono text-accent">F</kbd> to Save
      </div>

      <div className="bg-[#f4f4f5] dark:bg-[#161616] rounded-[16px] p-3 flex flex-col transition-colors cursor-pointer" onClick={() => window.open(tool.url, '_blank')}>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-zinc-900 dark:text-white text-[13px] font-medium tracking-tight truncate pr-8">{tool.name}</h3>
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium whitespace-nowrap">{tool.category}</span>
        </div>
        <div className={`relative w-full ${tool.heightClass} rounded-[10px] overflow-hidden bg-white dark:bg-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`}>
          <img src={tool.imageUrl} alt={tool.name} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 ease-out" loading="lazy" />
        </div>
      </div>
      <div className="bg-[#f4f4f5] dark:bg-[#161616] rounded-[14px] py-2.5 flex justify-center items-center text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors cursor-pointer" onClick={() => window.open(tool.url, '_blank')}>
        {isFocused ? <span className="font-mono">Press ENTER to Visit</span> : tool.actionText}
      </div>
    </div>
  );
};

// ... [AutoCaptureModal se mantiene exactamente igual, omitido por brevedad] ...
const AutoCaptureModal = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState(''); const [url, setUrl] = useState(''); const [category, setCategory] = useState('Design'); const [submitStatus, setSubmitStatus] = useState('idle');
  if (!isOpen) return null;
  const handleCapture = async (e) => { e.preventDefault(); setSubmitStatus('loading'); try { const res = await fetch('https://nexus-production-8dca.up.railway.app/api/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, url, category, submittedBy: user ? user.id : null }), }); if (res.ok) { setSubmitStatus('success'); setTimeout(() => { onClose(); setName(''); setUrl(''); setCategory('Design'); setSubmitStatus('idle'); }, 3000); } else setSubmitStatus('error'); } catch (err) { setSubmitStatus('error'); } };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 dark:bg-black/40 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 w-[90%] max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        <h2 className="text-lg font-medium text-black dark:text-white mb-1">Suggest a tool</h2><p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-5">Submissions will be reviewed before appearing on the directory.</p>
        {submitStatus === 'success' ? ( <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300"><div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><h3 className="text-black dark:text-white font-medium mb-1">Tool Submitted!</h3><p className="text-[13px] text-zinc-500">Waiting for approval.</p></div>
        ) : (
          <form onSubmit={handleCapture}>
            <div className="flex flex-col gap-3 mb-5">
              <input type="text" required placeholder="Tool Name (e.g. Figma)" value={name} onChange={(e) => setName(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white placeholder:text-zinc-400" />
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white"><GlobeIcon /><input type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-sm text-black dark:text-white placeholder:text-zinc-400" /></div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white"><option value="Design">Design</option><option value="Development">Development</option><option value="AI Tools">AI Tools</option><option value="Productivity">Productivity</option></select>
            </div>
            {submitStatus === 'error' && <p className="text-red-500 text-[12px] mb-3 text-center">Server error.</p>}
            <button type="submit" disabled={submitStatus === 'loading'} className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">{submitStatus === 'loading' ? "Sending..." : "Submit to Directory"}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default function App() {
  // --- EL CEREBRO DEL SISTEMA DE ACENTOS ---
  // Comprobamos si estamos en el navegador antes de usar localStorage
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus-accent') || '#ff8787';
    }
    return '#ff8787'; // Color por defecto para el servidor de Vercel
  });

  useEffect(() => {
    localStorage.setItem('nexus-accent', accentColor);
    // Inyectamos el color mágico directo a la raíz del CSS de toda la página
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => { setFocusedIndex(-1); }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen || isCommandPaletteOpen) return;
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
  }, [focusedIndex, tools, activeCategory, isModalOpen, isAuthModalOpen, isProfileOpen, isLeaderboardOpen, isCommandPaletteOpen]);

  useEffect(() => {
    const handleCmdK = (e) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsCommandPaletteOpen((prev) => !prev); } };
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
          const heights = ["h-[200px]", "h-[240px]", "h-[220px]", "h-[260px]", "h-[280px]"];
          const assignedHeight = tool.gridHeight === 'tall' ? (index % 2 === 0 ? "h-[450px]" : "h-[500px]") : heights[index % heights.length];
          return { id: tool.objectID, name: tool.name, category: tool.category, url: tool.url, imageUrl: tool.screenshotUrl || "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop", heightClass: assignedHeight, actionText: "View Production" };
        });
        setTools(fetchedTools);
      } catch (error) {} finally { setIsLoading(false); }
    };
    fetchTools();
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [searchQuery]);

  const filteredTools = useMemo(() => tools.filter(tool => activeCategory === "All" || tool.category === activeCategory), [activeCategory, tools]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] transition-colors duration-300 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700 pb-32">

      {/* MAGIA CSS: Inyectamos estilos utilitarios universales para el color de acento */}
      <style>{`
        .text-accent { color: var(--accent) !important; }
        .bg-accent { background-color: var(--accent) !important; }
        .hover-accent-text:hover { color: var(--accent) !important; }
        .hover-bg-accent:hover { background-color: var(--accent) !important; color: white !important; }
      `}</style>

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-lg flex items-center justify-between p-1.5 transition-all">
        <div className="flex items-center gap-2 pl-3">
          <div className="w-4 h-4 rounded bg-black dark:bg-white flex items-center justify-center"><div className="w-1 h-1 bg-white dark:bg-black rounded-full"></div></div>
        </div>

        <button onClick={() => setIsCommandPaletteOpen(true)} className="flex-1 flex items-center px-3 py-2 mx-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all group">
          <SearchIcon />
          <span className="ml-2 text-zinc-500 text-[12px] font-medium text-left flex-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors truncate">{searchQuery ? searchQuery : "Search or type a command..."}</span>
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-white dark:bg-black border border-black/10 dark:border-white/10 text-zinc-400">⌘K</kbd>
        </button>

        <div className="flex gap-1 pr-1">
          <button onClick={() => setIsLeaderboardOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer mr-1" title="Leaderboard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          </button>

          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="px-3 h-8 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 text-[11px] font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
              {/* Conectamos el indicador del Navbar al Acento */}
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></div>{user.nickname ? `@${user.nickname}` : user.email.split('@')[0]}
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"><UserIcon /></button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"><PlusIcon /></button>
        </div>
      </nav>

      <div className="pt-28 pb-8 flex justify-center w-full z-30 sticky top-0 bg-gradient-to-b from-[#fafafa] dark:from-[#050505] to-transparent pointer-events-none">
        <div className="flex gap-2 p-1.5 rounded-full bg-white/50 dark:bg-[#111]/50 backdrop-blur-md border border-black/5 dark:border-white/5 pointer-events-auto overflow-x-auto max-w-[95%] no-scrollbar">
          {["All", "Design", "Development", "AI Tools", "Productivity"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${activeCategory === cat ? 'text-white shadow-sm bg-accent' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <main className="max-w-[1600px] w-[95%] mx-auto mt-2">
        {isLoading ? ( <div className="flex justify-center items-center py-20 text-zinc-500"><svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg>Loading...</div>
        ) : filteredTools.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {filteredTools.map((tool, index) => <MasonryCard key={tool.id} tool={tool} user={user} onRequireAuth={() => setIsAuthModalOpen(true)} isFocused={focusedIndex === index} />)}
          </div>
        ) : ( <div className="flex flex-col items-center justify-center py-20 text-zinc-400"><SearchIcon /><p className="mt-4 text-sm">No tools found.</p></div> )}
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} query={searchQuery} setQuery={setSearchQuery} tools={tools} user={user} onAction={handlePaletteAction} />
      <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Pasamos los controles de acento al Perfil */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}
