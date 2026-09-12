import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../services/wishlistApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Fetch saved wishlist items ONLY when authenticated
  const {
    data: wishlist = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistApi.getAll(),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fast set of saved movie IDs for instant UI lookup
  const wishlistedIds = new Set(
    isAuthenticated ? wishlist.map((item) => item.movieId) : []
  );

  const isMovieWishlisted = (movieId) => {
    if (!isAuthenticated || !movieId) return false;
    return wishlistedIds.has(parseInt(movieId, 10));
  };

  // Add mutation with optimistic update
  const addMutation = useMutation({
    mutationFn: (movie) => wishlistApi.add(movie),
    onMutate: async (newMovie) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous = queryClient.getQueryData(WISHLIST_QUERY_KEY) || [];

      const optimisticItem = {
        id: 'temp-' + Date.now(),
        movieId: newMovie.id || newMovie.movieId,
        title: newMovie.title,
        posterPath: newMovie.posterPath,
        backdropPath: newMovie.backdropPath,
        rating: newMovie.rating,
        releaseDate: newMovie.releaseDate,
        overview: newMovie.overview,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(WISHLIST_QUERY_KEY, [optimisticItem, ...previous]);
      return { previous };
    },
    onError: (err, newMovie, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  // Remove mutation with optimistic update
  const removeMutation = useMutation({
    mutationFn: (movieId) => wishlistApi.remove(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous = queryClient.getQueryData(WISHLIST_QUERY_KEY) || [];

      const filtered = previous.filter(
        (item) => item.movieId !== parseInt(movieId, 10)
      );

      queryClient.setQueryData(WISHLIST_QUERY_KEY, filtered);
      return { previous };
    },
    onError: (err, movieId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  // Guarded add to wishlist
  const safeAddToWishlist = (movie) => {
    if (!isAuthenticated) {
      openAuthModal({
        mode: 'login',
        intent: { type: 'ADD_TO_WISHLIST', movie },
      });
      return;
    }
    addMutation.mutate(movie);
  };

  // Guarded remove from wishlist
  const safeRemoveFromWishlist = (movieId) => {
    if (!isAuthenticated) return;
    removeMutation.mutate(movieId);
  };

  // Toggle wishlist item convenience method
  const toggleWishlist = (movie) => {
    if (!isAuthenticated) {
      openAuthModal({
        mode: 'login',
        intent: { type: 'ADD_TO_WISHLIST', movie },
      });
      return;
    }

    const movieId = movie.id || movie.movieId;
    if (isMovieWishlisted(movieId)) {
      safeRemoveFromWishlist(movieId);
    } else {
      safeAddToWishlist(movie);
    }
  };

  return {
    wishlist: isAuthenticated ? wishlist : [],
    isLoading: isAuthenticated ? isLoading : false,
    isError: isAuthenticated ? isError : false,
    error: isAuthenticated ? error : null,
    refetch,
    isMovieWishlisted,
    toggleWishlist,
    addToWishlist: safeAddToWishlist,
    removeFromWishlist: safeRemoveFromWishlist,
    isMutating: addMutation.isPending || removeMutation.isPending,
  };
}
