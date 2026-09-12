import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import NewReleasesPage from './pages/NewReleasesPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-releases" element={<NewReleasesPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="text-center py-24 space-y-4">
            <h2 className="text-4xl font-extrabold text-white">Lost in the Cinema?</h2>
            <p className="text-sm text-cinema-muted max-w-sm mx-auto">
              We couldn't find the page you're looking for.
            </p>
            <div>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cinema-accent hover:bg-cinema-accentHover text-white text-xs font-semibold shadow-glow transition-all hover:scale-105"
              >
                Back to Home
              </a>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}
