import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Film, LogOut, LogIn, ChevronDown, Check, Globe, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegion } from '../../context/RegionContext.jsx';
import bLogo from '../../../img/bLogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, isAuthenticated, logout, openAuthModal, isLoggingOut } = useAuth();
  const { currentRegion, setRegion, supportedRegions } = useRegion();

  const [regionOpen, setRegionOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState('');

  const regionRef = useRef(null);
  const profileRef = useRef(null);

  // Sync desktopSearch with URL query parameter when on /search; clear when navigating away
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = searchParams.get('q') || '';
      setDesktopSearch(q);
    } else {
      setDesktopSearch('');
    }
  }, [location.pathname, searchParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (regionRef.current && !regionRef.current.contains(e.target)) setRegionOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDesktopSearchChange = (e) => {
    const val = e.target.value;
    setDesktopSearch(val);
    const trimmed = val.trim();

    if (location.pathname === '/search') {
      const newParams = new URLSearchParams(searchParams);
      if (trimmed) {
        newParams.set('q', trimmed);
      } else {
        newParams.delete('q');
      }
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    } else {
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        navigate('/search');
      }
    }
  };

  const handleDesktopSearchFocus = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const handleClearDesktopSearch = () => {
    setDesktopSearch('');
    if (location.pathname === '/search') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleDesktopSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = desktopSearch.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  // First character of name or email for avatar
  const avatarLetter = (user?.name || user?.email || 'U')[0].toUpperCase();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Account';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-cinema-bg/95 backdrop-blur-md border-b border-cinema-border/50 shadow-md shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 lg:h-[70px] flex items-center justify-between gap-4">

        {/* ── LEFT: LOGO & DESKTOP NAV LINKS ──────────────────────── */}
        <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
          {/* MoviesMetro Logo (bLogo across mobile, tablet, and desktop) */}
          <Link to="/" className="flex items-center flex-shrink-0 group" aria-label="MoviesMetro home">
            <img
              src={bLogo}
              alt="MoviesMetro"
              className="h-10 sm:h-11 md:h-12 lg:h-14 xl:h-[56px] w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md -translate-y-1 md:-translate-y-1.5"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-cinema-accent hover:text-cinema-accentHover font-semibold'
                    : 'text-cinema-muted hover:text-white hover:bg-cinema-card/60 font-medium'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/new-releases"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-cinema-accent hover:text-cinema-accentHover font-semibold'
                    : 'text-cinema-muted hover:text-white hover:bg-cinema-card/60 font-medium'
                }`
              }
            >
              New Releases
            </NavLink>
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-cinema-accent hover:text-cinema-accentHover font-semibold'
                    : 'text-cinema-muted hover:text-white hover:bg-cinema-card/60 font-medium'
                }`
              }
            >
              My List
            </NavLink>
          </nav>
        </div>

        {/* ── CENTER: DESKTOP SEARCH BAR ─────────────────────────── */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-4">
          <form onSubmit={handleDesktopSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={desktopSearch}
              onChange={handleDesktopSearchChange}
              onFocus={handleDesktopSearchFocus}
              placeholder="Search movies, shows, browse..."
              className="w-full bg-cinema-card/80 hover:bg-cinema-card focus:bg-cinema-card border border-cinema-border/60 hover:border-cinema-border focus:border-cinema-accent rounded-full pl-9 pr-8 py-1.5 text-xs text-cinema-text placeholder-cinema-muted focus:outline-none focus:ring-1 focus:ring-cinema-accent transition-all"
            />
            {desktopSearch && (
              <button
                type="button"
                onClick={handleClearDesktopSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-cinema-muted hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* ── RIGHT CONTROLS: REGION + AUTH ──────────────────────── */}
        <div className="flex items-center gap-2">

          {/* ── REGION SELECTOR ──────────────────────────────────── */}
          <div className="relative" ref={regionRef}>
            <button
              onClick={() => { setRegionOpen(o => !o); setProfileOpen(false); }}
              aria-label="Select region"
              aria-expanded={regionOpen}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-cinema-card/80 hover:bg-cinema-card border border-cinema-border/60 hover:border-cinema-accent/50 text-white text-xs font-medium transition-all flex-shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-cinema-accent flex-shrink-0" />
              <span className="text-xs font-semibold text-cinema-text/90 max-w-[85px] sm:max-w-none truncate">
                {currentRegion.name}
              </span>
              <ChevronDown className={`w-3 h-3 text-cinema-muted transition-transform duration-200 ${regionOpen ? 'rotate-180 text-cinema-accent' : ''}`} />
            </button>

            {/* Region dropdown */}
            {regionOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-cinema-card border border-cinema-border/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-cinema-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cinema-muted">Discovery Region</p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {supportedRegions.map((region) => {
                    const isSelected = region.code === currentRegion.code;
                    return (
                      <button
                        key={region.code}
                        onClick={() => { setRegion(region.code); setRegionOpen(false); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                          isSelected
                            ? 'text-cinema-accent font-semibold bg-cinema-accent/10'
                            : 'text-cinema-text/90 hover:bg-cinema-bg/80'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-cinema-border/50 text-[10px] font-mono text-cinema-muted font-semibold min-w-[24px] text-center">
                            {region.code}
                          </span>
                          <span className="truncate">{region.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cinema-accent flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── AUTH: AVATAR OR SIGN IN ───────────────────────────── */}
          {isAuthenticated ? (
            /* ── Logged-in: avatar + dropdown ── */
            <div className="relative flex-shrink-0" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(o => !o); setRegionOpen(false); }}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                className="w-8 h-8 rounded-full bg-cinema-accent hover:bg-cinema-accentHover flex items-center justify-center font-bold text-sm text-white shadow-glow transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              >
                {avatarLetter}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-cinema-card border border-cinema-border/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-cinema-border/50">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    {user?.email && (
                      <p className="text-[11px] text-cinema-muted truncate mt-0.5">{user.email}</p>
                    )}
                  </div>
                  {/* Log out */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-cinema-muted hover:bg-red-500/15 hover:text-red-400 transition-colors font-medium"
                      aria-label="Log out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isLoggingOut ? 'Signing out...' : 'Log Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Sign In button ── */
            <button
              onClick={() => openAuthModal({ mode: 'login' })}
              aria-label="Sign in"
              className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-cinema-card hover:bg-cinema-cardHover text-white border border-cinema-border/80 hover:border-cinema-accent text-xs font-semibold transition-all flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-cinema-accent" />
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
    {/* Spacer so page content flows directly below fixed navbar */}
    <div className="h-14 md:h-16 lg:h-[70px] w-full flex-shrink-0 pointer-events-none" aria-hidden="true" />
  </>
  );
}
