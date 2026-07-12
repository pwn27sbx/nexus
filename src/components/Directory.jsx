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
    } catch (e) { }
};

const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const UserIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const GlobeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>);
const HeartIcon = ({ isSaved }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 hover:scale-110"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const GridIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect></svg>);
const ListIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const DescIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>);
const ArrowUpRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>);
const TrophyIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>);
const LayersIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>);

const getDomain = (url) => { try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return ''; } };

const TOP_CATEGORIES = ["All", "Design", "Development", "AI Tools"];
const ALL_CATEGORIES = [
    "Design", "Development", "AI Tools", "Productivity", "Medicine",
    "Accounting", "Engineering", "Entertainment", "Finance",
    "Education", "Marketing", "Utilities", "Crypto", "Security", "Open Source"
];

const CategoriesModal = ({ isOpen, onClose, activeCategory, setActiveCategory }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="w-full max-w-4xl bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-400" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">Explore Hub</h2>
                        <p className="text-[14px] text-zinc-500 font-medium mt-1">Discover tools across all industries.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="px-8 pb-10 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {ALL_CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); playSound('pop'); onClose(); }}
                                className={`p-5 rounded-[20px] flex items-center justify-between transition-all duration-300 ${isActive ? 'bg-accent text-white shadow-lg scale-105' : 'bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/5 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
                            >
                                <span className="text-[16px] font-bold">{cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// LA NUEVA COMMAND PALETTE (Buscador Puro)
const CommandPalette = ({ isOpen, onClose, query, setQuery, tools }) => {
    const inputRef = useRef(null);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);
    useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [isOpen, onClose]);

    if (!isOpen) return null;
    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-2xl p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl w-full max-w-2xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-8 py-6 border-b border-black/5 dark:border-white/5">
                    <SearchIcon />
                    <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search directory..." className="flex-1 bg-transparent border-none outline-none text-black dark:text-white px-5 text-2xl font-bold tracking-tight placeholder:text-zinc-400 dark:placeholder:text-zinc-600" />
                    <kbd className="hidden sm:inline-block text-[12px] font-bold px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-zinc-500">ESC</kbd>
                </div>
                <div className="max-h-[50vh] overflow-y-auto p-4 no-scrollbar">
                    {query ? (
                        filteredTools.length > 0 ? (
                            <div className="mb-2">
                                {filteredTools.map(tool => (
                                    <button key={tool.id} onClick={() => { window.open(tool.url, '_blank'); onClose(); }} className="w-full text-left px-5 py-4 rounded-[20px] hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between group transition-all">
                                        <span className="text-[18px] font-bold text-black dark:text-white group-hover:text-accent">{tool.name}</span><span className="text-[13px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Visit <ArrowUpRight /></span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-zinc-500 font-bold">No results found.</div>
                        )
                    ) : (
                        <div className="py-8 text-center text-zinc-400 font-medium">Type to start searching...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const BentoCard = ({ tool, user, onRequireAuth, isFocused, index }) => {
    const cardRef = useRef(null);
    const numericToolId = Number(tool.id);
    const [isSaved, setIsSaved] = useState(() => user?.bookmarks?.some(b => (typeof b === 'object' ? b.id : b) === numericToolId) || false);
    const [isSaving, setIsSaving] = useState(false);

    const getBentoSpan = (i) => {
        const pattern = i % 7;
        switch (pattern) {
            case 0: return "md:col-span-2 md:row-span-2";
            case 1: return "md:col-span-1 md:row-span-1";
            case 2: return "md:col-span-1 md:row-span-1";
            case 3: return "md:col-span-2 md:row-span-1";
            case 4: return "md:col-span-1 md:row-span-2";
            case 5: return "md:col-span-1 md:row-span-1";
            case 6: return "md:col-span-2 md:row-span-1";
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
        } catch (err) { } finally { setIsSaving(false); }
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
            <button onClick={handleToggleSave} disabled={isSaving} className={`absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 outline-none ${isSaved ? 'bg-white text-accent dark:bg-black opacity-100' : 'bg-black/30 text-white dark:bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black'}`}>
                {isSaving ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg> : <HeartIcon isSaved={isSaved} />}
            </button>

            <img src={tool.imageUrl} alt={tool.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />

            <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
                <span className="text-accent text-[12px] font-extrabold uppercase tracking-widest mb-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">{tool.category}</span>
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tighter leading-none mb-1 group-hover:text-white transition-colors">{tool.name}</h3>
                        <p className="text-white/60 text-[14px] font-medium tracking-tight line-clamp-1 max-w-[80%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">{getDomain(tool.url)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0">
                        <ArrowUpRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        } catch (err) { } finally { setIsSaving(false); }
    };

    return (
        <div
            className={`group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[60px_2.5fr_1fr_1.5fr] gap-6 items-center py-6 px-4 md:px-8 border-b border-black/10 dark:border-white/10 transition-all duration-300 cursor-pointer ${isFocused ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
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
            <div className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl border border-white/20 dark:border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight mb-2">Suggest Tool</h2><p className="text-[15px] text-zinc-500 font-medium mb-8">Add a resource to the directory.</p>
                {submitStatus === 'success' ? (<div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300"><div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-lg mb-5"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><h3 className="text-black dark:text-white font-extrabold text-2xl tracking-tight mb-1">Received!</h3><p className="text-[15px] text-zinc-500">Waiting for curation review.</p></div>
                ) : (
                    <form onSubmit={handleCapture}>
                        <div className="flex flex-col gap-5 mb-8">
                            <input type="text" required placeholder="Tool Name" value={name} onChange={(e) => setName(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-black/5 dark:bg-white/5 border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 ring-accent transition-all text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500" />
                            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all"><GlobeIcon /><input type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500" /></div>
                            <div className="flex items-start gap-3 bg-black/5 dark:bg-white/5 rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                                <div className="mt-0.5"><DescIcon /></div>
                                <input type="text" required maxLength={100} placeholder="Brief description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitStatus === 'loading'} className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500" />
                            </div>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitStatus === 'loading'} className="w-full bg-black/5 dark:bg-white/5 border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 focus:ring-accent transition-all text-[16px] font-bold text-black dark:text-white appearance-none"><option value="Design">Design</option><option value="Development">Development</option><option value="AI Tools">AI Tools</option><option value="Productivity">Productivity</option><option value="Medicine">Medicine</option><option value="Finance">Finance</option></select>
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
            loadFont('google-fonts-expanded', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&family=Geist+Mono:wght@400;500;700&display=swap');
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
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const [tools, setTools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => { setFocusedIndex(-1); }, [searchQuery, activeCategory, viewMode]);

    useEffect(() => {
        if (isModalOpen || isAuthModalOpen || isProfileOpen || isLeaderboardOpen || isCommandPaletteOpen || isCategoryModalOpen) return;
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
    }, [focusedIndex, tools, activeCategory, isModalOpen, isAuthModalOpen, isProfileOpen, isLeaderboardOpen, isCommandPaletteOpen, isCategoryModalOpen]);

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
            try { const res = await fetch('https://nexus-production-8dca.up.railway.app/api/users/me', { headers: { 'Authorization': `JWT ${token}` } }); if (res.ok) { const data = await res.json(); setUser(data.user); } else { localStorage.removeItem('payload-token'); } } catch (err) { }
        }; checkUserSession();
    }, [isAuthModalOpen]);

    const handleLogout = () => { localStorage.removeItem('payload-token'); setUser(null); setIsProfileOpen(false); };

    const handlePaletteAction = (action) => {
        switch (action) {
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
            } catch (error) { } finally { setIsLoading(false); }
        };
        fetchTools();
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [searchQuery]);

    const filteredTools = useMemo(() => tools.filter(tool => activeCategory === "All" || tool.category === activeCategory), [activeCategory, tools]);

    return (
        <div className="relative min-h-screen bg-[#fcfcfc] dark:bg-[#050505] transition-colors duration-500 selection:bg-accent selection:text-white pb-40 overflow-x-hidden">

            {/* MAGIA SPATIAL: MESH GRADIENT VIVO DE FONDO */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vh] bg-accent/10 dark:bg-accent/20 rounded-[100%] blur-[160px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            </div>

            <style>{`
        :root {
          --global-font: ${fontFamily};
        }
        * { font-family: var(--global-font) !important; }
      `}</style>

            {/* HEADER UNIFICADO (EDGE-TO-EDGE) */}
            <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 h-[72px] flex items-center justify-between px-4 md:px-8 transition-colors duration-500">

                {/* PARTE IZQUIERDA: LOGO + CATEGORÍAS */}
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-[12px] bg-black dark:bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer">
                        <div className="w-3 h-3 bg-white dark:bg-black rounded-full"></div>
                    </div>

                    <div className="hidden lg:flex items-center gap-1">
                        {TOP_CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}>{cat}</button>
                        ))}
                        <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-2"></div>
                        <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 rounded-full text-[14px] font-bold text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all flex items-center gap-1.5">
                            More <LayersIcon />
                        </button>
                    </div>
                </div>

                {/* PARTE DERECHA: BUSCADOR + ICONOS + USUARIO */}
                <div className="flex items-center gap-2 md:gap-3">

                    <button onClick={() => { playSound('woosh'); setIsCommandPaletteOpen(true); }} className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-zinc-500 hover:text-black dark:hover:text-white group">
                        <SearchIcon />
                        <span className="hidden md:block text-[14px] font-bold tracking-tight">Search tools...</span>
                        <kbd className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 text-zinc-400 group-hover:text-zinc-500">⌘K</kbd>
                    </button>

                    <button onClick={() => setIsLeaderboardOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all" title="Leaderboard"><TrophyIcon /></button>

                    <button onClick={() => { playSound('snap'); setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); }} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all" title="Toggle View">{viewMode === 'grid' ? <ListIcon /> : <GridIcon />}</button>

                    {/* BOTÓN SUBMIT FUERA DEL MENÚ */}
                    <button onClick={() => setIsModalOpen(true)} className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-white text-[14px] font-bold hover:shadow-[0_0_15px_var(--accent-muted)] hover:scale-105 transition-all ml-1">
                        Submit <PlusIcon />
                    </button>

                    {user ? (
                        <button onClick={() => setIsProfileOpen(true)} className="ml-1 px-4 h-10 rounded-full border-2 border-black/10 dark:border-white/10 text-[14px] font-bold text-black dark:text-white hover:border-black dark:hover:border-white transition-all flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
                            <span className="hidden sm:inline">{user.nickname ? user.nickname : user.email.split('@')[0]}</span>
                        </button>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="ml-1 w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all"><UserIcon /></button>
                    )}
                </div>
            </header>

            <main className={`relative z-10 max-w-[1600px] mx-auto pt-[120px] ${viewMode === 'list' ? 'w-full px-4 lg:w-[1000px]' : 'px-4 md:px-8'}`}>
                {/* BOTÓN EXPLORE CATEGORIES PARA MÓVIL */}
                <div className="flex lg:hidden justify-center mb-6">
                    <button onClick={() => setIsCategoryModalOpen(true)} className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[14px] font-bold shadow-lg flex items-center gap-2">
                        Explore Categories <LayersIcon />
                    </button>
                </div>

                {isLoading ? (<div className="flex justify-center items-center py-32 text-black dark:text-white"><svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg></div>
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
                ) : (<div className="flex flex-col items-center justify-center py-32 text-black/50 dark:text-white/50"><SearchIcon /><p className="mt-4 text-[18px] font-bold">No tools found.</p></div>)}
            </main>

            <CategoriesModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} query={searchQuery} setQuery={setSearchQuery} tools={tools} />
            <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} accentColor={accentColor} setAccentColor={setAccentColor} fontFamily={fontFamily} setFontFamily={setFontFamily} />
            <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        </div>
    );
}
