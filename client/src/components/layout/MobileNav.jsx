import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';

export default function MobileNav() {
  const { isAuthenticated } = useAuth();
  const { wishlist } = useWishlist();

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      end: true,
    },
    {
      to: '/search',
      label: 'Search',
      icon: Search,
    },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Bookmark,
      badge: isAuthenticated && wishlist.length > 0 ? wishlist.length : null,
    },
  ];

  return (
    /* Hidden on lg+ — desktop uses top nav only */
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-cinema-bg/97 backdrop-blur-xl border-t border-cinema-border/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around px-2 pt-1.5 pb-1.5">
        {navItems.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 min-h-[48px] flex-1 rounded-xl transition-colors ${
                isActive ? 'text-cinema-accent' : 'text-cinema-muted hover:text-white'
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                  {badge && (
                    <span className="absolute -top-1.5 -right-2 bg-cinema-accent text-white text-[9px] font-bold min-w-[14px] px-0.5 rounded-full text-center leading-[14px]">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cinema-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
