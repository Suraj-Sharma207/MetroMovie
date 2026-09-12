import React from 'react';
import bLogo from '../../../img/bLogo.png';

export default function Footer() {
  return (
    <footer className="w-full bg-cinema-bg border-t border-cinema-border/40 py-10 pb-24 md:pb-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <img src={bLogo} alt="MoviesMetro" className="h-9 w-auto object-contain" />
            </div>
            <p className="text-xs text-cinema-muted max-w-sm">
              Your ultimate movie discovery destination for trending titles, trailers, ratings, and streaming availability.
            </p>
          </div>

          {/* Legal / Attribution Section */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2 text-xs text-cinema-muted">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cinema-card border border-cinema-border/50 text-cinema-text font-medium">
                TMDB
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cinema-card border border-cinema-border/50 text-cinema-gold font-medium">
                JustWatch
              </span>
            </div>
            <p className="text-[11px] text-cinema-muted/80 max-w-md">
              This product uses the TMDB API but is not endorsed or certified by TMDB. 
              Streaming & watch-provider data is powered by JustWatch via TMDB.
            </p>
            <p className="text-[11px] text-cinema-muted/60">
              © {new Date().getFullYear()} MoviesMetro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
