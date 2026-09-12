import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function MobileNav() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { wishlist } = useWishlist();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/search', label: 'Search', icon: Search },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Bookmark,
      badge: isAuthenticated && wishlist.length > 0 ? wishlist.length : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-cinema-bg/95 backdrop-blur-lg border-t border-cinema-border/60 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-cinema-accent font-semibold'
                  : 'text-cinema-muted hover:text-white'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge && (
                <span className="absolute -top-1.5 -right-2 bg-cinema-accent text-white text-[9px] font-bold px-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-wide">{label}</span>
          </NavLink>
        ))}

        {!isAuthenticated && (
          <button
            onClick={() => openAuthModal({ mode: 'login' })}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-cinema-muted hover:text-white transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-wide">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
