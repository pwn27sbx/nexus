import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import { API_BASE_URL } from '../utils/constants';

interface Review {
  id: string;
  user: any;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewSection({ toolId }: { toolId: string | number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
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
        const found = data.docs.some((r: any) => r.user?.id === user.id || r.user === user.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="w-full">
      {user && !hasReviewed && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-[2rem] space-y-4"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[0.95rem] font-semibold text-black dark:text-white">Rating</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    fill={star <= rating ? '#facc15' : 'transparent'}
                    color={
                      star <= rating
                        ? '#facc15'
                        : isDark
                          ? 'rgba(255,255,255,0.3)'
                          : 'rgba(0,0,0,0.15)'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this tool?"
              className="w-full p-4 rounded-xl resize-none outline-none text-[0.95rem] transition-colors"
              rows={3}
              style={{
                background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
                color: isDark ? '#fff' : '#000',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 shadow-[0_4px_14px_0_rgba(168,85,247,0.39)]"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #a855f7)',
                color: 'white',
              }}
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}

      {!user && (
        <div
          className="mb-12 p-6 rounded-2xl text-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
        >
          <p className="opacity-70 mb-4 font-medium text-[0.95rem]">Join to leave a review</p>
          <button
            onClick={() => isAuthModalOpen.set(true)}
            className="px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 cursor-pointer shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] text-[0.95rem]"
            style={{ background: 'linear-gradient(to right, #8b5cf6, #a855f7)', color: 'white' }}
          >
            Sign Up
          </button>
        </div>
      )}

      {loading ? (
        <div className="opacity-50 px-2">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-4 rounded-full text-[0.95rem] font-medium text-black dark:text-white"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.04)',
          }}
        >
          No reviews yet. Be the first!
        </div>
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
