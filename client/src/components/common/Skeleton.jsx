import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

/** Standard grid card skeleton */
export function MovieCardSkeleton({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-col space-y-2">
        <Skeleton className="w-full aspect-[2/3] rounded-xl" />
        <Skeleton className="w-3/4 h-3 rounded" />
        <Skeleton className="w-1/2 h-2.5 rounded" />
      </div>
    );
  }
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

/** Hero skeleton — matches new shorter mobile hero height */
export function HeroSkeleton() {
  return (
    <div className="w-full h-[320px] sm:h-[380px] md:h-[500px] lg:h-[560px] rounded-2xl md:rounded-3xl skeleton-shimmer flex flex-col justify-end p-4 sm:p-6 md:p-10 space-y-3">
      <Skeleton className="w-24 h-5 rounded-full" />
      <Skeleton className="w-2/3 h-7 rounded-lg" />
      <Skeleton className="w-1/3 h-4 rounded" />
      <Skeleton className="w-full h-4 rounded hidden sm:block" />
      <div className="flex gap-3 pt-1">
        <Skeleton className="w-28 h-9 rounded-full" />
        <Skeleton className="w-20 h-9 rounded-full" />
      </div>
      <div className="flex gap-1.5 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-6' : 'w-1.5'}`} />
        ))}
      </div>
    </div>
  );
}
