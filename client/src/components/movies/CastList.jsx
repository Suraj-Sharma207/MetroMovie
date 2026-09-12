import React, { useState } from 'react';
import { User, ChevronRight } from 'lucide-react';

function CastAvatar({ person }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex-shrink-0 w-[100px] sm:w-[110px] md:w-[116px] group cursor-pointer">
      <div className="w-full aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-cinema-card border border-cinema-border/70 shadow-md group-hover:border-cinema-accent/60 group-hover:shadow-glow/20 transition-all duration-300 relative">
        {person.profileUrl && !imageFailed ? (
          <img
            src={person.profileUrl}
            alt={person.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-cinema-card/90 text-cinema-muted">
            <User className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[10px] opacity-40 px-1 text-center font-medium">No photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="mt-2 space-y-0.5">
        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cinema-accent transition-colors">
          {person.name}
        </h4>
        <p className="text-[11px] text-cinema-muted line-clamp-1">
          {person.character}
        </p>
      </div>
    </div>
  );
}

export default function CastList({ cast = [] }) {
  const [showAll, setShowAll] = useState(false);
  if (!cast || cast.length === 0) return null;

  const displayCast = showAll ? cast : cast.slice(0, 10);

  return (
    <div className="rounded-2xl bg-cinema-card/70 border border-cinema-border/60 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Top Cast
        </h3>
        {cast.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-cinema-muted hover:text-cinema-accent transition-colors inline-flex items-center gap-1"
          >
            <span>{showAll ? 'Show Less' : 'See All'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      <div className={`w-full overflow-x-auto no-scrollbar pb-1 ${showAll ? 'flex flex-wrap gap-4' : 'flex items-start gap-3.5 sm:gap-4'}`}>
        {displayCast.map((person, idx) => (
          <CastAvatar key={`${person.id}-${person.character}-${idx}`} person={person} />
        ))}
      </div>
    </div>
  );
}
