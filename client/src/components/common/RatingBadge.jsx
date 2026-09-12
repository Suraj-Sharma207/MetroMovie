import React from 'react';
import { Star } from 'lucide-react';

export default function RatingBadge({ rating, size = 'sm', className = '' }) {
  const formatted = rating && rating > 0 ? Number(rating).toFixed(1) : 'NR';

  const sizeClasses = {
    xs: 'text-[11px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-3 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-md bg-black/60 backdrop-blur-md text-cinema-gold border border-cinema-gold/30 font-medium ${sizeClasses[size]} ${className}`}
    >
      <Star className={`${iconSizes[size]} fill-cinema-gold text-cinema-gold`} />
      <span>{formatted}</span>
    </div>
  );
}
