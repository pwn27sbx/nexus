import React, { useState, useEffect } from 'react';

const LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeaders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('https://nexus-production-8dca.up.railway.app/api/users?sort=-score&limit=10');
        const data = await res.json();
        setLeaders(data.docs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaders();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-4xl h-full max-h-[800px] bg-[#f5f5f7] dark:bg-[#050505] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>

        <div className="px-10 py-10 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#111]">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter text-black dark:text-white">Hall of Fame</h2>
            <p className="text-[15px] font-medium text-zinc-500 mt-2">Top contributors shaping the directory.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20 text-black dark:text-white"><svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg></div>
          ) : (
            <div className="flex flex-col gap-4">
              {leaders.map((leader, index) => {
                const isTop3 = index < 3;
                return (
                  <div key={leader.id} className={`flex items-center gap-6 p-6 rounded-[24px] transition-transform hover:-translate-y-1 ${index === 0 ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xl scale-[1.02]' : isTop3 ? 'bg-white dark:bg-[#111] shadow-lg border border-black/5 dark:border-white/5' : 'bg-transparent border-b border-black/5 dark:border-white/5 rounded-none p-4'}`}>

                    <div className={`w-12 text-center font-extrabold text-2xl ${index === 0 ? 'text-accent' : 'text-zinc-400'}`}>
                      #{index + 1}
                    </div>

                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${index === 0 ? 'bg-white/20 dark:bg-black/20' : 'bg-black/5 dark:bg-white/10'}`}>
                      {(leader.nickname || leader.email || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <h3 className={`text-xl font-bold tracking-tight ${index === 0 ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                        {leader.nickname ? `@${leader.nickname}` : leader.email.split('@')[0]}
                      </h3>
                      <span className={`text-[12px] font-bold uppercase tracking-widest mt-1 inline-block ${index === 0 ? 'text-white/60 dark:text-black/60' : 'text-zinc-500'}`}>
                        {leader.level || 'Explorer'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-extrabold tracking-tighter ${index === 0 ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                        {leader.score || 0}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${index === 0 ? 'text-white/50 dark:text-black/50' : 'text-zinc-400'}`}>Points</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
