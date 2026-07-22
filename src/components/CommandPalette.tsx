import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, ArrowUpRight } from '../utils/icons';
import type { Tool } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  tools: Tool[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  query,
  setQuery,
  tools,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDark =
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const filteredTools = tools
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTools.length - 1));
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault();
      window.open(filteredTools[selectedIndex].url, '_blank');
      onClose();
    }
  };

  const kbdStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 7px',
    borderRadius: '8px',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
    color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.55)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,190,240,0.5)',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '2rem',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)'
            : '0 20px 56px rgba(80,60,180,0.14), 0 0 0 1px rgba(255,255,255,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(255,255,255,0.5)',
            gap: '12px',
          }}
        >
          <SearchIcon
            size={18}
            style={{
              color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(124,58,237,0.45)',
              flexShrink: 0,
            }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search directory..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
            }}
            aria-label="Search tools"
          />
          <div style={{ display: 'flex', gap: '5px' }} className="hidden sm:flex">
            <kbd style={kbdStyle}>{'↑↓'}</kbd>
            <kbd style={kbdStyle}>{'⏎'}</kbd>
            <kbd style={kbdStyle}>ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div
          className="no-scrollbar"
          style={{ maxHeight: '50vh', overflowY: 'auto', padding: '8px' }}
        >
          {query ? (
            filteredTools.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredTools.map((tool: Tool, idx: number) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        window.open(tool.url, '_blank');
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 18px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s ease',
                        background: isSelected
                          ? isDark
                            ? 'rgba(124,58,237,0.2)'
                            : 'rgba(124,58,237,0.1)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(255,255,255,0.45)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                      aria-label={`Open ${tool.name}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.1)'
                              : '1px solid rgba(255,255,255,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=32`}
                            alt=""
                            style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                            aria-hidden="true"
                          />
                        </span>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            color: isSelected
                              ? isDark
                                ? '#c084fc'
                                : '#7c3aed'
                              : isDark
                                ? 'rgba(240,235,255,0.9)'
                                : 'rgba(15,10,40,0.85)',
                          }}
                        >
                          {tool.name}
                        </span>
                      </div>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isDark ? 'rgba(180,160,255,0.4)' : 'rgba(120,90,200,0.45)',
                          opacity: isSelected ? 1 : 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        Visit <ArrowUpRight />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '48px 0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon size={22} style={{ color: isDark ? '#a855f7' : '#7c3aed' }} />
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)',
                  }}
                >
                  No results found.
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                  }}
                >
                  Try a different search term.
                </p>
              </div>
            )
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDark ? 'rgba(180,165,240,0.45)' : 'rgba(100,80,160,0.5)',
                }}
              >
                Type to start searching...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
