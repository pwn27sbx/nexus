import React, { useState, useEffect } from 'react';

const LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Traemos el Top 10 de usuarios ordenados por mayor cantidad de aprobadas
        // Solo mostramos a quienes tengan al menos 1 aportación
        const response = await fetch('https://nexus-production-8dca.up.railway.app/api/users?sort=-approvedCount&limit=10&where[approvedCount][greater_than]=0');
        const data = await response.json();
        setLeaders(data.docs || []);
      } catch (error) {
        console.error("Error cargando ranking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 w-[90%] max-w-md rounded-[24px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">

        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-all active:scale-95">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/10 dark:shadow-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Top Contributors</h2>
          <p className="text-[13px] text-zinc-500 mt-1">The makers curating the best tools.</p>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
          {isLoading ? (
            <div className="flex justify-center py-10 text-zinc-400">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-zinc-500">No contributors yet. Be the first!</div>
          ) : (
            leaders.map((user, index) => {
              // Estilos especiales para el Top 3
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isFirst ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' : 'bg-[#fafafa] dark:bg-[#111] border-black/5 dark:border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${isFirst ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black' : isSecond ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : isThird ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                      #{index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[14px] font-bold ${isFirst ? 'text-white dark:text-black' : 'text-zinc-900 dark:text-white'}`}>
                        {user.nickname ? `@${user.nickname}` : user.email.split('@')[0]}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isFirst ? 'text-white/70 dark:text-black/60' : 'text-zinc-400'}`}>
                        {user.level}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isFirst ? 'bg-white/10 dark:bg-black/5' : 'bg-white dark:bg-black border border-black/5 dark:border-white/5 shadow-sm'}`}>
                    <span className={`text-[14px] font-extrabold ${isFirst ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>{user.approvedCount}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
