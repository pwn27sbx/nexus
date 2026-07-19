import React from 'react';
import { ALL_CATEGORIES } from '../utils/constants';
import { CloseIcon } from '../utils/icons';
import { playSound } from '../utils/sounds';

const categoryEmojis: Record<string, string> = {
  Design: '🎨',
  Development: '💻',
  'AI Tools': '🤖',
  Productivity: '⚡',
  Medicine: '🏥',
  Accounting: '📊',
  Engineering: '🔧',
  Entertainment: '🎬',
  Finance: '💰',
  Education: '📚',
  Marketing: '📢',
  Utilities: '🛠',
  Crypto: '₿',
  Security: '🔒',
  'Open Source': '🌐',
};

const CategoriesModal = ({ isOpen, onClose, activeCategory, setActiveCategory }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-label="Explore categories">
      <div className="w-full max-w-4xl bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-400" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-8 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">Explore Hub</h2>
            <p className="text-[14px] text-zinc-500 font-medium mt-1">Discover tools across all industries.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Close categories"><CloseIcon size={20} /></button>
        </div>
        <div className="px-8 pb-10 pt-6 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => { setActiveCategory(cat); playSound('pop'); onClose(); }} className={`p-5 rounded-[20px] flex flex-col items-center gap-3 transition-all duration-300 ${isActive ? 'bg-accent text-white shadow-lg scale-105' : 'bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/5 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:scale-[1.02]'}`} aria-label={`Category: ${cat}${isActive ? ' (active)' : ''}`}>
                <span className="text-3xl" role="img" aria-hidden="true">{categoryEmojis[cat] || '📁'}</span>
                <span className="text-[16px] font-bold text-center leading-tight">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesModal;
