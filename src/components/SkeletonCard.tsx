import React from 'react';

interface SkeletonCardProps {
  spanClass?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = () => (
  <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#161616] border border-black/[0.07] dark:border-white/[0.07]">
    {/* Image area */}
    <div className="w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse relative overflow-hidden" style={{ paddingBottom: '58%' }}>
      <div className="absolute inset-0 skeleton-pulse" />
    </div>
    {/* Info area */}
    <div className="px-4 py-3.5 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
        <div className="flex-1 h-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="w-16 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
      </div>
      <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse w-full" />
      <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse w-4/5" />
      <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse w-1/3 mt-1" />
    </div>
  </div>
);

export default SkeletonCard;
