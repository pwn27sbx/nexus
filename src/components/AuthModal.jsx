import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Payload genera estas rutas automáticamente
    const endpoint = isLogin ? '/api/users/login' : '/api/users';

    try {
      const response = await fetch(`https://nexus-production-8dca.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Aquí Payload nos devuelve el token y los datos del usuario
        console.log("Usuario autenticado:", data.user);
        // Guardamos el token para mantener la sesión
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 dark:bg-black/40 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 w-[90%] max-w-[400px] rounded-2xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-xl font-semibold text-black dark:text-white tracking-tight mb-1">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-6">
          {isLogin ? 'Enter your details to access your account.' : 'Join the directory to submit and save tools.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white transition-all"
              placeholder="••••••••"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-[12px] text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full mt-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success!' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }}
            className="text-[13px] text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
