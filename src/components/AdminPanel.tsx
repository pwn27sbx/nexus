import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '@nanostores/react';
import { isAdminPanelOpen } from '../stores/modals';
import { API_BASE_URL } from '../utils/constants';
import { CloseIcon, CheckIcon, SpinnerIcon } from '../utils/icons';
import { playSound } from '../utils/sounds';
import type { Tool } from '../types';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

// ─── Toast Component ───────────────────────────────────────────────────
const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgGradients: Record<string, string> = {
    success: 'linear-gradient(135deg, #10b981, #14b8a6)',
    error: 'linear-gradient(135deg, #ef4444, #f43f5e)',
    info: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  };
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] animate-fade-up"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: bgGradients[type] || bgGradients.info,
        color: 'white',
        padding: '14px 20px',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 700 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: '6px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          opacity: 0.7,
        }}
        aria-label="Dismiss"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
};

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const isDark =
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onCancel}
    >
      <div
        className="animate-scale-in"
        style={{
          maxWidth: '380px',
          width: '100%',
          background: isDark ? 'rgba(18,16,40,0.82)' : 'rgba(255,255,255,0.52)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '2rem',
          padding: '32px',
          boxShadow: isDark ? '0 20px 56px rgba(0,0,0,0.55)' : '0 20px 56px rgba(80,60,180,0.14)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(244,63,94,0.15))',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '26px',
          }}
        >
          🗑️
        </div>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
            marginBottom: '6px',
          }}
        >
          Confirm Rejection
        </h3>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
            marginBottom: '24px',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
              color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #f43f5e)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {isLoading ? (
              <>
                <SpinnerIcon size={16} /> Rejecting...
              </>
            ) : (
              'Reject Tool'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminPanel ────────────────────────────────────────────────────
const AdminPanel = () => {
  const { user } = useAuth();
  const isOpen = useStore(isAdminPanelOpen);
  const setIsAdminPanelOpen = isAdminPanelOpen.set;
  const onClose = () => setIsAdminPanelOpen(false);
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    toolId: string | number | null;
    type: 'approve' | 'reject' | null;
  }>({ isOpen: false, toolId: null, type: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [actionStatus, setActionStatus] = useState<Record<string | number, string>>({});
  const isDark =
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const isAdmin = user?.role === 'admin' || user?.email?.includes('@admin');

  const fetchPending = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/tools?where[status][equals]=pending&sort=createdAt&limit=20&page=${pageNum}`
        );
        const data = await res.json();
        const tools = data.docs || [];
        if (append) {
          setPendingTools((prev) => [...prev, ...tools]);
        } else {
          setPendingTools(tools);
        }
        setHasMore(data.hasNextPage || false);
        setPage(pageNum);
      } catch {
        addToast('Failed to load pending tools', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    fetchPending(1);
  }, [isOpen, isAdmin, fetchPending]);

  const handleApprove = async (toolId: string | number) => {
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
    } catch {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      addToast('Network error', 'error');
    }
  };

  const handleReject = async (toolId: string | number) => {
    setConfirmDialog({ isOpen: true, toolId, type: 'reject' });
  };

  const confirmRejectAction = async () => {
    const toolId = confirmDialog.toolId;
    if (!toolId) return;
    setIsProcessing(true);
    setActionStatus((prev) => ({ ...prev, [toolId]: 'rejecting' }));
    const token = localStorage.getItem('payload-token');
    try {
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
    } catch {
      setActionStatus((prev) => ({ ...prev, [toolId]: 'error' }));
      addToast('Network error', 'error');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ isOpen: false, toolId: null, type: null });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Toast notifications */}
      {toasts.map((t: ToastMessage) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
        />
      ))}

      {/* Confirm dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          message="Are you sure? This tool will be rejected and won't appear in the directory."
          onConfirm={confirmRejectAction}
          onCancel={() => setConfirmDialog({ isOpen: false, toolId: null, type: null })}
          isLoading={isProcessing}
        />
      )}

      <div
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-10"
        style={{
          background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Admin panel"
      >
        {/* Close pill */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
          style={{
            background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.18)'
              : '1px solid rgba(255,255,255,0.95)',
            color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
            backdropFilter: 'blur(16px)',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>

        <div
          className="animate-scale-in"
          style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '85vh',
            background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.09)'
              : '1px solid rgba(255,255,255,0.62)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '2rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark
              ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)'
              : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '28px 32px 20px',
              borderBottom: isDark
                ? '1px solid rgba(255,255,255,0.07)'
                : '1px solid rgba(255,255,255,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2
                className="font-display"
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: isDark ? 'rgba(240,235,255,0.97)' : 'rgba(10,8,30,0.90)',
                  letterSpacing: '-0.025em',
                }}
              >
                Curation Panel
              </h2>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}
              >
                Admin
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
                marginTop: '6px',
              }}
            >
              Review and approve pending tool submissions.
            </p>
          </div>

          {/* Content */}
          <div
            className="no-scrollbar"
            style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}
          >
            {!isAdmin ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    fontSize: '28px',
                  }}
                >
                  🔒
                </div>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)',
                  }}
                >
                  Access Denied
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                    marginTop: '6px',
                  }}
                >
                  Admin privileges required.
                </p>
              </div>
            ) : isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <SpinnerIcon style={{ color: isDark ? '#c084fc' : '#7c3aed' }} size={36} />
              </div>
            ) : pendingTools.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
                    }}
                  >
                    {pendingTools.length} tool{pendingTools.length !== 1 ? 's' : ''} pending review
                  </p>
                  {page > 1 && (
                    <button
                      onClick={() => fetchPending(1)}
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isDark ? '#c084fc' : '#7c3aed',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
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
                    <div
                      key={tool.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '14px',
                        padding: '18px 20px',
                        borderRadius: '20px',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.07)'
                          : '1px solid rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.2s ease',
                        opacity: isBusy ? 0.6 : 1,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '12px',
                              background: isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(255,255,255,0.7)',
                              border: isDark
                                ? '1px solid rgba(255,255,255,0.08)'
                                : '1px solid rgba(255,255,255,0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                              alt=""
                              style={{ width: '22px', height: '22px' }}
                              aria-hidden="true"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h3
                              style={{
                                fontSize: '15px',
                                fontWeight: 700,
                                color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tool.name}
                            </h3>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: isDark ? 'rgba(180,165,235,0.55)' : 'rgba(80,60,140,0.5)',
                              }}
                            >
                              {tool.category} {tool.tags ? `• ${tool.tags}` : ''}
                            </span>
                          </div>
                        </div>
                        {tool.description && (
                          <p
                            style={{
                              fontSize: '13px',
                              color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                              marginTop: '8px',
                              marginLeft: '48px',
                            }}
                          >
                            {tool.description}
                          </p>
                        )}
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: isDark ? '#c084fc' : '#7c3aed',
                            marginTop: '6px',
                            marginLeft: '48px',
                            display: 'inline-block',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tool.url}
                        </a>
                      </div>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                      >
                        {status === 'error' && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#ef4444',
                              padding: '3px 8px',
                              borderRadius: '100px',
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.2)',
                            }}
                          >
                            Error
                          </span>
                        )}
                        <button
                          onClick={() => handleApprove(tool.id)}
                          disabled={isBusy}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            background: 'rgba(16,185,129,0.12)',
                            color: '#10b981',
                            opacity: isBusy ? 0.4 : 1,
                          }}
                          aria-label="Approve"
                          title="Approve"
                        >
                          {status === 'approving' ? (
                            <SpinnerIcon size={16} />
                          ) : (
                            <CheckIcon size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(tool.id)}
                          disabled={isBusy}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            background: 'rgba(239,68,68,0.12)',
                            color: '#ef4444',
                            opacity: isBusy ? 0.4 : 1,
                          }}
                          aria-label="Reject"
                          title="Reject"
                        >
                          {status === 'rejecting' ? (
                            <SpinnerIcon size={16} />
                          ) : (
                            <CloseIcon size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Load More */}
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px' }}>
                    <button
                      onClick={() => fetchPending(page + 1, true)}
                      disabled={isLoadingMore}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.1)'
                          : '1px solid rgba(255,255,255,0.85)',
                        color: isDark ? 'rgba(240,235,255,0.85)' : 'rgba(15,10,40,0.8)',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: isLoadingMore ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      aria-label="Load more tools"
                    >
                      {isLoadingMore ? (
                        <>
                          <SpinnerIcon size={16} /> Loading...
                        </>
                      ) : (
                        'Load More Tools'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    fontSize: '28px',
                  }}
                >
                  ✅
                </div>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)',
                  }}
                >
                  All caught up!
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                    marginTop: '6px',
                  }}
                >
                  No pending tools to review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
