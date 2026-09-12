import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [pendingIntent, setPendingIntent] = useState(null); // e.g. { type: 'ADD_TO_WISHLIST', movie }

  // Query /api/auth/me to check current session status on mount
  const {
    data: authData,
    isLoading: isLoadingAuth,
    refetch: refetchAuth,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const user = authData?.user || null;
  const isAuthenticated = Boolean(authData?.isAuthenticated && user);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (credentials) => authApi.register(credentials),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      // Clear wishlist cache and re-check session
      queryClient.setQueryData(['wishlist'], []);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const openAuthModal = useCallback(({ mode = 'login', intent = null } = {}) => {
    setAuthModalMode(mode);
    setPendingIntent(intent);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const clearPendingIntent = useCallback(() => {
    setPendingIntent(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    pendingIntent,
    openAuthModal,
    closeAuthModal,
    clearPendingIntent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
