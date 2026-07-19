import React, { useState, useEffect } from 'react';
import { API_BASE_URL, ACCENTS } from '../utils/constants';
import { playSound } from '../utils/sounds';

const availableFonts = [
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'system', name: 'System', value: "system-ui, -apple-system, sans-serif" },
  { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist Mono', value: "'Geist Mono', monospace" },
];

const UserProfile = ({
  isOpen,
  onClose,
  user,
  onLogout,
  accentColor,
  setAccentColor,
  fontFamily,
  setFontFamily,
}) => {
  const [arsenal, setArsenal] = useState([]);
  const [collections, setCollections] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);

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
    if (nickname === user.nickname || nickname.length < 3) return;
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
      if (response.ok) user.nickname = nickname;
    } catch (error) {
      // Silently fail
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
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

  if (!isOpen) return null;

  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter((t) => t.status === 'approved').length;

  return (
    <div className="fixed inset-0 z-[300] bg-[#f5f5f7] dark:bg-[#000000] overflow-y-auto animate-in fade-in duration-500 pb-32">
      {/* Noise Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30 dark:opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-black dark:text-white">
            Command Center
          </h1>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform"
            aria-label="Close profile"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
          {/* IDENTITY */}
          <div className="md:col-span-4 bg-white dark:bg-[#111] rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-10 rounded-bl-[100%]" />
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <svg className="animate-spin h-8 w-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
              </div>
            ) : (
              <div>
                <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
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
                  className="w-full bg-transparent border-none outline-none text-3xl font-extrabold tracking-tight text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <p className="text-zinc-500 font-medium mt-2">{user?.email}</p>
              </div>
            )}
            <div className="mt-12 flex items-center justify-between">
              <span className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full text-[12px] font-bold uppercase tracking-widest text-black dark:text-white">
                {user?.level || 'Explorer'}
              </span>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-red-500 font-bold text-[14px] hover:underline underline-offset-4"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* APPEARANCE */}
          <div className="md:col-span-8 bg-white dark:bg-[#111] rounded-[32px] p-8 shadow-2xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-400 mb-6">
                Aesthetics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {availableFonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      setFontFamily(font.value);
                      playSound('snap');
                    }}
                    className={`p-4 rounded-[20px] text-center transition-all duration-300 ${
                      fontFamily === font.value
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                        : 'bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    style={{ fontFamily: font.value }}
                    aria-label={`Font: ${font.name}`}
                  >
                    <span className="text-[15px] font-bold tracking-tight">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-400 mb-4">
                Accent Color
              </h3>
              <div className="flex gap-4">
                {ACCENTS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      const isDark = document.documentElement.classList.contains('dark');
                      setAccentColor(isDark ? color.darkHex : color.hex);
                      playSound('pop');
                    }}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      accentColor === color.hex || accentColor === color.darkHex
                        ? 'scale-125 shadow-xl ring-4 ring-offset-4 ring-offset-white dark:ring-offset-[#111]'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: document.documentElement.classList.contains('dark')
                        ? color.darkHex
                        : color.hex,
                      borderColor:
                        color.hex === '#000000' ? '#333' : 'transparent',
                      borderWidth: color.hex === '#000000' ? '1px' : '0',
                    }}
                    aria-label={`Accent: ${color.name}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111] rounded-[24px] p-6 shadow-lg border border-black/5 dark:border-white/5">
              <p className="text-3xl font-extrabold text-black dark:text-white">{arsenal.length}</p>
              <p className="text-[13px] text-zinc-500 font-medium mt-1">Saved Tools</p>
            </div>
            <div className="bg-white dark:bg-[#111] rounded-[24px] p-6 shadow-lg border border-black/5 dark:border-white/5">
              <p className="text-3xl font-extrabold text-black dark:text-white">{collections.length}</p>
              <p className="text-[13px] text-zinc-500 font-medium mt-1">Collections</p>
            </div>
            <div className="bg-white dark:bg-[#111] rounded-[24px] p-6 shadow-lg border border-black/5 dark:border-white/5">
              <p className="text-3xl font-extrabold text-accent">{approvedSubmissions}</p>
              <p className="text-[13px] text-zinc-500 font-medium mt-1">Approved</p>
            </div>
            <div className="bg-white dark:bg-[#111] rounded-[24px] p-6 shadow-lg border border-black/5 dark:border-white/5">
              <p className="text-3xl font-extrabold text-black dark:text-white">{totalSubmissions}</p>
              <p className="text-[13px] text-zinc-500 font-medium mt-1">Submitted</p>
            </div>
          </div>

          {/* REST OF THE LIBRARY MANAGER */}
          <div className="md:col-span-12 bg-white dark:bg-[#111] rounded-[32px] p-8 md:p-10 shadow-2xl border border-black/5 dark:border-white/5 min-h-[400px]">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
              </div>
            ) : !activeFolder ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                    My Library
                  </h3>
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-full text-[14px] font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Folder
                  </button>
                </div>

                {isCreatingFolder && (
                  <form
                    onSubmit={handleCreateFolder}
                    className="mb-8 flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-[20px] animate-in slide-in-from-top-4"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="flex-1 bg-transparent outline-none text-[18px] font-bold text-black dark:text-white placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingFolder(false)}
                      className="px-4 py-2 text-zinc-500 font-bold hover:text-black dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-accent text-white rounded-full font-bold shadow-md"
                    >
                      Create
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                  <div
                    onClick={() => setActiveFolder('all')}
                    className="group cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-full aspect-square bg-black/5 dark:bg-white/5 rounded-[28px] p-3 grid grid-cols-2 grid-rows-2 gap-2 mb-3 shadow-inner group-hover:scale-105 transition-transform duration-300 border border-black/5 dark:border-white/5">
                      {arsenal.slice(0, 4).map((tool, i) => (
                        <img
                          key={i}
                          src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                          alt=""
                          className="w-full h-full object-cover rounded-[10px] shadow-sm bg-white dark:bg-[#222]"
                        />
                      ))}
                    </div>
                    <span className="text-[14px] font-bold text-black dark:text-white">All Saved</span>
                    <span className="text-[12px] text-zinc-500 font-medium">{arsenal.length} items</span>
                  </div>

                  {collections.map((folder, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFolder(folder)}
                      className="group cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-full aspect-square bg-black/5 dark:bg-white/5 rounded-[28px] p-3 grid grid-cols-2 grid-rows-2 gap-2 mb-3 shadow-inner group-hover:scale-105 transition-transform duration-300 border border-black/5 dark:border-white/5">
                        {folder.tools && folder.tools.length > 0
                          ? folder.tools.slice(0, 4).map((tool, i) => (
                              <img
                                key={i}
                                src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                                alt=""
                                className="w-full h-full object-cover rounded-[10px] shadow-sm bg-white dark:bg-[#222]"
                              />
                            ))
                          : Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className="rounded-[10px] bg-black/5 dark:bg-white/5"
                              />
                            ))}
                      </div>
                      <span className="text-[14px] font-bold text-black dark:text-white">{folder.name}</span>
                      <span className="text-[12px] text-zinc-500 font-medium">
                        {folder.tools ? folder.tools.length : 0} items
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <button
                  onClick={() => setActiveFolder(null)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white font-bold mb-6 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Library
                </button>

                <h3 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mb-8">
                  {activeFolder === 'all' ? 'All Saved Tools' : activeFolder.name}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(() => {
                    const toolsToShow =
                      activeFolder === 'all' ? arsenal : activeFolder.tools || [];
                    if (toolsToShow.length === 0)
                      return (
                        <div className="col-span-full text-center py-16">
                          <div className="w-16 h-16 mx-auto rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <p className="text-zinc-500 font-bold text-[18px]">This folder is empty.</p>
                          <p className="text-zinc-400 text-[14px] mt-2">
                            Save tools from the directory to see them here.
                          </p>
                        </div>
                      );

                    return toolsToShow.map((tool) => (
                      <a
                        key={tool.id}
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-[24px] transition-colors border border-black/5 dark:border-white/5 group"
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                          alt=""
                          className="w-10 h-10 rounded-[10px] shadow-sm bg-white"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-black dark:text-white font-bold tracking-tight truncate group-hover:text-accent transition-colors">
                            {tool.name}
                          </h4>
                          <span className="text-zinc-500 text-[11px] uppercase tracking-widest">
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
    </div>
  );
};

export default UserProfile;
