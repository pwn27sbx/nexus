import React, { useState, useEffect } from 'react';

// Ícono de corona para el Top 1
const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 drop-shadow-sm">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
  </svg>
);

const LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
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

  // Función para dar color a los rangos al estilo Monkeytype
  const getLevelStyle = (level) => {
    switch(level) {
      case 'Master Curator':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
      case 'Expert Curator':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'Contributor':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity p-4">
      {/* Modal ensanchado a max-w-3xl para dar respiro a la tabla */}
      <div className="bg-white dark:bg-[#0f0f11] border border-black/10 dark:border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">

        {/* Botón de cierre discreto */}
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Cabecera Estilo Dashboard */}
        <div className="px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
            All-time Contributors Leaderboard
          </h2>
          <p className="text-[13px] text-zinc-500 mt-1 font-mono">
            Users must have at least 1 approved tool to be placed on the leaderboard.
          </p>
        </div>

        {/* Tabla Estilo Monkeytype */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="w-full min-w-[500px]">

            {/* Cabeceras de Columna */}
            <div className="grid grid-cols-[60px_1fr_120px] gap-4 px-8 py-3 border-b border-black/5 dark:border-white/5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              <div className="text-center">#</div>
              <div>Maker</div>
              <div className="text-right">Approved</div>
            </div>

            {/* Filas de Datos */}
            <div className="py-2">
              {isLoading ? (
                <div className="flex justify-center py-20 text-zinc-400">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg>
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-20 text-[13px] text-zinc-500 font-mono">No data available.</div>
              ) : (
                leaders.map((user, index) => {
                  const isFirst = index === 0;
                  const nicknameDisplay = user.nickname ? `@${user.nickname}` : user.email.split('@')[0];

                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-[60px_1fr_120px] gap-4 px-8 py-3 items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-default"
                    >
                      {/* Columna 1: Posición */}
                      <div className="flex justify-center items-center font-mono text-[13px]">
                        {isFirst ? (
                          <CrownIcon />
                        ) : (
                          <span className={`${index < 3 ? 'text-black dark:text-white font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Columna 2: Usuario e Insignia */}
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                          {nicknameDisplay.charAt(nicknameDisplay.startsWith('@') ? 1 : 0).toUpperCase()}
                        </div>
                        <span className={`text-[14px] font-medium transition-colors ${isFirst ? 'text-black dark:text-white font-bold' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`}>
                          {nicknameDisplay}
                        </span>

                        {/* Insignia de Nivel tipo Pill */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${getLevelStyle(user.level)}`}>
                          {user.level === 'Master Curator' && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
                          {user.level}
                        </span>
                      </div>

                      {/* Columna 3: Contador (Monoespaciado) */}
                      <div className={`text-right font-mono text-[14px] ${isFirst ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`}>
                        {user.approvedCount.toString().padStart(2, '0')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardModal;
