import React, { useState, useEffect } from 'react';

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
    } else if (type === 'snap') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    }
  } catch (e) {}
};

const availableFonts = [
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'system', name: 'System', value: "system-ui, -apple-system, sans-serif" },
  { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist', value: "'Geist Mono', monospace" }
];

const accents = [
  { name: 'Monochrome', hex: '#000000', darkHex: '#ffffff' },
  { name: 'Azure', hex: '#3b82f6', darkHex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981', darkHex: '#10b981' },
  { name: 'Cherry', hex: '#ef4444', darkHex: '#ef4444' },
  { name: 'Cyber', hex: '#f59e0b', darkHex: '#f59e0b' }
];

const UserProfile = ({ isOpen, onClose, user, onLogout, accentColor, setAccentColor, fontFamily, setFontFamily }) => {
  const [arsenal, setArsenal] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setNickname(user.nickname || '');
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('payload-token');
      try {
        const userRes = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, { headers: { 'Authorization': `JWT ${token}` } });
        const userData = await userRes.json();
        setArsenal(userData.bookmarks || []);

        const subRes = await fetch(`https://nexus-production-8dca.up.railway.app/api/tools?where[submittedBy][equals]=${user.id}`, { headers: { 'Authorization': `JWT ${token}` } });
        const subData = await subRes.json();
        setSubmissions(subData.docs || []);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchUserData();
  }, [isOpen, user]);

  const handleSaveNickname = async () => {
    if (nickname === user.nickname || nickname.length < 3) return;
    setIsSavingName(true);
    const token = localStorage.getItem('payload-token');
    try {
      const response = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({ nickname }),
      });
      if (response.ok) user.nickname = nickname;
    } catch (error) {} finally { setIsSavingName(false); }
  };

  if (!isOpen) return null;

  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(t => t.status === 'approved').length;

  return (
    <div className="fixed inset-0 z-[300] bg-[#f5f5f7] dark:bg-[#000000] overflow-y-auto animate-in fade-in duration-500">
      {/* Textura Cinematográfica */}
      <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-40 dark:opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-black dark:text-white">Command Center</h1>
          <button onClick={onClose} className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">

          {/* IDENTIDAD (BENTO 1) */}
          <div className="md:col-span-4 bg-white dark:bg-[#111] rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-10 rounded-bl-[100%]"></div>
            <div>
              <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                {(nickname || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <input
                type="text" value={nickname}
                onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onBlur={handleSaveNickname}
                placeholder="Set nickname..."
                className="w-full bg-transparent border-none outline-none text-3xl font-extrabold tracking-tight text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
              <p className="text-zinc-500 font-medium mt-2">{user?.email}</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <span className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full text-[12px] font-bold uppercase tracking-widest text-black dark:text-white">
                {user?.level || 'Explorer'}
              </span>
              <button onClick={() => { onLogout(); onClose(); }} className="text-red-500 font-bold text-[14px] hover:underline underline-offset-4">
                Sign Out
              </button>
            </div>
          </div>

          {/* APARIENCIA: FUENTES Y COLORES (BENTO 2) */}
          <div className="md:col-span-8 bg-white dark:bg-[#111] rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-400 mb-6">Aesthetics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {availableFonts.map(font => (
                  <button
                    key={font.id} onClick={() => { setFontFamily(font.value); playSound('snap'); }}
                    className={`p-4 rounded-[20px] text-center transition-all ${fontFamily === font.value ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-[14px] font-bold">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-400 mb-4">Accent Color</h3>
              <div className="flex gap-4">
                {accents.map(color => (
                  <button
                    key={color.name} onClick={() => { setAccentColor(document.documentElement.classList.contains('dark') ? color.darkHex : color.hex); playSound('pop'); }}
                    className={`w-10 h-10 rounded-full transition-transform ${accentColor === color.hex || accentColor === color.darkHex ? 'scale-125 shadow-xl ring-4 ring-offset-4 ring-offset-white dark:ring-offset-[#111]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: document.documentElement.classList.contains('dark') ? color.darkHex : color.hex, borderColor: color.hex === '#000000' ? '#333' : 'transparent', borderWidth: color.hex === '#000000' ? '1px' : '0' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ARSENAL (BENTO 3) */}
          <div className="md:col-span-8 bg-black dark:bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
            <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-white/50 dark:text-black/50 mb-6 relative z-10">My Arsenal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar">
              {arsenal.length === 0 ? (
                <p className="text-white/60 dark:text-black/60 font-medium">No tools saved yet.</p>
              ) : (
                arsenal.map(tool => (
                  <a key={tool.id} href={tool.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/10 dark:bg-black/5 rounded-[20px] hover:bg-white/20 dark:hover:bg-black/10 transition-colors">
                    <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-8 h-8 rounded-md" />
                    <div>
                      <h4 className="text-white dark:text-black font-bold truncate">{tool.name}</h4>
                      <span className="text-white/50 dark:text-black/50 text-[12px] uppercase tracking-wider">{tool.category}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* ESTADÍSTICAS (BENTO 4) */}
          <div className="md:col-span-4 bg-accent rounded-[32px] p-8 shadow-2xl text-white flex flex-col justify-between">
             <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-white/70 mb-6">Contributions</h3>
             <div>
                <div className="text-7xl font-extrabold tracking-tighter mb-2">{totalSubmissions}</div>
                <p className="text-white/80 font-medium mb-8">Tools submitted to the directory</p>

                <div className="bg-black/20 rounded-[20px] p-5 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Approval Rate</span>
                    <span className="font-bold">{totalSubmissions > 0 ? Math.round((approvedSubmissions/totalSubmissions)*100) : 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${totalSubmissions > 0 ? (approvedSubmissions/totalSubmissions)*100 : 0}%` }}></div>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
