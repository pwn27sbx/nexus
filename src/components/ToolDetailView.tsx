import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { getDomain } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import ReviewSection from './ReviewSection';
import BentoCard from './BentoCard';
import type { Tool } from '../types';
import { AuthProvider } from '../contexts/AuthContext';
import { API_BASE_URL } from '../utils/constants';

export function ToolDetailViewContent({ tool }: { tool: Tool }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch related tools client-side to improve initial page load performance
  useEffect(() => {
    if (tool.category) {
      fetch(
        `${API_BASE_URL}/api/tools?where[category][equals]=${tool.category}&where[id][not_equals]=${tool.id}&limit=4&depth=0`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.docs) setRelatedTools(data.docs);
        })
        .catch((err) => console.error('Error fetching related tools', err));
    }
  }, [tool.category, tool.id]);

  const handleVisit = async () => {
    window.open(tool.url, '_blank');
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id }),
      });
    } catch (e) {
      console.error('Failed to track click', e);
    }
  };

  const glassStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(31, 38, 135, 0.05)',
  };

  const cardInnerGlass = {
    background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.6)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.6)',
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background blobs for the glassmorphism effect (visible primarily in light mode due to page background) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden hidden dark:block">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <header className="px-6 py-8 max-w-6xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={glassStyle}
        >
          <ArrowLeft size={16} />
          Back to directory
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Browser Mockup + About */}
          <div className="space-y-10">
            {/* Browser Window Mockup */}
            <div className="rounded-3xl overflow-hidden flex flex-col shadow-xl" style={glassStyle}>
              {/* Browser Header */}
              <div
                className="h-12 px-4 flex items-center justify-between border-b"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded text-xs font-medium opacity-60 truncate max-w-[200px]">
                    {getDomain(tool.url)}
                  </div>
                </div>
                <div className="w-[52px]"></div> {/* Spacer */}
              </div>
              {/* Browser Content */}
              <div className="aspect-[16/10] relative bg-white dark:bg-black/20 flex items-center justify-center p-8">
                {/* A decorative soft circle behind the screenshot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-64 h-64 rounded-full bg-pink-400/40 blur-[40px]"></div>
                </div>
                <img
                  src={
                    tool.screenshotUrl ||
                    'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1200&auto=format&fit=crop'
                  }
                  alt={`Screenshot of ${tool.name}`}
                  className="w-full h-full object-contain relative z-10 rounded shadow-sm"
                />
              </div>
            </div>

            {/* About Section */}
            <div className="px-2 pt-4">
              <h2 className="text-lg font-bold mb-2 font-sans">About</h2>
              <h3 className="text-3xl font-serif mb-6">{`About ${tool.name}`}</h3>
              <p className="text-[1.05rem] leading-relaxed opacity-80 font-medium">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Right Column: Info Card + Reviews */}
          <div className="space-y-10">
            {/* Main Info Card */}
            <div className="rounded-[2.5rem] p-8 space-y-8" style={glassStyle}>
              <div className="flex flex-col items-center gap-4 pt-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
                  className="w-16 h-16 rounded-2xl shadow-sm"
                  alt={`${tool.name} icon`}
                  style={{ background: '#fff' }}
                />
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-1">{tool.name}</h1>
                  <p className="text-sm opacity-70">{getDomain(tool.url)}</p>
                </div>
              </div>

              <button
                onClick={handleVisit}
                className="w-full py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: 'white',
                }}
              >
                Visit Website <ExternalLink size={20} />
              </button>

              <div className="grid grid-cols-2 gap-4">
                {/* Rating */}
                <div className="rounded-2xl p-4" style={cardInnerGlass}>
                  <div className="text-sm font-semibold opacity-70 mb-2">Rating</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= (tool.averageRating || 0) ? '#f59e0b' : 'transparent'}
                        color={
                          star <= (tool.averageRating || 0)
                            ? '#f59e0b'
                            : isDark
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(0,0,0,0.2)'
                        }
                      />
                    ))}
                    <span className="ml-1 text-sm font-semibold opacity-70">
                      {tool.reviewCount || 0}
                    </span>
                  </div>
                </div>

                {/* Visits */}
                <div className="rounded-2xl p-4" style={cardInnerGlass}>
                  <div className="text-sm font-semibold opacity-70 mb-2">Visits</div>
                  <div className="text-xl font-bold">
                    {tool.clicks ? tool.clicks.toLocaleString() : 0}
                  </div>
                </div>

                {/* Category */}
                <div className="rounded-2xl p-4" style={cardInnerGlass}>
                  <div className="text-sm font-semibold opacity-70 mb-2">Category</div>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                  >
                    {tool.category}
                  </span>
                </div>

                {/* Tags */}
                <div className="rounded-2xl p-4" style={cardInnerGlass}>
                  <div className="text-sm font-semibold opacity-70 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags && tool.tags.length > 0 ? (
                      tool.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs font-medium border"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm opacity-50">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section Wrapper */}
            <div className="px-2 pt-4">
              <h2 className="text-lg font-bold mb-4 font-sans">Reviews</h2>
              <div className="rounded-[2.5rem] p-6" style={glassStyle}>
                <ReviewSection toolId={tool.id} />
              </div>
            </div>
          </div>
        </div>

        {relatedTools && relatedTools.length > 0 && (
          <div className="mt-24 pb-12">
            <h3 className="text-2xl font-bold mb-8 opacity-90">Similar in {tool.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relatedTool: Tool, i: number) => (
                <BentoCard key={relatedTool.id} tool={relatedTool} index={i} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ToolDetailView(props: { tool: Tool }) {
  return (
    <AuthProvider>
      <ToolDetailViewContent {...props} />
    </AuthProvider>
  );
}
