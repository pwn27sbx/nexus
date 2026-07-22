import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import { API_BASE_URL } from '../utils/constants';

export default function ReviewSection({ toolId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews?where[tool][equals]=${toolId}&depth=1`);
      const data = await res.json();
      setReviews(data.docs || []);

      if (user && data.docs) {
        const found = data.docs.some((r) => r.user?.id === user.id || r.user === user.id);
        setHasReviewed(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [toolId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      isAuthModalOpen.set(true);
      return;
    }

    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('payload-token')}`,
        },
        body: JSON.stringify({
          tool: toolId,
          user: user.id,
          rating,
          comment,
        }),
      });
      setComment('');
      setRating(5);
      await fetchReviews();
    } catch (e) {
      console.error('Failed to submit review', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold mb-8" style={{ color: isDark ? '#fff' : '#000' }}>
        Reviews
      </h3>

      {user && !hasReviewed && (
        <form
          onSubmit={handleSubmit}
          className="mb-12 p-6 rounded-2xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <div className="mb-4">
            <label className="block text-sm mb-2 opacity-70">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={star <= rating ? '#f59e0b' : 'transparent'}
                    color={
                      star <= rating
                        ? '#f59e0b'
                        : isDark
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(0,0,0,0.2)'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this tool?"
              className="w-full p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              style={{
                background: isDark ? 'rgba(0,0,0,0.3)' : '#fff',
                color: isDark ? '#fff' : '#000',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-full font-bold transition-all disabled:opacity-50"
            style={{
              background: '#7c3aed',
              color: 'white',
            }}
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      )}

      {!user && (
        <div
          className="mb-12 p-6 rounded-2xl text-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
        >
          <p className="opacity-70 mb-4">Log in to leave a review</p>
          <button
            onClick={() => isAuthModalOpen.set(true)}
            className="px-6 py-2 rounded-full font-bold"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}
          >
            Log In
          </button>
        </div>
      )}

      {loading ? (
        <div className="opacity-50">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="opacity-50 text-center py-12">No reviews yet. Be the first!</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-500">
                    {review.user?.nickname?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold">{review.user?.nickname || 'Anonymous'}</div>
                    <div className="text-xs opacity-50">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? '#f59e0b' : 'transparent'}
                      color={
                        i < review.rating
                          ? '#f59e0b'
                          : isDark
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(0,0,0,0.2)'
                      }
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="opacity-80 leading-relaxed text-sm">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
