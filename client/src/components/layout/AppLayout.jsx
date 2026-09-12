import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import MobileNav from './MobileNav.jsx';
import Footer from './Footer.jsx';
import AuthModal from '../auth/AuthModal.jsx';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-cinema-bg text-cinema-text">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <AuthModal />
    </div>
  );
}
