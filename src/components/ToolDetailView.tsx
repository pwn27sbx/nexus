import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ArrowUpRight } from 'lucide-react';
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
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.04)',
  };

  const pillStyle = {
    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
    color: isDark ? '#fff' : '#333',
  };

  return (
    <div
      className="min-h-screen pb-20 relative"
      style={{
        background: isDark
          ? '#111'
          : 'linear-gradient(135deg, #e6eaff 0%, #ecdfff 50%, #f4dff4 100%)',
      }}
    >
      <header className="px-6 py-8 max-w-5xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={pillStyle}
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
              <div
                className="aspect-[16/10] relative flex items-center justify-center p-8 overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3), linear-gradient(45deg, #f3f3f3 25%, transparent 25%, transparent 75%, #f3f3f3 75%, #f3f3f3)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundColor: 'white',
                }}
              >
                {/* Decorative soft wave at the bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/3 opacity-80"
                  style={{
                    background:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233b82f6' fill-opacity='0.3' d='M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,229.3C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\") bottom/cover no-repeat",
                  }}
                ></div>

                {/* Decorative soft circle behind the screenshot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                  <div className="w-64 h-64 rounded-full bg-pink-500/40 blur-[20px]"></div>
                </div>
                <img
                  src={
                    tool.screenshotUrl ||
                    'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1200&auto=format&fit=crop'
                  }
                  alt={`Screenshot of ${tool.name}`}
                  className="w-48 h-48 object-contain relative z-10"
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

          <div className="space-y-8">
            {/* Main Info Card */}
            <div className="rounded-[2rem] p-8 space-y-6" style={glassStyle}>
              <div className="flex flex-row items-center gap-5 pt-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
                  className="w-[4.5rem] h-[4.5rem] rounded-[1.25rem] shadow-sm p-2"
                  alt={`${tool.name} icon`}
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }}
                />
                <div className="text-left">
                  <h1 className="text-[1.75rem] font-bold mb-0.5 leading-none text-black dark:text-white">
                    {tool.name}
                  </h1>
                  <p className="text-[0.95rem] opacity-60 font-medium text-black dark:text-white">
                    {getDomain(tool.url)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleVisit}
                className="w-full py-3.5 rounded-2xl text-[1.05rem] font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(168,85,247,0.39)]"
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #a855f7)',
                  color: 'white',
                }}
              >
                Visit Website <ArrowUpRight size={18} />
              </button>

              <div className="pt-2 flex flex-col gap-5 text-black dark:text-white">
                <div
                  className="grid grid-cols-2 gap-4 pb-5 border-b"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                >
                  {/* Rating */}
                  <div>
                    <div className="text-[0.85rem] font-semibold opacity-80 mb-2">Rating</div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= (tool.averageRating || 0) ? '#facc15' : 'transparent'}
                          color={
                            star <= (tool.averageRating || 0)
                              ? '#facc15'
                              : isDark
                                ? 'rgba(255,255,255,0.3)'
                                : 'rgba(0,0,0,0.15)'
                          }
                        />
                      ))}
                      <span className="ml-1.5 text-[0.9rem] font-medium opacity-60">
                        {tool.reviewCount || 0}
                      </span>
                    </div>
                  </div>
                  {/* Visits */}
                  <div>
                    <div className="text-[0.85rem] font-semibold opacity-80 mb-2">Visits</div>
                    <div className="text-[0.95rem] font-medium opacity-90">
                      {tool.clicks ? tool.clicks.toLocaleString() : 0}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <div className="text-[0.85rem] font-semibold opacity-80 mb-2">Category</div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={pillStyle}
                    >
                      {tool.category}
                    </span>
                  </div>
                  {/* Tags */}
                  <div>
                    <div className="text-[0.85rem] font-semibold opacity-80 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags && tool.tags.length > 0 ? (
                        tool.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={pillStyle}
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
            </div>

            {/* Reviews Section Wrapper */}
            <div className="pt-2">
              <h2 className="text-lg font-bold mb-4 font-sans text-black dark:text-white">
                Reviews
              </h2>
              <ReviewSection toolId={tool.id} />
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
