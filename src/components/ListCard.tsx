// @ts-nocheck
import React, { memo } from 'react';
import { HeartIcon, ArrowUpRight } from '../utils/icons';
import { getDomain } from '../utils/helpers';

const ListCard = memo(({ tool, user, onRequireAuth, isFocused, indexNumber, onSaveRequest }) => {
  const numericToolId = Number(tool.id);
  const isSavedAnywhere =
    user?.bookmarks?.some((b) => (typeof b === 'object' ? b.id : b) === numericToolId) ||
    user?.collections?.some((c) =>
      c.tools?.some((t) => (typeof t === 'object' ? t.id : t) === numericToolId)
    );

  return (
    <div
      className={`group relative grid grid-cols-[auto_1fr_auto] md:grid-cols-[60px_2.5fr_1fr_1.5fr] gap-6 items-center py-6 px-4 md:px-8 border-b border-black/10 dark:border-white/10 transition-all duration-300 cursor-pointer ${
        isFocused
          ? 'bg-black/5 dark:bg-white/5'
          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
      }`}
      onClick={() => window.open(tool.url, '_blank')}
      role="article"
      aria-label={`${tool.name} - ${tool.category}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.open(tool.url, '_blank');
        }
      }}
    >
      <div className="flex items-center justify-center w-10 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (user) {
              const rect = e.currentTarget.getBoundingClientRect();
              onSaveRequest({ tool, rect });
            } else {
              onRequireAuth();
            }
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
            isSavedAnywhere
              ? 'text-accent bg-accent/10 opacity-100 scale-110 shadow-sm'
              : 'text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:scale-110'
          }`}
          aria-label={isSavedAnywhere ? 'Remove from saved' : 'Save tool'}
        >
          <HeartIcon isSaved={isSavedAnywhere} size={18} />
        </button>
        <span
          className={`text-[14px] font-bold w-10 text-center absolute pointer-events-none transition-opacity z-0 ${
            isSavedAnywhere || isFocused
              ? 'opacity-0'
              : 'opacity-100 group-hover:opacity-0 text-zinc-400'
          }`}
        >
          {(indexNumber + 1).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col truncate justify-center z-10">
        <div className="flex items-center gap-4">
          <img
            src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=32`}
            alt=""
            loading="lazy"
            className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800"
            aria-hidden="true"
          />
          <span className="text-[24px] font-extrabold tracking-tight text-black dark:text-white truncate group-hover:text-accent transition-colors">
            {tool.name}
          </span>
        </div>
        <span className="text-[14px] text-zinc-500 font-medium truncate mt-1 ml-10">
          {tool.description}
        </span>
        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 ml-10">
            {tool.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center z-10">
        <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">
          {tool.category}
        </span>
      </div>

      <div className="hidden md:flex justify-end items-center gap-2 pr-2 z-10 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
        <span className="truncate text-[15px] font-bold">{getDomain(tool.url)}</span>
        <ArrowUpRight />
      </div>

      <div className="hidden lg:block absolute right-32 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 scale-90 rotate-2 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 transition-all duration-400 origin-center">
        <div className="w-[320px] h-[200px] rounded-[16px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20">
          <img
            src={tool.imageUrl}
            alt={`Preview of ${tool.name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
});

ListCard.displayName = 'ListCard';
export default ListCard;
