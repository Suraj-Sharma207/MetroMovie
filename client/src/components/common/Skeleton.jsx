import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="w-full aspect-[2/3] rounded-2xl" />
      <Skeleton className="w-3/4 h-4 rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-1/3 h-3 rounded" />
        <Skeleton className="w-1/4 h-3 rounded" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[460px] md:h-[540px] rounded-3xl skeleton-shimmer flex flex-col justify-end p-6 md:p-12 space-y-4">
      <Skeleton className="w-1/3 h-8 rounded-lg" />
      <Skeleton className="w-2/3 h-4 rounded" />
      <Skeleton className="w-1/2 h-4 rounded" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="w-32 h-10 rounded-full" />
        <Skeleton className="w-32 h-10 rounded-full" />
      </div>
    </div>
  );
}
