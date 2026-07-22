import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  Star,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { getDomain } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { isAuthModalOpen } from '../stores/modals';
import ReviewSection from './ReviewSection';
import BentoCard from './BentoCard';
import type { Tool } from '../types';

export default function ToolDetailView({
  tool,
  relatedTools,
}: {
  tool: Tool;
  relatedTools?: Tool[];
}) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleVisit = async () => {
    // 1. Abre la pestaña
    window.open(tool.url, '_blank');

    // 2. Trackea el clic en background
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

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Navbar simple */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: isDark ? 'rgba(5, 5, 5, 0.8)' : 'rgba(240, 244, 248, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
          }}
        >
          <ArrowLeft size={16} />
          Back to directory
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          {/* Col 1: Imagen y descripción */}
          <div className="space-y-8">
            <div
              className="w-full aspect-[16/10] rounded-3xl overflow-hidden relative"
              style={{
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.4)' : '0 24px 64px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={tool.screenshotUrl}
                alt={`Screenshot of ${tool.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: isDark ? '#fff' : '#000' }}>
                About {tool.name}
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
              >
                {tool.description}
              </p>
            </div>
          </div>

          {/* Col 2: Info Card */}
          <div>
            <div
              className="sticky top-28 rounded-3xl p-8 space-y-8"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                  className="w-12 h-12 rounded-xl"
                  alt={`${tool.name} icon`}
                />
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: isDark ? '#fff' : '#000' }}>
                    {tool.name}
                  </h1>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm mt-1 hover:underline"
                    style={{ color: '#7c3aed' }}
                  >
                    <LinkIcon size={14} />
                    {getDomain(tool.url)}
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div
                    className="text-sm mb-1"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    Rating
                  </div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {tool.averageRating || 0}
                    <Star size={20} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <div className="text-xs mt-1 opacity-50">{tool.reviewCount || 0} reviews</div>
                </div>
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div
                    className="text-sm mb-1"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    Visits
                  </div>
                  <div className="text-2xl font-bold">{tool.clicks || 0}</div>
                  <div className="text-xs mt-1 opacity-50">Total clicks</div>
                </div>
              </div>

              <button
                onClick={handleVisit}
                className="w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                }}
              >
                Visit Website <ExternalLink size={20} />
              </button>

              <div
                className="space-y-4 pt-6 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              >
                <div>
                  <div
                    className="text-sm mb-2"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    Category
                  </div>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm"
                    style={{ background: 'rgba(124,58,237,0.1)', color: '#c084fc' }}
                  >
                    {tool.category}
                  </span>
                </div>

                {tool.tags && tool.tags.length > 0 && (
                  <div>
                    <div
                      className="text-sm mb-2"
                      style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                    >
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ReviewSection toolId={tool.id} />

        {relatedTools && relatedTools.length > 0 && (
          <div
            className="mt-20 border-t pt-12"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          >
            <h3 className="text-2xl font-bold mb-8" style={{ color: isDark ? '#fff' : '#000' }}>
              Similar in {tool.category}
            </h3>
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
