// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const endpoint = isLogin ? '/api/users/login' : '/api/users';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        localStorage.setItem('payload-token', data.token);
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(data.errors?.[0]?.message || 'An error occurred.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.65)',
    borderRadius: '16px',
    padding: '14px 18px',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 600,
    color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(20,15,50,0.85)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Sign in' : 'Create account'}
    >
      {/* Close pill */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
        style={{
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
          border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.95)',
          color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
          backdropFilter: 'blur(16px)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
          zIndex: 10,
        }}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Close
      </button>

      {/* Glass card */}
      <div
        className="animate-scale-in"
        style={{
          width: '90%',
          maxWidth: '420px',
          background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '2rem',
          padding: '36px 32px',
          boxShadow: isDark
            ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)'
            : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          className="font-display"
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
            marginBottom: '28px',
          }}
        >
          {isLogin
            ? 'Enter your details to access your account.'
            : 'Join the directory to submit and save tools.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? 'rgba(200,190,255,0.7)' : 'rgba(60,45,120,0.7)',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? 'rgba(200,190,255,0.7)' : 'rgba(60,45,120,0.7)',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {status === 'error' && (
            <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '14px',
              borderRadius: '16px',
              background: status === 'success'
                ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              boxShadow: status === 'success'
                ? '0 4px 20px rgba(16,185,129,0.35)'
                : '0 4px 20px rgba(124,58,237,0.35)',
              transition: 'all 0.2s ease',
              opacity: status === 'loading' ? 0.6 : 1,
            }}
          >
            {status === 'loading'
              ? 'Processing...'
              : status === 'success'
                ? '✓ Success!'
                : isLogin
                  ? 'Sign In'
                  : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: isDark ? 'rgba(180,165,240,0.6)' : 'rgba(100,80,180,0.6)',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#c084fc' : '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? 'rgba(180,165,240,0.6)' : 'rgba(100,80,180,0.6)'; }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
