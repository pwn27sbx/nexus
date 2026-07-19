import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { CloseIcon, CheckIcon, SpinnerIcon } from '../utils/icons';
import { playSound } from '../utils/sounds';

// ─── Toast Component ───────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-zinc-800';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 ${bgColor} text-white px-5 py-3 rounded-[20px] shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300`}>
      <span>{icon}</span>
      <span className="text-[14px] font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70" aria-label="Dismiss">
        <CloseIcon size={14} />
      </button>
    </div>
  );
};

// ─── Confirm Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onCancel}>
    <div className="bg-white dark:bg-[#151515] rounded-[24px] p-8 max-w-sm w-full shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-3xl">🗑️</div>
        <h3 className="text-xl font-extrabold text-black dark:text-white mb-2">Confirm Rejection</h3>
        <p className="text-[14px] text-zinc-500 font-medium">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={isLoading} className="flex-1 py-3 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white font-bold text-[14px] hover:bg-black/10 dark:hover:bg-white/20 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold text-[14px] hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading ? <><SpinnerIcon size={16} /> Rejecting...</> : 'Reject Tool'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main AdminPanel ────────────────────────────────────────────────────
const AdminPanel = ({ isOpen, onClose, user }) => {
  const [pendingTools, setPendingTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  // Toast state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // Confirm dialog state
  const [confirmReject, setConfirmReject] = useState(null);

  const isAdmin = user?.role === 'admin';

  const fetchPending = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools?where[status][equals]=pending&sort=createdAt&limit=20&page=${pageNum}`);
      const data = await res.json();
      const tools = data.docs || [];
      if (append) {
        setPendingTools((prev) => [...prev, ...tools]);
      } else {
        setPendingTools(tools);
      }
      setHasMore(data.hasNextPage || false);
      setPage(pageNum);
    } catch (error) {
      addToast('Failed to load pending tools', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    fetchPending(1);
  }, [isOpen, isAdmin, fetchPending]);

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
        addToast('Tool approved successfully!', 'success');
      } else {
        setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
        addToast('Failed to approve tool', 'error');
      }
    } catch (error) {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      addToast('Network error', 'error');
    }
  };

  const handleReject = async (toolId) => {
    setConfirmReject(toolId);
  };

  const confirmRejectAction = async () => {
    const toolId = confirmReject;
    if (!toolId) return;
    setConfirmReject(null);
    setActionStatus((prev) => ({ ...prev, [toolId]: 'rejecting' }));
    const token = localStorage.getItem('payload-token');
    try {
      // Change status to 'rejected' instead of DELETE
      const res = await fetch(`${API_BASE_URL}/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        setPendingTools((prev) => prev.filter((t) => t.id !== toolId));
        playSound('snap');
        addToast('Tool rejected', 'info');
      } else {
        setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
        addToast('Failed to reject tool', 'error');
      }
    } catch (error) {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      addToast('Network error', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}

      {/* Confirm dialog */}
      {confirmReject && (
        <ConfirmDialog
          message="Are you sure? This tool will be rejected and won't appear in the directory."
          onConfirm={confirmRejectAction}
          onCancel={() => setConfirmReject(null)}
          isLoading={actionStatus[confirmReject] === 'rejecting'}
        />
      )}

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
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-4xl">{'🔒'}</div>
                <p className="text-zinc-500 font-bold text-[20px]">Access Denied</p>
                <p className="text-zinc-400 text-[14px] mt-2">Admin privileges required.</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20"><SpinnerIcon className="text-black dark:text-white" size={40} /></div>
            ) : pendingTools.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[14px] text-zinc-500 font-medium">{pendingTools.length} tool{pendingTools.length !== 1 ? 's' : ''} pending review</p>
                  {page > 1 && (
                    <button
                      onClick={() => fetchPending(1)}
                      className="text-[12px] text-accent font-bold hover:underline"
                      aria-label="Refresh list"
                    >
                      ← Back to first page
                    </button>
                  )}
                </div>
                {pendingTools.map((tool) => {
                  const status = actionStatus[tool.id];
                  const isBusy = status === 'approving' || status === 'rejecting';
                  return (
                    <div key={tool.id} className={`bg-white dark:bg-[#111] rounded-[24px] p-6 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all ${isBusy ? 'opacity-70' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              <img src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`} alt="" className="w-6 h-6" aria-hidden="true" loading="lazy" />
                            </div>
                            <div>
                              <h3 className="text-[18px] font-bold text-black dark:text-white truncate">{tool.name}</h3>
                              <span className="text-[12px] text-zinc-500 font-medium">{tool.category} {tool.tags ? `• ${tool.tags}` : ''}</span>
                            </div>
                          </div>
                          {tool.description && <p className="text-[14px] text-zinc-500 mt-3 ml-[52px]">{tool.description}</p>}
                          <a href={tool.url} target="_blank" rel="noreferrer" className="text-[13px] text-accent font-bold mt-2 ml-[52px] inline-block hover:underline">{tool.url}</a>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {status === 'error' && (
                            <span className="text-[10px] font-bold text-red-500 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">Error</span>
                          )}
                          <button
                            onClick={() => handleApprove(tool.id)}
                            disabled={isBusy}
                            className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 flex items-center justify-center transition-all disabled:opacity-40"
                            aria-label="Approve"
                            title="Approve"
                          >
                            {status === 'approving' ? <SpinnerIcon size={16} /> : <CheckIcon size={18} />}
                          </button>
                          <button
                            onClick={() => handleReject(tool.id)}
                            disabled={isBusy}
                            className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/40 flex items-center justify-center transition-all disabled:opacity-40"
                            aria-label="Reject"
                            title="Reject"
                          >
                            {status === 'rejecting' ? <SpinnerIcon size={16} /> : <CloseIcon size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => fetchPending(page + 1, true)}
                      disabled={isLoadingMore}
                      className="px-8 py-3 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white font-bold text-[14px] hover:bg-black/10 dark:hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                      aria-label="Load more tools"
                    >
                      {isLoadingMore ? (
                        <><SpinnerIcon size={16} /> Loading...</>
                      ) : (
                        'Load More Tools'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-4xl">{'✅'}</div>
                <p className="text-zinc-500 font-bold text-[20px]">All caught up!</p>
                <p className="text-zinc-400 text-[14px] mt-2">No pending tools to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
