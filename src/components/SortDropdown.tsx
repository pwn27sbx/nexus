import React, { useState, useEffect, useRef } from 'react';
import { SortIcon } from '../utils/icons';

interface SortOption {
  id: string;
  label: string;
}

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (id: string) => void;
  options?: SortOption[];
}

const DEFAULT_OPTIONS: SortOption[] = [
  { id: 'default', label: 'Default' },
  { id: 'name', label: 'Name A-Z' },
  { id: 'name-desc', label: 'Name Z-A' },
];

const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
  options = DEFAULT_OPTIONS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-zinc-500 hover:text-black dark:hover:text-white text-[14px] font-bold"
        aria-label="Sort tools"
        aria-expanded={isOpen}
      >
        <SortIcon size={14} />
        {options.find((o) => o.id === currentSort)?.label || 'Default'}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#151515] rounded-[16px] shadow-xl border border-black/10 dark:border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onSortChange(opt.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-[12px] text-[14px] font-bold transition-colors ${
                currentSort === opt.id
                  ? 'bg-accent text-white'
                  : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
