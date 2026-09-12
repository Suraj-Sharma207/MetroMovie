import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import MobileNav from './MobileNav.jsx';
import Footer from './Footer.jsx';
import AuthModal from '../auth/AuthModal.jsx';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-cinema-bg text-cinema-text">
      {/* Top navigation bar — always visible */}
      <Navbar />

      {/* Main content
          - Mobile/tablet (< lg): bottom padding clears the fixed bottom nav + safe area
          - Desktop (lg+): no bottom nav, normal padding */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-nav lg:pb-8">
        <Outlet />
      </main>

      {/* Footer — hidden below lg where bottom nav is shown */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Bottom tab nav — hidden on lg+ */}
      <MobileNav />

      {/* Auth modal — always mounted */}
      <AuthModal />
    </div>
  );
}
