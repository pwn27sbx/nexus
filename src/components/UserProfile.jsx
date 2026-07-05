import React, { useState, useEffect } from 'react';

const UserProfile = ({ isOpen, onClose, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('arsenal'); // 'arsenal' o 'submissions'
  const [arsenal, setArsenal] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('payload-token');
      try {
        // 1. Obtenemos los favoritos del usuario
        const userRes = await fetch(`https://nexus-production-8dca.up.railway.app/api/users/${user.id}`, {
          headers: { 'Authorization': `JWT ${token}` }
        });
        const userData = await userRes.json();
        setArsenal(userData.bookmarks || []);

        // 2. Obtenemos las herramientas que este usuario ha enviado
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

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro desenfocado */}
      <div
        className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel Lateral Minimalista */}
      <div className="fixed top-0 right-0 z-[101] w-full max-w-md h-full bg-white dark:bg-[#0a0a0a] border-l border-black/5 dark:border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Cabecera del Perfil */}
        <div className="px-8 pt-10 pb-6 border-b border-black/5 dark:border-white/5 relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl font-medium text-black dark:text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-black dark:text-white truncate">
            {user?.email}
          </h2>

          {/* Insignia de Nivel Gamificada */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold tracking-wide uppercase">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            {user?.level || 'Explorer'}
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-6 px-8 pt-4 border-b border-black/5 dark:border-white/5">
          <button
            onClick={() => setActiveTab('arsenal')}
            className={`pb-3 text-[13px] font-medium transition-all relative ${activeTab === 'arsenal' ? 'text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
          >
            My Arsenal
            {activeTab === 'arsenal' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-[13px] font-medium transition-all relative ${activeTab === 'submissions' ? 'text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
          >
            My Submissions
            {activeTab === 'submissions' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white rounded-t-full" />}
          </button>
        </div>

        {/* Contenido (Listas) */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10 text-zinc-400">Loading data...</div>
          ) : activeTab === 'arsenal' ? (
            <div className="space-y-4">
              {arsenal.length === 0 ? (
                <p className="text-[13px] text-zinc-500 text-center py-10">Your arsenal is empty. Save tools to access them quickly.</p>
              ) : (
                arsenal.map(tool => (
                  <div key={tool.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-center justify-between group">
                    <span className="text-[13px] font-medium text-black dark:text-white">{tool.name}</span>
                    <a href={tool.url} target="_blank" rel="noreferrer" className="text-[11px] text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">Visit ↗</a>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <p className="text-[13px] text-zinc-500 text-center py-10">You haven't submitted any tools yet.</p>
              ) : (
                submissions.map(tool => (
                  <div key={tool.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-black dark:text-white">{tool.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${tool.status === 'approved' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {tool.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer del Perfil */}
        <div className="p-6 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-3 rounded-xl border border-black/10 dark:border-white/10 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all flex justify-center items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
