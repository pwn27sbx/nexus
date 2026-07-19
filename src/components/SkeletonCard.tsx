import React from 'react';

interface SkeletonCardProps {
  spanClass: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ spanClass }) => (
  <div className={`rounded-[24px] overflow-hidden ${spanClass}`}>
    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-[24px] relative overflow-hidden">
      <div className="absolute inset-0 skeleton-pulse" />
    </div>
  </div>
);

export default SkeletonCard;
