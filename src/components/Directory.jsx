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

const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const UserIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const GlobeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>);
const HeartIcon = ({ isSaved }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 hover:scale-110"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const GridIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect></svg>);
const ListIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const DescIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>);
const ArrowUpRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>);

const getDomain = (url) => { try { return new URL(url).hostname.replace('www.', ''); } catch(e) { return ''; } };

const CommandPalette = ({ isOpen, onClose, query, setQuery, tools, user, onAction }) => {
  const inputRef = useRef(null);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [isOpen, onClose]);

  if (!isOpen) return null;
  const commands = [
    { id: 'suggest', title: 'Submit Tool', action: () => onAction('suggest') },
    { id: 'leaderboard', title: 'Leaderboard', action: () => onAction('leaderboard') },
    // Eliminamos el comando "fonts" independiente, ahora redirige al perfil que es el Command Center
    { id: 'profile', title: 'Command Center (Aesthetics & Profile)', action: () => onAction('profile') },
    { id: 'auth', title: user ? 'Sign Out' : 'Sign In', action: () => onAction(user ? 'logout' : 'auth') },
  ];
  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-2xl p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-3xl w-full max-w-2xl rounded-[36px] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-8 py-6 border-b border-black/5 dark:border-white/5">
          <SearchIcon />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tools or commands..." className="flex-1 bg-transparent border-none outline-none text-black dark:text-white px-5 text-2xl font-bold tracking-tight placeholder:text-zinc-400 dark:placeholder:text-zinc-600" />
          <kbd className="hidden sm:inline-block text-[12px] font-bold px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-zinc-500">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4 no-scrollbar">
          {query && filteredTools.length > 0 && (
            <div className="mb-6">
              <div className="px-5 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Tools</div>
              {filteredTools.map(tool => (
                <button key={tool.id} onClick={() => { window.open(tool.url, '_blank'); onClose(); }} className="w-full text-left px-5 py-4 rounded-[24px] hover:bg-white dark:hover:bg-white/10 flex items-center justify-between group transition-all">
                  <span className="text-[18px] font-bold text-black dark:text-white group-hover:text-accent">{tool.name}</span><span className="text-[13px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">Visit</span>
                </button>
              ))}
            </div>
          )}
          {(query ? filteredCommands : commands).length > 0 && (
            <div>
              <div className="px-5 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Commands</div>
              {(query ? filteredCommands : commands).map(cmd => (
                <button key={cmd.id} onClick={() => { cmd.action(); onClose(); }} className="w-full text-left px-5 py-4 rounded-[24px] hover:bg-white dark:hover:bg-white/10 flex items-center justify-between group transition-all">
                  <span className="text-[18px] font-bold text-black dark:text-white group-hover:text-accent">{cmd.title}</span><span className="text-[13px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">Execute</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- WOW EFFECT 1: BENTO GRID EDITORIAL (MAGAZINE STYLE) ---
const BentoCard = ({ tool, user, onRequireAuth, isFocused, index }) => {
  const cardRef = useRef(null);
  const numericToolId = Number(tool.id);
  const [isSaved, setIsSaved] = useState(() => user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) || false);
  const [isSaving, setIsSaving] = useState(false);

  // LOGÍCA BENTO 2.0: Patrón asimétrico para la grilla
  const getBentoSpan = (i) => {
    const pattern = i % 7;
    switch(pattern) {
      case 0: return "md:col-span-2 md:row-span-2"; // Hero gigante
      case 1: return "md:col-span-1 md:row-span-1"; // Cuadrado
      case 2: return "md:col-span-1 md:row-span-1"; // Cuadrado
      case 3: return "md:col-span-2 md:row-span-1"; // Rectángulo Ancho
      case 4: return "md:col-span-1 md:row-span-2"; // Rectángulo Alto
      case 5: return "md:col-span-1 md:row-span-1"; // Cuadrado
      case 6: return "md:col-span-2 md:row-span-1"; // Rectángulo Ancho
      default: return "md:col-span-1 md:row-span-1";
    }
  };

  const spanClass = getBentoSpan(index);

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
      className={`group relative overflow-hidden rounded-[24px] cursor-pointer transition-all duration-500 bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-2xl ${spanClass} ${isFocused ? 'ring-4 ring-accent ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02] z-10' : 'hover:-translate-y-1'}`}
    >
      {/* Botón Guardar */}
      <button onClick={handleToggleSave} disabled={isSaving} className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 outline-none ${isSaved ? 'bg-white text-accent dark:bg-black opacity-100' : 'bg-black/30 text-white dark:bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black'}`}>
        {isSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
      </button>

      {/* Imagen Full-Bleed con zoom lento */}
      <img src={tool.imageUrl} alt={tool.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]" loading="lazy" />

      {/* Gradiente Editorial Oscuro para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />

      {/* Contenido Editorial (Texto grande, alto contraste) */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
         <span className="text-accent text-[12px] font-extrabold uppercase tracking-widest mb-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">{tool.category}</span>

         <div className="flex items-end justify-between">
           <div>
             <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tighter leading-none mb-1 group-hover:text-white transition-colors">{tool.name}</h3>
             <p className="text-white/60 text-[14px] font-medium tracking-tight line-clamp-1 max-w-[80%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">{getDomain(tool.url)}</p>
           </div>

           {/* Flecha reveladora tipo revista */}
           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0">
             <ArrowUpRight />
           </div>
         </div>
      </div>
    </div>
  );
};

// --- WOW EFFECT 2: LISTA DE ALTO RENDIMIENTO CON IMAGEN FLOTANTE (HOVER REVEAL) ---
const ListCard = ({ tool, user, onRequireAuth, isFocused, indexNumber }) => {
  const numericToolId = Number(tool.id);
  const [isSaved, setIsSaved] = useState(() => user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) || false);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div
      className={`group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[60px_2.5fr_1fr_1.5fr] gap-6 items-center py-6 px-4 md:px-8 border-b border-black/10 dark:border-white/10 transition-all duration-300 cursor-pointer ${isFocused ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
      onClick={() => window.open(tool.url, '_blank')}
    >
      <div className="flex items-center justify-center w-10" onClick={(e) => { e.stopPropagation(); }}>
        <button onClick={handleToggleSave} disabled={isSaving} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSaved ? 'text-accent bg-accent/10 opacity-100 scale-110' : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110'}`}>
          {isSaving ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
        </button>
        <span className={`text-[14px] font-bold w-10 text-center absolute pointer-events-none transition-opacity ${isSaved || isFocused ? 'opacity-0 group-hover:opacity-0' : 'opacity-100 group-hover:opacity-0 text-zinc-400'}`}>
          {(indexNumber + 1).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col truncate justify-center z-10">
        <div className="flex items-center gap-4">
          <span className="text-[24px] font-extrabold tracking-tight text-black dark:text-white truncate group-hover:text-accent transition-colors">{tool.name}</span>
        </div>
        <span className="text-[14px] text-zinc-500 font-medium truncate mt-1">{tool.description}</span>
      </div>

      <div className="hidden md:flex items-center z-10">
        <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">{tool.category}</span>
      </div>

      <div className="hidden md:flex justify-end items-center gap-2 pr-2 z-10 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
        <span className="truncate text-[15px] font-bold">{getDomain(tool.url)}</span>
        <ArrowUpRight />
      </div>

      {/* LA IMAGEN FLOTANTE MÁGICA: Aparece al hacer hover, anclada a la derecha de la fila */}
      <div className="hidden lg:block absolute right-32 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 scale-90 rotate-2 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 transition-all duration-400 origin-center">
        <div className="w-[320px] h-[200px] rounded-[16px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20">
          <img src={tool.imageUrl} alt="" className="w-full h-full object-cover" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl transition-opacity p-4">
      <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight mb-2">Suggest Tool</h2><p className="text-[15px] text-zinc-500 font-medium mb-8">Add a resource to the directory.</p>
        {submitStatus === 'success' ? ( <div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300"><div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-lg mb-5"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><h3 className="text-black dark:text-white font-extrabold text-2xl tracking-tight mb-1">Received!</h3><p className="text-[15px] text-zinc-500">Waiting for curation review.</p></div>
        ) : (
          <form onSubmit={handleCapture}>
            <div className="flex flex-col gap-5 mb-8">
              <input type="text" required placeholder="Tool Name" value={name} onChange={(e) => setName(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 ring-accent transition-all text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-400" />
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-[#1a1a1a] rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all"><GlobeIcon /><input type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-400" /></div>
              <div className="flex items-start gap-3 bg-zinc-100 dark:bg-[#1a1a1a] rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                <div className="mt-0.5"><DescIcon /></div>
                <input type="text" required maxLength={100} placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-400" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 focus:ring-accent transition-all text-[16px] font-bold text-black dark:text-white appearance-none"><option value="Design">Design</option><option value="Development">Development</option><option value="AI Tools">AI Tools</option><option value="Productivity">Productivity</option></select>
            </div>
            {submitStatus === 'error' && <p className="text-red-500 text-[14px] font-bold mb-4 text-center">Server connection failed.</p>}
            <button type="submit" disabled={submitStatus === 'loading'} className="w-full bg-accent text-white text-[18px] font-extrabold tracking-tight py-4 rounded-[16px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg">{submitStatus === 'loading' ? "Sending..." : "Submit to Directory"}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-accent') || '#000000';
    return '#000000';
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
      loadFont('google-fonts-expanded', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Geist+Mono:wght@400;500;700&display=swap');
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
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => { setFocusedIndex(-1); }, [searchQuery, activeCategory, viewMode]);

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
        const fetchedTools = hits.map((tool) => {
          return {
            id: tool.objectID, name: tool.name, category: tool.category, url: tool.url,
            imageUrl: tool.screenshotUrl || "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop",
            description: tool.description || "High-performance platform."
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
    <div className="relative min-h-screen bg-[#f0f0f5] dark:bg-[#050505] transition-colors duration-500 selection:bg-accent selection:text-white pb-40 overflow-x-hidden">

      {/* MAGIA SPATIAL: MESH GRADIENT VIVO DE FONDO */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-accent/20 dark:bg-accent/30 rounded-[100%] blur-[160px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vh] bg-blue-500/10 dark:bg-blue-600/20 rounded-[100%] blur-[160px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      <style>{`
        :root {
          --global-font: ${fontFamily};
        }
        * { font-family: var(--global-font) !important; }
      `}</style>

      {/* NAVBAR SPATIAL DYNAMIC ISLAND */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl bg-white/50 dark:bg-[#111]/50 backdrop-blur-[50px] border border-white/60 dark:border-white/10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex items-center justify-between p-3 transition-all duration-500">
        <div className="flex items-center gap-3 pl-4 pr-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-black to-zinc-700 dark:from-white dark:to-zinc-300 flex items-center justify-center shadow-lg"><div className="w-2.5 h-2.5 bg-white dark:bg-black rounded-full"></div></div>
        </div>

        <button onClick={() => { playSound('woosh'); setIsCommandPaletteOpen(true); }} className="flex-1 flex items-center px-5 py-3 mx-4 bg-white/40 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/80 rounded-[20px] transition-all group border border-black/5 dark:border-white/5 shadow-inner">
          <SearchIcon />
          <span className="ml-3 text-black dark:text-white text-[15px] font-bold tracking-tight text-left flex-1 opacity-70 group-hover:opacity-100 transition-opacity truncate">{searchQuery ? searchQuery : "Search tools or command..."}</span>
          <kbd className="hidden sm:inline-block text-[11px] font-bold px-3 py-1 rounded-[8px] bg-black/10 dark:bg-white/10 text-black dark:text-white opacity-60">⌘K</kbd>
        </button>

        <div className="flex gap-2 pr-1">
          <button onClick={() => { playSound('snap'); setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); }} className="w-12 h-12 rounded-[20px] flex items-center justify-center bg-white/40 dark:bg-black/40 hover:bg-white dark:hover:bg-white/10 text-black dark:text-white transition-all shadow-sm border border-black/5 dark:border-white/5" title="View">{viewMode === 'grid' ? <ListIcon /> : <GridIcon />}</button>
          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="px-5 h-12 rounded-[20px] bg-black text-white dark:bg-white dark:text-black shadow-lg hover:opacity-90 text-[14px] font-bold transition-all flex items-center gap-3 ml-1">
              <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: accentColor }}></div>{user.nickname ? user.nickname : user.email.split('@')[0]}
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="w-12 h-12 ml-1 rounded-[20px] flex items-center justify-center bg-black text-white dark:bg-white dark:text-black shadow-lg hover:scale-105 transition-all"><UserIcon /></button>
          )}
        </div>
      </nav>

      {/* FILTROS FLOTANTES */}
      <div className="pt-[140px] pb-10 flex justify-center w-full z-30 sticky top-0 pointer-events-none">
        <div className="flex gap-3 p-2 rounded-[24px] bg-white/40 dark:bg-black/40 backdrop-blur-[40px] pointer-events-auto overflow-x-auto max-w-[95%] no-scrollbar border border-white/50 dark:border-white/10 shadow-xl">
          {["All", "Design", "Development", "AI Tools", "Productivity"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-[16px] text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'text-white shadow-lg bg-black dark:bg-white dark:text-black scale-105' : 'text-black/60 dark:text-white/60 hover:bg-white/50 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <main className={`relative z-10 max-w-[1600px] mx-auto mt-2 ${viewMode === 'list' ? 'w-full px-4 lg:w-[1000px]' : 'w-[95%]'}`}>
        {isLoading ? ( <div className="flex justify-center items-center py-32 text-black dark:text-white"><svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg></div>
        ) : filteredTools.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[300px] gap-6">
              {filteredTools.map((tool, index) => <BentoCard key={tool.id} tool={tool} user={user} onRequireAuth={() => setIsAuthModalOpen(true)} isFocused={focusedIndex === index} index={index} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredTools.map((tool, index) => <ListCard key={tool.id} tool={tool} user={user} onRequireAuth={() => setIsAuthModalOpen(true)} isFocused={focusedIndex === index} indexNumber={index} />)}
            </div>
          )
        ) : ( <div className="flex flex-col items-center justify-center py-32 text-black/50 dark:text-white/50"><SearchIcon /><p className="mt-4 text-[18px] font-bold">No tools found.</p></div> )}
      </main>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} query={searchQuery} setQuery={setSearchQuery} tools={tools} user={user} onAction={handlePaletteAction} />
      <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} accentColor={accentColor} setAccentColor={setAccentColor} fontFamily={fontFamily} setFontFamily={setFontFamily} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}
