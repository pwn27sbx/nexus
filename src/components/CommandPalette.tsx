import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, ArrowUpRight } from '../utils/icons';

const CommandPalette = ({ isOpen, onClose, query, setQuery, tools }) => {
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
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

  const handleKeyDown = (e) => {
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

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-2xl p-4 animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl w-full max-w-2xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-8 py-6 border-b border-black/5 dark:border-white/5">
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search directory..."
            className="flex-1 bg-transparent border-none outline-none text-black dark:text-white px-5 text-2xl font-bold tracking-tight placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            aria-label="Search tools"
          />
          <div className="flex gap-2">
            <kbd className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-zinc-500 border border-black/10 dark:border-white/10">
              {'\u2191\u2193'}
            </kbd>
            <kbd className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-zinc-500 border border-black/10 dark:border-white/10">
              {'\u23ce'}
            </kbd>
            <kbd className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-zinc-500 border border-black/10 dark:border-white/10">
              ESC
            </kbd>
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4 no-scrollbar">
          {query ? (
            filteredTools.length > 0 ? (
              <div className="mb-2">
                {filteredTools.map((tool, idx) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      window.open(tool.url, '_blank');
                      onClose();
                    }}
                    className={`w-full text-left px-5 py-4 rounded-[20px] flex items-center justify-between group transition-all ${
                      idx === selectedIndex
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-label={`Open ${tool.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=32`}
                          alt=""
                          className="w-5 h-5 rounded"
                          aria-hidden="true"
                        />
                      </span>
                      <span
                        className={`text-[18px] font-bold ${
                          idx === selectedIndex
                            ? 'text-accent'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {tool.name}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Visit <ArrowUpRight />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <SearchIcon className="text-zinc-300" size={32} />
                <p className="text-zinc-500 font-bold">No results found.</p>
                <p className="text-zinc-400 text-[13px]">Try a different search term.</p>
              </div>
            )
          ) : (
            <div className="py-8 text-center text-zinc-400 font-medium">
              Type to start searching...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
