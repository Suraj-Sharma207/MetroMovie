import React from 'react';
import { Film } from 'lucide-react';

export default function MoviePosterFallback({ title = 'No Poster', className = '' }) {
  return (
    <div
      className={`w-full h-full min-h-[160px] bg-gradient-to-br from-cinema-card to-cinema-border/50 rounded-xl flex flex-col items-center justify-center p-4 text-center border border-cinema-border/40 ${className}`}
    >
      <Film className="w-10 h-10 text-cinema-muted/60 mb-2" />
      <span className="text-xs text-cinema-muted font-medium line-clamp-2">
        {title}
      </span>
      <span className="text-[10px] text-cinema-muted/50 mt-1">Image Unavailable</span>
    </div>
  );
}
