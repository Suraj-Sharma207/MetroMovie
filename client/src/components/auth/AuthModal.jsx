import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Film,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../hooks/useWishlist.js';
import bLogo from '../../../img/bLogo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    pendingIntent,
    clearPendingIntent,
    login,
    register,
  } = useAuth();

  const { addToWishlist } = useWishlist();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Field Touched State
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGeneralError(null);
      setSuccessToast(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setTouched({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
      });
    }
  }, [isAuthModalOpen, authModalMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Lock background page scroll while modal is open (both html and body)
  useEffect(() => {
    if (isAuthModalOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Field-level validation logic
  const getFieldErrors = () => {
    const errors = {};

    // Validate Name (Sign Up only)
    if (authModalMode === 'register') {
      const trimmedName = name.trim();
      if (!trimmedName) {
        errors.name = 'Full name is required.';
      } else if (trimmedName.length < 2) {
        errors.name = 'Name must be at least 2 characters.';
      } else if (trimmedName.length > 50) {
        errors.name = 'Name cannot exceed 50 characters.';
      }
    }

    // Validate Email (Both modes)
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. alex@example.com).';
    }

    // Validate Password (both Sign In and Sign Up)
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    // Validate Confirm Password (Sign Up only)
    if (authModalMode === 'register') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Confirming your password is required.';
      } else if (password && confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    return errors;
  };

  const fieldErrors = getFieldErrors();

  // Check whether all required fields are filled
  const isFormFilled = authModalMode === 'login'
    ? Boolean(email.trim() && password)
    : Boolean(name.trim() && email.trim() && password && confirmPassword);

  // Check whether any field-level errors exist
  const hasErrors = Object.keys(fieldErrors).length > 0;

  // Submit button is disabled until all required fields are filled and valid
  const isSubmitDisabled = !isFormFilled || hasErrors || isSubmitting;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    // Touch all fields to reveal any errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if any errors exist
    const errors = getFieldErrors();
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      }

      // Check for pending intent (preserve user context)
      if (pendingIntent && pendingIntent.type === 'ADD_TO_WISHLIST' && pendingIntent.movie) {
        addToWishlist(pendingIntent.movie);
        setSuccessToast(`Saved "${pendingIntent.movie.title}" to your wishlist!`);
        clearPendingIntent();
      }

      // Close modal after brief feedback
      setTimeout(() => {
        closeAuthModal();
        setIsSubmitting(false);
        setSuccessToast(null);
      }, 700);
    } catch (err) {
      const rawMsg = err.message || 'Unable to sign in. Please check your credentials and try again.';
      const isTechnical = /prisma|database|invocation|neon\.tech|Can't reach/i.test(rawMsg);
      setGeneralError(
        isTechnical
          ? 'Unable to connect to account services right now. Please try again in a few moments.'
          : rawMsg
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in overscroll-contain"
      role="dialog"
      aria-modal="true"
    >
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={closeAuthModal} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-cinema-card border border-cinema-border/70 shadow-2xl overflow-hidden z-10 p-5 sm:p-6 space-y-3.5 animate-scale-up max-h-[96vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-cinema-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <img
            src={bLogo}
            alt="MoviesMetro"
            className="h-12 sm:h-[53px] w-auto mx-auto object-contain drop-shadow-md mb-1"
          />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-[11px] sm:text-xs text-cinema-muted">
            {authModalMode === 'login'
              ? 'Sign in to access your personal wishlist and saved favorites.'
              : 'Join MoviesMetro to save favorites and curate your watchlist.'}
          </p>
        </div>

        {/* Pending Movie Intent Banner */}
        {pendingIntent?.movie && (
          <div className="p-2.5 rounded-xl bg-cinema-accent/10 border border-cinema-accent/30 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cinema-accent flex-shrink-0" />
            <p className="text-xs text-cinema-text leading-snug">
              Sign in or sign up to instantly save{' '}
              <strong className="text-white font-bold">"{pendingIntent.movie.title}"</strong> to your wishlist.
            </p>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* General Error Alert */}
        {generalError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
          {/* Name Field (Sign Up Only) */}
          {authModalMode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-cinema-text mb-0.5" htmlFor="auth-name">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full bg-cinema-bg border rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-cinema-muted focus:outline-none transition-colors ${
                    touched.name && fieldErrors.name
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                      : 'border-cinema-border/60 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent'
                  }`}
                  autoComplete="name"
                />
                <User className="w-3.5 h-3.5 text-cinema-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {touched.name && fieldErrors.name && (
                <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-semibold text-cinema-text mb-0.5" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.com"
                className={`w-full bg-cinema-bg border rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-cinema-muted focus:outline-none transition-colors ${
                  touched.email && fieldErrors.email
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : 'border-cinema-border/60 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent'
                }`}
                autoComplete="email"
              />
              <Mail className="w-3.5 h-3.5 text-cinema-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {touched.email && fieldErrors.email && (
              <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password & Confirm Password Fields */}
          <div className={authModalMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : ''}>
            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-semibold text-cinema-text mb-0.5" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full bg-cinema-bg border rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-cinema-muted focus:outline-none transition-colors ${
                    touched.password && fieldErrors.password
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                      : 'border-cinema-border/60 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent'
                  }`}
                  autoComplete={authModalMode === 'login' ? 'current-password' : 'new-password'}
                />
                <Lock className="w-3.5 h-3.5 text-cinema-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cinema-muted hover:text-white transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {authModalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-cinema-text mb-0.5" htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`w-full bg-cinema-bg border rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-cinema-muted focus:outline-none transition-colors ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                        : touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword
                        ? 'border-emerald-500/60 focus:border-emerald-500'
                        : 'border-cinema-border/60 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent'
                    }`}
                    autoComplete="new-password"
                  />
                  <Lock className="w-3.5 h-3.5 text-cinema-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cinema-muted hover:text-white transition-colors p-0.5"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword ? (
                  <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                    {fieldErrors.confirmPassword}
                  </p>
                ) : touched.confirmPassword && confirmPassword && !fieldErrors.confirmPassword ? (
                  <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 animate-fade-in">
                    <Check className="w-2.5 h-2.5 flex-shrink-0" />
                    Passwords match
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cinema-accent to-red-600 hover:from-cinema-accentHover hover:to-red-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-glow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-400 flex items-center justify-center gap-2 mt-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{authModalMode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-cinema-muted border-t border-cinema-border/40">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-cinema-accent font-semibold hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-cinema-accent font-semibold hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
