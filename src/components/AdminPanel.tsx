import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { CloseIcon, CheckIcon, SpinnerIcon } from '../utils/icons';
import { playSound } from '../utils/sounds';

const AdminPanel = ({ isOpen, onClose, user }) => {
  const [pendingTools, setPendingTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  const isAdmin = user?.email?.includes('admin');

  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    const fetchPending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/tools?where[status][equals]=pending&sort=createdAt&limit=20`);
        const data = await res.json();
        setPendingTools(data.docs || []);
      } catch (error) {
        console.error('Failed to load pending tools');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, [isOpen, isAdmin]);

  const handleApprove = async (toolId) => {
    setActionStatus((prev) => ({ ...prev, [toolId]: 'approving' }));
    const token = localStorage.getItem('payload-token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        setPendingTools((prev) => prev.filter((t) => t.id !== toolId));
        playSound('success');
      } else {
        setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      }
    } catch (error) {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
    }
  };

  const handleReject = async (toolId) => {
    const token = localStorage.getItem('payload-token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/${toolId}`, {
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
      });
      if (res.ok) {
        setPendingTools((prev) => prev.filter((t) => t.id !== toolId));
        playSound('snap');
      } else {
        setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      }
    } catch (error) {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-label="Admin panel">
      <div className="w-full max-w-4xl h-full max-h-[850px] bg-[#f5f5f7] dark:bg-[#050505] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
        <div className="px-10 py-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#111]">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tighter text-black dark:text-white flex items-center gap-3">
              Curation Panel
              <span className="px-3 py-1 text-[12px] rounded-full bg-accent text-white font-bold">Admin</span>
            </h2>
            <p className="text-[15px] font-medium text-zinc-500 mt-2">Review and approve pending tool submissions.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-105 transition-transform" aria-label="Close"><CloseIcon size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-4xl">{'\uD83D\uDD12'}</div>
              <p className="text-zinc-500 font-bold text-[20px]">Access Denied</p>
              <p className="text-zinc-400 text-[14px] mt-2">Admin privileges required.</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-20"><SpinnerIcon className="text-black dark:text-white" size={40} /></div>
          ) : pendingTools.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-[14px] text-zinc-500 font-medium mb-2">{pendingTools.length} tool{pendingTools.length !== 1 ? 's' : ''} pending review</p>
              {pendingTools.map((tool) => (
                <div key={tool.id} className="bg-white dark:bg-[#111] rounded-[24px] p-6 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-bold text-black dark:text-white truncate">{tool.name}</h3>
                          <span className="text-[12px] text-zinc-500 font-medium">{tool.category} {tool.tags ? `\u2022 ${tool.tags}` : ''}</span>
                        </div>
                      </div>
                      {tool.description && <p className="text-[14px] text-zinc-500 mt-3 ml-[52px]">{tool.description}</p>}
                      <a href={tool.url} target="_blank" rel="noreferrer" className="text-[13px] text-accent font-bold mt-2 ml-[52px] inline-block hover:underline">{tool.url}</a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleApprove(tool.id)} className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 flex items-center justify-center transition-all" aria-label="Approve" title="Approve">
                        <CheckIcon size={18} />
                      </button>
                      <button onClick={() => handleReject(tool.id)} className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/40 flex items-center justify-center transition-all" aria-label="Reject" title="Reject">
                        <CloseIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-4xl">{'\u2705'}</div>
              <p className="text-zinc-500 font-bold text-[20px]">All caught up!</p>
              <p className="text-zinc-400 text-[14px] mt-2">No pending tools to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
