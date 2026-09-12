import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Bookmark, Compass, Home, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal, isLoggingOut } = useAuth();
  const { wishlist } = useWishlist();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-cinema-bg/90 backdrop-blur-md border-b border-cinema-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cinema-accent to-red-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-cinema-accent transition-colors">
            Cine<span className="text-cinema-accent">Scope</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/') ? 'text-white bg-cinema-card' : 'text-cinema-muted hover:text-white hover:bg-cinema-card/50'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/discover"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/discover') ? 'text-white bg-cinema-card' : 'text-cinema-muted hover:text-white hover:bg-cinema-card/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            Discover
          </Link>
          <Link
            to="/wishlist"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
              isActive('/wishlist') ? 'text-white bg-cinema-card' : 'text-cinema-muted hover:text-white hover:bg-cinema-card/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Wishlist
            {isAuthenticated && wishlist.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-cinema-accent text-white text-[10px] font-bold rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, actors..."
              className="w-full bg-cinema-card border border-cinema-border/60 rounded-full pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm text-cinema-text placeholder-cinema-muted focus:outline-none focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent transition-all duration-200"
            />
            <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Auth / Account Controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cinema-card border border-cinema-border/60 text-xs text-cinema-text">
                <User className="w-3.5 h-3.5 text-cinema-accent" />
                <span className="font-medium max-w-[120px] truncate" title={user.name || user.email}>
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-cinema-card hover:bg-red-500/20 text-cinema-muted hover:text-red-400 border border-cinema-border/60 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal({ mode: 'login' })}
              className="px-4 py-2 rounded-full bg-cinema-card hover:bg-cinema-card/80 text-white border border-cinema-border/80 hover:border-cinema-accent text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            >
              <LogIn className="w-3.5 h-3.5 text-cinema-accent" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Quick Search Button */}
          <div className="flex md:hidden items-center">
            <Link
              to="/search"
              className="p-2 rounded-lg text-cinema-muted hover:text-white hover:bg-cinema-card transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
