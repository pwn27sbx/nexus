import React, { useState, useEffect } from 'react';

// Añadimos accentColor y setAccentColor a las propiedades que recibe
const UserProfile = ({ isOpen, onClose, user, onLogout, accentColor, setAccentColor }) => {
  const [activeTab, setActiveTab] = useState('arsenal');
  const [arsenal, setArsenal] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [nickname, setNickname] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  // Paleta de colores Premium
  const accents = [
    { name: 'Cherry', hex: '#ff8787' },
    { name: 'Emerald', hex: '#4ade80' },
    { name: 'Azure', hex: '#3b82f6' },
    { name: 'Amethyst', hex: '#c084fc' },
    { name: 'Cyber', hex: '#facc15' }
  ];

  useEffect(() => {
    if (!isOpen || !user) return;
    setNickname(user.nickname || '');
    setNameError('');

    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('payload-token');
      try {
        const userRes = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, {
          headers: { 'Authorization': `JWT ${token}` }
        });
        const userData = await userRes.json();
        setArsenal(userData.bookmarks || []);

        const subRes = await fetch(`https://nexus-production-8dca.up.railway.app/api/tools?where[submittedBy][equals]=${user.id}`, {
          headers: { 'Authorization': `JWT ${token}` }
        });
        const subData = await subRes.json();
        setSubmissions(subData.docs || []);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isOpen, user]);

  const handleSaveNickname = async () => {
    if (nickname === user.nickname) return;
    if (nickname.length < 3) {
      setNameError('Nickname must be at least 3 characters.');
      return;
    }

    setIsSavingName(true);
    setNameError('');
    const token = localStorage.getItem('payload-token');

    try {
      const response = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`
        },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();

      if (response.ok) {
        user.nickname = nickname;
      } else {
        if (data.errors && data.errors[0]?.message.includes('unique')) {
          setNameError('This nickname is already taken.');
        } else {
          setNameError('Could not update nickname.');
        }
        setNickname(user.nickname || '');
      }
    } catch (error) {
      setNameError('Network error. Try again.');
      setNickname(user.nickname || '');
    } finally {
      setIsSavingName(false);
    }
  };

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch(e) { return ''; }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed top-0 right-0 z-[101] w-full max-w-md h-full bg-[#fafafa] dark:bg-[#050505] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        <div className="px-8 pt-12 pb-8 bg-white dark:bg-[#0a0a0a] border-b border-black/5 dark:border-white/5 relative flex flex-col items-center text-center">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-all active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border-2 border-white dark:border-black shadow-md flex items-center justify-center mb-5 relative">
            <span className="text-3xl font-medium text-zinc-800 dark:text-zinc-200">
              {(nickname || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
            {/* El indicador online ahora usa el color de acento */}
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white dark:border-black rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>

          <div className="relative group flex flex-col items-center justify-center w-full max-w-[240px]">
            <div className="flex items-center relative w-full">
              <span className="absolute left-2 text-zinc-400 font-medium opacity-0 group-focus-within:opacity-100 transition-opacity">@</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setNameError('');
                }}
                onBlur={handleSaveNickname}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                placeholder="Set a nickname..."
                className="w-full text-center text-2xl font-bold tracking-tight text-black dark:text-white bg-transparent border-b-2 border-transparent focus:border-black/10 dark:focus:border-white/10 hover:border-black/5 dark:hover:border-white/5 outline-none transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-800 px-8 py-1"
              />
              {isSavingName && <div className="absolute right-2 w-4 h-4 border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white rounded-full animate-spin"></div>}
            </div>

            {/* Fila de Colores de Acento */}
            <div className="flex items-center justify-center gap-3.5 mt-5">
              {accents.map(color => (
                <button
                  key={color.name}
                  onClick={() => setAccentColor(color.hex)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 focus:outline-none ${accentColor === color.hex ? 'scale-125 ring-2 ring-offset-2 ring-black/10 dark:ring-white/20 dark:ring-offset-[#0a0a0a]' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            {nameError && (
              <p className="text-[#ff8787] text-[11px] font-medium mt-3 animate-in fade-in slide-in-from-top-1">{nameError}</p>
            )}
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10 transition-colors duration-300" style={{ backgroundColor: accentColor }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span className="text-[10px] font-extrabold tracking-widest uppercase mt-px">{user?.level || 'Explorer'}</span>
          </div>
        </div>

        <div className="flex gap-8 px-8 pt-6 bg-[#fafafa] dark:bg-[#050505]">
          <button onClick={() => setActiveTab('arsenal')} className={`pb-4 text-[14px] font-semibold transition-all relative ${activeTab === 'arsenal' ? 'text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
            My Arsenal
            {activeTab === 'arsenal' && <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full transition-colors duration-300" style={{ backgroundColor: accentColor }} />}
          </button>
          <button onClick={() => setActiveTab('submissions')} className={`pb-4 text-[14px] font-semibold transition-all relative ${activeTab === 'submissions' ? 'text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
            My Submissions
            {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full transition-colors duration-300" style={{ backgroundColor: accentColor }} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar bg-[#fafafa] dark:bg-[#050505]">
          {isLoading ? (
            <div className="flex justify-center py-20 text-zinc-400">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg>
            </div>
          ) : activeTab === 'arsenal' ? (
            <div className="space-y-3">
              {arsenal.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg></div>
                  <p className="text-[13px] text-zinc-500 font-medium">Your arsenal is empty.</p>
                </div>
              ) : (
                arsenal.map(tool => (
                  <a key={tool.id} href={tool.url} target="_blank" rel="noreferrer" className="block p-3 rounded-2xl bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#fafafa] dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-6 h-6 object-contain" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors leading-tight">{tool.name}</span>
                          <span className="text-[12px] font-medium text-zinc-400 mt-0.5">{getDomain(tool.url)}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-[#161616] flex items-center justify-center text-zinc-400 transition-colors shrink-0 hover-bg-accent hover:text-white dark:hover-bg-accent dark:hover:text-black">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>
                  <p className="text-[13px] text-zinc-500 font-medium">You haven't submitted any tools yet.</p>
                </div>
              ) : (
                submissions.map(tool => (
                  <div key={tool.id} className="p-3 rounded-2xl bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#fafafa] dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-6 h-6 object-contain opacity-50 grayscale" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-zinc-900 dark:text-white leading-tight">{tool.name}</span>
                          <span className="text-[12px] font-medium text-zinc-400 mt-0.5">{getDomain(tool.url)}</span>
                        </div>
                      </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md ${tool.status === 'approved' ? 'bg-[#e8f5e9] text-[#2e7d32] dark:bg-[#1b5e20]/30 dark:text-[#4caf50]' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {tool.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-3.5 rounded-xl border-2 border-black/5 dark:border-white/5 text-[13px] font-bold text-zinc-500 hover:text-red-500 hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex justify-center items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            SIGN OUT
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
