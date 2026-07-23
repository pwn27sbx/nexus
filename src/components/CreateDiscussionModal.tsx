import React, { useState } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: any;
}

const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  isDark,
  user,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !summary) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('payload-token')}`,
        },
        body: JSON.stringify({
          title,
          category,
          summary,
          content: [
            {
              children: [{ text: summary }],
            },
          ], // Basic RichText format for Payload
          author: user.id,
        }),
      });

      if (res.ok) {
        onClose();
        window.location.reload(); // Refresh to show new discussion
      } else {
        const data = await res.json();
        setError(data.errors?.[0]?.message || 'Failed to create discussion');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-[2rem] overflow-hidden"
        style={{
          background: isDark ? 'rgba(18,16,40,0.75)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: isDark
            ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)'
            : 'inset 0 1px 1px rgba(255,255,255,0.7), 0 20px 40px rgba(0,0,0,0.12)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition-colors"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            color: isDark ? 'white' : 'black',
          }}
        >
          <X size={20} />
        </button>

        <h2
          className="text-2xl font-bold mb-2 font-display"
          style={{ color: isDark ? 'white' : 'black', letterSpacing: '-0.02em' }}
        >
          Start a Discussion
        </h2>
        <p
          style={{
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          Share your thoughts, ask a question, or discuss your favorite tools.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., What's the best tool for React animations?"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? 'white' : 'black',
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
            >
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="E.g., Development, Design, General"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? 'white' : 'black',
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)' }}
            >
              Summary / Content
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide more details..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all resize-none"
              style={{
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? 'white' : 'black',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-xl font-bold text-[15px] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
            }}
          >
            {isSubmitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussionModal;
